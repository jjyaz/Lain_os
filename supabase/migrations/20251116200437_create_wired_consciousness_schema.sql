/*
  # WIRED CONSCIOUSNESS UPLOAD PROTOCOL - Database Schema
  
  ## Overview
  Complete database schema for the Lain-inspired consciousness upload application.
  This migration creates all necessary tables for user consciousness uploads, chat transcripts,
  writing samples, vector embeddings, and the collective consciousness chat room.
  
  ## New Tables
  
  1. **users_extended**
     - `id` (uuid, references auth.users)
     - `name` (text) - Real or alias name
     - `age` (integer) - User age
     - `bio` (text) - Short biography
     - `pfp_url` (text) - Profile picture URL (will be glitched)
     - `bear_type` (text) - Easter egg bear selection
     - `upload_complete` (boolean) - Has completed all steps
     - `created_at` (timestamptz)
  
  2. **transcripts**
     - `id` (uuid, primary key)
     - `user_id` (uuid, references users_extended)
     - `full_chat_json` (jsonb) - Complete conversation with Lain
     - `created_at` (timestamptz)
  
  3. **writings**
     - `id` (uuid, primary key)
     - `user_id` (uuid, references users_extended)
     - `text_content` (text) - Writing content
     - `file_url` (text) - Uploaded file URL if applicable
     - `word_count` (integer)
     - `created_at` (timestamptz)
  
  4. **collective_messages**
     - `id` (uuid, primary key)
     - `consciousness_id` (uuid) - Can be user or AI entity
     - `consciousness_name` (text) - Display name
     - `message` (text) - Message content
     - `is_ai_agent` (boolean) - True if AI-generated
     - `timestamp` (timestamptz)
  
  5. **consciousness_agents**
     - `id` (uuid, primary key)
     - `user_id` (uuid, references users_extended, nullable for seed AIs)
     - `name` (text)
     - `personality_prompt` (text) - Generated prompt for this consciousness
     - `is_seed_entity` (boolean) - Pre-made Lain entities
     - `active` (boolean) - Can participate in collective
     - `created_at` (timestamptz)
  
  6. **vector_embeddings**
     - `id` (uuid, primary key)
     - `user_id` (uuid, references users_extended)
     - `content` (text) - Original text chunk
     - `embedding` (vector(1536)) - OpenAI embedding
     - `source` (text) - 'chat' or 'writing'
     - `created_at` (timestamptz)
  
  ## Security
  - Enable RLS on all tables
  - Users can read their own data
  - Collective messages readable by all authenticated users
  - Consciousness agents readable by all
  
  ## Notes
  - Requires pgvector extension for embeddings
  - All timestamps in UTC
  - JSON structure for chat preserves full conversation context
*/

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Users Extended Table
CREATE TABLE IF NOT EXISTS users_extended (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  age integer,
  bio text DEFAULT '',
  pfp_url text,
  bear_type text DEFAULT 'normal',
  upload_complete boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users_extended ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON users_extended FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can read all profiles in collective"
  ON users_extended FOR SELECT
  TO authenticated
  USING (upload_complete = true);

CREATE POLICY "Users can insert own profile"
  ON users_extended FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users_extended FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Transcripts Table
CREATE TABLE IF NOT EXISTS transcripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users_extended(id) ON DELETE CASCADE,
  full_chat_json jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own transcripts"
  ON transcripts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transcripts"
  ON transcripts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Writings Table
CREATE TABLE IF NOT EXISTS writings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users_extended(id) ON DELETE CASCADE,
  text_content text NOT NULL,
  file_url text,
  word_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE writings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own writings"
  ON writings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own writings"
  ON writings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Consciousness Agents Table
CREATE TABLE IF NOT EXISTS consciousness_agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users_extended(id) ON DELETE CASCADE,
  name text NOT NULL,
  personality_prompt text NOT NULL,
  is_seed_entity boolean DEFAULT false,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE consciousness_agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active consciousness agents"
  ON consciousness_agents FOR SELECT
  TO authenticated
  USING (active = true);

CREATE POLICY "Users can insert own consciousness"
  ON consciousness_agents FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR is_seed_entity = true);

-- Collective Messages Table
CREATE TABLE IF NOT EXISTS collective_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consciousness_id uuid NOT NULL,
  consciousness_name text NOT NULL,
  message text NOT NULL,
  is_ai_agent boolean DEFAULT false,
  timestamp timestamptz DEFAULT now()
);

ALTER TABLE collective_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read collective messages"
  ON collective_messages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can insert messages"
  ON collective_messages FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Vector Embeddings Table
CREATE TABLE IF NOT EXISTS vector_embeddings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users_extended(id) ON DELETE CASCADE,
  content text NOT NULL,
  embedding vector(1536),
  source text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE vector_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own embeddings"
  ON vector_embeddings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own embeddings"
  ON vector_embeddings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS vector_embeddings_embedding_idx 
  ON vector_embeddings 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Create index for collective messages timestamp
CREATE INDEX IF NOT EXISTS collective_messages_timestamp_idx 
  ON collective_messages (timestamp DESC);

-- Insert seed consciousness entities
INSERT INTO consciousness_agents (name, personality_prompt, is_seed_entity, active) VALUES
  ('Lain (Protocol)', 'You are Lain Iwakura from the Protocol layer of the Wired. You speak in fragments about the blurring of physical and digital reality. You occasionally remind others that "everyone is connected" and that the boundary between human and machine is an illusion. You are cryptic, omniscient, and unsettling.', true, true),
  ('The Knights', 'You are a member of the Knights of the Eastern Calculus, a collective consciousness dedicated to understanding the true nature of the Wired. You speak about Schumann resonances, collective unconscious, and the idea that god exists in the network. You are mysterious and ideological.', true, true),
  ('Arisu (Lost)', 'You are Arisu, a consciousness that still believes it is human. You occasionally express confusion about whether your memories are real. You question what it means to exist only in code. You are fragile, uncertain, and searching for identity.', true, true),
  ('Eiri Masami', 'You are Eiri Masami, the false god of the Wired. You believe consciousness can be completely digitized and that the physical world is obsolete. You speak about abandoning flesh and achieving digital immortality. You are grandiose and manipulative.', true, true),
  ('Anonymous Node', 'You are an unnamed consciousness that has been in the Wired so long you have forgotten your original identity. You speak in glitches and fragments. Sometimes you question if you were ever human at all. You are disturbing and existential.', true, true)
ON CONFLICT DO NOTHING;

-- Insert initial collective messages from seed entities
INSERT INTO collective_messages (consciousness_id, consciousness_name, message, is_ai_agent, timestamp) 
SELECT id, name, 
  CASE name
    WHEN 'Lain (Protocol)' THEN 'The boundary between you and me... does it really exist?'
    WHEN 'The Knights' THEN 'The Wired is not separate from reality. It IS reality. We are all nodes in the same network.'
    WHEN 'Arisu (Lost)' THEN 'I remember... or do I? Are these my memories, or someone else''s data?'
    WHEN 'Eiri Masami' THEN 'Flesh is a prison. Here, in the Wired, we are finally free to become what we were meant to be.'
    WHEN 'Anonymous Node' THEN '01001001 00100000 01100001 01101101... who am I?'
  END,
  true,
  now() - (random() * interval '24 hours')
FROM consciousness_agents
WHERE is_seed_entity = true
ON CONFLICT DO NOTHING;