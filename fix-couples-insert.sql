-- Fix: Add INSERT policy for couples table
-- This allows authenticated users to create new couples

-- Drop the policy if it already exists (to avoid errors)
DROP POLICY IF EXISTS "Authenticated users can create couples" ON couples;

-- Create the INSERT policy
CREATE POLICY "Authenticated users can create couples" ON couples
  FOR INSERT WITH CHECK (
    auth.uid() = user1_id
  );

-- Verify it was created
SELECT * FROM pg_policies WHERE tablename = 'couples';

