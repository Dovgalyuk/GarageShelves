from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for, jsonify
)
from werkzeug.exceptions import abort

from shelves.auth import (login_required, admin_required)
from shelves.db import get_db_cursor, db_commit

bp = Blueprint('changelog', __name__, url_prefix='/changelog')

def get_item(id):
    cursor = get_db_cursor()
    cursor.execute(
        'SELECT * FROM catalog_history ch'
        ' WHERE id = %s', (id,)
        )
    it = cursor.fetchone()
    if it is None:
        abort(403, "Catalog history id {0} doesn't exist.".format(id))

    return it


###############################################################################
# API Routes
###############################################################################

@bp.route('/list')
@login_required
@admin_required
def list():
    # No parameters yet
    cursor = get_db_cursor()
    cursor.execute(
        'SELECT *'
        ' FROM catalog_history ch'
        ' ORDER BY ch.created, ch.id'
        )
    return jsonify(cursor.fetchall())

@bp.route('/approve', methods=['POST'])
@login_required
@admin_required
def approve():
    id = int(request.args['id'])
    item = get_item(id)

    cursor = get_db_cursor()

    cursor.execute(
        'DELETE FROM catalog_history WHERE id = %s', (id,)
    )
    db_commit()

    return jsonify(result='success')

@bp.route('/undo', methods=['POST'])
@login_required
@admin_required
def undo():
    id = int(request.args['id'])
    item = get_item(id)

    if item['field'] == 'create':
        # no cascade delete yet
        abort(403)

    cursor = get_db_cursor()
    cursor.execute(item['undo_query'])
    cursor.execute(
        'DELETE FROM catalog_history WHERE id = %s', (id,)
    )
    db_commit()

    return jsonify(result='success')
