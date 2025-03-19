-- Recette Paella de Valence
INSERT INTO recipes (title, country, region, description, preparation_time, cooking_time, difficulty, servings, is_premium, image_url, category_id) VALUES
('Paella de Valence', 'Espagne', 'Valence', 'La vraie paella valencienne avec du poulet, du lapin et des haricots verts.', 40, 35, 'Difficile', 6, true, 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?q=80&w=1470&auto=format&fit=crop',
(SELECT id FROM categories WHERE name = 'Méditerranéen'));

-- Ingrédients de la Paella
INSERT INTO ingredients (recipe_id, name, quantity, unit) VALUES
((SELECT id FROM recipes WHERE title = 'Paella de Valence'), 'Riz bomba', '400', 'g'),
((SELECT id FROM recipes WHERE title = 'Paella de Valence'), 'Poulet', '400', 'g'),
((SELECT id FROM recipes WHERE title = 'Paella de Valence'), 'Lapin', '400', 'g'),
((SELECT id FROM recipes WHERE title = 'Paella de Valence'), 'Haricots verts plats', '200', 'g'),
((SELECT id FROM recipes WHERE title = 'Paella de Valence'), 'Haricots de Lima frais (ou congelés)', '100', 'g'),
((SELECT id FROM recipes WHERE title = 'Paella de Valence'), 'Tomates râpées', '2', ''),
((SELECT id FROM recipes WHERE title = 'Paella de Valence'), 'Paprika fumé', '1', 'cuillère à café'),
((SELECT id FROM recipes WHERE title = 'Paella de Valence'), 'Safran', '1', 'pincée'),
((SELECT id FROM recipes WHERE title = 'Paella de Valence'), 'Romarin frais', '1', 'branche'),
((SELECT id FROM recipes WHERE title = 'Paella de Valence'), 'Huile d''olive', '4', 'cuillères à soupe'),
((SELECT id FROM recipes WHERE title = 'Paella de Valence'), 'Eau ou bouillon de poulet', '1.2', 'litres'),
((SELECT id FROM recipes WHERE title = 'Paella de Valence'), 'Sel', '', 'au goût');

-- Étapes de préparation de la Paella
INSERT INTO steps (recipe_id, order_number, title, description, story_content) VALUES
((SELECT id FROM recipes WHERE title = 'Paella de Valence'), 1, 'Préparation de la paellera', 'Chauffer l''huile d''olive dans la paellera (poêle à paella) à feu moyen-vif.', 'La paella tire son nom du plat dans lequel elle est cuite, la "paellera", un ustensile emblématique de la cuisine espagnole.'),
((SELECT id FROM recipes WHERE title = 'Paella de Valence'), 2, 'Saisir les viandes', 'Faire dorer le poulet et le lapin coupés en morceaux pendant environ 10 minutes.', 'La paella authentique valencienne est à l''origine un plat de fermiers, utilisant les ingrédients disponibles dans la campagne.'),
((SELECT id FROM recipes WHERE title = 'Paella de Valence'), 3, 'Ajout des légumes', 'Incorporer les haricots verts et les haricots de Lima, faire revenir 5 minutes.', 'Ces légumes apportent fraîcheur et texture à ce plat traditionnel.'),
((SELECT id FROM recipes WHERE title = 'Paella de Valence'), 4, 'Préparation de la base', 'Ajouter les tomates râpées, le paprika et faire cuire 2-3 minutes.', 'Le paprika fumé (pimentón de la Vera) est essentiel pour donner ce goût caractéristique à la paella.'),
((SELECT id FROM recipes WHERE title = 'Paella de Valence'), 5, 'Incorporation du riz', 'Ajouter le riz et remuer pour bien l''enrober des saveurs et de l''huile.', 'Le riz bomba, à grain court, est parfait pour absorber les saveurs tout en gardant une texture ferme.'),
((SELECT id FROM recipes WHERE title = 'Paella de Valence'), 6, 'Ajout du liquide', 'Verser le bouillon chaud, le safran et ajouter le romarin. Porter à ébullition.', 'Le safran donne sa couleur jaune caractéristique à la paella et un arôme subtil.'),
((SELECT id FROM recipes WHERE title = 'Paella de Valence'), 7, 'Cuisson du riz', 'Réduire à feu moyen et laisser mijoter sans remuer pendant environ 18 minutes.', 'Ne jamais remuer la paella pendant la cuisson est la règle d''or - cela permet au "socarrat", cette croûte caramélisée au fond, de se former.'),
((SELECT id FROM recipes WHERE title = 'Paella de Valence'), 8, 'Repos et service', 'Retirer du feu, couvrir d''un torchon propre et laisser reposer 5 minutes avant de servir.', 'La paella se sert traditionnellement directement dans le plat de cuisson, au centre de la table, pour un repas convivial et familial.');

-- Playlist pour la Paella
INSERT INTO playlists (recipe_id, title, description, spotify_link, image_url) VALUES
((SELECT id FROM recipes WHERE title = 'Paella de Valence'), 'Fiesta Española', 'Rythmes espagnols festifs pour accompagner votre paella', 'https://open.spotify.com/playlist/37i9dQZF1DX5WnT70QV0so', 'https://images.unsplash.com/photo-1551972873-b7e8754e8e26?q=80&w=1376&auto=format&fit=crop');

-- Tracks pour la playlist Paella
INSERT INTO playlist_tracks (playlist_id, name, artist, order_number) VALUES
((SELECT id FROM playlists WHERE title = 'Fiesta Española'), 'Bamboleo', 'Gipsy Kings', 1),
((SELECT id FROM playlists WHERE title = 'Fiesta Española'), 'La Bamba', 'Ritchie Valens', 2),
((SELECT id FROM playlists WHERE title = 'Fiesta Española'), 'Bailando', 'Enrique Iglesias', 3),
((SELECT id FROM playlists WHERE title = 'Fiesta Española'), 'Macarena', 'Los del Rio', 4),
((SELECT id FROM playlists WHERE title = 'Fiesta Española'), 'Danza Kuduro', 'Don Omar', 5);

-- Accord de vin pour la Paella
INSERT INTO wine_pairings (recipe_id, name, description, region, image_url) VALUES
((SELECT id FROM recipes WHERE title = 'Paella de Valence'), 'Albarino', 'Un vin blanc espagnol vif et aromatique avec des notes d''agrumes et de pêche, parfait avec les saveurs safranées.', 'Rias Baixas, Espagne', 'https://images.unsplash.com/photo-1561731173-5f64f8b6ff68?q=80&w=1374&auto=format&fit=crop'); 