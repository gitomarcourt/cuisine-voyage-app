-- Recette Ramen Tonkotsu
INSERT INTO recipes (title, country, region, description, preparation_time, cooking_time, difficulty, servings, is_premium, image_url, category_id) VALUES
('Ramen Tonkotsu', 'Japon', 'Kyushu', 'Un bouillon riche et crémeux avec des nouilles faites maison et du porc braisé.', 60, 180, 'Difficile', 4, true, 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=1480&auto=format&fit=crop',
(SELECT id FROM categories WHERE name = 'Asiatique'));

-- Ingrédients du Ramen
INSERT INTO ingredients (recipe_id, name, quantity, unit) VALUES
((SELECT id FROM recipes WHERE title = 'Ramen Tonkotsu'), 'Os de porc', '1', 'kg'),
((SELECT id FROM recipes WHERE title = 'Ramen Tonkotsu'), 'Poitrine de porc', '500', 'g'),
((SELECT id FROM recipes WHERE title = 'Ramen Tonkotsu'), 'Nouilles ramen fraîches', '400', 'g'),
((SELECT id FROM recipes WHERE title = 'Ramen Tonkotsu'), 'Oignons verts', '4', ''),
((SELECT id FROM recipes WHERE title = 'Ramen Tonkotsu'), 'Gingembre', '50', 'g'),
((SELECT id FROM recipes WHERE title = 'Ramen Tonkotsu'), 'Ail', '6', 'gousses'),
((SELECT id FROM recipes WHERE title = 'Ramen Tonkotsu'), 'Œufs', '4', ''),
((SELECT id FROM recipes WHERE title = 'Ramen Tonkotsu'), 'Sauce soja', '100', 'ml');

-- Étapes de préparation du Ramen
INSERT INTO steps (recipe_id, order_number, title, description, story_content) VALUES
((SELECT id FROM recipes WHERE title = 'Ramen Tonkotsu'), 1, 'Préparation des os', 'Blanchir les os de porc dans l''eau bouillante pendant 5 minutes.', 'Le tonkotsu, originaire de Fukuoka sur l''île de Kyushu, est reconnu pour son bouillon riche et opaque.'),
((SELECT id FROM recipes WHERE title = 'Ramen Tonkotsu'), 2, 'Préparation du bouillon', 'Rincer les os et les mettre dans une grande marmite avec 5 litres d''eau.', 'Ce bouillon, cuit pendant de longues heures, extrait le collagène des os, créant cette texture onctueuse caractéristique.'),
((SELECT id FROM recipes WHERE title = 'Ramen Tonkotsu'), 3, 'Ajout des aromates', 'Ajouter le gingembre et l''ail et porter à ébullition.', 'Ces aromates apportent profondeur et complexité au bouillon.'),
((SELECT id FROM recipes WHERE title = 'Ramen Tonkotsu'), 4, 'Cuisson longue', 'Réduire le feu et laisser mijoter pendant 6 à 8 heures.', 'La patience est la clé - c''est cette cuisson lente qui transforme un simple bouillon en une expérience gustative extraordinaire.'),
((SELECT id FROM recipes WHERE title = 'Ramen Tonkotsu'), 5, 'Préparation du porc', 'Faire mariner la poitrine de porc dans la sauce soja et le mirin.', 'Le chashu, ou porc mariné, est un élément essentiel des ramens traditionnels.'),
((SELECT id FROM recipes WHERE title = 'Ramen Tonkotsu'), 6, 'Cuisson du porc', 'Cuire la poitrine de porc au four à 150°C pendant 2 heures.', 'Cette cuisson lente permet d''obtenir une viande tendre qui se défait à la fourchette.'),
((SELECT id FROM recipes WHERE title = 'Ramen Tonkotsu'), 7, 'Préparation des œufs', 'Faire bouillir les œufs pendant 6 minutes, les refroidir et les mariner.', 'Les œufs ajami, avec leur jaune coulant, sont l''un des toppings les plus appréciés du ramen.'),
((SELECT id FROM recipes WHERE title = 'Ramen Tonkotsu'), 8, 'Cuisson des nouilles', 'Cuire les nouilles selon les instructions du paquet.', 'Contrairement aux pâtes italiennes, les nouilles de ramen doivent garder une certaine fermeté et élasticité.'),
((SELECT id FROM recipes WHERE title = 'Ramen Tonkotsu'), 9, 'Assemblage final', 'Assembler le ramen : bouillon, nouilles, tranches de porc, œuf coupé en deux, oignons verts.', 'L''art du ramen réside aussi dans sa présentation, chaque ingrédient ayant sa place dans le bol.');

-- Playlist pour le Ramen
INSERT INTO playlists (recipe_id, title, description, spotify_link, image_url) VALUES
((SELECT id FROM recipes WHERE title = 'Ramen Tonkotsu'), 'Ambiance Tokyo', 'Sons urbains du Japon pour accompagner votre dégustation de ramen', 'https://open.spotify.com/playlist/37i9dQZF1DX6ThddIjWuGT', 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1334&auto=format&fit=crop');

-- Tracks pour la playlist Ramen
INSERT INTO playlist_tracks (playlist_id, name, artist, order_number) VALUES
((SELECT id FROM playlists WHERE title = 'Ambiance Tokyo'), 'Tokyo Drift', 'Teriyaki Boyz', 1),
((SELECT id FROM playlists WHERE title = 'Ambiance Tokyo'), 'Plastic Love', 'Mariya Takeuchi', 2),
((SELECT id FROM playlists WHERE title = 'Ambiance Tokyo'), 'Merry Christmas Mr. Lawrence', 'Ryuichi Sakamoto', 3),
((SELECT id FROM playlists WHERE title = 'Ambiance Tokyo'), 'Sukiyaki', 'Kyu Sakamoto', 4),
((SELECT id FROM playlists WHERE title = 'Ambiance Tokyo'), 'Akuma no Ko', 'Ai Higuchi', 5);

-- Accord de vin pour le Ramen
INSERT INTO wine_pairings (recipe_id, name, description, region, image_url) VALUES
((SELECT id FROM recipes WHERE title = 'Ramen Tonkotsu'), 'Junmai Sake', 'Un saké non-filtré avec des notes de riz et de noisette qui complète parfaitement la richesse du bouillon de porc.', 'Préfecture de Niigata, Japon', 'https://images.unsplash.com/photo-1516100882582-96c3a05fe590?q=80&w=1374&auto=format&fit=crop'); 