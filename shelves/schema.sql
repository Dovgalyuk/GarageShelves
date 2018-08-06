DROP TABLE IF EXISTS item;
DROP TABLE IF EXISTS concept;
DROP TABLE IF EXISTS concept_type;
DROP TABLE IF EXISTS collection;
DROP TABLE IF EXISTS user;

CREATE TABLE user (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  admin BOOLEAN NOT NULL DEFAULT 0
);

CREATE TABLE collection (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_id INTEGER NOT NULL,
  created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  title TEXT NOT NULL,
  description TEXT NOT NULL,

  FOREIGN KEY (owner_id) REFERENCES user (id)
);

CREATE TABLE concept_type (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  physical BOOLEAN NOT NULL DEFAULT 1
);

CREATE TABLE concept (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  owner_id INTEGER NULL DEFAULT NULL,

  FOREIGN KEY (type_id) REFERENCES concept_type (id),
  FOREIGN KEY (owner_id) REFERENCES user (id)
);

CREATE TABLE item (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  concept_id INTEGER NOT NULL,
  internal_id TEXT,
  description TEXT NOT NULL,
  added TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  collection_id INTEGER NOT NULL,

  FOREIGN KEY (concept_id) REFERENCES concept (id),
  FOREIGN KEY (collection_id) REFERENCES collection (id)
);

CREATE TABLE image (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ext TEXT NOT NULL,
  filename TEXT NOT NULL
);

CREATE TABLE item_attribute (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type INTEGER NOT NULL,
  item_id INTEGER NOT NULL,
  value_id INTEGER NOT NULL,

  FOREIGN KEY (item_id) REFERENCES item (id)
);

-- default user
INSERT INTO user (username, password, admin)
  -- user admin, password admin
  VALUES ("admin", "pbkdf2:sha256:50000$g307uMdl$7da6a054398f31081232bae9b62883a660b74fa4444c571db546a200dd18415b",
  	      1);

-- admin's collection
INSERT INTO collection (owner_id, title, description)
  VALUES (1, "Admin's collection", "");

-- default concept types
INSERT INTO concept_type (title) VALUES ("Nothing");
INSERT INTO concept_type (title, physical) VALUES ("Computer Family", 0);
INSERT INTO concept_type (title) VALUES ("Computer");
INSERT INTO concept_type (title) VALUES ("Computer kit");
INSERT INTO concept_type (title) VALUES ("Mainboard");
INSERT INTO concept_type (title) VALUES ("Peripheral device");
INSERT INTO concept_type (title) VALUES ("Peripheral device kit");
INSERT INTO concept_type (title) VALUES ("Manual");
INSERT INTO concept_type (title) VALUES ("Software");
INSERT INTO concept_type (title) VALUES ("Software kit");

-- default concepts
