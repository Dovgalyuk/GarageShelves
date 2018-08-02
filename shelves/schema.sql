DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS collection;

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
  title TEXT NOT NULL
);

CREATE TABLE concept (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (type_id) REFERENCES concept_type (id)
);

-- default users
INSERT INTO user (username, password, admin)
  -- user admin, password admin
  VALUES ("admin", "pbkdf2:sha256:50000$g307uMdl$7da6a054398f31081232bae9b62883a660b74fa4444c571db546a200dd18415b",
  	      1);

-- default concept types
INSERT INTO concept_type (title) VALUES ("Nothing");
INSERT INTO concept_type (title) VALUES ("Computer Family");
INSERT INTO concept_type (title) VALUES ("Computer");
INSERT INTO concept_type (title) VALUES ("Computer kit");
INSERT INTO concept_type (title) VALUES ("Mainboard");
INSERT INTO concept_type (title) VALUES ("Peripheral device");
INSERT INTO concept_type (title) VALUES ("Peripheral device kit");
INSERT INTO concept_type (title) VALUES ("Manual");
INSERT INTO concept_type (title) VALUES ("Software");
INSERT INTO concept_type (title) VALUES ("Software kit");

-- default concepts
