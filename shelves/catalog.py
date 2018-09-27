from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for, jsonify
)
from werkzeug.exceptions import abort
import re

from shelves.auth import (login_required, admin_required)
from shelves.db import get_db_cursor, db_commit, db_rollback
from shelves.collection import get_user_collection
from shelves.item import (get_catalog_items, render_items_list)
from shelves.company import get_companies, get_company
from shelves.uploads import upload_image
from shelves.relation import Relation
from shelves.attribute import Attribute

bp = Blueprint('catalog', __name__, url_prefix='/catalog')


def get_catalog_type(id):
    cursor = get_db_cursor()
    cursor.execute(
        'SELECT * FROM catalog_type WHERE id = %s',
        (id,)
    )
    ct = cursor.fetchone()

    if ct is None:
        abort(404, "Catalog type id {0} doesn't exist.".format(id))

    return ct

def get_catalog_none(id):
    cursor = get_db_cursor()
    cursor.execute(
        'SELECT c.id, c.title, description, created, c.type_id,'
        ' ct.title as type_title, ct.physical, IFNULL(c.year, "") as year, com.title as company,'
        ' c.company_id'
        ' FROM catalog c JOIN catalog_type ct ON c.type_id = ct.id'
        ' LEFT JOIN company com ON com.id = c.company_id'
        ' WHERE c.id = %s',
        (id,)
    )
    return cursor.fetchone()

def get_catalog(id):
    catalog = get_catalog_none(id)
    if catalog is None:
        abort(404, "Catalog id {0} doesn't exist.".format(id))

    return catalog

def get_catalog_types():
    cursor = get_db_cursor()
    cursor.execute('SELECT * FROM catalog_type')
    return cursor.fetchall()

def get_catalog_images(id):
    cursor = get_db_cursor()
    cursor.execute(
        'SELECT img.id, img.filename'
        ' FROM catalog c JOIN catalog_attribute a ON c.id = a.catalog_id'
        ' JOIN image img ON a.value_id = img.id'
        ' WHERE a.type = %s AND c.id = %s',
        (Attribute.ATTR_IMAGE, id,)
    )
    images = cursor.fetchall()
    return images

def get_catalog_logo(id):
    cursor = get_db_cursor()
    cursor.execute(
        'SELECT img.id'
        ' FROM catalog c JOIN catalog_attribute a ON c.id = a.catalog_id'
        ' JOIN image img ON a.value_id = img.id'
        ' WHERE a.type = %s AND c.id = %s',
        (Attribute.ATTR_LOGO, id,)
    )
    return cursor.fetchone()

def get_catalog_families(id):
    f1 = get_catalog_type_id('Computer family')
    f2 = get_catalog_type_id('Console family')
    f3 = get_catalog_type_id('Calculator family')
    cursor = get_db_cursor()
    cursor.execute(
        'SELECT c1.id, c1.title, ct.title as type_title'
        ' FROM catalog c1 JOIN catalog_relation r ON c1.id = r.catalog_id1'
        ' JOIN catalog_type ct ON c1.type_id = ct.id'
        ' JOIN catalog c2 ON c2.id = r.catalog_id2'
        ' WHERE r.type = %s AND c2.id = %s AND c1.type_id IN (%s, %s, %s)',
        (Relation.REL_INCLUDES, id, f1, f2, f3,)
    )
    parents = cursor.fetchall()
    return parents

def get_catalog_kits(id):
    kit = get_catalog_type_id('Kit')
    cursor = get_db_cursor()
    cursor.execute(
        'SELECT c1.id, c1.title, ct.title as type_title, IFNULL(c1.year, "") as year,'
        ' com.title as company, c1.company_id, img.id as logo'
        ' FROM catalog c1 JOIN catalog_relation r ON c1.id = r.catalog_id1'
        ' JOIN catalog_type ct ON c1.type_id = ct.id'
        ' JOIN catalog c2 ON c2.id = r.catalog_id2'
        ' LEFT JOIN company com ON com.id = c1.company_id'
        ' LEFT JOIN (SELECT * FROM catalog_attribute WHERE type = %s) a ON c1.id = a.catalog_id'
        ' LEFT JOIN image img ON a.value_id = img.id'
        ' WHERE r.type = %s AND c2.id = %s AND c1.type_id = %s'
        ' ORDER BY c1.title',
        (Attribute.ATTR_LOGO, Relation.REL_INCLUDES, id, kit,)
    )
    return cursor.fetchall()

