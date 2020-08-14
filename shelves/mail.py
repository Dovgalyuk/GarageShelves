from flask import (
    Blueprint, flash, g, redirect, render_template, request, session, url_for,
    jsonify
)
from flask_mail import Mail, Message

from shelves.auth import (login_required, admin_required)
from shelves.user import get_user

bp = Blueprint('mail', __name__, url_prefix='/mail')

mail = Mail()

def init_app(app):
    mail.init_app(app)

def mail_send_register(email):
    msg = Message("Registered new user",
            recipients=[email])
    msg.body = "testing"
    mail.send(msg)

#########################################################################
# Blueprints
#########################################################################

@bp.route('/message', methods=('POST',))
@admin_required
@login_required
def message():
    id = request.form.get('id', -1, type=int)
    try:
        user = get_user(id)
        msg = Message("New message",
                recipients=[user['email']])
        msg.body = "testing"
        mail.send(msg)
    except Exception as err:
        return jsonify(result="error", error=str(err))

    return jsonify(result="success")
