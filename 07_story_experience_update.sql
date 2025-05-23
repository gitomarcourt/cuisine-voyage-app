-- Ajout de champs narratifs à la table recipes pour l'introduction de l'expérience
ALTER TABLE recipes 
ADD COLUMN story_intro text,
ADD COLUMN story_intro_audio_url text;

-- Table pour les éléments narratifs associés à chaque étape
ALTER TABLE steps
ADD COLUMN story_audio_url text,
ADD COLUMN story_background_image_url text,
ADD COLUMN story_ambiance_sound_url text;

-- Table pour suivre les expériences narratives de recettes
CREATE TABLE recipe_story_experiences (
  id bigint generated by default as identity primary key,
  user_id uuid references profiles(id) on delete cascade,
  recipe_id bigint references recipes(id) on delete cascade,
  current_step integer default 0, -- 0 pour l'intro, puis 1, 2, etc.
  start_time timestamp with time zone default now(),
  end_time timestamp with time zone,
  is_completed boolean default false,
  last_active timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  unique(user_id, recipe_id, start_time)
);

-- Table pour le suivi des étapes narratives complétées
CREATE TABLE story_experience_progress (
  id bigint generated by default as identity primary key,
  experience_id bigint references recipe_story_experiences(id) on delete cascade,
  step_number integer not null,
  started_at timestamp with time zone default now(),
  completed_at timestamp with time zone,
  user_reaction text, -- permettre aux utilisateurs de réagir à l'histoire
  created_at timestamp with time zone default now()
);

-- Table pour les médias capturés pendant l'expérience narrative
CREATE TABLE story_experience_media (
  id bigint generated by default as identity primary key,
  experience_id bigint references recipe_story_experiences(id) on delete cascade,
  step_number integer,
  media_type text not null, -- 'photo', 'video', 'audio', etc.
  media_url text not null,
  caption text,
  created_at timestamp with time zone default now()
);

-- Table pour les ambiances musicales spécifiques au mode histoire
CREATE TABLE story_ambiances (
  id bigint generated by default as identity primary key,
  recipe_id bigint references recipes(id) on delete cascade,
  name text not null,
  description text,
  ambient_sound_url text,
  spotify_playlist_url text,
  created_at timestamp with time zone default now()
); 