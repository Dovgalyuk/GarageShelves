# DROP DATABASE GarageShelves;
CREATE DATABASE GarageShelves;
USE GarageShelves;

DROP TABLE IF EXISTS catalog_comment;
DROP TABLE IF EXISTS item_comment;
DROP TABLE IF EXISTS comment;
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
INSERT INTO page_catalog (num, title) VALUES (5, "Peripherals");
INSERT INTO page_catalog (num, title) VALUES (6, "Data storage");

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

-- Update Dec 2019

-- ALTER TABLE catalog ADD type INTEGER NOT NULL;
-- ALTER TABLE catalog MODIFY COLUMN type_id INTEGER NULL DEFAULT NULL;
-- UPDATE catalog SET type = 3 WHERE type_id IN (SELECT id FROM catalog_type WHERE title="Kit");
-- UPDATE catalog SET type = 1 WHERE type_id IN (SELECT id FROM catalog_type WHERE title LIKE "%family%");
-- UPDATE catalog SET type = 4 WHERE type_id IN (SELECT id FROM catalog_type WHERE title="Software");
-- UPDATE catalog SET type = 2 WHERE type = 0;

---- COMPUTERS
INSERT INTO catalog (type, title_eng) VALUES (1, "Computer");
SET @comp = LAST_INSERT_ID();
SET @old_comp = (SELECT id FROM catalog_type WHERE title="Computer");
SET @fam_comp = (SELECT id FROM catalog_type WHERE title="Computer family");
-- include relations
INSERT INTO catalog_relation (catalog_id1, catalog_id2, type)
   SELECT @comp AS catalog_id1, cat.id AS catalog_id2, 1 AS type FROM catalog cat WHERE
     (cat.type_id=@old_comp OR cat.type_id=@fam_comp)
     AND NOT EXISTS (SELECT * FROM catalog_relation WHERE catalog_id2=cat.id AND type=1
         AND catalog_id1 IN (SELECT id FROM catalog WHERE type_id=@old_comp OR type_id=@fam_comp));
-- root relations
INSERT INTO catalog_relation (catalog_id1, catalog_id2, type)
   SELECT @comp, cat.id, 6 FROM catalog cat
     WHERE cat.type_id=@old_comp OR cat.type_id=@fam_comp;

-- hardcoded ids!
INSERT INTO page_catalog_section (title, num, page, parent, type, relation)
  VALUES ("Computer families", 1, 1, @comp, 1, 1);
INSERT INTO page_catalog_section (title, num, page, parent, type, relation)
  VALUES ("Computers", 2, 1, @comp, 2, 6);

---- CONSOLES
INSERT INTO catalog (type, title_eng) VALUES (1, "Console");
SET @comp = LAST_INSERT_ID();
SET @old_comp = (SELECT id FROM catalog_type WHERE title="Console");
SET @fam_comp = (SELECT id FROM catalog_type WHERE title="Console family");
-- include relations
INSERT INTO catalog_relation (catalog_id1, catalog_id2, type)
   SELECT @comp AS catalog_id1, cat.id AS catalog_id2, 1 AS type FROM catalog cat WHERE
     (cat.type_id=@old_comp OR cat.type_id=@fam_comp)
     AND NOT EXISTS (SELECT * FROM catalog_relation WHERE catalog_id2=cat.id AND type=1
         AND catalog_id1 IN (SELECT id FROM catalog WHERE type_id=@old_comp OR type_id=@fam_comp));
-- root relations
INSERT INTO catalog_relation (catalog_id1, catalog_id2, type)
   SELECT @comp, cat.id, 6 FROM catalog cat
     WHERE cat.type_id=@old_comp OR cat.type_id=@fam_comp;

-- hardcoded ids!
INSERT INTO page_catalog_section (title, num, page, parent, type, relation)
  VALUES ("Console families", 1, 2, @comp, 1, 1);
INSERT INTO page_catalog_section (title, num, page, parent, type, relation)
  VALUES ("Consoles", 2, 2, @comp, 2, 6);

