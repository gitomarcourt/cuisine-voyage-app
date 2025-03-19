-- Tajine d'Agneau avec expérience immersive
UPDATE recipes
SET 
  story_intro = 'Les premiers rayons du soleil caressent les tuiles colorées des toits de Marrakech, alors que vous pénétrez dans le dédale de ruelles de la médina. L''air est déjà imprégné des parfums envoûtants d''épices qui s''échappent des échoppes et des maisons. Fatima, maîtresse dans l''art du tajine depuis des décennies, vous accueille dans son riad aux murs ornés de zellige traditionnels. "Le tajine", explique-t-elle avec un sourire chaleureux, "n''est pas qu''un plat, c''est une histoire, une tradition qui se transmet de mère en fille depuis des générations." Son tajine d''agneau aux abricots est légendaire dans tout le quartier, et aujourd''hui, elle vous dévoile les secrets de cette recette ancestrale qui incarne l''âme de la cuisine marocaine.',
  story_intro_audio_url = 'https://savorista.com/audio/stories/tajine_intro.mp3'
WHERE title = 'Tajine d''Agneau';

-- Mise à jour des étapes avec éléments narratifs
UPDATE steps
SET 
  story_content = 'Fatima sort de sa cuisine un morceau d''agneau fraîchement acheté au souk. "Choisir la bonne viande est crucial", dit-elle en découpant l''agneau en cubes avec des gestes précis. "À Marrakech, nous préférons l''épaule pour sa tendreté et sa saveur. L''agneau doit être jeune, élevé dans les montagnes de l''Atlas, nourri aux herbes sauvages qui parfument sa chair."',
  story_audio_url = 'https://savorista.com/audio/stories/tajine_step1.mp3',
  story_background_image_url = 'https://images.unsplash.com/photo-1534531173927-aeb928d54385?q=80&w=1470&auto=format&fit=crop'
WHERE recipe_id = (SELECT id FROM recipes WHERE title = 'Tajine d''Agneau') AND order_number = 1;

-- Continuer avec les autres étapes...

-- Ajout d'une ambiance musicale pour l'expérience immersive
INSERT INTO story_ambiances (recipe_id, name, description, ambient_sound_url, spotify_playlist_url)
VALUES (
  (SELECT id FROM recipes WHERE title = 'Tajine d''Agneau'),
  'Soirée dans la médina de Marrakech',
  'Ambiance d''un riad marocain avec fontaine en arrière-plan et musique traditionnelle au loin',
  'https://savorista.com/audio/ambience/moroccan_riad.mp3',
  'https://open.spotify.com/playlist/37i9dQZF1DX2q3aDlExVfQ'
); 