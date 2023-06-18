----------------------------------------------
--- Cria Relações entre as tabelas
----------------------------------------------

--- Cria as Relações
ALTER TABLE pds.users ADD CONSTRAINT user_role_users_fk FOREIGN KEY(id_user_role) REFERENCES pds.user_roles(id);
ALTER TABLE pds.user_keys ADD CONSTRAINT user_user_keys_fk FOREIGN KEY(id_user) REFERENCES pds.users(id);
ALTER TABLE pds.clocks ADD CONSTRAINT user_clocks_fk FOREIGN KEY(id_user) REFERENCES pds.users(id);
ALTER TABLE pds.clocks ADD CONSTRAINT log_clocks_fk FOREIGN KEY(log) REFERENCES pds.users(id);
ALTER TABLE pds.bookings ADD CONSTRAINT user_bookings_fk FOREIGN KEY(id_user) REFERENCES pds.users(id);
ALTER TABLE pds.bookings ADD CONSTRAINT room_bookings_fk FOREIGN KEY(id_room) REFERENCES pds.rooms(id);

--- Cria as Relações das Tabelas Associativas
ALTER TABLE pds.users_areas ADD CONSTRAINT user_areas_fk FOREIGN KEY(id_user) REFERENCES pds.users(id);
ALTER TABLE pds.users_areas ADD CONSTRAINT area_users_fk FOREIGN KEY(id_area) REFERENCES pds.areas(id);

