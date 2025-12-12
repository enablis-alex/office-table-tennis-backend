-- Migration: Add wins, losses, and draws columns to users table
-- Run this SQL directly on your PostgreSQL RDS database if needed

-- Add the columns with default value of 0
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS wins INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS losses INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS draws INTEGER NOT NULL DEFAULT 0;

-- Calculate existing wins/losses/draws from games table for each user
-- This ensures existing users have accurate statistics
UPDATE users u
SET 
  wins = (
    SELECT COUNT(*)
    FROM games g
    WHERE g.winner_id = u.id
  ),
  losses = (
    SELECT COUNT(*)
    FROM games g
    WHERE (g.player1_id = u.id OR g.player2_id = u.id) 
      AND g.winner_id != u.id
      AND g.winner_id IN (g.player1_id, g.player2_id)
  ),
  draws = (
    SELECT COUNT(*)
    FROM games g
    WHERE (g.player1_id = u.id OR g.player2_id = u.id)
      AND g.winner_id NOT IN (g.player1_id, g.player2_id)
  );

