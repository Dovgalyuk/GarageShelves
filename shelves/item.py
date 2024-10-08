from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for, jsonify
)
from werkzeug.exceptions import abort

from shelves.auth import (login_required)
from shelves.db import get_db_cursor, db_commit, db_rollback
from shelves.image import upload_image
from shelves.relation import Relation
from shelves.attribute import Attribute
from shelves.catalog import get_catalog
from shelves.type import Type

bp = Blueprint('item', __name__, url_prefix='/item')

def get_item_images(id):
    cursor = get_db_cursor()
    cursor.execute(
        'SELECT a.value_id AS id'
        ' FROM item_attribute a'
        ' WHERE a.type = %s AND a.item_id = %s',
        (Attribute.ATTR_IMAGE, id,)
    )
    return cursor.fetchall()

def get_item(id):
    cursor = get_db_cursor()
    cursor.execute(
        'SELECT i.id, i.description, c.id AS catalog_id,'
        ' c.title, c.title_eng, added,'
        '       col.owner_id, i.internal_id, i.collection_id, '
        ' rr.catalog_id1 AS root, cr.title_eng AS root_title'
        ' FROM item i'
        ' JOIN catalog c ON i.catalog_id = c.id'
        ' JOIN collection col ON i.collection_id = col.id'
        ' LEFT JOIN catalog_relation rr ON rr.catalog_id2 = c.id'
        ' LEFT JOIN catalog cr ON rr.catalog_id1 = cr.id'
        ' WHERE i.id = %s AND rr.type = %s',
        (id, Relation.REL_ROOT,)
    )

    item = cursor.fetchone()

    if item is None:
        abort(404, "Item id {0} doesn't exist.".format(id))

    return item

# function for checking existing dependencies
# returns False if subitem is already parent of main item
def check_parent_loops(main_id, subitem_id):
    checked = set()
    queue = {main_id}
    cursor = get_db_cursor()
    while queue:
        next = queue.pop()
        if next == subitem_id:
            return False
        if next not in checked:
            checked.add(next)
            cursor.execute(
                'SELECT item_id1 FROM item_relation'
                ' WHERE type = %s AND item_id2 = %s',
                (Relation.REL_INCLUDES, next,)
            )
            for v in cursor.fetchall():
                queue.add(v['item_id1'])
    #
    return True

###############################################################################
# JSON Routes
###############################################################################

