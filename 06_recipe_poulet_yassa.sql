-- Recette Poulet Yassa
INSERT INTO recipes (title, country, region, description, preparation_time, cooking_time, difficulty, servings, is_premium, image_url, category_id) VALUES
('Poulet Yassa', 'Sénégal', 'Dakar', 'Poulet mariné au citron et aux oignons, un plat emblématique de la cuisine sénégalaise.', 30, 60, 'Moyen', 4, false, 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?q=80&w=1470&auto=format&fit=crop',
(SELECT id FROM categories WHERE name = 'Africain'));

-- Ingrédients du Poulet Yassa
INSERT INTO ingredients (recipe_id, name, quantity, unit) VALUES
((SELECT id FROM recipes WHERE title = 'Poulet Yassa'), 'Poulet entier', '1.5', 'kg'),
((SELECT id FROM recipes WHERE title = 'Poulet Yassa'), 'Oignons', '1', 'kg'),
((SELECT id FROM recipes WHERE title = 'Poulet Yassa'), 'Citrons', '5', ''),
((SELECT id FROM recipes WHERE title = 'Poulet Yassa'), 'Moutarde', '2', 'cuillères à soupe'),
((SELECT id FROM recipes WHERE title = 'Poulet Yassa'), 'Huile d''olive', '100', 'ml'),
((SELECT id FROM recipes WHERE title = 'Poulet Yassa'), 'Piment', '1', ''),
((SELECT id FROM recipes WHERE title = 'Poulet Yassa'), 'Bouillon de poulet', '500', 'ml'),
((SELECT id FROM recipes WHERE title = 'Poulet Yassa'), 'Riz', '400', 'g'),
((SELECT id FROM recipes WHERE title = 'Poulet Yassa'), 'Ail', '4', 'gousses'),
((SELECT id FROM recipes WHERE title = 'Poulet Yassa'), 'Poivre noir', '1', 'cuillère à café'),
((SELECT id FROM recipes WHERE title = 'Poulet Yassa'), 'Sel', '1', 'cuillère à café'),
((SELECT id FROM recipes WHERE title = 'Poulet Yassa'), 'Laurier', '2', 'feuilles');

-- Étapes de préparation du Poulet Yassa
INSERT INTO steps (recipe_id, order_number, title, description, story_content) VALUES
((SELECT id FROM recipes WHERE title = 'Poulet Yassa'), 1, 'Préparation de la marinade', 'Découper le poulet en morceaux et le mettre dans un grand saladier.', 'Le Yassa est un plat traditionnel de la cuisine sénégalaise, particulièrement populaire dans la région de la Casamance.'),
((SELECT id FROM recipes WHERE title = 'Poulet Yassa'), 2, 'Préparation des oignons', 'Éplucher et émincer les oignons, presser les citrons.', 'La quantité impressionnante d''oignons est essentielle à l''authenticité du plat - ils doivent littéralement fondre en cuisant.'),
((SELECT id FROM recipes WHERE title = 'Poulet Yassa'), 3, 'Mélange de la marinade', 'Préparer la marinade avec le jus de citron, les oignons, la moutarde, le piment émincé et l''huile.', 'L''acidité du citron attendrit la viande tout en lui apportant une saveur incomparable.'),
((SELECT id FROM recipes WHERE title = 'Poulet Yassa'), 4, 'Marinade du poulet', 'Verser la marinade sur le poulet et laisser reposer au moins 4 heures au réfrigérateur.', 'Plus la marinade est longue, meilleur sera le résultat. Idéalement, on laisse mariner toute une nuit.'),
((SELECT id FROM recipes WHERE title = 'Poulet Yassa'), 5, 'Cuisson du poulet', 'Retirer le poulet de la marinade et le faire dorer dans une poêle.', 'Cette étape de coloration est importante pour développer les saveurs et obtenir une peau croustillante.'),
((SELECT id FROM recipes WHERE title = 'Poulet Yassa'), 6, 'Cuisson au four', 'Mettre le poulet dans un plat allant au four et le faire cuire 30 minutes à 180°C.', 'La cuisson au four permet d''obtenir une viande tendre à cœur tout en conservant les saveurs.'),
((SELECT id FROM recipes WHERE title = 'Poulet Yassa'), 7, 'Préparation de la sauce', 'Pendant ce temps, faire revenir les oignons de la marinade dans la poêle.', 'Les oignons vont caraméliser légèrement, ce qui apporte une douceur contrastant avec l''acidité du citron.'),
((SELECT id FROM recipes WHERE title = 'Poulet Yassa'), 8, 'Finition de la sauce', 'Ajouter le bouillon, laisser réduire et rectifier l''assaisonnement.', 'La sauce doit avoir un équilibre parfait entre acidité, douceur et saveur umami.'),
((SELECT id FROM recipes WHERE title = 'Poulet Yassa'), 9, 'Service', 'Servir le poulet nappé de sauce aux oignons avec du riz blanc.', 'Au Sénégal, ce plat est souvent préparé pour les grandes occasions et rassemblements familiaux.');

-- Playlist pour le Poulet Yassa
INSERT INTO playlists (recipe_id, title, description, spotify_link, image_url) VALUES
((SELECT id FROM recipes WHERE title = 'Poulet Yassa'), 'Rythmes d''Afrique', 'Ambiance musicale d''Afrique de l''Ouest pour accompagner votre repas sénégalais', 'https://open.spotify.com/playlist/37i9dQZF1DWYxctNxvWpTK', 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?q=80&w=1372&auto=format&fit=crop');

-- Tracks pour la playlist du Poulet Yassa
INSERT INTO playlist_tracks (playlist_id, name, artist, order_number) VALUES
((SELECT id FROM playlists WHERE title = 'Rythmes d''Afrique'), 'Yéké Yéké', 'Mory Kanté', 1),
((SELECT id FROM playlists WHERE title = 'Rythmes d''Afrique'), 'Sili Beto', 'Youssou N''Dour', 2),
((SELECT id FROM playlists WHERE title = 'Rythmes d''Afrique'), 'Fatou Yo', 'Salif Keita', 3),
((SELECT id FROM playlists WHERE title = 'Rythmes d''Afrique'), 'Sweet Mother', 'Prince Nico Mbarga', 4),
((SELECT id FROM playlists WHERE title = 'Rythmes d''Afrique'), 'Premier Gaou', 'Magic System', 5);

-- Accord de vin pour le Poulet Yassa
INSERT INTO wine_pairings (recipe_id, name, description, region, image_url) VALUES
((SELECT id FROM recipes WHERE title = 'Poulet Yassa'), 'Chenin Blanc sud-africain', 'Un vin blanc sec avec des notes d''agrumes et une minéralité qui équilibre parfaitement l''acidité du citron dans le plat.', 'Western Cape, Afrique du Sud', 'https://images.unsplash.com/photo-1508162452-c732241a8f66?q=80&w=1470&auto=format&fit=crop'); 