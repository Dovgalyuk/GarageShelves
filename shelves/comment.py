from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for, jsonify
)
from werkzeug.exceptions import abort

from shelves.auth import (login_required, admin_required)
from shelves.db import get_db_cursor, db_commit

bp = Blueprint('comment', __name__, url_prefix='/comment')

###############################################################################
# API Routes
###############################################################################

@bp.route('/get')
def get():
    try:
        id = request.args['id']
        cursor = get_db_cursor()
        cursor.execute(
            'SELECT * FROM comment WHERE id = %s', (id,)
            )

        return jsonify(cursor.fetchone())
    except:
        abort(400)

@bp.route('/catalog')
def catalog():
    try:
        id = request.args['id']
        cursor = get_db_cursor()
        cursor.execute(
            'SELECT c.id, c.message, c.user_id, c.created,'
            ' u.username FROM comment c'
            ' INNER JOIN catalog_comment cc ON cc.comment_id = c.id'
            ' INNER JOIN user u ON u.id = c.user_id'
            ' WHERE cc.ref_id = %s'
            ' ORDER BY c.created DESC', (id,)
            )

        return jsonify(cursor.fetchall())
    except:
        abort(400)

@bp.route('/catalog/add', methods=['POST'])
@login_required
def catalog_add():
    try:
        id = request.json['id']
        comment = request.json['comment']
        user_id = g.user['id']

        cursor = get_db_cursor()
        cursor.execute(
            'INSERT INTO comment (user_id, message)'
            ' VALUES (%s, %s)', (user_id, comment)
        )
        comment_id = cursor.lastrowid
        cursor.execute(
            'INSERT INTO catalog_comment (comment_id, ref_id)'
            ' VALUES (%s, %s)', (comment_id, id)
        )
        db_commit()
        return jsonify(result='success')
    except:
        abort(400)

@bp.route('/item')
def item():
    try:
        id = request.args['id']
        cursor = get_db_cursor()
        cursor.execute(
            'SELECT c.id, c.message, c.user_id, c.created,'
            ' u.username FROM comment c'
            ' INNER JOIN item_comment ii ON ii.comment_id = c.id'
            ' INNER JOIN user u ON u.id = c.user_id'
            ' WHERE ii.ref_id = %s'
            ' ORDER BY c.created DESC', (id,)
            )

        return jsonify(cursor.fetchall())
    except:
        abort(400)

@bp.route('/item/add', methods=['POST'])
@login_required
def item_add():
    try:
        id = request.json['id']
        comment = request.json['comment']
        user_id = g.user['id']

        cursor = get_db_cursor()
        cursor.execute(
            'INSERT INTO comment (user_id, message)'
            ' VALUES (%s, %s)', (user_id, comment)
        )
        comment_id = cursor.lastrowid
        cursor.execute(
            'INSERT INTO item_comment (comment_id, ref_id)'
            ' VALUES (%s, %s)', (comment_id, id)
        )
        db_commit()
        return jsonify(result='success')
    except:
        abort(400)

@bp.route('/latest')
def latest():
    try:
        cursor = get_db_cursor()
        cursor.execute(
            'SELECT c.id, c.message, c.user_id, c.created,'
            ' u.username, cc.ref_id AS catalog_id, ic.ref_id AS item_id,'
            ' CASE WHEN cat.title IS NOT NULL'
            '   THEN cat.title'
            '   ELSE icat.title'
            ' END AS catalog_title,'
            ' CASE WHEN cat.title_eng IS NOT NULL'
            '   THEN cat.title_eng'
            '   ELSE icat.title_eng'
            ' END AS catalog_title_eng'
            ' FROM comment c'
            ' INNER JOIN user u ON u.id = c.user_id'
            ' LEFT OUTER JOIN catalog_comment cc ON cc.comment_id = c.id'
            ' LEFT OUTER JOIN catalog cat ON cc.ref_id = cat.id'
            ' LEFT OUTER JOIN item_comment ic ON ic.comment_id = c.id'
            ' LEFT OUTER JOIN item it ON ic.ref_id = it.id'
            ' LEFT OUTER JOIN catalog icat ON it.catalog_id = icat.id'
            ' ORDER BY c.created DESC'
            ' LIMIT 10'
            )

        return jsonify(cursor.fetchall())
    except:
        abort(400)
