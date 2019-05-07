import functools
import re

from flask import (
    Blueprint, flash, g, redirect, render_template, request, session, url_for,
    jsonify
)
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.exceptions import abort

from shelves.db import get_db_cursor, db_commit

bp = Blueprint('auth', __name__, url_prefix='/auth')

@bp.before_app_request
def load_logged_in_user():
    user_id = session.get('user_id')

    if user_id is None:
        g.user = None
    else:
        cursor = get_db_cursor()
        # TODO: multiple collections
        cursor.execute(
            'SELECT user.id as id, username, admin, collection.id as col_id,'
            ' email FROM user '
            ' LEFT JOIN collection ON user.id = collection.owner_id'
            ' WHERE user.id = %s',
            (user_id,)
        )
        g.user = cursor.fetchone()

def login_required(view):
    @functools.wraps(view)
    def wrapped_view(**kwargs):
        if g.user is None:
            return abort(403)

        return view(**kwargs)

    return wrapped_view

def admin_required(view):
    @functools.wraps(view)
    def wrapped_view(**kwargs):
        if g.user is None:
            return abort(403)

        if g.user['admin'] == 0:
            return abort(403)

        return view(**kwargs)

    return wrapped_view

###############################################################################
# API Routes
###############################################################################

@bp.route('/_login')
def _login():
    login = request.args.get('login').strip()
    password = request.args.get('password').strip()
    cursor = get_db_cursor()
    error = None
    cursor.execute(
        'SELECT * FROM user WHERE email = %s', (login,)
    )
    user = cursor.fetchone()

    if user is None:
        error = 'Incorrect username.'
    elif not check_password_hash(user['password'], password):
        error = 'Incorrect password.'

    if error is None:
        session.clear()
        session['user_id'] = user['id']
        return jsonify(user_id=user['id'])

    return jsonify(error='No session')

@bp.route('/_session')
def _session():
    if g.user is None:
        return jsonify(error='No session')

    return jsonify(user_id=g.user['id'],
                   is_admin=g.user['admin'],
                   username=g.user['username'],
                   email=g.user['email'])

@bp.route('/_logout')
def _logout():
    session.clear()
    return jsonify(error='No session')

@bp.route('/set_username')
@login_required
def set_username():
    username = request.args.get('username').strip()
    cursor = get_db_cursor()
    cursor.execute(
        'UPDATE user SET username = %s WHERE id = %s',
        (username, g.user['id'])
    )
    db_commit()
    return jsonify(result='success')

@bp.route('/set_password')
@login_required
def set_password():
    old_password = request.args.get('old_password').strip()
    new_password = request.args.get('new_password').strip()
    new_password = generate_password_hash(new_password)

    error = None
    if not old_password:
        error = 'Password is required.'

    if not new_password or new_password == '':
        error = 'New password is required.'

    cursor = get_db_cursor()
    cursor.execute(
        'SELECT * FROM user WHERE id = %s', (g.user['id'],)
    )
    user = cursor.fetchone()

    if not check_password_hash(user['password'], old_password):
        error = 'Incorrect password.'

    if error:
        return jsonify(error=error)

    cursor.execute(
        'UPDATE user SET password = %s WHERE id = %s',
        (new_password, g.user['id'])
    )
    db_commit()
    return jsonify(result='success')

@bp.route('/register', methods=('POST',))
def register():
    print(request.json)
    try:
        email = request.json['email'].strip()
        username = request.json['username'].strip()
        username = username[:64]
        password = request.json['password'].strip()
        collection_title = request.json['collection_title']
        collection_description = request.json['collection_desc']
    except:
        return jsonify(error='Missing some parameters')

    error = None
    cursor = get_db_cursor()

    if not email or not re.match("[^@]+@[^@]+.[^@]+", email):
        error = 'Valid E-mail is required.'
    elif not username:
        error = 'Username is required.'
    elif not password:
        error = 'Password is required.'
    elif not collection_title:
        error = 'Collection title is required.'
    else:
        cursor.execute(
            'SELECT id FROM user WHERE email = %s', (email,)
        )
        if cursor.fetchone() is not None:
            error = 'User with email {} is already registered.'.format(email)
        else:
            cursor.execute(
                'SELECT id FROM user WHERE username = %s', (username,)
            )
            if cursor.fetchone() is not None:
                error = 'User with name {} is already registered.'.format(username)

    if error is None:
        cursor.execute(
            'INSERT INTO user (email, username, password) VALUES (%s, %s, %s)',
            (email, username, generate_password_hash(password))
        )
        id = cursor.lastrowid
        cursor.execute(
            'INSERT INTO collection (title, description, owner_id)'
            ' VALUES (%s, %s, %s)',
            (collection_title, collection_description, id)
        )
        db_commit()
        return jsonify(result='success')

    return jsonify(error=error)