---- CALCULATORS
INSERT INTO catalog (type, title_eng) VALUES (1, "Calculator");
SET @comp = LAST_INSERT_ID();
SET @old_comp = (SELECT id FROM catalog_type WHERE title="Calculator");
SET @fam_comp = (SELECT id FROM catalog_type WHERE title="Calculator family");
-- include relations
INSERT INTO catalog_relation (catalog_id1, catalog_id2, type)
   SELECT @comp AS catalog_id1, cat.id AS catalog_id2, 1 AS type FROM catalog cat WHERE
     (cat.type_id=@old_comp OR cat.type_id=@fam_comp)
     AND NOT EXISTS (SELECT * FROM catalog_relation WHERE catalog_id2=cat.id AND type=1
         AND catalog_id1 IN (SELECT id FROM catalog WHERE type_id=@old_comp OR type_id=@fam_comp));
-- root relations
INSERT INTO catalog_relation (catalog_id1, catalog_id2, type)
   SELECT @comp, cat.id, 6 FROM catalog cat
     WHERE cat.type_id=@old_comp OR cat.type_id=@fam_comp;

-- hardcoded ids!
INSERT INTO page_catalog_section (title, num, page, parent, type, relation)
  VALUES ("Calculator families", 1, 3, @comp, 1, 1);
INSERT INTO page_catalog_section (title, num, page, parent, type, relation)
  VALUES ("Calculators", 2, 3, @comp, 2, 6);

---- SOFTWARE
INSERT INTO catalog (type, title_eng) VALUES (1, "Software");
SET @comp = LAST_INSERT_ID();
SET @old_comp = (SELECT id FROM catalog_type WHERE title="Software");
SET @fam_comp = (SELECT id FROM catalog_type WHERE title="Software family");
-- include relations
INSERT INTO catalog_relation (catalog_id1, catalog_id2, type)
   SELECT @comp AS catalog_id1, cat.id AS catalog_id2, 1 AS type FROM catalog cat WHERE
     (cat.type_id=@old_comp OR cat.type_id=@fam_comp)
     AND NOT EXISTS (SELECT * FROM catalog_relation WHERE catalog_id2=cat.id AND type=1
         AND catalog_id1 IN (SELECT id FROM catalog WHERE type_id=@old_comp OR type_id=@fam_comp));
-- root relations
INSERT INTO catalog_relation (catalog_id1, catalog_id2, type)
   SELECT @comp, cat.id, 6 FROM catalog cat
     WHERE cat.type_id=@old_comp OR cat.type_id=@fam_comp;

-- hardcoded ids!
INSERT INTO page_catalog_section (title, num, page, parent, type, relation)
  VALUES ("Software families", 1, 4, @comp, 1, 1);
INSERT INTO page_catalog_section (title, num, page, parent, type, relation)
  VALUES ("Software", 2, 4, @comp, 4, 6);

---- PERIPHERALS
INSERT INTO catalog (type, title_eng) VALUES (1, "Peripheral device");
SET @comp = LAST_INSERT_ID();
SET @old_comp = (SELECT id FROM catalog_type WHERE title="Peripheral device");
SET @fam_comp = (SELECT id FROM catalog_type WHERE title="Peripheral device family");
-- include relations
INSERT INTO catalog_relation (catalog_id1, catalog_id2, type)
   SELECT @comp AS catalog_id1, cat.id AS catalog_id2, 1 AS type FROM catalog cat WHERE
     (cat.type_id=@old_comp OR cat.type_id=@fam_comp)
     AND NOT EXISTS (SELECT * FROM catalog_relation WHERE catalog_id2=cat.id AND type=1
         AND catalog_id1 IN (SELECT id FROM catalog WHERE type_id=@old_comp OR type_id=@fam_comp));
-- root relations
INSERT INTO catalog_relation (catalog_id1, catalog_id2, type)
   SELECT @comp, cat.id, 6 FROM catalog cat
     WHERE cat.type_id=@old_comp OR cat.type_id=@fam_comp;

-- hardcoded ids!
INSERT INTO page_catalog_section (title, num, page, parent, type, relation)
  VALUES ("Peripheral device families", 1, 5, @comp, 1, 1);
INSERT INTO page_catalog_section (title, num, page, parent, type, relation)
  VALUES ("Peripheral devices", 2, 5, @comp, 2, 6);