def get_catalog_children(id):
    cursor = get_db_cursor()
    cursor.execute(
        'SELECT c2.id, c2.title, ct.title as type_title,'
        '       ct.physical, c2.description, IFNULL(c2.year, "") as year, com.title as company,'
        '       c2.company_id'
        ' FROM catalog c1 JOIN catalog_relation r ON c1.id = r.catalog_id1'
        ' JOIN catalog c2 ON c2.id = r.catalog_id2'
        ' JOIN catalog_type ct ON c2.type_id = ct.id'
        ' LEFT JOIN company com ON com.id = c2.company_id'
        ' WHERE r.type = %s AND c1.id = %s'
        ' ORDER BY c2.title',
        (Relation.REL_INCLUDES, id,)
    )
    parents = cursor.fetchall()
    return parents

def get_catalog_type_id(name):
    cursor = get_db_cursor()
    cursor.execute(
        'SELECT id FROM catalog_type'
        ' WHERE title = %s',
        (name,)
        )
    ct = cursor.fetchone()
    if ct is None:
        abort(404, "Catalog type %s doesn't exist." % name)

    return ct['id']

def get_catalog_items_of_type(id, noparent = False):
    cursor = get_db_cursor()
    query = 'SELECT c.id, c.title, description, created, c.type_id,'   \
            ' ct.title as type_title, ct.physical, img.id as logo,'    \
            ' year, com.title as company, c.company_id,'               \
            ' (SELECT COUNT(*) FROM catalog cc'                        \
            '   JOIN catalog_relation r WHERE cc.id=r.catalog_id2'     \
            '   AND c.id=r.catalog_id1 AND r.type=%s) AS count'        \
            ' FROM catalog c JOIN catalog_type ct ON c.type_id = ct.id'\
            ' LEFT JOIN (SELECT * FROM catalog_attribute WHERE type = %s) a ON c.id = a.catalog_id'    \
            ' LEFT JOIN image img ON a.value_id = img.id'              \
            ' LEFT JOIN company com ON com.id = c.company_id'          \
            ' WHERE ct.id = %s'
    suffix = ' ORDER BY c.title'
    if noparent:
        cursor.execute(query
            + ' AND NOT EXISTS (SELECT 1 FROM catalog_relation'
              '      WHERE catalog_id2 = c.id AND type = %s)' + suffix,
            (Relation.REL_INCLUDES,Attribute.ATTR_LOGO, id, Relation.REL_INCLUDES,)
        )
    else:
        cursor.execute(query + suffix, (Relation.REL_INCLUDES,Attribute.ATTR_LOGO,id,))
    return cursor.fetchall()

def get_catalog_items_of_company(id):
    cursor = get_db_cursor()
    cursor.execute(
        'SELECT c.id, c.title, description, created, c.type_id,'
        ' ct.title as type_title, ct.physical, img.id as logo,'
        ' year'
        ' FROM catalog c JOIN catalog_type ct ON c.type_id = ct.id'
        ' LEFT JOIN (SELECT * FROM catalog_attribute WHERE type = %s) a ON c.id = a.catalog_id'
        ' LEFT JOIN image img ON a.value_id = img.id'
        ' JOIN company com ON com.id = c.company_id'
        ' WHERE c.company_id = %s'
        ' ORDER BY c.title',
        (Attribute.ATTR_LOGO, id,)
    )
    return cursor.fetchall()

def get_computer_families(noparent=True):
    return get_catalog_items_of_type(get_catalog_type_id('Computer family'), noparent)

def get_computers():
    return get_catalog_items_of_type(get_catalog_type_id('Computer'))

def get_console_families(noparent=True):
    return get_catalog_items_of_type(get_catalog_type_id('Console family'), noparent)

def get_consoles():
    return get_catalog_items_of_type(get_catalog_type_id('Console'))

def get_calculator_families(noparent=True):
    return get_catalog_items_of_type(get_catalog_type_id('Calculator family'), noparent)

def get_calculators():
    return get_catalog_items_of_type(get_catalog_type_id('Calculator'))

def render_catalog_list(items, showcount=False):
    return render_template('catalog/list.html',
        catalogs=items, notype=True, showcount=showcount)

def get_all_families():
    f1 = get_catalog_type_id('Computer family')
    f2 = get_catalog_type_id('Console family')
    f3 = get_catalog_type_id('Calculator family')
    cursor = get_db_cursor()
    cursor.execute(
            'SELECT c.id, c.title, ct.title as type_title'
            ' FROM catalog c JOIN catalog_type ct ON c.type_id = ct.id'
            ' WHERE ct.id IN (%s, %s, %s)'
            ' ORDER BY c.title',
            (f1, f2, f3,)
        )
    return cursor.fetchall()

