from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for
)
from werkzeug.exceptions import abort

from shelves.auth import (login_required, admin_required)
from shelves.db import get_db_cursor, db_commit
from shelves.uploads import upload_image

bp = Blueprint('company', __name__, url_prefix='/company')


def get_companies():
    cursor = get_db_cursor()
    cursor.execute(
        'SELECT * FROM company ORDER BY title'
        )
    return cursor.fetchall()

def get_company(id):
    cursor = get_db_cursor()
    cursor.execute(
        'SELECT * FROM company WHERE id = %s',
        (id,)
        )
    return cursor.fetchone()

###############################################################################
# Routes
###############################################################################

# All companies
@bp.route('/')
def index():
    return render_template('company/index.html',
        companies=get_companies())

@bp.route('/create', methods=('GET', 'POST'))
@login_required
@admin_required
def create():
    if request.method == 'POST':
        error = None
        title = request.form['title']

        if not title:
            error = 'Title is required.'

        if error is not None:
            flash(error)
        else:
            cursor = get_db_cursor()
            cursor.execute(
                'INSERT INTO company (title)'
                ' VALUES (%s)',
                (title,)
            )
            company_id = cursor.lastrowid
            db_commit()
            return redirect(url_for('company.view', id=company_id))

    return render_template('company/create.html')

@bp.route('/<int:id>')
def view(id):
    from shelves.catalog import get_catalog_items_of_company, render_catalog_list
    return render_template('company/view.html',
        company=get_company(id),
        rendered_catalog_items=render_catalog_list(get_catalog_items_of_company(id)))

@bp.route('/<int:id>/update', methods=('GET', 'POST'))
@login_required
@admin_required
def update(id):
    if request.method == 'POST':
        error = None
        title = request.form['title']

        if not title:
            error = 'Title is required.'

        if error is not None:
            flash(error)
        else:
            cursor = get_db_cursor()
            cursor.execute(
                'UPDATE company SET title = %s'
                ' WHERE id = %s',
                (title,id,)
            )
            db_commit()
            return redirect(url_for('company.view', id=id))

    return render_template('company/update.html',
        company=get_company(id))
