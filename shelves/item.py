from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for
)
from werkzeug.exceptions import abort

from shelves.auth import (login_required)
from shelves.db import get_db

bp = Blueprint('item', __name__, url_prefix='/item')

def get_collection_items(collection):
    items = get_db().execute(
        'SELECT i.id, i.description, c.title, ct.title AS type_title'
        ' FROM item i JOIN concept c ON i.concept_id = c.id'
        ' JOIN concept_type ct ON c.type_id = ct.id'
        ' WHERE i.collection_id = ?',
        (collection,)
    )

    return items

def get_concept_items(collection, concept):
    items = get_db().execute(
        'SELECT i.id, i.description, c.title, ct.title AS type_title, added'
        ' FROM item i JOIN concept c ON i.concept_id = c.id'
        ' JOIN concept_type ct ON c.type_id = ct.id'
        ' WHERE i.collection_id = ? AND c.id = ?',
        (collection,concept,)
    )

    return items

def get_item(id):
    item = get_db().execute(
        'SELECT i.id, i.description, c.title, ct.title AS type_title, added,'
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

#     if request.method == 'POST':
#         type_id = request.form['type_id']
#         title = request.form['title']
#         description = request.form['description']
#         error = None

#         # assert that concept type exists
#         get_concept_type(type_id)

#         if not title:
#             error = 'Title is required.'

#         if error is not None:
#             flash(error)
#         else:
#             db = get_db()
#             db.execute(
#                 'INSERT INTO concept (type_id, title, description)'
#                 ' VALUES (?, ?, ?)',
#                 (type_id, title, description)
#             )
#             db.commit()
#             return redirect(url_for('concept.index'))

#     concept_types = get_concept_types()
#     return render_template('concept/create.html', concept_types = concept_types)

def render_items_list(items):
    return render_template('item/list.html', items=items)

@bp.route('/<int:id>')
def view(id):
    item = get_item(id)
    return render_template('item/view.html', item=item)

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
