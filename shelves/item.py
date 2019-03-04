from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for, jsonify
)
from werkzeug.exceptions import abort

from shelves.auth import (login_required)
from shelves.db import get_db_cursor, db_commit
from shelves.uploads import upload_image
from shelves.relation import Relation
from shelves.attribute import Attribute

bp = Blueprint('item', __name__, url_prefix='/item')

def get_item_images(id):
    cursor = get_db_cursor()
    cursor.execute(
        'SELECT img.id, img.filename'
        ' FROM item i JOIN item_attribute a ON i.id = a.item_id'
        ' JOIN image img ON a.value_id = img.id'
        ' WHERE a.type = %s AND i.id = %s',
        (Attribute.ATTR_IMAGE, id,)
    )
    return cursor.fetchall()

def get_item(id):
    cursor = get_db_cursor()
    cursor.execute(
        'SELECT i.id, i.description, c.id AS catalog_id,'
        ' c.title, c.title_eng, ct.title AS type_title, added,'
        '       col.owner_id, i.internal_id, i.collection_id '
        ' FROM item i JOIN catalog c ON i.catalog_id = c.id'
        ' JOIN catalog_type ct ON c.type_id = ct.id'
        ' JOIN collection col ON i.collection_id = col.id'
        ' WHERE i.id = %s',
        (id,)
    )

    item = cursor.fetchone()

    if item is None:
        abort(404, "Item id {0} doesn't exist.".format(id))

    return item

###############################################################################
# JSON Routes
###############################################################################

@bp.route('/_filtered_list')
def _filtered_list():
    user_id = request.args.get('user', -1, type=int)
    parent_id = request.args.get('parent', -1, type=int)
    catalog_id = request.args.get('catalog', -1, type=int)
    includes_id = request.args.get('includes', -1, type=int)
    collection_id = request.args.get('collection', -1, type=int)
    includes_catalog_id = request.args.get('includes_catalog', -1, type=int)
    is_main = request.args.get('is_main', -1, type=int)

    cursor = get_db_cursor()

    query = 'SELECT i.id, i.description, c.id AS catalog_id,' \
            ' c.title, c.title_eng, ct.title AS type_title, added,'        \
            '       col.owner_id, i.internal_id, i.collection_id,' \
            '       (SELECT value_id FROM item_attribute '    \
            '            WHERE item_id = i.id AND type=%s LIMIT 1) AS img_id' \
            ' FROM item i JOIN catalog c ON i.catalog_id = c.id' \
            ' JOIN catalog_type ct ON c.type_id = ct.id'         \
            ' JOIN collection col ON i.collection_id = col.id'

    where = ' WHERE 1 = 1'
    params = (Attribute.ATTR_IMAGE,)

    if user_id != -1:
        where += ' AND col.owner_id = %s'
        params = (*params, user_id)
    if catalog_id != -1:
        where += ' AND catalog_id = %s'
        params = (*params, catalog_id)
    if parent_id != -1:
        parent = get_item(parent_id)
        where += ' AND EXISTS (SELECT 1 FROM item_relation' \
                 ' WHERE item_id1 = %s AND item_id2 = i.id AND type = %s)'
        params = (*params, parent_id, Relation.REL_INCLUDES)
        if is_main != -1:
            where += ' AND ' + ("" if is_main == 1 else "NOT") + \
                     ' EXISTS (SELECT 1 FROM catalog_relation' \
                     ' WHERE catalog_id1 = %s AND catalog_id2 = catalog_id AND type = %s)'
            params = (*params, parent['catalog_id'], Relation.REL_MAIN_ITEM)
    if includes_id != -1:
        query += ' JOIN item_relation r2 ON r2.item_id1 = i.id'
        where += ' AND r2.item_id2 = %s AND r2.type = %s'
        params =(*params, includes_id, Relation.REL_INCLUDES)
    if collection_id != -1:
        where += ' AND col.id = %s'
        params = (*params, collection_id)
    if includes_catalog_id != -1:
        where += ' AND EXISTS (SELECT 1 FROM catalog_relation' \
                 ' WHERE type = %s AND catalog_id1 = c.id'     \
                 ' AND catalog_id2 = %s)'
        params = (*params, Relation.REL_INCLUDES, includes_catalog_id)
    
    cursor.execute(query + where, params)
    #print(query + where)
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
    id = request.args.get('id', -1, type=int)
    item = get_item(id)
    if item['owner_id'] != g.user['id']:
        return abort(403)

    if 'file' not in request.files:
        return abort(400)

    file = request.files['file']
    if file:
        file_id = upload_image(file)
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

###############################################################################
# Routes
###############################################################################

@bp.route('/<int:id>')
def view(id):
    item = get_item(id)
    return render_template('item/view.html', item=item)

