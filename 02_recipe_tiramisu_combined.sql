-- Recette Tiramisu
INSERT INTO recipes (title, country, region, description, preparation_time, cooking_time, difficulty, servings, is_premium, image_url, category_id) VALUES
('Tiramisu Italien', 'Italie', 'Vénétie', 'Un dessert classique italien à base de biscuits imbibés de café et de crème au mascarpone.', 30, 10, 'Moyen', 8, true, 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?q=80&w=1470&auto=format&fit=crop', 
(SELECT id FROM categories WHERE name = 'Européen'));

-- Mise à jour pour l'expérience immersive
UPDATE recipes
SET 
  story_intro = 'Bienvenue dans le nord de l''Italie, dans la région du Piémont. C''est là, dans les petites trattorias familiales, que le tiramisu a vu le jour, un dessert devenu légendaire. La recette a traversé les générations, apportant avec elle la douceur et la chaleur des moments passés en famille. Aujourd''hui, vous allez créer ce dessert classique, tout en découvrant les secrets de cette merveille sucrée qui unit le café, le mascarpone, et la tradition italienne.',
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
((SELECT id FROM recipes WHERE title = 'Tiramisu Italien'), 1, 'Préparation des œufs', 'Séparer les blancs des jaunes d''œufs.', 'Le tiramisu, dont le nom signifie "remonte-moi" en italien, est né dans la région de Vénétie dans les années 1960.'),
((SELECT id FROM recipes WHERE title = 'Tiramisu Italien'), 2, 'Préparation de la crème', 'Mélanger les jaunes avec le sucre jusqu''à ce que le mélange blanchisse.', 'Cette étape est cruciale pour obtenir une crème légère et aérienne.'),
((SELECT id FROM recipes WHERE title = 'Tiramisu Italien'), 3, 'Ajout du mascarpone', 'Ajouter le mascarpone et bien mélanger.', 'Le mascarpone est un fromage frais originaire de Lombardie, essentiel à l''authenticité du tiramisu.'),
((SELECT id FROM recipes WHERE title = 'Tiramisu Italien'), 4, 'Montage des blancs', 'Monter les blancs en neige et les incorporer délicatement à la préparation.', 'Ce geste délicat préserve l''air dans les blancs et donne sa texture caractéristique au dessert.'),
((SELECT id FROM recipes WHERE title = 'Tiramisu Italien'), 5, 'Trempage des biscuits', 'Tremper rapidement les biscuits dans le café et les disposer dans un plat.', 'Ne pas trop imbiber les biscuits pour éviter un dessert trop humide.'),
((SELECT id FROM recipes WHERE title = 'Tiramisu Italien'), 6, 'Assemblage', 'Recouvrir d''une couche de crème, puis répéter l''opération.', 'L''alternance des couches est la signature visuelle du tiramisu.'),
((SELECT id FROM recipes WHERE title = 'Tiramisu Italien'), 7, 'Finition', 'Saupoudrer de cacao et réserver au réfrigérateur pendant au moins 4 heures.', 'La patience est récompensée : le repos permet aux saveurs de se développer pleinement.');

-- Mise à jour des étapes avec éléments narratifs immersifs
UPDATE steps
SET 
  story_content = 'Maria commence par préparer la crème. Elle prend les jaunes d''œufs, les fouette délicatement avec du sucre, un geste précis, presque rituel. ''Il faut un peu de patience'', dit-elle toujours, ''le tiramisu se prépare avec amour, lentement.''',
  story_audio_url = 'https://savorista.com/audio/stories/tiramisu_step1.mp3',
  story_background_image_url = 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?q=80&w=1471&auto=format&fit=crop'
WHERE recipe_id = (SELECT id FROM recipes WHERE title = 'Tiramisu Italien') AND order_number = 1;

UPDATE steps
SET 
  story_content = 'Ajoutez le mascarpone, l''ingrédient secret de ce dessert. Le mascarpone, on le trouve dans les marchés locaux, frais et crémeux, un produit essentiel à la réussite du tiramisu.',
  story_audio_url = 'https://savorista.com/audio/stories/tiramisu_step2.mp3',
  story_background_image_url = 'https://images.unsplash.com/photo-1551529834-525807d6b4a2?q=80&w=1470&auto=format&fit=crop'
WHERE recipe_id = (SELECT id FROM recipes WHERE title = 'Tiramisu Italien') AND order_number = 2;

UPDATE steps
SET 
  story_content = 'Ensuite, Maria prépare la seconde partie de la magie : le café. Le parfum fort du café fraîchement préparé emplit la pièce. C''est un geste symbolique, chaque famille ayant sa recette secrète. Certains ajoutent une touche d''amaretto, pour une légère note d''amande, un petit clin d''œil à la région.',
  story_audio_url = 'https://savorista.com/audio/stories/tiramisu_step3.mp3',
  story_background_image_url = 'https://images.unsplash.com/photo-1517817748493-49ec54a32465?q=80&w=1470&auto=format&fit=crop'
WHERE recipe_id = (SELECT id FROM recipes WHERE title = 'Tiramisu Italien') AND order_number = 3;