###############################################################################
# Routes
###############################################################################

# All catalogs
@bp.route('/')
def index():
    return render_template('catalog/index.html',
        rendered_families=render_catalog_list(get_computer_families(), True),
        rendered_computers=render_catalog_list(get_computers()),
        rendered_console_families=render_catalog_list(get_console_families(), True),
        rendered_consoles=render_catalog_list(get_consoles()),
        rendered_calculator_families=render_catalog_list(get_calculator_families(), True),
        rendered_calculators=render_catalog_list(get_calculators()),
        )


@bp.route('/create', methods=('GET', 'POST'))
@bp.route('/create/<int:parent>', methods=('GET', 'POST'))
@login_required
@admin_required
def create(parent = -1):
    if request.method == 'POST':
        if not g.user['admin']:
            abort(403)

        error = None
        type_id = request.form['type_id']
        title = request.form['title']
        description = request.form['description']
        company_id = int(request.form['company_id'])
        if company_id == -1:
            company_id = None
        try:
            year = int(request.form['year'])
            if year < 1500 or year > 2100:
                error = 'Invalid year.'
        except:
            year = None

        # assert that catalog type exists
        get_catalog_type(type_id)
        # assert that company exists
        if (company_id is not None) and (get_company(company_id) is None):
            error = 'Invalid company.'

        if not title:
            error = 'Title is required.'

        if error is not None:
            flash(error)
        else:
            parent = request.form['parent']
            cursor = get_db_cursor()
            cursor.execute(
                'INSERT INTO catalog (type_id, title, description, year, company_id)'
                ' VALUES (%s, %s, %s, %s, %s)',
                (type_id, title, description, year, company_id)
            )
            catalog_id = cursor.lastrowid
            if parent and int(parent) > 0:
                get_catalog(parent) # validate the parent
                cursor.execute(
                    'INSERT INTO catalog_relation'
                    ' (catalog_id1, catalog_id2, type)'
                    ' VALUES (%s, %s, %s)',
                    (parent, catalog_id, Relation.REL_INCLUDES)
                )
            db_commit()
            return redirect(url_for('catalog.view', id=catalog_id))

    catalog_types = get_catalog_types()
    p = None
    if parent != -1:
        p = get_catalog(parent)
    return render_template('catalog/create.html',
        parent=p, catalog_types=catalog_types,
        companies=get_companies())

@bp.route('/<int:id>')
def view(id):
    catalog = get_catalog(id)

    items = []
    if g.user:
        items = get_catalog_items(get_user_collection(g.user['id'])['id'], id)

    return render_template('catalog/view.html',
        catalog=catalog, catalog_types=get_catalog_types(),
        rendered_items=render_items_list(items),
        rendered_kits=render_catalog_list(get_catalog_kits(id), True),
        catalogs=get_catalog_children(id),
        logo=get_catalog_logo(id))

@bp.route('/<int:id>/update', methods=('GET', 'POST'))
@login_required
@admin_required
def update(id):
    catalog = get_catalog(id)

    if request.method == 'POST':
        if not g.user['admin']:
            abort(403)

        error = None
        title = request.form['title']
        description = request.form['description']
        type_id = request.form['type_id']
        company_id = int(request.form['company_id'])
        if company_id == -1:
            company_id = None
        try:
            year = int(request.form['year'])
            if year < 1500 or year > 2100:
                error = 'Invalid year.'
        except:
            year = None

        # assert that catalog type exists
        get_catalog_type(type_id)
        # assert that company exists
        if (company_id is not None) and (get_company(company_id) is None):
            error = 'Invalid company.'

        if not title:
            error = 'Title is required.'

        file = None
        file_id = None
        if 'catalog_logo' in request.files:
            file = request.files['catalog_logo']
            if file.filename != '':
                file_id = upload_image(file, 64, 64)
                if file_id is None:
                    error = 'Only 64x64 images can be used as a logo'

        if error is not None:
            flash(error)
        else:
            cursor = get_db_cursor()
            if file_id is not None:
                cursor.execute(
                    'DELETE FROM catalog_attribute'
                    ' WHERE type=%s AND catalog_id=%s',
                    (Attribute.ATTR_LOGO, id,)
                )
                cursor.execute(
                    'INSERT INTO catalog_attribute (type, catalog_id, value_id)'
                    ' VALUES (%s, %s, %s)',
                    (Attribute.ATTR_LOGO, id, file_id,)
                )

            cursor.execute(
                'UPDATE catalog SET title = %s, description = %s, type_id = %s,'
                ' year = %s, company_id = %s'
                ' WHERE id = %s',
                (title, description, type_id, year, company_id, id)
            )
            db_commit()
            return redirect(url_for('catalog.view', id=id))

    return render_template('catalog/update.html',
        catalog=catalog, catalog_types=get_catalog_types(),
        companies=get_companies())

