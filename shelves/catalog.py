from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for
)
from werkzeug.exceptions import abort

from shelves.auth import (login_required, admin_required)
from shelves.db import get_db_cursor, db_commit
from shelves.collection import get_user_collection
from shelves.item import (get_catalog_items, render_items_list)
from shelves.uploads import upload_image

bp = Blueprint('catalog', __name__, url_prefix='/catalog')

# Catalog attributes
ATTR_IMAGE    = 1

# Catalog relations
REL_INCLUDES = 1

def get_catalog_type(id):
    cursor = get_db_cursor()
    cursor.execute(
        'SELECT * FROM catalog_type WHERE id = %s',
        (id)
    )
    ct = cursor.fetchone()

    if ct is None:
        abort(404, "Catalog type id {0} doesn't exist.".format(id))

    return ct

def get_catalog(id):
    cursor = get_db_cursor()
    cursor.execute(
        'SELECT c.id, c.title, description, created, c.type_id,'
        ' ct.title as type_title, ct.physical'
        ' FROM catalog c JOIN catalog_type ct ON c.type_id = ct.id'
        ' WHERE c.id = %s',
        (id,)
    )
    catalog = cursor.fetchone()

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
        (ATTR_IMAGE, id,)
    )
    images = cursor.fetchall()
    return images

def get_catalog_parents(id):
    cursor = get_db_cursor()
    cursor.execute(
        'SELECT c1.id, c1.title, ct.title as type_title'
        ' FROM catalog c1 JOIN catalog_relation r ON c1.id = r.catalog_id1'
        ' JOIN catalog_type ct ON c1.type_id = ct.id'
        ' JOIN catalog c2 ON c2.id = r.catalog_id2'
        ' WHERE r.type = %s AND c2.id = %s',
        (REL_INCLUDES, id,)
    )
    parents = cursor.fetchall()
    return parents

###############################################################################
# Routes
###############################################################################

# All catalogs
@bp.route('/')
def index():
    cursor = get_db_cursor()
    cursor.execute(
        'SELECT c.id, c.title, description, created, c.type_id, ct.title as type_title'
        ' FROM catalog c JOIN catalog_type ct ON c.type_id = ct.id'
        ' ORDER BY created DESC'
    )
    catalogs = cursor.fetchall()
    return render_template('catalog/index.html', catalogs=catalogs)


@bp.route('/create', methods=('GET', 'POST'))
@bp.route('/create/<int:parent>', methods=('GET', 'POST'))
@login_required
@admin_required
def create(parent = -1):
    if request.method == 'POST':
        type_id = request.form['type_id']
        title = request.form['title']
        description = request.form['description']
        error = None

        # assert that catalog type exists
        get_catalog_type(type_id)

        if not title:
            error = 'Title is required.'

        if error is not None:
            flash(error)
        else:
            parent = request.form['parent']
            cursor = get_db_cursor()
            cursor.execute(
                'INSERT INTO catalog (type_id, title, description)'
                ' VALUES (%s, %s, %s)',
                (type_id, title, description)
            )
            catalog_id = cursor.lastrowid
            if parent and int(parent) > 0:
                get_catalog(parent) # validate the parent
                cursor.execute(
                    'INSERT INTO catalog_relation'
                    ' (catalog_id1, catalog_id2, type)'
                    ' VALUES (%s, %s, %s)',
                    (parent, catalog_id, REL_INCLUDES)
                )
            db_commit()
            return redirect(url_for('catalog.index'))

    catalog_types = get_catalog_types()
    p = None
    if parent != -1:
        p = get_catalog(parent)
    return render_template('catalog/create.html',
        parent=p, catalog_types=catalog_types)

@bp.route('/<int:id>', methods=('GET', 'POST'))
def view(id):
    catalog = get_catalog(id)

    if request.method == 'POST':
        if not g.user['admin']:
            abort(403)

        if 'catalog_photo' not in request.files:
            flash('No photo selected')
            return redirect(request.url)

        file = request.files['catalog_photo']
        if file.filename == '':
            flash('No selected file')
            return redirect(request.url)

        if file:
            file_id = upload_image(file)
            db = get_db_cursor()
            db.execute(
                'INSERT INTO catalog_attribute (type, catalog_id, value_id)'
                ' VALUES (%s, %s, %s)',
                (ATTR_IMAGE, id, file_id,)
            )
            db_commit()
            return redirect(request.url)
        else:
            flash('Invalid file')
            return redirect(request.url)

    items = []
    if g.user:
        items = get_catalog_items(get_user_collection(g.user['id'])['id'], id)

    return render_template('catalog/view.html',
        catalog=catalog, catalog_types=get_catalog_types(),
        rendered_items=render_items_list(items),
        images=get_catalog_images(id),
        parents=get_catalog_parents(id))

@bp.route('/<int:id>/update', methods=('GET', 'POST'))
@login_required
@admin_required
def update(id):
    catalog = get_catalog(id)

    if request.method == 'POST':
        title = request.form['title']
        description = request.form['description']
        type_id = request.form['type_id']
        error = None

        # assert that catalog type exists
        get_catalog_type(type_id)

        if not title:
            error = 'Title is required.'

        if error is not None:
            flash(error)
        else:
            db = get_db_cursor()
            db.execute(
                'UPDATE catalog SET title = %s, description = %s, type_id = %s'
                ' WHERE id = %s',
                (title, description, type_id, id)
            )
            db_commit()
            return redirect(url_for('catalog.view', id=id))

    return render_template('catalog/update.html',
        catalog=catalog, catalog_types=get_catalog_types())

@bp.route('/<int:id>/own')
@login_required
def own(id):
    catalog = get_catalog(id)

    if not catalog['physical']:
        abort(403)

    collection = get_user_collection(g.user['id'])
    db = get_db_cursor()
    db.execute(
        'INSERT INTO item (catalog_id, description, collection_id)'
        ' VALUES (%s, %s, %s)',
        (id, '', collection['id'])
    )
    db_commit()
    return redirect(url_for('catalog.view', id=id))
