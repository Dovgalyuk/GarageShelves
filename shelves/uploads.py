import os
from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for,
    current_app, send_from_directory
)
from werkzeug.exceptions import abort
from werkzeug.utils import secure_filename

from shelves.auth import (login_required)
from shelves.db import get_db

bp = Blueprint('uploads', __name__, url_prefix='/uploads')

IMAGE_EXTENSIONS = set(['png', 'jpg', 'jpeg', 'gif'])

def allowed_image(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in IMAGE_EXTENSIONS

def upload_image(file):
    if not allowed_image(file.filename):
        abort(403)

    filename = secure_filename(file.filename)
    ext = filename.rsplit('.', 1)[1].lower()
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        'INSERT INTO image (ext, filename) VALUES (?, ?)',
        (ext, filename,)
    )
    file_id = cursor.lastrowid
    file.save(os.path.join(
        os.path.join(current_app.instance_path, 'uploads'),
        '%d.%s' % (file_id, ext)))
    db.commit()
    return file_id

@bp.route('/<int:id>')
def view(id):
    db = get_db();
    image = db.execute(
        'SELECT * FROM image WHERE id = ?',
        (id,)
        ).fetchone()

    return send_from_directory(os.path.join(current_app.instance_path,
        'uploads'), '%d.%s' % (id, image['ext']))

# @bp.route('/upload_photo')
# def upload_photo():
#     item = get_item(id)
#     if item['owner_id'] != g.user['id']:
#         abort(403)

#     if request.method == 'POST':
#         description = request.form['description']
#         internal_id = request.form['internal_id']
#         db = get_db()
#         db.execute(
#             'UPDATE item SET description = ?, internal_id = ?'
#             ' WHERE id = ?',
#             (description, internal_id, id)
#         )
#         db.commit()
#         return redirect(url_for("item.view", id=id))

#     return render_template('item/update.html', item=item)