@bp.route('/_filtered_list')
def _filtered_list():
    user_id = request.args.get('user', -1, type=int)
    parent_id = request.args.get('parent', -1, type=int)
    noparent = request.args.get('noparent') == 'true'
    catalog_id = request.args.get('catalog', -1, type=int)
    catalog_title = request.args.get('catalog_title')
    includes_id = request.args.get('includes', -1, type=int)
    collection_id = request.args.get('collection', -1, type=int)
    is_main = request.args.get('is_main', -1, type=int)
    latest = request.args.get('latest', -1, type=int)
    if latest and latest > 100:
        latest = 10

    catalog_type = Type.get_id(request.args.get('type'))
    catalog_parent_id = request.args.get('catalog_parent', -1, type=int)
    catalog_parent_rel = Relation.get_id(request.args.get('catalog_parent_rel'))

    cursor = get_db_cursor()

    add_fields = ''
    add_tables = ''
    if latest > 0:
        add_fields = ' u.username,'
        add_tables = ' JOIN user u ON u.id = col.owner_id'
    query = 'SELECT i.id, i.description, c.id AS catalog_id,' \
            ' c.title, c.title_eng, added,'        \
            '       col.owner_id, i.internal_id, i.collection_id,' \
            + add_fields + \
            '       (SELECT value_id FROM item_attribute '    \
            '            WHERE item_id = i.id AND type=%s LIMIT 1) AS img_id,' \
            ' rr.catalog_id1 AS root, cr.title_eng AS root_title' \
            ' FROM item i JOIN catalog c ON i.catalog_id = c.id' \
            ' JOIN collection col ON i.collection_id = col.id' \
            ' LEFT JOIN catalog_relation rr ON rr.catalog_id2 = c.id' \
            ' LEFT JOIN catalog cr ON rr.catalog_id1 = cr.id' \
            + add_tables

    where = ' WHERE 1 = 1 AND rr.type = %s'
    params = (Attribute.ATTR_IMAGE, Relation.REL_ROOT,)

    if user_id != -1:
        where += ' AND col.owner_id = %s'
        params = (*params, user_id)
    if catalog_id != -1:
        where += ' AND catalog_id = %s'
        params = (*params, catalog_id)
    if parent_id != -1:
        parent = get_item(parent_id)
        query += ' JOIN item_relation ir ON i.id = ir.item_id2'
        where += ' AND ir.item_id1 = %s AND ir.type = %s'
        params = (*params, parent_id, Relation.REL_INCLUDES)
        if is_main != -1:
            where += ' AND ' + ("" if is_main == 1 else "NOT") + \
                     ' EXISTS (SELECT 1 FROM catalog_relation' \
                     ' WHERE catalog_id1 = %s AND catalog_id2 = catalog_id AND type = %s)'
            params = (*params, parent['catalog_id'], Relation.REL_MAIN_ITEM)
    if catalog_parent_id != -1:
        query += ' JOIN catalog_relation crp ON c.id = crp.catalog_id2'
        where += ' AND crp.catalog_id1 = %s AND crp.type = %s'
        params = (*params, catalog_parent_id, catalog_parent_rel,)
    if catalog_type != -1:
        where += ' AND c.type = %s'
        params = (*params, catalog_type)
    if noparent:
        where += ' AND NOT EXISTS (SELECT 1 FROM item_relation' \
                 '      WHERE item_id2 = i.id AND type = %s)'
        params = (*params, Relation.REL_INCLUDES)
    if includes_id != -1:
        query += ' JOIN item_relation r2 ON r2.item_id1 = i.id'
        where += ' AND r2.item_id2 = %s AND r2.type = %s'
        params =(*params, includes_id, Relation.REL_INCLUDES)
    if collection_id != -1:
        where += ' AND col.id = %s'
        params = (*params, collection_id)
    if catalog_title:
        # TODO: spaces are not supported in the template?
        where += ' AND (c.title LIKE %s OR c.title_eng LIKE %s)'
        params = (*params, '%' + catalog_title + '%', '%' + catalog_title + '%')

    if latest > 0:
        where += " ORDER BY i.added DESC LIMIT %d" % latest

    #print(query + where)
    #print(params)

    cursor.execute(query + where, params)
    result = cursor.fetchall()

    return jsonify(result)

@bp.route('/_images')
def _images():
    id = request.args.get('id', -1, type=int)
    return jsonify(get_item_images(id))

@bp.route('/_get')
def _get():
    id = request.args.get('id', -1, type=int)
    return jsonify(get_item(id))

