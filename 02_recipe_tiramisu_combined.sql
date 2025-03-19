-- Recette Tiramisu
INSERT INTO recipes (title, country, region, description, preparation_time, cooking_time, difficulty, servings, is_premium, image_url, category_id) 
VALUES 
('Tiramisu Italien', 'Italie', 'Vénétie', 'Un dessert classique italien à base de biscuits imbibés de café et de crème au mascarpone.', 30, 10, 'Moyen', 8, true, 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?q=80&w=1470&auto=format&fit=crop', 
(SELECT id FROM categories WHERE name = 'Européen'));

-- Mise à jour pour l'expérience immersive
UPDATE recipes
SET 
  story_intro = 'Bienvenue en Vénétie, dans le nord de l''Italie. C''est là, dans les petites trattorias familiales, que le tiramisu a vu le jour, un dessert devenu légendaire.',
  story_intro_audio_url = 'https://savorista.com/audio/stories/tiramisu_intro.mp3'
WHERE title = 'Tiramisu Italien';

-- Ingrédients du Tiramisu
INSERT INTO ingredients (recipe_id, name, quantity, unit) VALUES
((SELECT id FROM recipes WHERE title = 'Tiramisu Italien'), 'Mascarpone', '500', 'g'),
((SELECT id FROM recipes WHERE title = 'Tiramisu Italien'), 'Œufs', '4', ''),
((SELECT id FROM recipes WHERE title = 'Tiramisu Italien'), 'Sucre', '100', 'g'),
((SELECT id FROM recipes WHERE title = 'Tiramisu Italien'), 'Café espresso', '300', 'ml'),
((SELECT id FROM recipes WHERE title = 'Tiramisu Italien'), 'Biscuits cuillère', '200', 'g'),
((SELECT id FROM recipes WHERE title = 'Tiramisu Italien'), 'Cacao en poudre non sucré', '30', 'g');

-- Étapes de préparation du Tiramisu
INSERT INTO steps (recipe_id, order_number, title, description, story_content) VALUES
((SELECT id FROM recipes WHERE title = 'Tiramisu Italien'), 1, 'Préparation des œufs', 'Séparer les blancs des jaunes d''œufs.', 'Le tiramisu est né en Vénétie dans les années 1960.'),
((SELECT id FROM recipes WHERE title = 'Tiramisu Italien'), 2, 'Préparation de la crème', 'Mélanger les jaunes avec le sucre jusqu''à ce que le mélange blanchisse.', 'Cette étape est cruciale pour une crème légère et aérienne.'),
((SELECT id FROM recipes WHERE title = 'Tiramisu Italien'), 3, 'Ajout du mascarpone', 'Ajouter le mascarpone et bien mélanger.', 'Le mascarpone est un fromage frais originaire de Lombardie, essentiel à l''authenticité du tiramisu.'),
((SELECT id FROM recipes WHERE title = 'Tiramisu Italien'), 4, 'Montage des blancs', 'Monter les blancs en neige et les incorporer délicatement à la préparation.', 'Ce geste délicat préserve l''air dans les blancs.'),
((SELECT id FROM recipes WHERE title = 'Tiramisu Italien'), 5, 'Trempage des biscuits', 'Tremper rapidement les biscuits dans le café et les disposer dans un plat.', 'Ne pas trop imbiber pour éviter un dessert trop humide.'),
((SELECT id FROM recipes WHERE title = 'Tiramisu Italien'), 6, 'Assemblage', 'Recouvrir d''une couche de crème, puis répéter l''opération.', 'L''alternance des couches est la signature du tiramisu.'),
((SELECT id FROM recipes WHERE title = 'Tiramisu Italien'), 7, 'Finition', 'Saupoudrer de cacao et réserver au réfrigérateur pendant au moins 4 heures.', 'Le repos permet aux saveurs de se développer pleinement.');

-- Playlist pour le Tiramisu
INSERT INTO playlists (recipe_id, title, description, spotify_link, image_url) 
VALUES 
((SELECT id FROM recipes WHERE title = 'Tiramisu Italien'), 'Soirée Italienne', 'Une sélection de classiques italiens pour accompagner votre tiramisu', 
'https://open.spotify.com/playlist/37i9dQZF1DX6QsuoQP5qFt', 
'https://images.unsplash.com/photo-1591195856727-2f81371a98af?q=80&w=1374&auto=format&fit=crop');

-- Tracks corrigées dans la playlist
INSERT INTO playlist_tracks (playlist_id, name, artist, order_number) VALUES
((SELECT id FROM playlists WHERE title = 'Soirée Italienne'), 'Volare', 'Dean Martin', 1),
((SELECT id FROM playlists WHERE title = 'Soirée Italienne'), 'That''s Amore', 'Dean Martin', 2),
((SELECT id FROM playlists WHERE title = 'Soirée Italienne'), 'Tu Vuò Fà L''Americano', 'Renato Carosone', 3),
((SELECT id FROM playlists WHERE title = 'Soirée Italienne'), 'Nel Blu Dipinto Di Blu', 'Domenico Modugno', 4),
((SELECT id FROM playlists WHERE title = 'Soirée Italienne'), 'La Dolce Vita', 'Nino Rota', 5);

-- Accord de vin corrigé pour la Vénétie
INSERT INTO wine_pairings (recipe_id, name, description, region, image_url) 
VALUES 
((SELECT id FROM recipes WHERE title = 'Tiramisu Italien'), 'Recioto della Valpolicella', 
'Un vin doux rouge de la Vénétie, avec des arômes de fruits rouges et une légère touche de chocolat.', 
'Vénétie, Italie', 
'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=1470&auto=format&fit=crop');

-- Ajout d'une ambiance musicale pour l'expérience immersive
INSERT INTO story_ambiances (recipe_id, name, description, ambient_sound_url, spotify_playlist_url)
VALUES 
((SELECT id FROM recipes WHERE title = 'Tiramisu Italien'),
'Soirée italienne traditionnelle',
'Ambiance d''une cuisine familiale italienne avec des conversations douces en arrière-plan.',
'https://savorista.com/audio/ambience/italian_kitchen.mp3',
'https://open.spotify.com/playlist/37i9dQZF1DX6wfQutivYYr');
