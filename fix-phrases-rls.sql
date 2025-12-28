-- Fix RLS policy for romantic_phrases table
-- Allow authenticated users to insert phrases

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can view romantic phrases" ON romantic_phrases;
DROP POLICY IF EXISTS "Authenticated users can insert phrases" ON romantic_phrases;

-- Enable RLS
ALTER TABLE romantic_phrases ENABLE ROW LEVEL SECURITY;

-- Allow everyone to SELECT (read) phrases
CREATE POLICY "Anyone can view romantic phrases"
ON romantic_phrases FOR SELECT
USING (true);

-- Allow authenticated users to INSERT phrases
CREATE POLICY "Authenticated users can insert phrases"
ON romantic_phrases FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to UPDATE their own phrases (optional)
CREATE POLICY "Authenticated users can update phrases"
ON romantic_phrases FOR UPDATE
TO authenticated
USING (true);

-- Allow authenticated users to DELETE phrases (optional)
CREATE POLICY "Authenticated users can delete phrases"
ON romantic_phrases FOR DELETE
TO authenticated
USING (true);

