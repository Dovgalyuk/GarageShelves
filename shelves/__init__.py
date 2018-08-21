import os

from flask import (Flask, render_template)
from flask_bootstrap import Bootstrap
from flask_misaka import Misaka
from .flask_util_js import FlaskUtilJs
from .nav import nav

def create_app(test_config=None):
    # create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    Bootstrap(app)
    Misaka(app)
    FlaskUtilJs(app)

    app.config.from_mapping(
        SECRET_KEY = 'dev',
        DATABASE = os.path.join(app.instance_path, 'shelves.sqlite'),
        MAX_CONTENT_LENGTH = 16 * 1024 * 1024,

        MYSQL_USER = 'root',
        MYSQL_PASSWORD = 'root',
        MYSQL_DB = 'GarageShelves',
        MYSQL_HOST = 'localhost',
    )

    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_pyfile('config.py', silent=True)
    else:
        # load the test config if passed in
        app.config.from_mapping(test_config)

    # ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    from . import db
    db.init_app(app)

    from . import auth
    app.register_blueprint(auth.bp)

    from . import collection
    app.register_blueprint(collection.bp)

    from . import concept
    app.register_blueprint(concept.bp)

    from . import item
    app.register_blueprint(item.bp)

    from . import uploads
    app.register_blueprint(uploads.bp)

    @app.route('/')
    def base():
        return render_template('index.html')

    app.add_url_rule('/', endpoint='index')

    nav.init_app(app)

    return app
