-- Recette Tajine d'Agneau
INSERT INTO recipes (title, country, region, description, preparation_time, cooking_time, difficulty, servings, is_premium, image_url, category_id) VALUES
('Tajine d''Agneau', 'Maroc', 'Marrakech', 'Un tajine mijoté avec de l''agneau tendre, des abricots, des amandes et des épices.', 30, 120, 'Moyen', 4, true, 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=1932&auto=format&fit=crop',
(SELECT id FROM categories WHERE name = 'Méditerranéen'));

-- Ingrédients du Tajine
INSERT INTO ingredients (recipe_id, name, quantity, unit) VALUES
((SELECT id FROM recipes WHERE title = 'Tajine d''Agneau'), 'Épaule d''agneau', '1', 'kg'),
((SELECT id FROM recipes WHERE title = 'Tajine d''Agneau'), 'Oignons', '2', ''),
((SELECT id FROM recipes WHERE title = 'Tajine d''Agneau'), 'Ail', '4', 'gousses'),
((SELECT id FROM recipes WHERE title = 'Tajine d''Agneau'), 'Gingembre frais râpé', '2', 'cuillères à café'),
((SELECT id FROM recipes WHERE title = 'Tajine d''Agneau'), 'Cannelle', '1', 'bâton'),
((SELECT id FROM recipes WHERE title = 'Tajine d''Agneau'), 'Safran', '1', 'pincée'),
((SELECT id FROM recipes WHERE title = 'Tajine d''Agneau'), 'Cumin moulu', '1', 'cuillère à café'),
((SELECT id FROM recipes WHERE title = 'Tajine d''Agneau'), 'Coriandre moulue', '1', 'cuillère à café'),
((SELECT id FROM recipes WHERE title = 'Tajine d''Agneau'), 'Miel', '2', 'cuillères à soupe'),
((SELECT id FROM recipes WHERE title = 'Tajine d''Agneau'), 'Abricots secs', '150', 'g'),
((SELECT id FROM recipes WHERE title = 'Tajine d''Agneau'), 'Amandes effilées', '100', 'g'),
((SELECT id FROM recipes WHERE title = 'Tajine d''Agneau'), 'Huile d''olive', '3', 'cuillères à soupe'),
((SELECT id FROM recipes WHERE title = 'Tajine d''Agneau'), 'Bouillon de mouton', '500', 'ml'),
((SELECT id FROM recipes WHERE title = 'Tajine d''Agneau'), 'Coriandre fraîche', '1', 'bouquet');

-- Étapes de préparation du Tajine
INSERT INTO steps (recipe_id, order_number, title, description, story_content) VALUES
((SELECT id FROM recipes WHERE title = 'Tajine d''Agneau'), 1, 'Préparation de la viande', 'Couper l''agneau en cubes de 3-4 cm et le faire dorer dans l''huile d''olive.', 'Le tajine est à la fois le nom du plat et celui du récipient de cuisson en terre cuite avec son couvercle conique caractéristique.'),
((SELECT id FROM recipes WHERE title = 'Tajine d''Agneau'), 2, 'Préparation de la base', 'Ajouter les oignons émincés et l''ail écrasé, faire revenir jusqu''à ce qu''ils soient translucides.', 'Cette base aromatique est le fondement de la richesse du plat.'),
((SELECT id FROM recipes WHERE title = 'Tajine d''Agneau'), 3, 'Ajout des épices', 'Incorporer le gingembre, la cannelle, le safran, le cumin et la coriandre moulue.', 'Ces épices sont l''âme de la cuisine marocaine, créant des parfums envoûtants.'),
((SELECT id FROM recipes WHERE title = 'Tajine d''Agneau'), 4, 'Ajout du liquide', 'Verser le bouillon de mouton, couvrir et laisser mijoter à feu doux pendant 1h30.', 'La cuisson lente dans le tajine permet à la vapeur de circuler et de retomber sur les aliments, concentrant les saveurs.'),
((SELECT id FROM recipes WHERE title = 'Tajine d''Agneau'), 5, 'Préparation des fruits secs', 'Faire tremper les abricots dans de l''eau chaude pendant 15 minutes si nécessaire.', 'Les abricots apportent une douceur qui contraste délicieusement avec les épices.'),
((SELECT id FROM recipes WHERE title = 'Tajine d''Agneau'), 6, 'Torréfaction des amandes', 'Faire dorer les amandes effilées à sec dans une poêle.', 'Cette étape révèle tous les arômes des amandes et ajoute une texture croquante.'),
((SELECT id FROM recipes WHERE title = 'Tajine d''Agneau'), 7, 'Finalisation', 'Quand la viande est tendre, ajouter le miel et les abricots, poursuivre la cuisson 15 minutes.', 'Le mariage sucré-salé est typique de la cuisine marocaine, influencée par les traditions berbères, arabes et méditerranéennes.'),
((SELECT id FROM recipes WHERE title = 'Tajine d''Agneau'), 8, 'Service', 'Servir chaud, parsemé d''amandes grillées et de coriandre fraîche.', 'Le tajine se sert traditionnellement directement dans le plat de cuisson, accompagné de couscous ou de pain.');

-- Playlist pour le Tajine
INSERT INTO playlists (recipe_id, title, description, spotify_link, image_url) VALUES
((SELECT id FROM recipes WHERE title = 'Tajine d''Agneau'), 'Nuits de Marrakech', 'Atmosphère musicale des souks et palais marocains', 'https://open.spotify.com/playlist/37i9dQZF1DX2q3aDlExVfQ', 'https://images.unsplash.com/photo-1525517450344-d08c6a528e3c?q=80&w=1470&auto=format&fit=crop');

-- Tracks pour la playlist Tajine
INSERT INTO playlist_tracks (playlist_id, name, artist, order_number) VALUES
((SELECT id FROM playlists WHERE title = 'Nuits de Marrakech'), 'Yalil (Night)', 'Fairuz', 1),
((SELECT id FROM playlists WHERE title = 'Nuits de Marrakech'), 'Didi', 'Khaled', 2),
((SELECT id FROM playlists WHERE title = 'Nuits de Marrakech'), 'Ya Rayah', 'Rachid Taha', 3),
((SELECT id FROM playlists WHERE title = 'Nuits de Marrakech'), 'Batwanes Beek', 'Umm Kulthum', 4),
((SELECT id FROM playlists WHERE title = 'Nuits de Marrakech'), 'Maktoub', 'Souad Massi', 5);

-- Accord de vin pour le Tajine
INSERT INTO wine_pairings (recipe_id, name, description, region, image_url) VALUES
((SELECT id FROM recipes WHERE title = 'Tajine d''Agneau'), 'Syrah marocaine', 'Un vin rouge aux arômes de fruits noirs et d''épices, dont la structure tannique équilibre parfaitement la richesse du tajine.', 'Meknès, Maroc', 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=1470&auto=format&fit=crop'); 