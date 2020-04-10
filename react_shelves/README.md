This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Installation

	curl -sL https://deb.nodesource.com/setup_8.x | sudo bash -
    sudo apt install nodejs
    ln -s /usr/bin/nodejs /usr/bin/node
    cd GarageShelves/react_shelves
    npm install

## Apache2 config for frontend

	<VirtualHost *:8080>
		#ServerName www.example.com

		ServerAdmin webmaster@localhost
		DocumentRoot /var/www/frontend

		ErrorLog ${APACHE_LOG_DIR}/error.log
		CustomLog ${APACHE_LOG_DIR}/access.log combined

		<Directory "/var/www/frontend">
		    RewriteEngine on
		    # Don't rewrite files or directories
		    RewriteCond %{REQUEST_FILENAME} -f [OR]
		    RewriteCond %{REQUEST_FILENAME} -d
		    RewriteRule ^ - [L]
		    # Rewrite everything else to index.html to allow html5 state links
		    RewriteRule ^ index.html [L]
		</Directory>
	</VirtualHost>

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://127.0.0.1:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm run build`

Create .env.production with the following line:

    REACT_APP_BACKEND_URL=http://<server address>:<server port>/

This url should point to the address of the backend server.
