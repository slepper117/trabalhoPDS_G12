----------------------------------------------
--- Dados Iniciais
----------------------------------------------

--- Insere os dados iniciais
INSERT INTO pds.user_roles(name, permissions, control, access) VALUES 
('Administradores', '{"access": {"clockIn": false, "clockOut": false, "area": false, "room": false}, "areas": {"list": true, "create": true, "read": true, "update": true, "destroy": true}, "bookings": {"list": true, "create": true, "read": true, "update": true, "destroy": true, "validate": true}, "clocks": {"list": true, "create": true, "read": true, "update": true, "destroy": true}, "rooms": {"list": true, "create": true, "read": true, "update": true, "destroy": true}, "users": {"list": true, "create": true, "read": true, "update": true, "destroy": true}}', 'true', 'true'),
('Utilizadores do Sistema', '{"access": {"clockIn": true, "clockOut": true, "area": true, "room": true}, "areas": {"list": false, "create": false, "read": false, "update": false, "destroy": false}, "bookings": {"list": false, "create": false, "read": false, "update": false, "destroy": false, "validate": false}, "clocks": {"list": false, "create": false, "read": false, "update": false, "destroy": false}, "rooms": {"list": false, "create": false, "read": false, "update": false, "destroy": false}, "users": {"list": false, "create": false, "read": false, "update": false, "destroy": false}}', 'false', 'false'),
('Supervisores', '{"access": {"clockIn": false, "clockOut": false, "area": false, "room": false}, "areas": {"list": true, "create": false, "read": true, "update": false, "destroy": false}, "bookings": {"list": true, "create": true, "read": true, "update": true, "destroy": true, "validate": true}, "clocks": {"list": true, "create": true, "read": true, "update": true, "destroy": true}, "rooms": {"list": true, "create": false, "read": true, "update": false, "destroy": false}, "users": {"list": true, "create": false, "read": true, "update": true, "destroy": false}}', 'true', 'true'),
('Funcionários', '{"access": {"clockIn": false, "clockOut": false, "area": false, "room": false}, "areas": {"list": false, "create": false, "read": false, "update": false, "destroy": false}, "bookings": {"list": true, "create": true, "read": true, "update": true, "destroy": true, "validate": false}, "clocks": {"list": true, "create": false, "read": false, "update": false, "destroy": false}, "rooms": {"list": true, "create": false, "read": true, "update": false, "destroy": false}, "users": {"list": false, "create": false, "read": true, "update": true, "destroy": false}} ', 'false', 'false');

INSERT INTO pds.users(id_user_role, username, password, name, tag, schedule, status) VALUES 
(1, 'rdantas', '$2b$10$PsmHLyU2WOkxwfbmNXVGbeQAZon5D7kj8QXI4dK1IYWpmuGUMUFwy', 'Renato Dantas', 'eb7177bb', '0111110', 'user'),
(2, 'arduino', '', 'Arduino', '', '', 'system'),
(3, 'fmota', '$2b$10$NPKAGfYqo8sFlfTwkx9So..Vbc4MEluaRSD6Em2BkwebHQ5rAMyqq', 'Fábio Mota', 'eb7177bu', '0111110', 'user'),
(4, 'jmorais', '$2b$10$Ro4aYv4J1pu.y4v9hzzQ1.WVcHinNa3pynG7A67JOszIIrLqi74eq', 'João Morais', 'eb7177bc', '0111110', 'user'),
(4, 'aferreira', '$2b$10$K1fJiWGf9kaFeg1XTisqvusSm.Hl6j7yFbG2ObLonI8UvHpeHMLma', 'André Ferreira', 'eb7177bg', '0011111', 'user'),
(4, 'sribeiro', '$2b$10$mAjU5h2jaHMT9.wR2XNZQeQoBVNtZDrCzr.HKjISBPB1yTChuAT9e', 'Sérgio Ribeiro', 'eb7177bt', '1111110', 'user');

INSERT INTO pds.user_keys(id_user, consumer, secret) VALUES
(1, '1blQ0D2KM2lPNAPB', '$2b$10$cFOqbdrN8Y4jB3m12xGWxufQ5Bp8pZZYW5Dyk7Acw7N4Rni7yGcwq'),
(2, 'zzKn4iv6MUpCyCVb', '$2b$10$RBgecQjjouQJbfmXZKNvVe7n11DxPXkeHbnAOX9QfgtrbPkYgv1Ru');