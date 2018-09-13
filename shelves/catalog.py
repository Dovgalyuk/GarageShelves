from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for
)
from werkzeug.exceptions import abort

from shelves.auth import (login_required, admin_required)
from shelves.db import get_db_cursor, db_commit
from shelves.collection import get_user_collection
from shelves.item import (get_catalog_items, render_items_list)
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
        ' ct.title as type_title, ct.physical, year, com.title as company,'
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

def get_catalog_parents(id):
    cursor = get_db_cursor()
    cursor.execute(
        'SELECT c1.id, c1.title, ct.title as type_title'
        ' FROM catalog c1 JOIN catalog_relation r ON c1.id = r.catalog_id1'
        ' JOIN catalog_type ct ON c1.type_id = ct.id'
        ' JOIN catalog c2 ON c2.id = r.catalog_id2'
        ' WHERE r.type = %s AND c2.id = %s',
        (Relation.REL_INCLUDES, id,)
    )
    parents = cursor.fetchall()
    return parents

def get_catalog_children(id):
    cursor = get_db_cursor()
    cursor.execute(
        'SELECT c2.id, c2.title, ct.title as type_title,'
        '       ct.physical, c2.description, c2.year, com.title as company,'
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
            ' year, com.title as company, c.company_id'                \
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
            (Attribute.ATTR_LOGO, id, Relation.REL_INCLUDES,)
        )
    else:
        cursor.execute(query + suffix, (Attribute.ATTR_LOGO,id,))
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

def get_computer_families():
    return get_catalog_items_of_type(get_catalog_type_id('Computer family'), True)

def get_computers():
    return get_catalog_items_of_type(get_catalog_type_id('Computer'))

def get_console_families():
    return get_catalog_items_of_type(get_catalog_type_id('Console family'), True)

def get_consoles():
    return get_catalog_items_of_type(get_catalog_type_id('Console'))

def get_calculator_families():
    return get_catalog_items_of_type(get_catalog_type_id('Calculator family'), True)

def get_calculators():
    return get_catalog_items_of_type(get_catalog_type_id('Calculator'))

def render_catalog_list(items):
    return render_template('catalog/list.html', catalogs=items, notype=True)

###############################################################################
# Routes
###############################################################################

# All catalogs
@bp.route('/')
def index():
    return render_template('catalog/index.html',
        rendered_families=render_catalog_list(get_computer_families()),
        rendered_computers=render_catalog_list(get_computers()),
        rendered_console_families=render_catalog_list(get_console_families()),
        rendered_consoles=render_catalog_list(get_consoles()),
        rendered_calculator_families=render_catalog_list(get_calculator_families()),
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
        try:
            year = int(request.form['year'])
            if year < 1500 or year > 2100:
                error = 'Invalid year.'
        except:
            year = None

        # assert that catalog type exists
        get_catalog_type(type_id)

        if not title:
            error = 'Title is required.'

        if error is not None:
            flash(error)
        else:
            parent = request.form['parent']
            cursor = get_db_cursor()
            cursor.execute(
                'INSERT INTO catalog (type_id, title, description, year)'
                ' VALUES (%s, %s, %s, %s)',
                (type_id, title, description, year)
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
        parent=p, catalog_types=catalog_types)

@bp.route('/<int:id>', methods=('GET', 'POST'))
def view(id):
    catalog = get_catalog(id)

    if request.method == 'POST':
        if not g.user['admin']:
            abort(403)

        if 'catalog_photo' not in request.files:
            flash('No photo selected')
            return redirect(request.url)

        file = request.files['catalog_photo']
        if file.filename == '':
            flash('No selected file')
            return redirect(request.url)

        if file:
            file_id = upload_image(file)
            db = get_db_cursor()
            db.execute(
                'INSERT INTO catalog_attribute (type, catalog_id, value_id)'
                ' VALUES (%s, %s, %s)',
                (Attribute.ATTR_IMAGE, id, file_id,)
            )
            db_commit()
            return redirect(request.url)
        else:
            flash('Invalid file')
            return redirect(request.url)

    items = []
    if g.user:
        items = get_catalog_items(get_user_collection(g.user['id'])['id'], id)

    return render_template('catalog/view.html',
        catalog=catalog, catalog_types=get_catalog_types(),
        rendered_items=render_items_list(items),
        images=get_catalog_images(id),
        parents=get_catalog_parents(id),
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
        try:
            year = int(request.form['year'])
            if year < 1500 or year > 2100:
                error = 'Invalid year.'
        except:
            year = None

        # assert that catalog type exists
        get_catalog_type(type_id)

        if not title:
            error = 'Title is required.'

        cursor = get_db_cursor()
        if 'catalog_logo' in request.files:
            file = request.files['catalog_logo']
            if file.filename != '':
                file_id = upload_image(file, 64, 64)
                if file_id is None:
                    flash('Only 64x64 images can be used as a logo')
                    return redirect(request.url)

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

        if error is not None:
            flash(error)
        else:
            cursor.execute(
                'UPDATE catalog SET title = %s, description = %s, type_id = %s,'
                ' year = %s'
                ' WHERE id = %s',
                (title, description, type_id, year, id)
            )
            db_commit()
            return redirect(url_for('catalog.view', id=id))

    return render_template('catalog/update.html',
        catalog=catalog, catalog_types=get_catalog_types())

@bp.route('/<int:id>/own', methods=('POST',))
@login_required
def own(id):
    catalog = get_catalog(id)

    if not catalog['physical']:
        abort(403)

    collection = get_user_collection(g.user['id'])
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

    return redirect(url_for('catalog.view', id=id))
