-- Paella de Valence avec expérience immersive
UPDATE recipes
SET 
  story_intro = 'Bienvenue dans l''effervescence d''un marché valencien, où le soleil espagnol baigne les étals de produits frais de sa lumière dorée. C''est ici, dans la région de Valence, que la paella a vu le jour au XVIIIe siècle. Antonio, maître paellero depuis 40 ans, vous accueille dans sa cuisine ouverte sur les champs de safran et les orangeraies. "La paella est l''âme de Valence", dit-il en préparant sa paellera, cette large poêle qui a donné son nom au plat. Aujourd''hui, vous allez découvrir les secrets ancestraux de la vraie paella valencienne, celle que l''on ne trouve pas dans les restaurants touristiques, mais dans les maisons familiales où chaque dimanche, elle rassemble plusieurs générations autour d''une même table.',
  story_intro_audio_url = 'https://savorista.com/audio/stories/paella_intro.mp3'
WHERE title = 'Paella de Valence';

-- Mise à jour des étapes avec éléments narratifs
UPDATE steps
SET 
  story_content = 'Antonio sort sa paellera et la place sur le feu. "Une bonne paella commence par une bonne préparation", dit-il en caressant le bord usé de la poêle. "Cette paellera appartenait à mon père, et avant lui à mon grand-père. Elle contient l''histoire de notre famille." Il verse l''huile d''olive qui commence à chauffer, libérant son parfum fruité dans l''air.',
  story_audio_url = 'https://savorista.com/audio/stories/paella_step1.mp3',
  story_background_image_url = 'https://images.unsplash.com/photo-1604547581206-3e57fae3c21a?q=80&w=1374&auto=format&fit=crop'
WHERE recipe_id = (SELECT id FROM recipes WHERE title = 'Paella de Valence') AND order_number = 1;

-- Continuer avec les autres étapes...

-- Ajout d'une ambiance musicale pour l'expérience immersive
INSERT INTO story_ambiances (recipe_id, name, description, ambient_sound_url, spotify_playlist_url)
VALUES (
  (SELECT id FROM recipes WHERE title = 'Paella de Valence'),
  'Après-midi ensoleillé à Valence',
  'Sons d''un marché espagnol animé avec des conversations joyeuses et de la musique de guitare flamenco en arrière-plan',
  'https://savorista.com/audio/ambience/spanish_market.mp3',
  'https://open.spotify.com/playlist/37i9dQZF1DX5WnT70QV0so'
); 