@bp.route('/<int:id>/update', methods=('GET', 'POST'))
@login_required
def update(id):
    item = get_item(id)
    if not g.user['admin'] and item['owner_id'] != g.user['id']:
        abort(403)

    if request.method == 'POST':
        description = request.form['description']
        internal_id = request.form['internal_id']
        db = get_db_cursor()
        db.execute(
            'UPDATE item SET description = %s, internal_id = %s'
            ' WHERE id = %s',
            (description, internal_id, id)
        )
        db_commit()
        return redirect(url_for("item.view", id=id))

    return render_template('item/update.html', item=item)


@bp.route('/<int:id>/_delete')
@login_required
def _delete(id):
    item = get_item(id)

    if not g.user['admin'] and item['owner_id'] != g.user['id']:
        abort(403)

    cursor = get_db_cursor()
    # delete attributes
    cursor.execute(
        'DELETE FROM item_attribute WHERE item_id = %s',
        (id,)
    )
    # delete relations
    cursor.execute(
        'DELETE FROM item_relation WHERE item_id1 = %s OR item_id2 = %s',
        (id, id,)
    )
    # delete item
    cursor.execute('DELETE FROM item WHERE id = %s', (id,));

    db_commit()

    from shelves.collection import get_user_collection
    collection = get_user_collection(g.user['id'])

    return redirect(url_for('collection.view', id=collection['id']))

@bp.route('/_items_filtered')
def _items_filtered():
    user_id = request.args.get('user', -1, type=int)
    parent_id = request.args.get('parent', -1, type=int)
    catalog_id = request.args.get('catalog', -1, type=int)
    includes_id = request.args.get('includes', -1, type=int)
    collection_id = request.args.get('collection', -1, type=int)
    includes_catalog_id = request.args.get('includes_catalog', -1, type=int)
    is_main = request.args.get('is_main', False, type=bool)

    # TODO: check at frontend
    if parent_id == -1 and is_main:
        return jsonify(result='')

    cursor = get_db_cursor()

    query = 'SELECT i.id, i.description, c.id AS catalog_id,' \
            ' c.title, c.title_eng, ct.title AS type_title, added,'        \
            '       col.owner_id, i.internal_id, i.collection_id,' \
            '       (SELECT value_id FROM item_attribute '    \
            '            WHERE item_id = i.id AND type=%s LIMIT 1) AS img_id' \
            ' FROM item i JOIN catalog c ON i.catalog_id = c.id' \
            ' JOIN catalog_type ct ON c.type_id = ct.id'         \
            ' JOIN collection col ON i.collection_id = col.id'

    where = ' WHERE 1 = 1'
    params = (Attribute.ATTR_IMAGE,)

    if user_id != -1:
        where += ' AND col.owner_id = %s'
        params = (*params, user_id)
    if catalog_id != -1:
        where += ' AND catalog_id = %s'
        params = (*params, catalog_id)
    if parent_id != -1:
        parent = get_item(parent_id)
        where += ' AND EXISTS (SELECT 1 FROM item_relation' \
                 ' WHERE item_id1 = %s AND item_id2 = i.id AND type = %s)'
        params = (*params, parent_id, Relation.REL_INCLUDES)
        if is_main:
            where += ' AND EXISTS (SELECT 1 FROM catalog_relation' \
                     ' WHERE catalog_id1 = %s AND catalog_id2 = catalog_id AND type = %s)'
            params = (*params, parent['catalog_id'], Relation.REL_MAIN_ITEM)
    if includes_id != -1:
        query += ' JOIN item_relation r2 ON r2.item_id1 = i.id'
        where += ' AND r2.item_id2 = %s AND r2.type = %s'
        params =(*params, includes_id, Relation.REL_INCLUDES)
    if collection_id != -1:
        where += ' AND col.id = %s'
        params = (*params, collection_id)
    if includes_catalog_id != -1:
        where += ' AND EXISTS (SELECT 1 FROM catalog_relation' \
                 ' WHERE type = %s AND catalog_id1 = c.id'     \
                 ' AND catalog_id2 = %s)'
        params = (*params, Relation.REL_INCLUDES, includes_catalog_id)
    
    cursor.execute(query + where, params)
    #print(query + where)
    result = cursor.fetchall()

    return jsonify(result=result)

@bp.route('/<int:id>/_add_to_kit')
@login_required
def _add_to_kit(id):
    kit_id = request.args.get('kit', -1, type=int)

    item = get_item(id)

    if not g.user['admin'] and item['owner_id'] != g.user['id']:
        abort(403)

    kit = get_item(kit_id)

    cursor = get_db_cursor()

    # validate that the item is not already included anywhere
    cursor.execute('SELECT * FROM item_relation'
        ' WHERE item_id2 = %s AND type = %s',
        (id, Relation.REL_INCLUDES,))
    if cursor.fetchone():
        abort(403)

    cursor.execute(
        'INSERT INTO item_relation (item_id1, item_id2, type)'
        ' VALUES (%s, %s, %s)',
        (kit_id, id, Relation.REL_INCLUDES)
        )
    db_commit()

    return jsonify(result='')