@bp.route('/_upload_image', methods=('POST',))
@login_required
def _upload_image():
    id = request.form.get('id', -1, type=int)
    item = get_item(id)

    if item['owner_id'] != g.user['id']:
        return abort(403)

    if 'file' not in request.files:
        return abort(400)

    file = request.files['file']
    if file:
        file_id = upload_image(file, request.form.get('desc'))
        cursor = get_db_cursor()
        cursor.execute(
            'INSERT INTO item_attribute (type, item_id, value_id)'
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
def _delete_image():
    id = request.args.get('id', -1, type=int)
    item = get_item(id)
    if not g.user['admin'] or (item['owner_id'] != g.user['id']):
        return abort(403)

    img = request.args.get('img', -1, type=int)
    if img == -1:
        return abort(400)

    cursor = get_db_cursor()
    cursor.execute(
        'DELETE FROM item_attribute WHERE type = %s'
        ' AND item_id = %s AND value_id = %s',
        (Attribute.ATTR_IMAGE, id, img,)
    )
    db_commit()

    return jsonify(result='success')

@bp.route('/_update', methods=('POST',))
@login_required
def _update():
    id = int(request.args['id'])
    item = get_item(id)
    if not g.user['admin'] or (item['owner_id'] != g.user['id']):
        abort(403)
    try:
        field = request.json['field']
        value = request.json['value']
        if field not in ['internal_id', 'description']:
            abort(403)
        cursor = get_db_cursor()
        # field is validated, use concatenation here
        cursor.execute(
            'UPDATE item SET ' + field + ' = %s WHERE id = %s',
            (value, id)
        )
        db_commit()
    except:
        db_rollback()
        abort(403)

    return jsonify(result='success')

@bp.route('/_software_add', methods=('POST',))
@login_required
def _software_add():
    id = request.json['id']
    item = get_item(id)
    if item['root_title'] != 'Data storage':
        abort(403)
    if not g.user['admin'] or (item['owner_id'] != g.user['id']):
        abort(403)
    try:
        soft_id = request.json['software']
        soft = get_catalog(soft_id)
        if soft['type'] != Type.TYPE_BITS:
            abort(403)
        cursor = get_db_cursor()
        cursor.execute(
            'INSERT INTO catalog_item_relation (catalog_id, item_id, type)'
            ' VALUES (%s, %s, %s)',
            (soft_id, id, Relation.REL_STORES)
            )
        db_commit()
    except:
        db_rollback()
        abort(403)

    return jsonify(result='success')    

@bp.route('/_subitem_add', methods=('POST',))
@login_required
def _subitem_add():
    id = request.json['id']
    item = get_item(id)
    if not g.user['admin'] or (item['owner_id'] != g.user['id']):
        abort(403)
    try:
        subitem_id = request.json['subitem']
        # assert that subitem exists
        subitem = get_item(subitem_id)
        if not g.user['admin'] or (subitem['owner_id'] != g.user['id']):
            abort(403)
        cursor = get_db_cursor()
        # check whether this item is already included somewhere
        cursor.execute(
            'SELECT * FROM item_relation'
            ' WHERE item_id2 = %s AND type = %s',
            (subitem_id, Relation.REL_INCLUDES)
        )
        if cursor.fetchone() is not None:
            abort(403)
        # check possible recursion
        if id == subitem_id or not check_parent_loops(id, subitem_id):
            abort(403)

        cursor.execute(
            'INSERT INTO item_relation (item_id1, item_id2, type)'
            ' VALUES (%s, %s, %s)',
            (id, subitem_id, Relation.REL_INCLUDES)
            )
        db_commit()
    except:
        db_rollback()
        abort(403)

    return jsonify(result='success')    

###############################################################################
# Routes
###############################################################################

# @bp.route('/<int:id>/_delete')
# @login_required
# def _delete(id):
#     item = get_item(id)

#     if not g.user['admin'] and item['owner_id'] != g.user['id']:
#         abort(403)

#     cursor = get_db_cursor()
#     # delete attributes
#     cursor.execute(
#         'DELETE FROM item_attribute WHERE item_id = %s',
#         (id,)
#     )
#     # delete relations
#     cursor.execute(
#         'DELETE FROM item_relation WHERE item_id1 = %s OR item_id2 = %s',
#         (id, id,)
#     )
#     # delete item
#     cursor.execute('DELETE FROM item WHERE id = %s', (id,));

#     db_commit()

#     from shelves.collection import get_user_collection
#     collection = get_user_collection(g.user['id'])

#     return redirect(url_for('collection.view', id=collection['id']))

# @bp.route('/<int:id>/_add_to_kit')
# @login_required
# def _add_to_kit(id):
#     kit_id = request.args.get('kit', -1, type=int)

#     item = get_item(id)

#     if not g.user['admin'] and item['owner_id'] != g.user['id']:
#         abort(403)

#     kit = get_item(kit_id)

#     cursor = get_db_cursor()

#     # validate that the item is not already included anywhere
#     cursor.execute('SELECT * FROM item_relation'
#         ' WHERE item_id2 = %s AND type = %s',
#         (id, Relation.REL_INCLUDES,))
#     if cursor.fetchone():
#         abort(403)

#     cursor.execute(
#         'INSERT INTO item_relation (item_id1, item_id2, type)'
#         ' VALUES (%s, %s, %s)',
#         (kit_id, id, Relation.REL_INCLUDES)
#         )
#     db_commit()

#     return jsonify(result='')