@bp.route('/<int:id>/own', methods=('POST',))
@login_required
def own(id):
    catalog = get_catalog(id)

    if not catalog['physical']:
        abort(403)

    collection = get_user_collection(g.user['id'])
    try:
        cursor = get_db_cursor()
        cursor.execute(
            'INSERT INTO item (catalog_id, internal_id, description, collection_id)'
            ' VALUES (%s, %s, %s, %s)',
            (id, request.form['internal_id'], '', collection['id'])
        )
        item_id = cursor.lastrowid

        if 'subitem' in request.form:
            subitems = request.form.getlist('subitem')
            for subitem in subitems:
                # assert that catalog item exists
                get_catalog(subitem)
                cursor.execute(
                    'INSERT INTO item (catalog_id, description, collection_id)'
                    ' VALUES (%s, %s, %s)',
                    (subitem, '', collection['id'])
                )
                subitem_id = cursor.lastrowid
                cursor.execute(
                    'INSERT INTO item_relation (item_id1, item_id2, type)'
                    ' VALUES (%s, %s, %s)',
                    (item_id, subitem_id, Relation.REL_INCLUDES)
                )

        db_commit()
    except:
        db_rollback()
        raise

    return redirect(url_for('catalog.view', id=id))


@bp.route('/_join', methods=('POST',))
@login_required
@admin_required
def _join():
    id1 = int(request.form['id1'])
    id2 = int(request.form['id2'])
    logo = int(request.form['logos'])
    title = request.form['title']
    year = request.form['year']
    description = request.form['description']

    if not title:
        abort(403)

    if logo != 1 and logo != 2:
        abort(403)

    if year == '':
        year = None

    # assert that catalog items exist
    c1 = get_catalog(id1)
    c2 = get_catalog(id2)

    if c1['company_id'] != c2['company_id']:
        abort(403)

    if c1['type_id'] != c2['type_id']:
        abort(403)

    cursor = get_db_cursor()

    cursor.execute('SELECT * FROM catalog_relation'
        ' WHERE catalog_id1 = %s AND catalog_id2 = %s',
        (id1, id2,))
    if cursor.fetchone():
        abort(403)

    cursor.execute('SELECT * FROM catalog_relation'
        ' WHERE catalog_id1 = %s AND catalog_id2 = %s',
        (id2, id1,))
    if cursor.fetchone():
        abort(403)

    # Set new parameters of the catalog item
    cursor.execute(
        'UPDATE catalog SET title = %s, description = %s,'
        ' year = %s'
        ' WHERE id = %s',
        (title, description, year, id1,)
    )

    # Set new logo
    if logo == 2:
        cursor.execute(
            'DELETE FROM catalog_attribute'
            ' WHERE catalog_id = %s AND type = %s',
            (id1, Attribute.ATTR_LOGO,)
        )
    else:
        cursor.execute(
            'DELETE FROM catalog_attribute'
            ' WHERE catalog_id = %s AND type = %s',
            (id2, Attribute.ATTR_LOGO,)
        )

    # Redirect items
    cursor.execute(
        'UPDATE item SET catalog_id = %s WHERE catalog_id = %s',
        (id1, id2, )
    )

    # Redirect attributes
    cursor.execute(
        'UPDATE catalog_attribute SET catalog_id = %s WHERE catalog_id = %s',
        (id1, id2, )
    )

    # Delete duplicate relations
    cursor.execute(
        'DELETE FROM catalog_relation WHERE catalog_id1 = %s AND type = %s'
        ' AND catalog_id2 IN (SELECT DISTINCT catalog_id2 FROM'
                             ' (SELECT * FROM catalog_relation'
                             ' WHERE catalog_id1 = %s AND type = %s) AS tmp)',
        (id2, Relation.REL_INCLUDES, id1, Relation.REL_INCLUDES,)
    )
    cursor.execute(
        'DELETE FROM catalog_relation WHERE catalog_id2 = %s AND type = %s'
        ' AND catalog_id1 IN (SELECT DISTINCT catalog_id1 FROM'
                             ' (SELECT * FROM catalog_relation'
                             ' WHERE catalog_id2 = %s AND type = %s) AS tmp)',
        (id2, Relation.REL_INCLUDES, id1, Relation.REL_INCLUDES,)
    )

    # Redirect relations
    cursor.execute(
        'UPDATE catalog_relation SET catalog_id1 = %s WHERE catalog_id1 = %s',
        (id1, id2, )
    )
    cursor.execute(
        'UPDATE catalog_relation SET catalog_id2 = %s WHERE catalog_id2 = %s',
        (id1, id2, )
    )

    # Delete old catalog item
    cursor.execute('DELETE FROM catalog WHERE id = %s', (id2,))

    # Commit all the changes
    db_commit()

    return redirect(url_for('catalog.view', id=id1))


