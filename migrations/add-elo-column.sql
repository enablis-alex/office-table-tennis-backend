-- Migration: Add elo column to users table
-- Run this SQL directly on your PostgreSQL RDS database if needed

-- Add the elo column with default value of 1000
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS elo INTEGER NOT NULL DEFAULT 1000;

-- Update existing users to have the default elo value (if column was just added)
-- This is optional since DEFAULT will handle new inserts, but ensures existing rows have the value
UPDATE users 
SET elo = 1000 
WHERE elo IS NULL;

