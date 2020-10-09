import os
from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for,
    current_app, send_from_directory, send_file, jsonify
)
from werkzeug.exceptions import abort
from werkzeug.utils import secure_filename
from PIL import Image

from shelves.auth import (login_required)
from shelves.db import get_db_cursor, db_commit

bp = Blueprint('uploads', __name__, url_prefix='/uploads')

def upload_file(file, desc):
    if not g.user:
        abort(403)

    filename = secure_filename(file.filename)

    cursor = get_db_cursor()
    cursor.execute(
        'INSERT INTO attachment (filename, description, owner_id) VALUES (%s, %s, %s)',
        (filename, desc, g.user['id'],)
    )
    file_id = cursor.lastrowid
    file.save(os.path.join(
        os.path.join(os.path.abspath(current_app.instance_path), 'uploads'),
        '%d' % (file_id,)))
    return file_id

@bp.route('/get')
def get():
    id = request.args.get('id', -1, type=int)
    cursor = get_db_cursor()
    cursor.execute(
        'SELECT filename, description FROM attachment WHERE id = %s',
        (id,)
    )
    res = cursor.fetchone()
    if res is None:
        abort(403)

    return jsonify(res)

@bp.route('/download')
def download():
    id = request.args.get('id', -1, type=int)

    cursor = get_db_cursor()
    cursor.execute(
        'SELECT * FROM attachment WHERE id = %s',
        (id,)
        )
    file = cursor.fetchone()
    if file is None:
        abort(403)

    result = send_file(os.path.join(os.path.abspath(current_app.instance_path),'uploads/%d' % (id,)),
                mimetype="application/octet-stream",
                as_attachment=True,
                attachment_filename=file['filename'],
                conditional=False)
    return result

