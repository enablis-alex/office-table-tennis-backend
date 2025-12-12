-- Migration: Add games_played column to users table
-- Run this SQL directly on your PostgreSQL RDS database if needed

-- Add the games_played column with default value of 0
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS games_played INTEGER NOT NULL DEFAULT 0;

-- Count existing games for each user and update the games_played count
-- This ensures existing users have accurate game counts
UPDATE users u
SET games_played = (
  SELECT COUNT(*)
  FROM games g
  WHERE g.player1_id = u.id OR g.player2_id = u.id
)
WHERE games_played = 0;

