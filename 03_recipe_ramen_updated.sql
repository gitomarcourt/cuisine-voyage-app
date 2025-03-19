-- Ramen Tonkotsu avec expérience immersive
UPDATE recipes
SET 
  story_intro = 'Bienvenue dans l''agitation d''une ruelle animée de Fukuoka, sur l''île de Kyushu au Japon. C''est ici, dans de petites échoppes familiales nommées "yatai", que le ramen tonkotsu a gagné sa renommée. Le chef Tanaka, maître ramen de troisième génération, se prépare à partager les secrets de son bouillon légendaire. L''air est chargé des arômes complexes du porc mijoté et des épices. Aujourd''hui, vous allez entrer dans l''univers des ramens authentiques et découvrir pourquoi ce plat représente bien plus qu''un simple bol de soupe pour la culture japonaise.',
  story_intro_audio_url = 'https://savorista.com/audio/stories/ramen_intro.mp3'
WHERE title = 'Ramen Tonkotsu';

-- Mise à jour des étapes avec éléments narratifs
UPDATE steps
SET 
  story_content = '"La base de tout bon tonkotsu commence par les os", explique le chef Tanaka en plaçant délicatement les os de porc dans une grande casserole d''eau bouillante. "Cette étape est essentielle pour éliminer les impuretés et permettre au bouillon final d''être clair et propre. C''est ce que nous appelons ''yubiki'' - le blanchiment."',
  story_audio_url = 'https://savorista.com/audio/stories/ramen_step1.mp3',
  story_background_image_url = 'https://images.unsplash.com/photo-1602273660127-a0000560a4c1?q=80&w=1470&auto=format&fit=crop'
WHERE recipe_id = (SELECT id FROM recipes WHERE title = 'Ramen Tonkotsu') AND order_number = 1;

UPDATE steps
SET 
  story_content = 'Le chef rince soigneusement les os blanchis et les place dans une immense marmite en fonte, transmise dans sa famille depuis trois générations. "Ce qui distingue notre bouillon tonkotsu des autres, c''est le temps et la patience", dit-il en versant l''eau fraîche. "À Fukuoka, nous croyons que le bouillon parfait ne peut pas être précipité."',
  story_audio_url = 'https://savorista.com/audio/stories/ramen_step2.mp3',
  story_background_image_url = 'https://images.unsplash.com/photo-1584501891223-ac98ceab2a0c?q=80&w=1470&auto=format&fit=crop'
WHERE recipe_id = (SELECT id FROM recipes WHERE title = 'Ramen Tonkotsu') AND order_number = 2;

UPDATE steps
SET 
  story_content = 'Au comptoir, Tanaka ajoute l''ail et le gingembre, libérant immédiatement leurs arômes dans la cuisine. "Ces aromates sont comme la mélodie qui accompagne la richesse du porc", explique-t-il, "ils ajoutent de la profondeur et de la complexité sans jamais dominer."',
  story_audio_url = 'https://savorista.com/audio/stories/ramen_step3.mp3',
  story_background_image_url = 'https://images.unsplash.com/photo-1556269923-e4ef51d69638?q=80&w=1470&auto=format&fit=crop'
WHERE recipe_id = (SELECT id FROM recipes WHERE title = 'Ramen Tonkotsu') AND order_number = 3;

-- Continuer avec les autres étapes...

-- Ajout d'une ambiance musicale pour l'expérience immersive
INSERT INTO story_ambiances (recipe_id, name, description, ambient_sound_url, spotify_playlist_url)
VALUES (
  (SELECT id FROM recipes WHERE title = 'Ramen Tonkotsu'),
  'Izakaya du soir à Tokyo',
  'Ambiance d''un restaurant japonais traditionnel: conversations feutrées, cliquetis de baguettes et sons de cuisine',
  'https://savorista.com/audio/ambience/japanese_izakaya.mp3',
  'https://open.spotify.com/playlist/37i9dQZF1DX6ThddIjWuGT'
); 