---- DATA STORAGE
INSERT INTO catalog (type, title_eng) VALUES (1, "Data storage");
SET @comp = LAST_INSERT_ID();
SET @old_comp = (SELECT id FROM catalog_type WHERE title="Data storage");
SET @fam_comp = (SELECT id FROM catalog_type WHERE title="Data storage family");
-- include relations
INSERT INTO catalog_relation (catalog_id1, catalog_id2, type)
   SELECT @comp AS catalog_id1, cat.id AS catalog_id2, 1 AS type FROM catalog cat WHERE
     (cat.type_id=@old_comp OR cat.type_id=@fam_comp)
     AND NOT EXISTS (SELECT * FROM catalog_relation WHERE catalog_id2=cat.id AND type=1
         AND catalog_id1 IN (SELECT id FROM catalog WHERE type_id=@old_comp OR type_id=@fam_comp));
-- root relations
INSERT INTO catalog_relation (catalog_id1, catalog_id2, type)
   SELECT @comp, cat.id, 6 FROM catalog cat
     WHERE cat.type_id=@old_comp OR cat.type_id=@fam_comp;

-- hardcoded ids!
INSERT INTO page_catalog_section (title, num, page, parent, type, relation)
  VALUES ("Data storage families", 1, 6, @comp, 1, 1);
INSERT INTO page_catalog_section (title, num, page, parent, type, relation)
  VALUES ("Data storage", 2, 6, @comp, 2, 6);


-- swap storage relations
INSERT INTO catalog_relation (catalog_id1, catalog_id2, type)
  SELECT catalog_id2, catalog_id1, 999 FROM catalog_relation WHERE type=4;
DELETE FROM catalog_relation WHERE type=4;
UPDATE catalog_relation SET type=4 WHERE type=999;

-- Kit
INSERT INTO catalog (type, title_eng) VALUES (3, "Kit");
SET @comp = LAST_INSERT_ID();
SET @old_comp = (SELECT id FROM catalog_type WHERE title="Kit");
INSERT INTO catalog_relation (catalog_id1, catalog_id2, type)
   SELECT @comp, cat.id, 6 FROM catalog cat
     WHERE cat.type_id=@old_comp;

-- Cable/Adapter
INSERT INTO catalog (type, title_eng) VALUES (2, "Cable/Adapter");
SET @comp = LAST_INSERT_ID();
SET @old_comp = (SELECT id FROM catalog_type WHERE title="Cable/Adapter");
INSERT INTO catalog_relation (catalog_id1, catalog_id2, type)
   SELECT @comp, cat.id, 6 FROM catalog cat
     WHERE cat.type_id=@old_comp;

-- Book
INSERT INTO catalog (type, title_eng) VALUES (2, "Book");
SET @comp = LAST_INSERT_ID();
SET @old_comp = (SELECT id FROM catalog_type WHERE title="Book");
INSERT INTO catalog_relation (catalog_id1, catalog_id2, type)
   SELECT @comp, cat.id, 6 FROM catalog cat
     WHERE cat.type_id=@old_comp;

-- Manual
INSERT INTO catalog (type, title_eng) VALUES (2, "Manual");
SET @comp = LAST_INSERT_ID();
SET @old_comp = (SELECT id FROM catalog_type WHERE title="Manual");
INSERT INTO catalog_relation (catalog_id1, catalog_id2, type)
   SELECT @comp, cat.id, 6 FROM catalog cat
     WHERE cat.type_id=@old_comp;

-- Schematics
INSERT INTO catalog (type, title_eng) VALUES (2, "Schematics");
SET @comp = LAST_INSERT_ID();
SET @old_comp = (SELECT id FROM catalog_type WHERE title="Schematics");
INSERT INTO catalog_relation (catalog_id1, catalog_id2, type)
   SELECT @comp, cat.id, 6 FROM catalog cat
     WHERE cat.type_id=@old_comp;

-- Mainboard
INSERT INTO catalog (type, title_eng) VALUES (2, "Mainboard");
SET @comp = LAST_INSERT_ID();
SET @old_comp = (SELECT id FROM catalog_type WHERE title="Mainboard");
INSERT INTO catalog_relation (catalog_id1, catalog_id2, type)
   SELECT @comp, cat.id, 6 FROM catalog cat
     WHERE cat.type_id=@old_comp;

-- Other
INSERT INTO catalog (type, title_eng) VALUES (2, "Other");
SET @comp = LAST_INSERT_ID();
SET @old_comp = (SELECT id FROM catalog_type WHERE title="Other");
INSERT INTO catalog_relation (catalog_id1, catalog_id2, type)
   SELECT @comp, cat.id, 6 FROM catalog cat
     WHERE cat.type_id=@old_comp;
