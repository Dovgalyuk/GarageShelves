from flask import (
    Blueprint, flash, g, redirect, request, url_for, jsonify
)
from werkzeug.exceptions import abort

from shelves.db import get_db_cursor, db_commit
from shelves.type import Type

bp = Blueprint('page', __name__, url_prefix='/page')

###############################################################################
# API Routes
###############################################################################

@bp.route('/catalog')
def catalog():
    try:
        cursor = get_db_cursor()
        cursor.execute(
            'SELECT * FROM page_catalog'
            ' ORDER BY num'
            )

        return jsonify(cursor.fetchall())
    except:
        abort(400)

@bp.route('/sections')
def sections():
    try:
        page = request.args.get('page', -1, type=int)
        cursor = get_db_cursor()
        cursor.execute(
            'SELECT id, title, num, page, parent, type, relation,'
            ' IF(type = %s, 1, 0) AS is_physical'
            ' FROM page_catalog_section'
            ' WHERE page = %s'
            ' ORDER BY num',
            (Type.TYPE_PHYSICAL,page,)
            )

        return jsonify(cursor.fetchall())
    except:
        abort(400)
