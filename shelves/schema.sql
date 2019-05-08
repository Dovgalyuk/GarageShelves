DROP DATABASE GarageShelves;
CREATE DATABASE GarageShelves;
USE GarageShelves;

DROP TABLE IF EXISTS catalog_history;
DROP TABLE IF EXISTS catalog_attribute;
DROP TABLE IF EXISTS catalog_relation;
DROP TABLE IF EXISTS item_relation;
DROP TABLE IF EXISTS item_attribute;
DROP TABLE IF EXISTS image;
DROP TABLE IF EXISTS item;
DROP TABLE IF EXISTS catalog;
DROP TABLE IF EXISTS catalog_type;
DROP TABLE IF EXISTS collection;
DROP TABLE IF EXISTS company;
DROP TABLE IF EXISTS user;

CREATE TABLE user (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(64) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  email VARCHAR(128) UNIQUE NOT NULL DEFAULT "",
  admin BOOLEAN NOT NULL DEFAULT 0
);

CREATE TABLE collection (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  owner_id INTEGER NOT NULL,
  created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  title TEXT NOT NULL,
  description TEXT NOT NULL,

  FOREIGN KEY (owner_id) REFERENCES user (id)
);

CREATE TABLE catalog_type (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  title TEXT NOT NULL,
  is_physical BOOLEAN NOT NULL DEFAULT 1,
  is_group BOOLEAN NOT NULL DEFAULT 0,
  is_kit BOOLEAN NOT NULL DEFAULT 0
);

CREATE TABLE company (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  title TEXT NOT NULL
);

CREATE TABLE catalog (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  type_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  title_eng TEXT NULL DEFAULT NULL,
  description TEXT NOT NULL,
  company_id INTEGER NULL DEFAULT NULL,
  year INTEGER NULL DEFAULT NULL,

  created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  owner_id INTEGER NULL DEFAULT NULL,

  FOREIGN KEY (type_id) REFERENCES catalog_type (id),
  FOREIGN KEY (owner_id) REFERENCES user (id),
  FOREIGN KEY (company_id) REFERENCES company (id)
);

CREATE TABLE catalog_history (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  catalog_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  field TEXT NOT NULL,
  value TEXT NULL,
  old_value TEXT NULL,

  created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (catalog_id) REFERENCES catalog (id),
  FOREIGN KEY (user_id) REFERENCES user (id)
);

CREATE TABLE item (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  catalog_id INTEGER NOT NULL,
  internal_id TEXT,
  description TEXT NOT NULL,
  added TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  collection_id INTEGER NOT NULL,

  FOREIGN KEY (catalog_id) REFERENCES catalog (id),
  FOREIGN KEY (collection_id) REFERENCES collection (id)
);

CREATE TABLE image (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  ext TEXT NOT NULL,
  filename TEXT NOT NULL,
  owner_id INTEGER NULL DEFAULT NULL,

  FOREIGN KEY (owner_id) REFERENCES user (id)
);

CREATE TABLE item_attribute (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  type INTEGER NOT NULL,
  item_id INTEGER NOT NULL,
  value_id INTEGER NOT NULL,

  FOREIGN KEY (item_id) REFERENCES item (id)
);

CREATE TABLE catalog_attribute (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  type INTEGER NOT NULL,
  catalog_id INTEGER NOT NULL,
  value_id INTEGER NOT NULL,

  FOREIGN KEY (catalog_id) REFERENCES catalog (id)
);

CREATE TABLE catalog_relation (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  catalog_id1 INTEGER NOT NULL,
  catalog_id2 INTEGER NOT NULL,
  type INTEGER NOT NULL,

  FOREIGN KEY (catalog_id1) REFERENCES catalog (id),
  FOREIGN KEY (catalog_id2) REFERENCES catalog (id)
);

CREATE TABLE item_relation (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  item_id1 INTEGER NOT NULL,
  item_id2 INTEGER NOT NULL,
  type INTEGER NOT NULL,

  FOREIGN KEY (item_id1) REFERENCES item (id),
  FOREIGN KEY (item_id2) REFERENCES item (id)
);

-- default user
INSERT INTO user (username, password, admin, email)
  -- user admin, password admin
  VALUES ("admin", "pbkdf2:sha256:50000$g307uMdl$7da6a054398f31081232bae9b62883a660b74fa4444c571db546a200dd18415b",
  	      1, "admin@admin.ru");

-- admin's collection
INSERT INTO collection (owner_id, title, description)
  VALUES (1, "Admin's collection", "");

-- default catalog types
INSERT INTO catalog_type (title) VALUES ("Nothing");
INSERT INTO catalog_type (title, is_physical, is_group) VALUES ("Computer Family", 0, 1);
INSERT INTO catalog_type (title) VALUES ("Computer");
INSERT INTO catalog_type (title, is_physical, is_group) VALUES ("Console family", 0, 1);
INSERT INTO catalog_type (title) VALUES ("Console");
INSERT INTO catalog_type (title, is_physical, is_group) VALUES ("Calculator Family", 0, 1);
INSERT INTO catalog_type (title) VALUES ("Calculator");
INSERT INTO catalog_type (title, is_kit) VALUES ("Kit", 1);
INSERT INTO catalog_type (title) VALUES ("Mainboard");
INSERT INTO catalog_type (title) VALUES ("Peripheral device");
INSERT INTO catalog_type (title) VALUES ("Cable/Adapter");
INSERT INTO catalog_type (title) VALUES ("Book");
INSERT INTO catalog_type (title) VALUES ("Manual");
INSERT INTO catalog_type (title) VALUES ("Schematics");
INSERT INTO catalog_type (title) VALUES ("Software");
INSERT INTO catalog_type (title) VALUES ("Data storage");
INSERT INTO catalog_type (title) VALUES ("Other");

-- default catalogs
