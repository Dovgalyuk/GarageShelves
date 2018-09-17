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

def get_collection_items(collection):
    cursor = get_db_cursor()
    cursor.execute(
        'SELECT i.id, i.internal_id,  i.description, c.title,'
        '       ct.title AS type_title, col.owner_id, '
        '       (SELECT value_id FROM item_attribute '
        '            WHERE item_id = i.id AND type=%s LIMIT 1) AS img_id'
        ' FROM item i JOIN catalog c ON i.catalog_id = c.id'
        ' JOIN catalog_type ct ON c.type_id = ct.id'
        ' JOIN collection col ON i.collection_id = col.id'
        ' WHERE i.collection_id = %s'
        ,(Attribute.ATTR_IMAGE,collection,)
    )

    return cursor.fetchall()

def get_catalog_items(collection, catalog):
    cursor = get_db_cursor()
    cursor.execute(
        'SELECT i.id, i.internal_id,  i.description, c.title,'
        '       ct.title AS type_title, added, col.owner_id, u.username,'
        '       (SELECT value_id FROM item_attribute '
        '            WHERE item_id = i.id AND type=%s LIMIT 1) AS img_id'
        ' FROM item i JOIN catalog c ON i.catalog_id = c.id'
        ' JOIN catalog_type ct ON c.type_id = ct.id'
        ' JOIN collection col ON i.collection_id = col.id'
        ' JOIN user u ON col.owner_id = u.id'
        ' WHERE i.collection_id = %s AND c.id = %s'
        , (Attribute.ATTR_IMAGE,collection,catalog,)
    )

    return cursor.fetchall()

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
        ' c.title, ct.title AS type_title, added,'
        '       col.owner_id, i.internal_id'
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

def get_item_children(id):
    cursor = get_db_cursor()
    cursor.execute(
        'SELECT i.id, i.description, c.id AS catalog_id,'
        ' c.title, ct.title AS type_title, added,'
        '       col.owner_id, i.internal_id,'
        '       (SELECT value_id FROM item_attribute '
        '            WHERE item_id = i.id AND type=%s LIMIT 1) AS img_id'
        ' FROM item i JOIN catalog c ON i.catalog_id = c.id'
        ' JOIN catalog_type ct ON c.type_id = ct.id'
        ' JOIN collection col ON i.collection_id = col.id'
        ' JOIN item_relation r ON i.id = r.item_id2'
        ' WHERE r.item_id1 = %s AND r.type = %s',
        (Attribute.ATTR_IMAGE,id,Relation.REL_INCLUDES,)
    )

    return cursor.fetchall()

def render_items_list(items):
    return render_template('item/list.html', items=items)

###############################################################################
# Routes
###############################################################################

@bp.route('/<int:id>')
def view(id):
    item = get_item(id)
    return render_template('item/view.html', item=item,
        rendered_children=render_items_list(get_item_children(id)))

@bp.route('/<int:id>/update', methods=('GET', 'POST'))
@login_required
def update(id):
    item = get_item(id)
    if item['owner_id'] != g.user['id']:
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


@bp.route('/<int:id>/_get_images')
def _get_images(id):
    return jsonify(result=get_item_images(id))

@bp.route('/<int:id>/_upload_image', methods=('POST',))
def _upload_image(id):
    item = get_item(id)
    if item['owner_id'] != g.user['id']:
        return ('', 403)

    if 'img' not in request.files:
        return ('', 400)

    file = request.files['img']
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
        return jsonify(result=cursor.fetchone())

    return ('', 400)
