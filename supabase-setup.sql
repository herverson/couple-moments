-- Create couples table
CREATE TABLE IF NOT EXISTS couples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL,
  user2_id UUID NOT NULL,
  relationship_start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  couple_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create photos table
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  uploaded_by_user_id UUID NOT NULL,
  s3_key VARCHAR(512) NOT NULL,
  s3_url TEXT NOT NULL,
  description TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create youtube_videos table
CREATE TABLE IF NOT EXISTS youtube_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  added_by_user_id UUID NOT NULL,
  video_id VARCHAR(255) NOT NULL,
  title VARCHAR(512),
  description TEXT,
  thumbnail TEXT,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create romantic_phrases table
CREATE TABLE IF NOT EXISTS romantic_phrases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phrase TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  author VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_couples_user1_id ON couples(user1_id);
CREATE INDEX IF NOT EXISTS idx_couples_user2_id ON couples(user2_id);
CREATE INDEX IF NOT EXISTS idx_photos_couple_id ON photos(couple_id);
CREATE INDEX IF NOT EXISTS idx_youtube_videos_couple_id ON youtube_videos(couple_id);
CREATE INDEX IF NOT EXISTS idx_romantic_phrases_category ON romantic_phrases(category);

-- Enable Row Level Security
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE romantic_phrases ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for couples
CREATE POLICY "Users can view their own couple" ON couples
  FOR SELECT USING (
    auth.uid() = user1_id OR auth.uid() = user2_id
  );

CREATE POLICY "Users can update their own couple" ON couples
  FOR UPDATE USING (
    auth.uid() = user1_id OR auth.uid() = user2_id
  );

CREATE POLICY "Authenticated users can create couples" ON couples
  FOR INSERT WITH CHECK (
    auth.uid() = user1_id
  );

-- Create RLS policies for photos
CREATE POLICY "Users can view couple photos" ON photos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM couples
      WHERE couples.id = photos.couple_id
      AND (couples.user1_id = auth.uid() OR couples.user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert photos to their couple" ON photos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM couples
      WHERE couples.id = photos.couple_id
      AND (couples.user1_id = auth.uid() OR couples.user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can delete their own photos" ON photos
  FOR DELETE USING (
    uploaded_by_user_id = auth.uid()
  );

-- Create RLS policies for youtube_videos
CREATE POLICY "Users can view couple videos" ON youtube_videos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM couples
      WHERE couples.id = youtube_videos.couple_id
      AND (couples.user1_id = auth.uid() OR couples.user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert videos to their couple" ON youtube_videos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM couples
      WHERE couples.id = youtube_videos.couple_id
      AND (couples.user1_id = auth.uid() OR couples.user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can delete their own videos" ON youtube_videos
  FOR DELETE USING (
    added_by_user_id = auth.uid()
  );

-- Create RLS policies for romantic_phrases (public read)
CREATE POLICY "Anyone can view romantic phrases" ON romantic_phrases
  FOR SELECT USING (true);

-- Insert seed data for romantic phrases
INSERT INTO romantic_phrases (phrase, category, author) VALUES
  ('You are my greatest adventure.', 'Love', 'Unknown'),
  ('In your eyes, I found my home.', 'Love', 'Unknown'),
  ('Every moment with you is a gift.', 'Appreciation', 'Unknown'),
  ('You make my heart skip a beat.', 'Romance', 'Unknown'),
  ('I love you more than words can say.', 'Love', 'Unknown'),
  ('You are my favorite hello and my hardest goodbye.', 'Love', 'Unknown'),
  ('With you, I found my soulmate.', 'Love', 'Unknown'),
  ('You are the best decision I ever made.', 'Appreciation', 'Unknown'),
  ('Forever is not long enough with you.', 'Romance', 'Unknown'),
  ('You complete me.', 'Love', 'Jerry Maguire'),
  ('I would find you in any lifetime.', 'Romance', 'Unknown'),
  ('You are my today and all of my tomorrows.', 'Love', 'Leo Christopher'),
  ('My heart knew you before my mind did.', 'Love', 'Unknown'),
  ('You are my favorite notification.', 'Appreciation', 'Unknown'),
  ('I fall in love with you every single day.', 'Romance', 'Unknown')
ON CONFLICT DO NOTHING;

-- =====================================================
-- STORAGE CONFIGURATION FOR PHOTOS
-- =====================================================

-- Create storage bucket for couple photos (run this in SQL Editor)
-- Note: You may need to create the bucket manually in Supabase Dashboard first
-- Go to: Storage > Create a new bucket > Name: "couple-photos" > Public: Yes

-- Storage policies for couple-photos bucket
-- These policies control who can upload, view, and delete photos

-- Policy 1: Anyone can view photos (public bucket)
INSERT INTO storage.buckets (id, name, public)
VALUES ('couple-photos', 'couple-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Policy 2: Authenticated users can upload photos
CREATE POLICY "Authenticated users can upload photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'couple-photos' 
    AND auth.role() = 'authenticated'
  );

-- Policy 3: Authenticated users can view their couple's photos
CREATE POLICY "Users can view couple photos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'couple-photos' 
    AND auth.role() = 'authenticated'
  );

-- Policy 4: Users can delete their own uploaded photos
CREATE POLICY "Users can delete their own photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'couple-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy 5: Users can update their own photos
CREATE POLICY "Users can update their own photos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'couple-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
