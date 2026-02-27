-- Populate Staff Performance Data from Users
-- This script creates sample staff performance records for existing users

-- First, let's see what users we have
SELECT id, name, email, role FROM users WHERE role IN ('admin', 'manager', 'cashier', 'chef');

-- Insert sample staff performance data for each user
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

-- Insert sample shift assignments
INSERT INTO shift_assignments (
  staff_id, 
  shift_date, 
  shift_type, 
  start_time, 
  end_time, 
  status, 
  notes,
  created_at,
  updated_at
)
SELECT 
  u.id,
  CURRENT_DATE - INTERVAL '1 day',
  CASE FLOOR(RANDOM() * 3)
    WHEN 0 THEN 'morning'
    WHEN 1 THEN 'evening'
    ELSE 'night'
  END as shift_type,
  CASE FLOOR(RANDOM() * 3)
    WHEN 0 THEN '08:00'
    WHEN 1 THEN '16:00'
    ELSE '00:00'
  END as start_time,
  CASE FLOOR(RANDOM() * 3)
    WHEN 0 THEN '16:00'
    WHEN 1 THEN '00:00'
    ELSE '08:00'
  END as end_time,
  CASE WHEN RANDOM() > 0.8 THEN 'completed' ELSE 'scheduled' END as status,
  u.name || ' - ' || CASE FLOOR(RANDOM() * 3)
    WHEN 0 THEN 'morning'
    WHEN 1 THEN 'evening'
    ELSE 'night'
  END as notes,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM users u
WHERE u.role IN ('admin', 'manager', 'cashier', 'chef');

-- Insert sample user activity logs
INSERT INTO user_activity (
  user_id, 
  activity_type, 
  activity_data, 
  ip_address, 
  user_agent,
  created_at
)
SELECT 
  u.id,
  CASE FLOOR(RANDOM() * 4)
    WHEN 0 THEN 'login'
    WHEN 1 THEN 'order_created'
    WHEN 2 THEN 'order_completed'
    ELSE 'logout'
  END as activity_type,
  json_build_object(
    'timestamp', CURRENT_TIMESTAMP,
    'details', u.name || ' performed ' || CASE FLOOR(RANDOM() * 4)
      WHEN 0 THEN 'login'
      WHEN 1 THEN 'order_created'
      WHEN 2 THEN 'order_completed'
      ELSE 'logout'
    END
  ) as activity_data,
  '127.0.0.1',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  CURRENT_TIMESTAMP - INTERVAL '1 hour' * FLOOR(RANDOM() * 24)
FROM users u
WHERE u.role IN ('admin', 'manager', 'cashier', 'chef');

-- Verify the data was inserted
SELECT 
  COUNT(*) as total_performance_records,
  COUNT(DISTINCT staff_id) as unique_staff_members
FROM staff_performance;

SELECT 
  u.name,
  u.role,
  sp.orders_completed,
  sp.revenue_generated,
  sp.efficiency_score,
  sp.date
FROM staff_performance sp
JOIN users u ON sp.staff_id = u.id
ORDER BY sp.revenue_generated DESC
LIMIT 10;
