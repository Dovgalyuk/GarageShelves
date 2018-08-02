from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for
)
from werkzeug.exceptions import abort

from shelves.auth import (login_required)
from shelves.db import get_db
#from shelves.concept import get_concept
#from shelves.collection import get_collection

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

# @bp.route('/<int:id>')
# def view(id):
#     concept = get_concept(id)

#     return render_template('concept/view.html',
#         concept=concept, concept_types=get_concept_types())

# @bp.route('/<int:id>/update', methods=('GET', 'POST'))
# @login_required
# @admin_required
# def update(id):
#     concept = get_concept(id)

#     if request.method == 'POST':
#         title = request.form['title']
#         description = request.form['description']
#         type_id = request.form['type_id']
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
#                 'UPDATE concept SET title = ?, description = ?, type_id = ?'
#                 ' WHERE id = ?',
#                 (title, description, type_id, id)
#             )
#             db.commit()
#             return redirect(url_for("concept.view", id=id))

#     return render_template('concept/update.html',
#         concept=concept, concept_types=get_concept_types())
