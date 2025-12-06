-- Memories of Friends - Supabase Database Setup
-- Run this SQL in your Supabase SQL Editor

-- Drop existing tables if they exist (careful: this deletes all data!)
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS media CASCADE;
DROP TABLE IF EXISTS photos CASCADE;
DROP TABLE IF EXISTS stories CASCADE;

-- Create stories table
CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create photos table
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'General',
  image_url TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create media table
CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  title TEXT NOT NULL,
  description TEXT,
  media_type TEXT NOT NULL CHECK (media_type IN ('video', 'audio')),
  media_url TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('story', 'photo', 'media')),
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage bucket for media (optional - for direct storage management)
-- Note: You'll need to create this in the Supabase dashboard under Storage

-- Enable Row Level Security (RLS) on tables
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies to allow public read/write (you can restrict later)
CREATE POLICY "Allow public read on stories" ON stories FOR SELECT USING (true);
CREATE POLICY "Allow public insert on stories" ON stories FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on stories" ON stories FOR UPDATE USING (true);

CREATE POLICY "Allow public read on photos" ON photos FOR SELECT USING (true);
CREATE POLICY "Allow public insert on photos" ON photos FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on photos" ON photos FOR UPDATE USING (true);

CREATE POLICY "Allow public read on media" ON media FOR SELECT USING (true);
CREATE POLICY "Allow public insert on media" ON media FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on media" ON media FOR UPDATE USING (true);

CREATE POLICY "Allow public read on comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Allow public insert on comments" ON comments FOR INSERT WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX idx_stories_created_at ON stories(created_at DESC);
CREATE INDEX idx_photos_created_at ON photos(created_at DESC);
CREATE INDEX idx_media_created_at ON media(created_at DESC);
CREATE INDEX idx_comments_content_id ON comments(content_id);
