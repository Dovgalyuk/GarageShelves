from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for
)
from werkzeug.exceptions import abort

from shelves.auth import (login_required, admin_required)
from shelves.db import get_db
from shelves.collection import get_user_collection
from shelves.item import (get_concept_items, render_items_list)
from shelves.uploads import upload_image

bp = Blueprint('concept', __name__, url_prefix='/concept')

# Concept attributes
ATTR_IMAGE = 1

# All concepts
@bp.route('/')
def index():
    db = get_db()
    concepts = db.execute(
        'SELECT c.id, c.title, description, created, c.type_id, ct.title as type_title'
        ' FROM concept c JOIN concept_type ct ON c.type_id = ct.id'
        ' ORDER BY created DESC'
    ).fetchall()
    return render_template('concept/index.html', concepts=concepts)

def get_concept_type(id):
    ct = get_db().execute(
        'SELECT * FROM concept_type WHERE id = ?',
        (id)
    ).fetchone()

    if ct is None:
        abort(404, "Concept type id {0} doesn't exist.".format(id))

    return ct

def get_concept(id):
    concept = get_db().execute(
        'SELECT c.id, c.title, description, created, c.type_id,'
        ' ct.title as type_title, ct.physical'
        ' FROM concept c JOIN concept_type ct ON c.type_id = ct.id'
        ' WHERE c.id = ?',
        (id,)
    ).fetchone()

    if concept is None:
        abort(404, "Concept id {0} doesn't exist.".format(id))

    return concept

def get_concept_types():
    return get_db().execute('SELECT * FROM concept_type')

def get_concept_images(id):
    images = get_db().execute(
        'SELECT img.id, img.filename'
        ' FROM concept c JOIN concept_attribute a ON c.id = a.concept_id'
        ' JOIN image img ON a.value_id = img.id'
        ' WHERE a.type = ? AND c.id = ?',
        (ATTR_IMAGE, id,)
    ).fetchall()
    return images

###############################################################################
# Routes
###############################################################################

@bp.route('/create', methods=('GET', 'POST'))
@login_required
@admin_required
def create():
    if request.method == 'POST':
        type_id = request.form['type_id']
        title = request.form['title']
        description = request.form['description']
        error = None

        # assert that concept type exists
        get_concept_type(type_id)

        if not title:
            error = 'Title is required.'

        if error is not None:
            flash(error)
        else:
            db = get_db()
            db.execute(
                'INSERT INTO concept (type_id, title, description)'
                ' VALUES (?, ?, ?)',
                (type_id, title, description)
            )
            db.commit()
            return redirect(url_for('concept.index'))

    concept_types = get_concept_types()
    return render_template('concept/create.html', concept_types = concept_types)

@bp.route('/<int:id>', methods=('GET', 'POST'))
def view(id):
    concept = get_concept(id)

    if request.method == 'POST':
        if not g.user['admin']:
            abort(403)

        if 'concept_photo' not in request.files:
            flash('No photo selected')
            return redirect(request.url)

        file = request.files['concept_photo']
        if file.filename == '':
            flash('No selected file')
            return redirect(request.url)

        if file:
            file_id = upload_image(file)
            db = get_db()
            db.execute(
                'INSERT INTO concept_attribute (type, concept_id, value_id)'
                ' VALUES (?, ?, ?)',
                (ATTR_IMAGE, id, file_id,)
            )
            db.commit()
            return redirect(request.url)
        else:
            flash('Invalid file')
            return redirect(request.url)

    items = []
    if g.user:
        items = get_concept_items(get_user_collection(g.user['id'])['id'], id)

    return render_template('concept/view.html',
        concept=concept, concept_types=get_concept_types(),
        rendered_items=render_items_list(items),
        images=get_concept_images(id))

@bp.route('/<int:id>/update', methods=('GET', 'POST'))
@login_required
@admin_required
def update(id):
    concept = get_concept(id)

    if request.method == 'POST':
        title = request.form['title']
        description = request.form['description']
        type_id = request.form['type_id']
        error = None

        # assert that concept type exists
        get_concept_type(type_id)

        if not title:
            error = 'Title is required.'

        if error is not None:
            flash(error)
        else:
            db = get_db()
            db.execute(
                'UPDATE concept SET title = ?, description = ?, type_id = ?'
                ' WHERE id = ?',
                (title, description, type_id, id)
            )
            db.commit()
            return redirect(url_for("concept.view", id=id))

    return render_template('concept/update.html',
        concept=concept, concept_types=get_concept_types())

@bp.route('/<int:id>/own')
@login_required
def own(id):
    concept = get_concept(id)

    if not concept['physical']:
        abort(403)

    collection = get_user_collection(g.user['id'])
    db = get_db()
    db.execute(
        'INSERT INTO item (concept_id, description, collection_id)'
        ' VALUES (?, ?, ?)',
        (id, '', collection['id'])
    )
    db.commit()
    return redirect(url_for('concept.view', id=id))