@bp.route('/_all_types')
def _all_types():
    return jsonify(result=get_catalog_types())

@bp.route('/_families')
def _families():
    id = request.args.get('id', 0, type=int)
    return jsonify(result=get_catalog_families(id))

@bp.route('/_all_families')
def _all_families():
    return jsonify(result=get_all_families())

@bp.route('/_family_remove', methods=('POST',))
@admin_required
def _family_remove():
    id = int(request.form['id'])
    family = int(request.form['family'])
    cursor = get_db_cursor()
    cursor.execute(
        'DELETE FROM catalog_relation'
        ' WHERE catalog_id1=%s AND catalog_id2=%s AND type=%s',
        (family, id, Relation.REL_INCLUDES,)
    )
    db_commit()
    return ('', 204)

@bp.route('/_family_add', methods=('POST',))
@admin_required
def _family_add():
    id = int(request.form['id'])
    family = int(request.form['family'])
    cursor = get_db_cursor()
    cursor.execute(
        'INSERT INTO catalog_relation (catalog_id1, catalog_id2, type)'
        ' VALUES (%s, %s, %s)',
        (family, id, Relation.REL_INCLUDES,)
    )
    db_commit()
    return ('', 204)

@bp.route('/<int:id>/_get')
def _get(id):
    return jsonify(result=get_catalog(id));

@bp.route('/<int:id>/_get_images')
def _get_images(id):
    return jsonify(result=get_catalog_images(id))

@bp.route('/<int:id>/_upload_image', methods=('POST',))
@login_required
@admin_required
def _upload_image(id):
    if 'img' not in request.files:
        return ('', 400)

    file = request.files['img']
    if file:
        file_id = upload_image(file)
        cursor = get_db_cursor()
        cursor.execute(
            'INSERT INTO catalog_attribute (type, catalog_id, value_id)'
            ' VALUES (%s, %s, %s)',
            (Attribute.ATTR_IMAGE, id, file_id,)
        )
        db_commit()
        cursor.execute('SELECT id, filename FROM image WHERE id = %s',
            (file_id,))
        return jsonify(result=cursor.fetchone())

    return ('', 400)

@bp.route('/<int:id>/_create_kit', methods=('POST',))
@login_required
@admin_required
def _create_kit(id):
    catalog = get_catalog(id)
    if not catalog['physical']:
        abort(403)

    kit_type = get_catalog_type_id('Kit')

    title = request.form['title']
    if not title:
        abort(403)

    try:
        cursor = get_db_cursor()
        cursor.execute(
            'INSERT INTO catalog (type_id, title, description, company_id)'
            ' VALUES (%s, %s, %s, %s)',
            (kit_type, title, '', catalog['company_id'],)
        )
        kit_id = cursor.lastrowid

        # Add main item into the kit
        cursor.execute(
            'INSERT INTO catalog_relation'
            ' (catalog_id1, catalog_id2, type)'
            ' VALUES (%s, %s, %s)',
            (kit_id, id, Relation.REL_INCLUDES,)
        )

        re_type = re.compile('type(\d+)')
        for k, v in request.form.items():
            m = re.search(re_type, k)
            if m:
                num = m.group(1)
                title_item = request.form['title%s' % num]
                type_id = int(v)
                ct = get_catalog_type(type_id)
                if not ct['physical']:
                    abort(403)
                cursor.execute(
                    'INSERT INTO catalog (type_id, title, description, company_id)'
                    ' VALUES (%s, %s, %s, %s)',
                    (type_id, title_item, '', catalog['company_id'],)
                )
                item_id = cursor.lastrowid
                cursor.execute(
                    'INSERT INTO catalog_relation'
                    ' (catalog_id1, catalog_id2, type)'
                    ' VALUES (%s, %s, %s)',
                    (kit_id, item_id, Relation.REL_INCLUDES,)
                )
        db_commit()
    except:
        db_rollback()
        raise

    return view(kit_id)
