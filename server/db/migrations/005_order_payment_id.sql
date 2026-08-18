-- Migration 005: Add payment_id column to orders table for Razorpay / Online Transactions
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'payment_id'
    ) THEN 
        ALTER TABLE orders ADD COLUMN payment_id VARCHAR(255);
    END IF;
END $$;
