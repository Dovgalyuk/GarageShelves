# GarageShelves
Web-based system for managing private tech collections

## Installation

```
sudo apt install python3-pip libffi-dev libmysqlclient-dev python3-setuptools gcc python3-dev uwsgi-plugin-python3
sudo pip3 install -r shelves/requirements.txt
mkdir instance
cp shelves/config.cfg instance
```
Now edit config.cfg in the instance subdirectory.

### Setup mysql

```
sudo apt install mysql-server
sudo mysql_secure_installation
mysql -u root -p < shelves/schema.sql
```

### Setup web server

#### Nginx


#### Apache2

```
sudo apt install apache2-dev
sudo pip3 install mod_wsgi
```

/etc/apache2/mods-enables/wsgi.load:
```
LoadModule wsgi_module "/usr/local/lib/python3.5/dist-packages/mod_wsgi/server/mod_wsgi-py35.cpython-35m-x86_64-linux-gnu.so"
```

/etc/apache2/sites-enabled/001-shelves.conf
```
<VirtualHost *:8080>
#    ServerName example.com

    WSGIDaemonProcess shelves user=www-data group=www-data threads=5
    WSGIScriptAlias / /var/www/GarageShelves/shelves.wsgi

    <Directory /var/www/GarageShelves/shelves>
        WSGIProcessGroup shelves
        WSGIApplicationGroup %{GLOBAL}
        Order deny,allow
        Allow from all
    </Directory>
</VirtualHost>
```

## Development

Flask-based backend
```
./devel_be.sh
```

React-based frontend
```
./devel_fe.sh
```

[React-based frontend](react_shelves/README.md)

