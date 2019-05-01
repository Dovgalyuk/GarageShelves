from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for, jsonify
)
from werkzeug.exceptions import abort
import re

from shelves.auth import (login_required, admin_required)
from shelves.db import get_db_cursor, db_commit, db_rollback
from shelves.collection import get_user_collection
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
        'SELECT c.id, c.title, c.title_eng, description, created, c.type_id,'
        ' ct.title as type_title, ct.is_physical, ct.is_group, ct.is_kit,'
        ' IFNULL(c.year, "") as year, com.title as company,'
        ' c.company_id'
        ' FROM catalog c JOIN catalog_type ct ON c.type_id = ct.id'
        ' LEFT JOIN company com ON com.id = c.company_id'
        ' WHERE c.id = %s',
        (id,)
    )
    return cursor.fetchone()

def get_catalog_full(id):
    cursor = get_db_cursor()
    cursor.execute(
        'SELECT c.id, c.title, c.title_eng, description, created, c.type_id,'
        ' ct.title as type_title, ct.is_physical, ct.is_group, ct.is_kit,'
        ' IFNULL(c.year, "") as year, com.title as company,'
        ' c.company_id, a_logo.value_id as logo_id'
        ' FROM catalog c JOIN catalog_type ct ON c.type_id = ct.id'
        ' LEFT JOIN company com ON com.id = c.company_id'
        ' LEFT JOIN catalog_attribute a_logo'
        ' ON (c.id = a_logo.catalog_id AND a_logo.type = %s)'
        ' WHERE c.id = %s',
        (Attribute.ATTR_LOGO,id,)
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

###############################################################################
# API Routes
###############################################################################

@bp.route('/_types')
def _types():
    cursor = get_db_cursor()
    query = 'SELECT * FROM catalog_type WHERE 1=1'
    params = ()
    type_name = request.args.get('type_name')
    if type_name:
        query += ' AND title=%s'
        params = (*params, type_name,)
    cursor.execute(query, params)
    return jsonify(cursor.fetchall())

@bp.route('/<int:id>/_get_logo')
def _get_logo(id):
    return jsonify(get_catalog_logo(id))

@bp.route('/_get')
def _get():
    id = request.args.get('id', -1, type=int)

    catalog = get_catalog_full(id)
    if catalog is None:
        return jsonify(error="Catalog item doesn't exist")

    return jsonify(catalog)

@bp.route('/_filtered_list')
def _filtered_list():
    company_id = request.args.get('company', -1, type=int)
    parent_id = request.args.get('parent', -1, type=int)
    includes_id = request.args.get('includes', -1, type=int)
    type_id = request.args.get('type_id', -1, type=int)
    type_name = request.args.get('type_name')
    name = request.args.get('name')
    if type_name:
        type_id = get_catalog_type_id(type_name)
    noparent = request.args.get('noparent', False, type=bool)
    is_main = request.args.get('is_main', False, type=bool)
    is_group = request.args.get('is_group', False, type=bool)

    cursor = get_db_cursor()
    query = 'SELECT c.id, c.title, c.title_eng,'                       \
            ' created, c.type_id,'                                     \
            ' ct.title as type_title, ct.is_physical, '                \
            ' year, com.title as company, c.company_id,'               \
            ' a_logo.value_id as logo_id,'                             \
            ' (SELECT COUNT(*) FROM catalog cc'                        \
            '   JOIN catalog_relation r WHERE cc.id=r.catalog_id2'     \
            '   AND c.id=r.catalog_id1 AND r.type=%s) AS count'        \
            ' FROM catalog c JOIN catalog_type ct ON c.type_id = ct.id'\
            ' LEFT JOIN company com ON com.id = c.company_id'          \
            ' LEFT JOIN catalog_attribute a_logo'                      \
            ' ON (c.id = a_logo.catalog_id AND a_logo.type = %s)'
    suffix = ' ORDER BY c.title'
    where = ' WHERE 1 = 1'
    params = (Relation.REL_INCLUDES,Attribute.ATTR_LOGO,)
    # parameters are integer - insert them without escaping
    if company_id != -1:
        where += ' AND com.id = %d' % company_id
    if parent_id != -1:
        if is_main:
            rel = Relation.REL_MAIN_ITEM
        else:
            rel = Relation.REL_INCLUDES
        where += ' AND EXISTS (SELECT 1 FROM catalog_relation' \
                 '      WHERE catalog_id1 = %s AND catalog_id2 = c.id AND type = %s)'
        params = (*params, parent_id, rel,)
    if includes_id != -1:
        query += ' JOIN catalog_relation r3 ON r3.catalog_id1 = c.id'
        where += ' AND r3.catalog_id2 = %d' % includes_id \
              +  ' AND r3.type = %d' % Relation.REL_INCLUDES
    if type_id != -1:
        where += ' AND ct.id = %d' % type_id
    if noparent:
        where += ' AND NOT EXISTS (SELECT 1 FROM catalog_relation' \
                 '      WHERE catalog_id2 = c.id AND type = %d)' % Relation.REL_INCLUDES
    if name:
        # TODO: spaces are not supported in the template?
        where += ' AND c.title LIKE %s'
        params = (*params, '%' + name + '%', )
    if is_group:
        where += ' AND ct.is_group = TRUE'
    else:
        where += ' AND ct.is_group = FALSE'

    #print(query + where + suffix)
    #print(params)

    cursor.execute(query + where + suffix, params)
    result = cursor.fetchall()

    return jsonify(result)

@bp.route('/_images')
def _images():
    id = request.args.get('id', -1, type=int)
    return jsonify(get_catalog_images(id))

@bp.route('/_upload_image', methods=('POST',))
@login_required
@admin_required
def _upload_image():
    id = request.args.get('id', -1, type=int)
    get_catalog(id)

    if 'file' not in request.files:
        return abort(400)

    file = request.files['file']
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
        return jsonify(cursor.fetchone())

    return abort(400)

@bp.route('/_delete_image')
@login_required
@admin_required
def _delete_image():
    id = request.args.get('id', -1, type=int)
    catalog = get_catalog(id)

    img = request.args.get('img', -1, type=int)

    if img == -1:
        return abort(400)

    cursor = get_db_cursor()
    cursor.execute(
        'DELETE FROM catalog_attribute WHERE type = %s'
        ' AND catalog_id = %s AND value_id = %s',
        (Attribute.ATTR_IMAGE, id, img,)
    )
    db_commit()

    return jsonify(result='success')

@bp.route('/_own', methods=('POST',))
@login_required
def _own():
    id = int(request.args['id'])
    catalog = get_catalog(id)

    if not catalog['is_physical']:
        abort(403)

    collection = get_user_collection(g.user['id'])
    try:
        main = request.json[str(id)]
        iid = ''
        if 'internal' in main:
            iid = main['internal']
        cursor = get_db_cursor()
        cursor.execute(
            'INSERT INTO item (catalog_id, internal_id, description, collection_id)'
            ' VALUES (%s, %s, %s, %s)',
            (id, iid, '', collection['id'])
        )
        item_id = cursor.lastrowid

        for subitem, attr in request.json.items():
            subid = int(subitem)
            if id == subid:
                continue
            if attr['use']:
                # assert that catalog item exists
                get_catalog(subid)
                iid = ''
                if 'internal' in attr:
                    iid = attr['internal']
                cursor.execute(
                    'INSERT INTO item (catalog_id, internal_id, description, collection_id)'
                    ' VALUES (%s, %s, %s, %s)',
                    (subid, iid, '', collection['id'])
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
        abort(500)

    return jsonify(result='success')

@bp.route('/_update', methods=('POST',))
@login_required
def _update():
    id = int(request.args['id'])
    catalog = get_catalog(id)
    try:
        field = request.json['field']
        value = request.json['value']
        if field not in ['title', 'title_eng', 'description',
            'type_id', 'year', 'company_id']:
            abort(403)
        if field == 'year':
            year = int(value)
            if year < 1500 or year > 2100:
                abort(403)
        if field == 'company_id':
            if (get_company(value) is None):
                value = None
        if field == 'type_id' and (get_catalog_type(value) is None):
            abort(403)
        cursor = get_db_cursor()
        # field is validated, use concatenation here
        cursor.execute(
            'UPDATE catalog SET ' + field + ' = %s WHERE id = %s',
            (value, id)
        )
#        if not g.user.admin:
        cursor.execute(
            'INSERT INTO catalog_history (catalog_id, user_id, field, value)'
            ' VALUES (%s, %s, %s, %s)',
            (id, g.user['id'], field, value)
        )
        db_commit()
    except:
        db_rollback()
        abort(403)

    return jsonify(result='success')

@bp.route('/_create', methods=('POST',))
@login_required
@admin_required
def _create():
    error = None;
    type_id = request.json['type_id']
    title = request.json['title']
    title_eng = request.json['title_eng']
    description = request.json['description']
    company_id = int(request.json['company_id'])
    if company_id == -1:
        company_id = None
    year = None
    if request.json['year'] != '':
        try:
            year = int(request.json['year'])
            if year < 1500 or year > 2100:
                error = 'Invalid year'
        except:
            error = 'Invalid year'

    # assert that catalog type exists
    get_catalog_type(type_id)
    # assert that company exists
    if (company_id is not None) and (get_company(company_id) is None):
        error = 'Invalid company'

    if title_eng is None or title_eng == "":
        error = 'title_eng is required'

    if error is not None:
        abort(403)

    try:
        cursor = get_db_cursor()
        cursor.execute(
            'INSERT INTO catalog (type_id, title, title_eng, description, year, company_id)'
            ' VALUES (%s, %s, %s, %s, %s, %s)',
            (type_id, title, title_eng, description, year, company_id)
        )
        catalog_id = cursor.lastrowid
        if 'parent' in request.json:
            parent = int(request.json['parent'])
            # validate the parent
            get_catalog(parent)
            cursor.execute(
                'INSERT INTO catalog_relation'
                ' (catalog_id1, catalog_id2, type)'
                ' VALUES (%s, %s, %s)',
                (parent, catalog_id, Relation.REL_INCLUDES)
            )
        db_commit()
    except:
        db_rollback()
        abort(403)

    return jsonify(result='success')

@bp.route('/_create_kit', methods=('POST',))
@login_required
@admin_required
def _create_kit():
    id = int(request.args['id'])
    catalog = get_catalog(id)
    if not catalog['is_physical']:
        abort(403)

    kit_type = get_catalog_type_id('Kit')

    title = request.json['title']
    title_eng = request.json['title_eng']
    if not title_eng:
        abort(403)

    try:
        cursor = get_db_cursor()
        cursor.execute(
            'INSERT INTO catalog (type_id, title, title_eng, description, company_id)'
            ' VALUES (%s, %s, %s, %s, %s)',
            (kit_type, title, title_eng, '', catalog['company_id'],)
        )
        kit_id = cursor.lastrowid

        # Add main item into the kit
        cursor.execute(
            'INSERT INTO catalog_relation'
            ' (catalog_id1, catalog_id2, type)'
            ' VALUES (%s, %s, %s), (%s, %s, %s)',
            (kit_id, id, Relation.REL_INCLUDES,
             kit_id, id, Relation.REL_MAIN_ITEM,)
        )

        for item in request.json['items']:
            print(item)
            title_item = item['title']
            type_id = int(item['type'])
            ct = get_catalog_type(type_id)
            if not ct['is_physical']:
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
        abort(403)

    return jsonify(result='success')

@bp.route('/_relation_remove', methods=('POST',))
@admin_required
def _relation_remove():
    id = int(request.json['id'])
    family = int(request.json['family'])
    cursor = get_db_cursor()
    cursor.execute(
        'DELETE FROM catalog_relation'
        ' WHERE catalog_id1=%s AND catalog_id2=%s AND type=%s',
        (family, id, Relation.REL_INCLUDES,)
    )
    db_commit()
    return jsonify(result='success')

@bp.route('/_relation_add', methods=('POST',))
@admin_required
def _relation_add():
    id1 = int(request.json['id1'])
    id2 = int(request.json['id2'])

    # assert the ids
    get_catalog(id1)
    get_catalog(id2)

    cursor = get_db_cursor()
    cursor.execute(
        'INSERT INTO catalog_relation (catalog_id1, catalog_id2, type)'
        ' VALUES (%s, %s, %s)',
        (id1, id2, Relation.REL_INCLUDES,)
    )
    db_commit()
    return jsonify(result='success')

@bp.route('/_set_logo', methods=('POST',))
@login_required
@admin_required
def _set_logo():
    try:
        id = int(request.args['id'])
        catalog = get_catalog(id)

        file = request.files['file']
        file_id = upload_image(file, 64, 64)
        if file_id is None:
            # Only 64x64 images can be used as a logo
            abort(400)

        cursor = get_db_cursor()
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
        db_commit()
    except:
        db_rollback()
        abort(403)

    return jsonify(result='success')

###############################################################################
# Routes
###############################################################################

# @bp.route('/_join', methods=('POST',))
# @login_required
# @admin_required
# def _join():
#     id1 = int(request.form['id1'])
#     id2 = int(request.form['id2'])
#     logo = int(request.form['logos'])
#     title = request.form['title']
#     title_eng = request.form['title_eng']
#     year = request.form['year']
#     description = request.form['description']

#     if not title:
#         abort(403)

#     if logo != 1 and logo != 2:
#         abort(403)

#     if year == '':
#         year = None

#     # assert that catalog items exist
#     c1 = get_catalog(id1)
#     c2 = get_catalog(id2)

#     if c1['company_id'] != c2['company_id']:
#         abort(403)

#     if c1['type_id'] != c2['type_id']:
#         abort(403)

#     cursor = get_db_cursor()

#     cursor.execute('SELECT * FROM catalog_relation'
#         ' WHERE catalog_id1 = %s AND catalog_id2 = %s',
#         (id1, id2,))
#     if cursor.fetchone():
#         abort(403)

#     cursor.execute('SELECT * FROM catalog_relation'
#         ' WHERE catalog_id1 = %s AND catalog_id2 = %s',
#         (id2, id1,))
#     if cursor.fetchone():
#         abort(403)

#     # Set new parameters of the catalog item
#     cursor.execute(
#         'UPDATE catalog SET title = %s, title_eng = %s, description = %s,'
#         ' year = %s'
#         ' WHERE id = %s',
#         (title, title_eng, description, year, id1,)
#     )

#     # Set new logo
#     if logo == 2:
#         cursor.execute(
#             'DELETE FROM catalog_attribute'
#             ' WHERE catalog_id = %s AND type = %s',
#             (id1, Attribute.ATTR_LOGO,)
#         )
#     else:
#         cursor.execute(
#             'DELETE FROM catalog_attribute'
#             ' WHERE catalog_id = %s AND type = %s',
#             (id2, Attribute.ATTR_LOGO,)
#         )

#     # Redirect items
#     cursor.execute(
#         'UPDATE item SET catalog_id = %s WHERE catalog_id = %s',
#         (id1, id2, )
#     )

#     # Redirect attributes
#     cursor.execute(
#         'UPDATE catalog_attribute SET catalog_id = %s WHERE catalog_id = %s',
#         (id1, id2, )
#     )

#     # Delete duplicate relations
#     cursor.execute(
#         'DELETE FROM catalog_relation WHERE catalog_id1 = %s AND type = %s'
#         ' AND catalog_id2 IN (SELECT DISTINCT catalog_id2 FROM'
#                              ' (SELECT * FROM catalog_relation'
#                              ' WHERE catalog_id1 = %s AND type = %s) AS tmp)',
#         (id2, Relation.REL_INCLUDES, id1, Relation.REL_INCLUDES,)
#     )
#     cursor.execute(
#         'DELETE FROM catalog_relation WHERE catalog_id2 = %s AND type = %s'
#         ' AND catalog_id1 IN (SELECT DISTINCT catalog_id1 FROM'
#                              ' (SELECT * FROM catalog_relation'
#                              ' WHERE catalog_id2 = %s AND type = %s) AS tmp)',
#         (id2, Relation.REL_INCLUDES, id1, Relation.REL_INCLUDES,)
#     )

#     # Redirect relations
#     cursor.execute(
#         'UPDATE catalog_relation SET catalog_id1 = %s WHERE catalog_id1 = %s',
#         (id1, id2, )
#     )
#     cursor.execute(
#         'UPDATE catalog_relation SET catalog_id2 = %s WHERE catalog_id2 = %s',
#         (id1, id2, )
#     )

#     # Delete old catalog item
#     cursor.execute('DELETE FROM catalog WHERE id = %s', (id2,))

#     # Commit all the changes
#     db_commit()

#     return redirect(url_for('catalog.view', id=id1))

# @bp.route('/<int:id>/_delete')
# @login_required
# @admin_required
# def _delete(id):
#     # assert id is correct
#     catalog = get_catalog(id)

#     cursor = get_db_cursor()
#     # delete attributes
#     cursor.execute(
#         'DELETE FROM catalog_attribute WHERE catalog_id = %s',
#         (id,)
#     )
#     # delete relations
#     cursor.execute(
#         'DELETE FROM catalog_relation WHERE catalog_id1 = %s OR catalog_id2 = %s',
#         (id, id,)
#     )
#     # delete item
#     cursor.execute('DELETE FROM catalog WHERE id = %s', (id,));

#     # TODO: delete child items for the kit?

#     db_commit()

#     return redirect(url_for('catalog.index'))
