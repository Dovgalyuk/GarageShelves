import os
from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for,
    current_app, send_from_directory, send_file
)
from werkzeug.exceptions import abort
from werkzeug.utils import secure_filename
from PIL import Image

from shelves.db import get_db_cursor, db_commit
from shelves.utils import makedirs

bp = Blueprint('image', __name__, url_prefix='/image')

IMAGE_EXTENSIONS = set(['png', 'jpg', 'jpeg', 'gif'])

def allowed_image(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in IMAGE_EXTENSIONS

def upload_image(file,desc='',width=-1,height=-1):
    if not allowed_image(file.filename):
        abort(403)

    if not g.user:
        abort(403)

    img = Image.open(file)
    if width != -1:
        if (img.width != width and img.height != height) or img.width > width or img.height > height:
            return None

    filename = secure_filename(file.filename)
    ext = filename.rsplit('.', 1)[1].lower()

    cursor = get_db_cursor()
    cursor.execute(
        'INSERT INTO image (ext, filename, description, owner_id) VALUES (%s, %s, %s, %s)',
        (ext, filename, desc, g.user['id'],)
    )
    file_id = cursor.lastrowid
    img.save(os.path.join(
        os.path.join(os.path.abspath(current_app.instance_path), 'uploads'),
        '%d.%s' % (file_id, ext)))
    return file_id


@bp.route('/view')
def view():
    id = request.args.get('id', -1, type=int)

    cursor = get_db_cursor()
    cursor.execute(
        'SELECT * FROM image WHERE id = %s',
        (id,)
        )
    image = cursor.fetchone()
    if image is None:
        abort(403)

    width = request.args.get('width', -1, type=int)
    height = request.args.get('height', -1, type=int)

    src = os.path.join(os.path.abspath(current_app.instance_path),
            'uploads/%d.%s' % (id, image['ext']))
    if width == -1 or height == -1:
        # full size
        return send_file(src)
    else:
        # thumbnail
        sizes = (64, 256)
        if width not in sizes or height not in sizes:
            abort(403)
        
        img = Image.open(src)
        if img.width <= width and img.height <= height:
            return send_file(src)

        r = img.width / width
        r2 = img.height / height
        if r2 > r:
            r = r2
        rw = int(img.width / r)
        rh = int(img.height / r)

        makedirs(current_app.config['IMAGES_CACHE'])
        path = os.path.join(os.path.abspath(current_app.config['IMAGES_CACHE']),
            '%d.%dx%d.%s' % (id, width, height, image['ext']))
        if not os.path.exists(path):
            img = img.resize((rw, rh), Image.ANTIALIAS)
            cache_file = open(path, 'wb')
            img.save(cache_file)
            cache_file.close()

        return send_file(path)
