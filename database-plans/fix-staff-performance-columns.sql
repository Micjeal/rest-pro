-- Fix Staff Performance Table - Add Missing Columns
-- This script adds missing columns to staff_performance table

-- First, check current table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'staff_performance' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Add missing columns if they don't exist
DO $$
BEGIN
    -- Add orders_cancelled column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'staff_performance' 
        AND column_name = 'orders_cancelled'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE staff_performance ADD COLUMN orders_cancelled INTEGER DEFAULT 0;
        RAISE NOTICE 'Added orders_cancelled column to staff_performance table';
    END IF;

    -- Add other potentially missing columns
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'staff_performance' 
        AND column_name = 'revenue_generated'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE staff_performance ADD COLUMN revenue_generated NUMERIC(10, 2) DEFAULT 0;
        RAISE NOTICE 'Added revenue_generated column to staff_performance table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'staff_performance' 
        AND column_name = 'average_order_value'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE staff_performance ADD COLUMN average_order_value NUMERIC(10, 2) DEFAULT 0;
        RAISE NOTICE 'Added average_order_value column to staff_performance table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'staff_performance' 
        AND column_name = 'total_preparation_time'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE staff_performance ADD COLUMN total_preparation_time INTEGER DEFAULT 0;
        RAISE NOTICE 'Added total_preparation_time column to staff_performance table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'staff_performance' 
        AND column_name = 'average_preparation_time'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE staff_performance ADD COLUMN average_preparation_time NUMERIC(5, 2) DEFAULT 0;
        RAISE NOTICE 'Added average_preparation_time column to staff_performance table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'staff_performance' 
        AND column_name = 'efficiency_score'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE staff_performance ADD COLUMN efficiency_score NUMERIC(5, 2) DEFAULT 0;
        RAISE NOTICE 'Added efficiency_score column to staff_performance table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'staff_performance' 
        AND column_name = 'shift_type'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE staff_performance ADD COLUMN shift_type TEXT DEFAULT 'regular';
        RAISE NOTICE 'Added shift_type column to staff_performance table';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'staff_performance' 
        AND column_name = 'hours_worked'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE staff_performance ADD COLUMN hours_worked NUMERIC(4, 2) DEFAULT 0;
        RAISE NOTICE 'Added hours_worked column to staff_performance table';
    END IF;
END $$;

-- Verify the table structure after adding columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'staff_performance' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Now populate with sample data
INSERT INTO staff_performance (
  staff_id, 
  date, 
  orders_completed, 
  orders_cancelled, 
  revenue_generated, 
  average_order_value,
  total_preparation_time,
  average_preparation_time,
  efficiency_score,
  shift_type,
  hours_worked,
  created_at,
  updated_at
)
SELECT 
  u.id,
  CURRENT_DATE - INTERVAL '1 day',
  CASE 
    WHEN u.role = 'cashier' THEN FLOOR(RANDOM() * 20 + 10)
    WHEN u.role = 'chef' THEN FLOOR(RANDOM() * 15 + 5)
    WHEN u.role = 'manager' THEN FLOOR(RANDOM() * 25 + 15)
    WHEN u.role = 'admin' THEN FLOOR(RANDOM() * 30 + 20)
    ELSE FLOOR(RANDOM() * 10 + 5)
  END as orders_completed,
  FLOOR(RANDOM() * 3) as orders_cancelled,
  CASE 
    WHEN u.role = 'cashier' THEN (FLOOR(RANDOM() * 20 + 10)) * (RANDOM() * 5000 + 3000)
    WHEN u.role = 'chef' THEN (FLOOR(RANDOM() * 15 + 5)) * (RANDOM() * 6000 + 4000)
    WHEN u.role = 'manager' THEN (FLOOR(RANDOM() * 25 + 15)) * (RANDOM() * 7000 + 5000)
    WHEN u.role = 'admin' THEN (FLOOR(RANDOM() * 30 + 20)) * (RANDOM() * 8000 + 6000)
    ELSE (FLOOR(RANDOM() * 10 + 5)) * (RANDOM() * 4000 + 2000)
  END as revenue_generated,
  CASE 
    WHEN u.role = 'cashier' THEN RANDOM() * 5000 + 3000
    WHEN u.role = 'chef' THEN RANDOM() * 6000 + 4000
    WHEN u.role = 'manager' THEN RANDOM() * 7000 + 5000
    WHEN u.role = 'admin' THEN RANDOM() * 8000 + 6000
    ELSE RANDOM() * 4000 + 2000
  END as average_order_value,
  CASE 
    WHEN u.role = 'cashier' THEN (FLOOR(RANDOM() * 20 + 10)) * (RANDOM() * 15 + 10)
    WHEN u.role = 'chef' THEN (FLOOR(RANDOM() * 15 + 5)) * (RANDOM() * 15 + 10)
    WHEN u.role = 'manager' THEN (FLOOR(RANDOM() * 25 + 15)) * (RANDOM() * 15 + 10)
    WHEN u.role = 'admin' THEN (FLOOR(RANDOM() * 30 + 20)) * (RANDOM() * 15 + 10)
    ELSE (FLOOR(RANDOM() * 10 + 5)) * (RANDOM() * 15 + 10)
  END as total_preparation_time,
  CASE 
    WHEN u.role = 'cashier' THEN RANDOM() * 15 + 10
    WHEN u.role = 'chef' THEN RANDOM() * 15 + 10
    WHEN u.role = 'manager' THEN RANDOM() * 15 + 10
    WHEN u.role = 'admin' THEN RANDOM() * 15 + 10
    ELSE RANDOM() * 15 + 10
  END as average_preparation_time,
  CASE 
    WHEN u.role = 'cashier' THEN 75 + RANDOM() * 20
    WHEN u.role = 'chef' THEN 80 + RANDOM() * 15
    WHEN u.role = 'manager' THEN 85 + RANDOM() * 10
    WHEN u.role = 'admin' THEN 90 + RANDOM() * 10
    ELSE 70 + RANDOM() * 15
  END as efficiency_score,
  CASE FLOOR(RANDOM() * 3)
    WHEN 0 THEN 'morning'
    WHEN 1 THEN 'evening'
    ELSE 'night'
  END as shift_type,
  8 as hours_worked,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM users u
WHERE u.role IN ('admin', 'manager', 'cashier', 'chef');

-- Verify data was inserted
SELECT 
  COUNT(*) as total_performance_records,
  COUNT(DISTINCT staff_id) as unique_staff_members
FROM staff_performance;

SELECT 
  u.name,
  u.role,
  sp.orders_completed,
  sp.orders_cancelled,
  sp.revenue_generated,
  sp.efficiency_score,
  sp.date
FROM staff_performance sp
JOIN users u ON sp.staff_id = u.id
ORDER BY sp.revenue_generated DESC
LIMIT 10;
