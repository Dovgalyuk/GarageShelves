from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for, jsonify
)
from werkzeug.exceptions import abort

from shelves.auth import (login_required, admin_required)
from shelves.db import get_db_cursor, db_commit
from shelves.uploads import upload_image

bp = Blueprint('company', __name__, url_prefix='/company')


def get_companies():
    cursor = get_db_cursor()
    cursor.execute(
        'SELECT *,'
        ' (SELECT COUNT(*) FROM catalog WHERE catalog.company_id=company.id) AS count'
        ' FROM company ORDER BY title'
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
# API Routes
###############################################################################

@bp.route('/_filtered_list')
def _filtered_list():
    # No parameters yet
    return jsonify(get_companies())

@bp.route('/_get')
def _get():
    id = request.args.get('id', -1, type=int)
    return jsonify(get_company(id))

@bp.route('/_update', methods=('POST',))
@login_required
@admin_required
def _update():
    id = int(request.args['id'])
    try:
        company = get_company(id)
        field = request.json['field']
        value = request.json['value']
        if field not in ['title']:
            abort(403)
        cursor = get_db_cursor()
        # field is validated, use concatenation here
        cursor.execute(
            'UPDATE company SET ' + field + ' = %s WHERE id = %s',
            (value, id)
        )
        db_commit()
    except:
        db_rollback()
        abort(403)

    return jsonify(result='success')

@bp.route('/_create', methods=('POST',))
@login_required
@admin_required
def _create():
    error = None
    title = request.json['title']

    if not title or title == '':
        error = 'Title is required.'

    if error is not None:
        abort(403)

    cursor = get_db_cursor()
    cursor.execute(
        'INSERT INTO company (title)'
        ' VALUES (%s)',
        (title,)
    )
    db_commit()
    return jsonify(result='success')

###############################################################################
# Routes
###############################################################################

# All companies
@bp.route('/')
def index():
    return render_template('company/index.html',
        companies=get_companies())

@bp.route('/<int:id>')
def view(id):
    return render_template('company/view.html', company=get_company(id))

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
