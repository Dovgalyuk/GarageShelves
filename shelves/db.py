import MySQLdb
#from MySQLdb import cursors, DictCursor
import click
from flask import current_app, g
from flask.cli import with_appcontext
from flask_mysqldb import MySQL

mysql = MySQL()

def get_db_cursor():
    if 'db' not in g:
        g.db = mysql.connection
#            current_app.config['DATABASE'],
#            detect_types=sqlite3.PARSE_DECLTYPES
#        )
#        g.db.row_factory = sqlite3.Row

    return g.db.cursor(MySQLdb.cursors.DictCursor)


def close_db(e=None):
    db = g.pop('db', None)

    if db is not None:
        get_db_cursor().close()

def db_commit():
    mysql.connection.commit()

def init_db():
    db = get_db_cursor()

    with current_app.open_resource('schema.sql') as f:
        query = " ".join(f.readlines())
        db.cursor().execute(query)

#    with current_app.open_resource('schema.sql') as f:
#        db.cursor().execute(f.read().decode('utf8'))

@click.command('init-db')
@with_appcontext
def init_db_command():
    """Clear the existing data and create new tables."""
    init_db()
    click.echo('Initialized the database.')

def init_app(app):
    mysql.init_app(app)
    app.teardown_appcontext(close_db)
    app.cli.add_command(init_db_command)
