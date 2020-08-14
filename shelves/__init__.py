import os

from flask import (Flask, render_template)
from flask_cors import CORS

from . import utils

def create_app(test_config=None):
    # create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    CORS(app, supports_credentials=True)

    # compatible with flask-images
    app.config.setdefault('IMAGES_CACHE', '/tmp/flask-images')

    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_pyfile('config.cfg')#, silent=True)
    else:
        # load the test config if passed in
        app.config.from_mapping(test_config)

    app.config.update(SESSION_COOKIE_SAMESITE='None')
    app.config.update(SESSION_COOKIE_SECURE=True)

    # init all after config

    # ensure the instance folder exists
    utils.makedirs(app.instance_path)

    # ensure the uploads folder exists
    utils.makedirs(os.path.join(app.instance_path, 'uploads'))

    from . import db
    db.init_app(app)

    from . import mail
    mail.init_app(app)

    from . import auth
    app.register_blueprint(auth.bp)

    from . import collection
    app.register_blueprint(collection.bp)

    from . import catalog
    app.register_blueprint(catalog.bp)

    from . import item
    app.register_blueprint(item.bp)

    from . import uploads
    app.register_blueprint(uploads.bp)

    from . import category
    app.register_blueprint(category.bp)

    from . import changelog
    app.register_blueprint(changelog.bp)

    from . import comment
    app.register_blueprint(comment.bp)

    from . import page
    app.register_blueprint(page.bp)

    from . import image
    app.register_blueprint(image.bp)

    return app
