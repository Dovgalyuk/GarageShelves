from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for
)
from werkzeug.exceptions import abort

from shelves.auth import (login_required)
from shelves.db import get_db
from shelves.uploads import upload_image

# item attributes' ids
ATTR_IMAGE = 1

bp = Blueprint('item', __name__, url_prefix='/item')

def get_collection_items(collection):
    items = get_db().execute(
        'SELECT i.id, i.description, c.title, ct.title AS type_title,'
        '       col.owner_id, u.username'
        ' FROM item i JOIN concept c ON i.concept_id = c.id'
        ' JOIN concept_type ct ON c.type_id = ct.id'
        ' JOIN collection col ON i.collection_id = col.id'
        ' JOIN user u ON col.owner_id = u.id'
        ' WHERE i.collection_id = ?',
        (collection,)
    )

    return items

def get_concept_items(collection, concept):
    items = get_db().execute(
        'SELECT i.id, i.description, c.title, ct.title AS type_title, added,'
        '       col.owner_id, u.username'
        ' FROM item i JOIN concept c ON i.concept_id = c.id'
        ' JOIN concept_type ct ON c.type_id = ct.id'
        ' JOIN collection col ON i.collection_id = col.id'
        ' JOIN user u ON col.owner_id = u.id'
        ' WHERE i.collection_id = ? AND c.id = ?',
        (collection,concept,)
    )

    return items

def get_item_images(id):
    images = get_db().execute(
        'SELECT img.id, img.filename'
        ' FROM item i JOIN item_attribute a ON i.id = a.item_id'
        ' JOIN image img ON a.value_id = img.id'
        ' WHERE a.type = ? AND i.id = ?',
        (ATTR_IMAGE, id,)
    ).fetchall()
    return images

def get_item(id):
    item = get_db().execute(
        'SELECT i.id, i.description, c.id AS concept_id,'
        ' c.title, ct.title AS type_title, added,'
        '       col.owner_id, i.internal_id'
        ' FROM item i JOIN concept c ON i.concept_id = c.id'
        ' JOIN concept_type ct ON c.type_id = ct.id'
        ' JOIN collection col ON i.collection_id = col.id'
        ' WHERE i.id = ?',
        (id,)
    ).fetchone()

    if item is None:
        abort(404, "Item id {0} doesn't exist.".format(id))

    return item

def render_items_list(items):
    return render_template('item/list.html', items=items)

###############################################################################
# Routes
###############################################################################

@bp.route('/<int:id>', methods=('GET', 'POST'))
def view(id):
    item = get_item(id)

    if request.method == 'POST':
        if item['owner_id'] != g.user['id']:
            abort(403)

        if 'item_photo' not in request.files:
            flash('No photo selected')
            return redirect(request.url)

        file = request.files['item_photo']
        if file.filename == '':
            flash('No selected file')
            return redirect(request.url)

        if file:
            file_id = upload_image(file)
            db = get_db()
            db.execute(
                'INSERT INTO item_attribute (type, item_id, value_id)'
                ' VALUES (?, ?, ?)',
                (ATTR_IMAGE, id, file_id,)
            )
            db.commit()
            return redirect(request.url)
        else:
            flash('Invalid file')
            return redirect(request.url)

    images = get_item_images(id)
    return render_template('item/view.html', item=item, images=images)

@bp.route('/<int:id>/update', methods=('GET', 'POST'))
@login_required
def update(id):
    item = get_item(id)
    if item['owner_id'] != g.user['id']:
        abort(403)

    if request.method == 'POST':
        description = request.form['description']
        internal_id = request.form['internal_id']
        db = get_db()
        db.execute(
            'UPDATE item SET description = ?, internal_id = ?'
            ' WHERE id = ?',
            (description, internal_id, id)
        )
        db.commit()
        return redirect(url_for("item.view", id=id))

    return render_template('item/update.html', item=item)
