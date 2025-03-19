-- Ajout d'éléments narratifs au Tiramisu
UPDATE recipes
SET 
  story_intro = 'Nous sommes dans une petite trattoria familiale de Vénétie, au nord de l''Italie. La lumière dorée du soleil couchant filtre à travers les fenêtres, illuminant la cuisine où Nonna Maria prépare son fameux tiramisu. L''air est rempli du parfum envoûtant du café fraîchement préparé. "Le tiramisu", explique-t-elle avec un sourire chaleureux, "n''est pas seulement un dessert, c''est un moment de joie à partager. Son nom signifie ''remonte-moi'' car il a le pouvoir de remonter le moral avec sa douceur et sa richesse."',
  story_intro_audio_url = 'https://savorista.com/audio/stories/tiramisu_intro.mp3'
WHERE title = 'Tiramisu Italien';

-- Mise à jour des étapes avec des éléments narratifs
UPDATE steps
SET 
  story_audio_url = 'https://savorista.com/audio/stories/tiramisu_step1.mp3',
  story_background_image_url = 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?q=80&w=1471&auto=format&fit=crop',
  story_ambiance_sound_url = 'https://savorista.com/audio/ambience/italian_kitchen.mp3'
WHERE recipe_id = (SELECT id FROM recipes WHERE title = 'Tiramisu Italien') AND order_number = 1;

-- Insertion d'une ambiance pour le mode histoire
INSERT INTO story_ambiances (recipe_id, name, description, ambient_sound_url, spotify_playlist_url)
VALUES (
  (SELECT id FROM recipes WHERE title = 'Tiramisu Italien'),
  'Soirée italienne à Venise',
  'Sons ambiants d''une cuisine italienne traditionnelle mêlés aux bruits lointains des canaux vénitiens',
  'https://savorista.com/audio/ambience/venice_evening.mp3',
  'https://open.spotify.com/playlist/37i9dQZF1DX6wfQutivYYr'
); 