-- Migration 004: Add is_sold_out column to products table
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'is_sold_out'
    ) THEN 
        ALTER TABLE products ADD COLUMN is_sold_out BOOLEAN DEFAULT FALSE;
    END IF;
END $$;
