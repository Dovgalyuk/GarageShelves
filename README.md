# GarageShelves
Web-based system for managing private tech collections

## Installation

sudo apt install python3-pip libffi-dev libmysqlclient-dev
 
sudo pip3 install -r requirements.txt

sudo apt install apache2-dev

sudo pip3 install mod_wsgi

/etc/apache2/mods-enables/wsgi.load:
LoadModule wsgi_module "/usr/local/lib/python3.5/dist-packages/mod_wsgi/server/mod_wsgi-py35.cpython-35m-x86_64-linux-gnu.so"

sudo mkdir instance/uploads
