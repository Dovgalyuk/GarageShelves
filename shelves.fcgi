#!/usr/bin/python3
import sys
sys.path.append("/var/www/backend")
from shelves import create_app
from flup.server.fcgi import WSGIServer
if __name__ == '__main__':
    application = create_app()
    WSGIServer(application).run()
