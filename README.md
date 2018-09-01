# GarageShelves
Web-based system for managing private tech collections

## Installation

```
sudo apt install python3-pip libffi-dev libmysqlclient-dev
sudo pip3 install -r requirements.txt
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
