from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for
)
from werkzeug.exceptions import abort

from shelves.auth import login_required
from shelves.db import get_db_cursor, db_commit
from shelves.item import render_items_list

bp = Blueprint('collection', __name__, url_prefix='/collection')

# All collections of all users
@bp.route('/')
def index():
    db = get_db_cursor()
    db.execute(
        'SELECT c.id, title, description, created, owner_id, username'
        ' FROM collection c JOIN user u ON c.owner_id = u.id'
        ' ORDER BY created DESC'
    )
    collections = db.fetchall()
    return render_template('collection/index.html', collections=collections)

def get_collection(id, check_author=True):
    cursor = get_db_cursor()
    cursor.execute(
        'SELECT c.id, title, description, created, owner_id, username'
        ' FROM collection  c JOIN user u ON c.owner_id = u.id'
        ' WHERE c.id = %s',
        (id,)
    )

    collection = cursor.fetchone()

    if collection is None:
        abort(404, "Collection id {0} doesn't exist.".format(id))

    if check_author and collection['owner_id'] != g.user['id']:
        abort(403)

    return collection

def get_user_collection(id):
    cursor = get_db_cursor()
    cursor.execute(
        'SELECT id, title, description, created, owner_id'
        ' FROM collection'
        ' WHERE owner_id = %s',
        (id,)
    )

    collection = cursor.fetchone()

    if collection is None:
        abort(404, "Collection id {0} doesn't exist.".format(id))

    return collection

@bp.route('/<int:id>')
def view(id):
    from shelves.item import get_collection_items
    collection = get_collection(id, False)
    items = get_collection_items(id)

    return render_template('collection/view.html',
        collection=collection, rendered_items=render_items_list(items))

@bp.route('/<int:id>/update', methods=('GET', 'POST'))
@login_required
def update(id):
    collection = get_collection(id, True)

    if request.method == 'POST':
        title = request.form['title']
        description = request.form['description']
        error = None

        if not title:
            error = 'Title is required.'

        if error is not None:
            flash(error)
        else:
            db = get_db_cursor()
            db.execute(
                'UPDATE collection SET title = %s, description = %s'
                ' WHERE id = %s',
                (title, description, id)
            )
            db_commit()
            return redirect(url_for('collection.view', id=id))

    return render_template('collection/update.html', collection=collection)
