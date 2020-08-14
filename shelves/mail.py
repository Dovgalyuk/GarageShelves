from flask_mail import Mail, Message

mail = Mail()

def init_app(app):
    mail.init_app(app)

def mail_send_register(email):
    msg = Message("Registered new user",
            recipients=[email])
    msg.body = "testing"
    mail.send(msg)
