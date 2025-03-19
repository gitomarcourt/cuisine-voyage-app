-- Poulet Yassa avec expérience immersive
UPDATE recipes
SET 
  story_intro = 'Le soleil se lève sur Dakar, illuminant la côte atlantique du Sénégal d''une lumière dorée. Au marché Kermel, l''agitation matinale bat son plein, entre étals colorés et discussions animées. Aïssatou, connue dans tout le quartier pour son poulet yassa incomparable, vous invite dans sa cuisine familiale. "Le yassa", commence-t-elle en ajustant son foulard aux motifs vifs, "est bien plus qu''un plat pour nous, Sénégalais. C''est l''histoire de notre peuple, de nos célébrations, de nos moments de partage." Ses yeux brillent tandis qu''elle prépare les ingrédients. "Aujourd''hui, je vais vous transmettre la recette telle que ma grand-mère me l''a enseignée, un héritage précieux de la région de la Casamance."',
  story_intro_audio_url = 'https://savorista.com/audio/stories/yassa_intro.mp3'
WHERE title = 'Poulet Yassa';

-- Mise à jour des étapes avec éléments narratifs
UPDATE steps
SET 
  story_content = 'Aïssatou sort un poulet fraîchement préparé qu''elle a acheté ce matin même chez le volailler du marché. "Le choix du poulet est essentiel", explique-t-elle en le découpant avec précision. "Au Sénégal, nous préférons des poulets fermiers, élevés en liberté, leur chair est plus savoureuse, plus authentique." Ses gestes sont assurés, transmis de génération en génération.',
  story_audio_url = 'https://savorista.com/audio/stories/yassa_step1.mp3',
  story_background_image_url = 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?q=80&w=1470&auto=format&fit=crop'
WHERE recipe_id = (SELECT id FROM recipes WHERE title = 'Poulet Yassa') AND order_number = 1;

-- Continuer avec les autres étapes...

-- Ajout d'une ambiance musicale pour l'expérience immersive
INSERT INTO story_ambiances (recipe_id, name, description, ambient_sound_url, spotify_playlist_url)
VALUES (
  (SELECT id FROM recipes WHERE title = 'Poulet Yassa'),
  'Cuisine sénégalaise en fête',
  'Sons d''une cuisine familiale africaine avec percussions douces et conversations joyeuses',
  'https://savorista.com/audio/ambience/senegalese_kitchen.mp3',
  'https://open.spotify.com/playlist/37i9dQZF1DWYxctNxvWpTK'
); 