UPDATE steps
SET 
  story_content = 'Maria a toujours préféré un café fort, un espresso italien, car il se mélange parfaitement avec le mascarpone pour créer cette texture si caractéristique. Laissez-le refroidir un peu avant de tremper les biscuits.',
  story_audio_url = 'https://savorista.com/audio/stories/tiramisu_step4.mp3',
  story_background_image_url = 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1374&auto=format&fit=crop'
WHERE recipe_id = (SELECT id FROM recipes WHERE title = 'Tiramisu Italien') AND order_number = 4;

UPDATE steps
SET 
  story_content = 'Maintenant, les biscuits à la cuillère, trempés rapidement dans le café, sont prêts à être disposés dans le plat. ''Il ne faut pas trop les tremper, sinon ils deviendront trop mous'', explique Maria. Chaque biscuit doit juste sentir le café, pas plus.',
  story_audio_url = 'https://savorista.com/audio/stories/tiramisu_step5.mp3',
  story_background_image_url = 'https://images.unsplash.com/photo-1571877227200-a09d9b4aefdd?q=80&w=1470&auto=format&fit=crop'
WHERE recipe_id = (SELECT id FROM recipes WHERE title = 'Tiramisu Italien') AND order_number = 5;

UPDATE steps
SET 
  story_content = 'La première couche de biscuits est maintenant prête. Maria recouvre les biscuits d''une couche généreuse de crème au mascarpone. Elle a toujours insisté sur l''importance de cette étape : la crème doit être onctueuse, lisse et parfaite.',
  story_audio_url = 'https://savorista.com/audio/stories/tiramisu_step6.mp3',
  story_background_image_url = 'https://images.unsplash.com/photo-1587314168485-3236d6710a32?q=80&w=1470&auto=format&fit=crop'
WHERE recipe_id = (SELECT id FROM recipes WHERE title = 'Tiramisu Italien') AND order_number = 6;

UPDATE steps
SET 
  story_content = 'Une fois le tiramisu assemblé, il faut le laisser reposer. ''Le tiramisu est un dessert qui se bonifie avec le temps'', dit toujours Maria. Quelques heures au réfrigérateur, pour permettre aux saveurs de se mélanger et de s''intensifier.',
  story_audio_url = 'https://savorista.com/audio/stories/tiramisu_step7.mp3',
  story_background_image_url = 'https://images.unsplash.com/photo-1571877599748-eb893a569ba2?q=80&w=1470&auto=format&fit=crop'
WHERE recipe_id = (SELECT id FROM recipes WHERE title = 'Tiramisu Italien') AND order_number = 7;

-- Playlist pour le Tiramisu
INSERT INTO playlists (recipe_id, title, description, spotify_link, image_url) VALUES
((SELECT id FROM recipes WHERE title = 'Tiramisu Italien'), 'Soirée Italienne', 'Une sélection de classiques italiens pour accompagner votre tiramisu', 'https://open.spotify.com/playlist/37i9dQZF1DX6QsuoQP5qFt', 'https://images.unsplash.com/photo-1591195856727-2f81371a98af?q=80&w=1374&auto=format&fit=crop');

-- Tracks pour la playlist du Tiramisu (avec correction de l'apostrophe dans "That's Amore")
INSERT INTO playlist_tracks (playlist_id, name, artist, order_number) VALUES
((SELECT id FROM playlists WHERE title = 'Soirée Italienne'), 'Volare', 'Dean Martin', 1),
((SELECT id FROM playlists WHERE title = 'Soirée Italienne'), 'That''s Amore', 'Dean Martin', 2),
((SELECT id FROM playlists WHERE title = 'Soirée Italienne'), 'Tu Vuò Fà L''Americano', 'Renato Carosone', 3),
((SELECT id FROM playlists WHERE title = 'Soirée Italienne'), 'Nel Blu Dipinto Di Blu', 'Domenico Modugno', 4),
((SELECT id FROM playlists WHERE title = 'Soirée Italienne'), 'La Dolce Vita', 'Nino Rota', 5);

-- Accord de vin pour le Tiramisu
INSERT INTO wine_pairings (recipe_id, name, description, region, image_url) VALUES
((SELECT id FROM recipes WHERE title = 'Tiramisu Italien'), 'Vin Santo', 'Un vin de dessert toscan avec des notes de miel et de noisette qui complète parfaitement les saveurs du café et du cacao.', 'Toscane, Italie', 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=1470&auto=format&fit=crop');

-- Ajout d'une ambiance musicale pour l'expérience immersive
INSERT INTO story_ambiances (recipe_id, name, description, ambient_sound_url, spotify_playlist_url)
VALUES (
  (SELECT id FROM recipes WHERE title = 'Tiramisu Italien'),
  'Soirée italienne traditionnelle',
  'Ambiance d''une cuisine familiale italienne avec des conversations douces en arrière-plan et le bruit des ustensiles',
  'https://savorista.com/audio/ambience/italian_kitchen.mp3',
  'https://open.spotify.com/playlist/37i9dQZF1DX6wfQutivYYr'
); 