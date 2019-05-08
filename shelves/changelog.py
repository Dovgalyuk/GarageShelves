from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for, jsonify
)
from werkzeug.exceptions import abort

from shelves.auth import (login_required, admin_required)
from shelves.db import get_db_cursor, db_commit

bp = Blueprint('changelog', __name__, url_prefix='/changelog')

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
        ' ORDER BY ch.created'
        )
    return jsonify(cursor.fetchall())
