from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for
)
from werkzeug.exceptions import abort

from shelves.auth import login_required
from shelves.db import get_db

bp = Blueprint('collection', __name__, url_prefix='/collection')

# All collections of all users
@bp.route('/')
def index():
    db = get_db()
    collections = db.execute(
        'SELECT c.id, title, description, created, owner_id, username'
        ' FROM collection c JOIN user u ON c.owner_id = u.id'
        ' ORDER BY created DESC'
    ).fetchall()
    return render_template('collection/index.html', collections=collections)

@bp.route('/create', methods=('GET', 'POST'))
@login_required
def create():
    if request.method == 'POST':
        title = request.form['title']
        description = request.form['description']
        error = None

        if not title:
            error = 'Title is required.'

        if error is not None:
            flash(error)
        else:
            db = get_db()
            db.execute(
                'INSERT INTO collection (title, description, owner_id)'
                ' VALUES (?, ?, ?)',
                (title, description, g.user['id'])
            )
            db.commit()
            return redirect(url_for('collection.index'))

    return render_template('collection/create.html')

def get_collection(id, check_author=True):
    collection = get_db().execute(
        'SELECT c.id, title, description, created, owner_id, username'
        ' FROM collection  c JOIN user u ON c.owner_id = u.id'
        ' WHERE c.id = ?',
        (id,)
    ).fetchone()

    if collection is None:
        abort(404, "Collection id {0} doesn't exist.".format(id))

    if check_author and collection['owner_id'] != g.user['id']:
        abort(403)

    return collection

@bp.route('/<int:id>/update', methods=('GET', 'POST'))
@login_required
def update(id):
    collection = get_collection(id)

    if request.method == 'POST':
        title = request.form['title']
        description = request.form['description']
        error = None

        if not title:
            error = 'Title is required.'

        if error is not None:
            flash(error)
        else:
            db = get_db()
            db.execute(
                'UPDATE collection SET title = ?, description = ?'
                ' WHERE id = ?',
                (title, description, id)
            )
            db.commit()
            return redirect(url_for('collection.index'))

    return render_template('collection/update.html', collection=collection)
