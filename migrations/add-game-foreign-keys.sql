-- Migration: Add foreign key constraints to games table
-- Run this SQL directly on your PostgreSQL RDS database

-- Add foreign key constraints if they don't exist
DO $$
BEGIN
    -- Add foreign key for player1_id
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'games_player1_id_fkey'
    ) THEN
        ALTER TABLE games
        ADD CONSTRAINT games_player1_id_fkey
        FOREIGN KEY (player1_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;

    -- Add foreign key for player2_id
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'games_player2_id_fkey'
    ) THEN
        ALTER TABLE games
        ADD CONSTRAINT games_player2_id_fkey
        FOREIGN KEY (player2_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;

    -- Add foreign key for winner_id
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'games_winner_id_fkey'
    ) THEN
        ALTER TABLE games
        ADD CONSTRAINT games_winner_id_fkey
        FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

