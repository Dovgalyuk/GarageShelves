from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for, jsonify
)
from werkzeug.exceptions import abort

from shelves.auth import login_required
from shelves.db import get_db_cursor, db_commit
from shelves.user import UserStatus

bp = Blueprint('collection', __name__, url_prefix='/collection')


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

###############################################################################
# API Routes
###############################################################################

@bp.route('/_filtered_list')
def _filtered_list():
    # No parameters yet

    db = get_db_cursor()
    db.execute(
        'SELECT c.id, title, description, created, owner_id, username,'
        ' (SELECT COUNT(*) FROM item it WHERE it.collection_id=c.id) AS count'
        ' FROM collection c JOIN user u ON c.owner_id = u.id'
        ' WHERE u.status = %s'
        ' ORDER BY title',
        (UserStatus.ACTIVE,)
    )
    collections = db.fetchall()

    return jsonify(collections)

@bp.route('/_get')
def _get():
    id = request.args.get('id', -1, type=int)
    return jsonify(get_collection(id, False))
