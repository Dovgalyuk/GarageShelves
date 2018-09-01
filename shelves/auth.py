import functools

from flask import (
    Blueprint, flash, g, redirect, render_template, request, session, url_for
)
from werkzeug.security import check_password_hash, generate_password_hash

from shelves.db import get_db_cursor, db_commit

bp = Blueprint('auth', __name__, url_prefix='/auth')

@bp.before_app_request
def load_logged_in_user():
    user_id = session.get('user_id')

    if user_id is None:
        g.user = None
    else:
        cursor = get_db_cursor()
        cursor.execute(
            'SELECT * FROM user WHERE id = %s', (user_id,)
        )
        g.user = cursor.fetchone()


def login_required(view):
    @functools.wraps(view)
    def wrapped_view(**kwargs):
        if g.user is None:
            return redirect(url_for('auth.login'))

        return view(**kwargs)

    return wrapped_view

def admin_required(view):
    @functools.wraps(view)
    def wrapped_view(**kwargs):
        if g.user is None:
            return redirect(url_for('auth.login'))

        if g.user['admin'] == 0:
            return redirect(url_for('auth.login'))

        return view(**kwargs)

    return wrapped_view

@bp.route('/register', methods=('GET', 'POST'))
def register():
    if request.method == 'POST':
        username = request.form['username']
        username = username[:64]
        password = request.form['password']
        collection_title = request.form['collection_title']
        collection_description = request.form['collection_description']
        cursor = get_db_cursor()
        error = None

        if not username:
            error = 'Username is required.'
        elif not password:
            error = 'Password is required.'
        elif not collection_title:
            error = 'Collection title is required.'
        else:
            cursor.execute(
                'SELECT id FROM user WHERE username = %s', (username,)
            )
            if cursor.fetchone() is not None:
                error = 'User {} is already registered.'.format(username)

        if error is None:
            cursor.execute(
                'INSERT INTO user (username, password) VALUES (%s, %s)',
                (username, generate_password_hash(password))
            )
            id = cursor.lastrowid
            cursor.execute(
                'INSERT INTO collection (title, description, owner_id)'
                ' VALUES (%s, %s, %s)',
                (collection_title, collection_description, id)
            )
            db_commit()
            return redirect(url_for('auth.login'))

        flash(error)

    return render_template('auth/register.html')

@bp.route('/profile', methods=('GET', 'POST'))
@login_required
def profile():
    if request.method == 'POST':
        old_password = request.form['old_password']
        new_password = request.form['new_password']
        cursor = get_db_cursor()
        error = None

        if not old_password:
            error = 'Password is required.'

        if not new_password:
            error = 'New password is required.'

        cursor.execute(
            'SELECT * FROM user WHERE id = %s', (g.user['id'],)
        )
        user = cursor.fetchone()

        if not check_password_hash(user['password'], old_password):
            error = 'Incorrect password.'

        if error is None:
            new_password = generate_password_hash(new_password)
            cursor.execute(
                'UPDATE user SET password = %s'
                ' WHERE id = %s',
                (new_password, g.user['id'])
            )
            db_commit()
            return redirect(url_for('index'))

        flash(error)

    return render_template('auth/profile.html')

@bp.route('/login', methods=('GET', 'POST'))
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        cursor = get_db_cursor()
        error = None
        cursor.execute(
            'SELECT * FROM user WHERE username = %s', (username,)
        )
        user = cursor.fetchone()

        if user is None:
            error = 'Incorrect username.'
        elif not check_password_hash(user['password'], password):
            error = 'Incorrect password.'

        if error is None:
            session.clear()
            session['user_id'] = user['id']
            return redirect(url_for('index'))

        flash(error)

    return render_template('auth/login.html')

@bp.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))
