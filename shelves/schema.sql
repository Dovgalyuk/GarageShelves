CREATE DATABASE GarageShelves;
USE GarageShelves;

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
  type INTEGER NOT NULL,
  title TEXT NULL DEFAULT NULL,
  title_eng TEXT NULL DEFAULT NULL,
  description TEXT NULL DEFAULT NULL,
  company_id INTEGER NULL DEFAULT NULL,
  year INTEGER NULL DEFAULT NULL,

  created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  owner_id INTEGER NULL DEFAULT NULL,

  FOREIGN KEY (type_id) REFERENCES catalog_type (id),
  FOREIGN KEY (root) REFERENCES catalog (id),
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
  description TEXT NOT NULL,
  ext TEXT NOT NULL,
  filename TEXT NOT NULL,
  owner_id INTEGER NULL DEFAULT NULL,

  FOREIGN KEY (owner_id) REFERENCES user (id)
);

CREATE TABLE attachment (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  description TEXT NOT NULL,
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

CREATE TABLE catalog_item_relation (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  catalog_id INTEGER NOT NULL,
  item_id INTEGER NOT NULL,
  type INTEGER NOT NULL,

  FOREIGN KEY (catalog_id) REFERENCES catalog (id),
  FOREIGN KEY (item_id) REFERENCES item (id)
);

CREATE TABLE comment (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  user_id INTEGER NOT NULL,
  message TEXT NOT NULL,
  created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES user (id)
);

CREATE TABLE catalog_comment (
  comment_id INTEGER PRIMARY KEY NOT NULL,
  ref_id INTEGER NOT NULL,
  FOREIGN KEY (comment_id) REFERENCES comment (id),
  FOREIGN KEY (ref_id) REFERENCES catalog (id)
);

CREATE TABLE item_comment (
  comment_id INTEGER PRIMARY KEY NOT NULL,
  ref_id INTEGER NOT NULL,
  FOREIGN KEY (comment_id) REFERENCES comment (id),
  FOREIGN KEY (ref_id) REFERENCES item (id)
);

CREATE TABLE page_catalog (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  num INTEGER NOT NULL,
  title TEXT NOT NULL
);

INSERT INTO page_catalog (num, title) VALUES (1, "Computers");
INSERT INTO page_catalog (num, title) VALUES (2, "Consoles");
INSERT INTO page_catalog (num, title) VALUES (3, "Calculators");
INSERT INTO page_catalog (num, title) VALUES (4, "Software");
INSERT INTO page_catalog (num, title) VALUES (5, "Peripherals and parts");
INSERT INTO page_catalog (num, title) VALUES (6, "Data storage");
INSERT INTO page_catalog (num, title) VALUES (7, "Printed material");

CREATE TABLE page_catalog_section (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  title TEXT NOT NULL,
  num INTEGER NOT NULL,
  page INTEGER NOT NULL,
  parent INTEGER NOT NULL,
  type INTEGER NOT NULL,
  relation INTEGER NOT NULL,

  FOREIGN KEY (page) REFERENCES page_catalog (id),
  FOREIGN KEY (parent) REFERENCES catalog (id)
);

-- default user
INSERT INTO user (username, password, admin, email)
  -- user admin, password admin
  VALUES ("admin", "pbkdf2:sha256:50000$g307uMdl$7da6a054398f31081232bae9b62883a660b74fa4444c571db546a200dd18415b",
  	      1, "admin@admin.ru");

-- admin's collection
INSERT INTO collection (owner_id, title, description)
  VALUES (1, "Admin's collection", "");

-- default catalogs

---- COMPUTERS
INSERT INTO catalog (type, title_eng) VALUES (1, "Computer");
SET @comp = LAST_INSERT_ID();
-- hardcoded ids!
INSERT INTO page_catalog_section (title, num, page, parent, type, relation)
  VALUES ("Computer families", 1, 1, @comp, 1, 1);
INSERT INTO page_catalog_section (title, num, page, parent, type, relation)
  VALUES ("Computers", 2, 1, @comp, 2, 6);

---- CONSOLES
INSERT INTO catalog (type, title_eng) VALUES (1, "Console");
SET @comp = LAST_INSERT_ID();
-- hardcoded ids!
INSERT INTO page_catalog_section (title, num, page, parent, type, relation)
  VALUES ("Console families", 1, 2, @comp, 1, 1);
INSERT INTO page_catalog_section (title, num, page, parent, type, relation)
  VALUES ("Consoles", 2, 2, @comp, 2, 6);

---- CALCULATORS
INSERT INTO catalog (type, title_eng) VALUES (1, "Calculator");
SET @comp = LAST_INSERT_ID();
-- hardcoded ids!
INSERT INTO page_catalog_section (title, num, page, parent, type, relation)
  VALUES ("Calculator families", 1, 3, @comp, 1, 1);
INSERT INTO page_catalog_section (title, num, page, parent, type, relation)
  VALUES ("Calculators", 2, 3, @comp, 2, 6);

---- SOFTWARE
INSERT INTO catalog (type, title_eng) VALUES (1, "Software");
SET @comp = LAST_INSERT_ID();
-- hardcoded ids!
INSERT INTO page_catalog_section (title, num, page, parent, type, relation)
  VALUES ("Software families", 1, 4, @comp, 1, 1);
INSERT INTO page_catalog_section (title, num, page, parent, type, relation)
  VALUES ("Software", 2, 4, @comp, 4, 6);

---- PERIPHERALS
INSERT INTO catalog (type, title_eng) VALUES (1, "Peripheral device");
SET @comp = LAST_INSERT_ID();
-- hardcoded ids!
INSERT INTO page_catalog_section (title, num, page, parent, type, relation)
  VALUES ("Peripheral device families", 1, 5, @comp, 1, 1);
INSERT INTO page_catalog_section (title, num, page, parent, type, relation)
  VALUES ("Peripheral devices", 2, 5, @comp, 2, 6);

---- DATA STORAGE
INSERT INTO catalog (type, title_eng) VALUES (1, "Data storage");
SET @comp = LAST_INSERT_ID();
-- hardcoded ids!
INSERT INTO page_catalog_section (title, num, page, parent, type, relation)
  VALUES ("Data storage families", 1, 6, @comp, 1, 1);
INSERT INTO page_catalog_section (title, num, page, parent, type, relation)
  VALUES ("Data storage", 2, 6, @comp, 2, 6);


-- Kit
INSERT INTO catalog (type, title_eng) VALUES (3, "Kit");
SET @comp = LAST_INSERT_ID();

-- Cable/Adapter
INSERT INTO catalog (type, title_eng) VALUES (1, "Cable/Adapter");
SET @comp = LAST_INSERT_ID();

-- Printed stuff

INSERT INTO catalog (type, title_eng) VALUES (1, "Printed material");
SET @printed = LAST_INSERT_ID();
-- hardcoded ids!
INSERT INTO page_catalog_section (title, num, page, parent, type, relation)
  VALUES ("Print material categories", 1, 7, @printed, 1, 1);
INSERT INTO page_catalog_section (title, num, page, parent, type, relation)
  VALUES ("Print materials", 2, 7, @printed, 2, 6);

-- Book
INSERT INTO catalog (type, title_eng) VALUES (1, "Book");
SET @comp = LAST_INSERT_ID();
INSERT INTO catalog_relation (catalog_id1, catalog_id2, type)
   VALUES (@printed, @comp, 6);
INSERT INTO catalog_relation (catalog_id1, catalog_id2, type)
   VALUES (@printed, @comp, 1);

-- Manual
INSERT INTO catalog (type, title_eng) VALUES (1, "Manual");
SET @comp = LAST_INSERT_ID();
INSERT INTO catalog_relation (catalog_id1, catalog_id2, type)
   VALUES (@printed, @comp, 6);
INSERT INTO catalog_relation (catalog_id1, catalog_id2, type)
   VALUES (@printed, @comp, 1);

-- Schematics
INSERT INTO catalog (type, title_eng) VALUES (1, "Schematic");
SET @comp = LAST_INSERT_ID();
INSERT INTO catalog_relation (catalog_id1, catalog_id2, type)
   VALUES (@printed, @comp, 6);
INSERT INTO catalog_relation (catalog_id1, catalog_id2, type)
   VALUES (@printed, @comp, 1);

-- Mainboard
INSERT INTO catalog (type, title_eng) VALUES (1, "Mainboard");
SET @comp = LAST_INSERT_ID();

INSERT INTO page_catalog_section (title, num, page, parent, type, relation)
  VALUES ("Mainboards", 3, 5, @comp, 2, 6);

-- Other
INSERT INTO catalog (type, title_eng) VALUES (1, "Other");
SET @comp = LAST_INSERT_ID();

-- TODO: category relation (equivalent to catalog_type)
