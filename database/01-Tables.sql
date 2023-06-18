----------------------------------------------
--- Tabelas
----------------------------------------------

--- Tabela User Roles
CREATE TABLE pds.user_roles(
    id              SERIAL,
    name            VARCHAR(50),
    permissions     JSON,
    control         BOOLEAN         DEFAULT false,
    access          BOOLEAN         DEFAULT false,
    CONSTRAINT user_roles_pk PRIMARY KEY(id)
);

CREATE TABLE pds.users(
    id              SERIAL,
    id_user_role    INT,
    username        VARCHAR(50),
    password        TEXT,
    name            VARCHAR(50),
    tag             VARCHAR(50),
    schedule        VARCHAR(7),
    status          VARCHAR(20)         DEFAULT 'user', 
    CONSTRAINT users_pk PRIMARY KEY(id),
    CONSTRAINT users_uk UNIQUE(username)
);

CREATE TABLE pds.user_keys(
    id          SERIAL,
    id_user     INT,
    consumer    VARCHAR(250),
    secret      TEXT,
    CONSTRAINT user_keys_pk PRIMARY KEY(id)
);

CREATE TABLE pds.clocks(
    id          SERIAL,
    id_user     INT,
    direction   VARCHAR(50),
    datetime    TIMESTAMP,
    log         INT,
    CONSTRAINT clocks_pk PRIMARY KEY(id)
);

CREATE TABLE pds.rooms(
    id          SERIAL,
    name        VARCHAR(50),
CONSTRAINT rooms_pk PRIMARY KEY(id)
);

CREATE TABLE pds.bookings(
    id              SERIAL,
    id_user         INT,
    id_room         INT,
    start           TIMESTAMP,
    final           TIMESTAMP,
    description     TEXT,
    validated       BOOLEAN         DEFAULT false,
    CONSTRAINT bookings_pk PRIMARY KEY(id)
);

CREATE TABLE pds.areas(
    id      SERIAL,
    name    VARCHAR(50),
CONSTRAINT areas_pk PRIMARY KEY(id)
);

--- Cria as Tabelas Associativas
CREATE TABLE pds.users_areas(
    id_user     INT,
    id_area     INT,
CONSTRAINT users_areas_pk PRIMARY KEY(id_user, id_area)
);

