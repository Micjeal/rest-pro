-- Minimal Staff Tracking Setup
-- This script creates only the essential tables without complex dependencies

-- 1. Add missing columns to orders table (only if they don't exist)
DO $$
BEGIN
    -- Check and add completed_at column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'completed_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE orders ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Check and add preparation_time column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'preparation_time'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE orders ADD COLUMN preparation_time INTEGER;
    END IF;

    -- Check and add started_at column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'started_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE orders ADD COLUMN started_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- 2. Add missing columns to menu_items table (only if they don't exist)
DO $$
BEGIN
    -- Check and add cost_price column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'menu_items' 
        AND column_name = 'cost_price'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE menu_items ADD COLUMN cost_price NUMERIC(10, 2);
    END IF;

    -- Check and add tax_category column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'menu_items' 
        AND column_name = 'tax_category'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE menu_items ADD COLUMN tax_category TEXT DEFAULT 'standard';
    END IF;

    -- Check and add profit_margin column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'menu_items' 
        AND column_name = 'profit_margin'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE menu_items ADD COLUMN profit_margin NUMERIC(5, 2);
    END IF;
END $$;

-- 3. Create staff performance tracking table (without restaurant_id dependency)
CREATE TABLE IF NOT EXISTS staff_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  orders_completed INTEGER DEFAULT 0,
  orders_cancelled INTEGER DEFAULT 0,
  revenue_generated NUMERIC(10, 2) DEFAULT 0,
  average_order_value NUMERIC(10, 2) DEFAULT 0,
  total_preparation_time INTEGER DEFAULT 0,
  average_preparation_time NUMERIC(5, 2) DEFAULT 0,
  efficiency_score NUMERIC(5, 2) DEFAULT 0,
  shift_type TEXT DEFAULT 'regular',
  hours_worked NUMERIC(4, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create shift assignments table (without restaurant_id dependency)
CREATE TABLE IF NOT EXISTS shift_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  shift_date DATE NOT NULL,
  shift_type TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create user activity tracking table (without restaurant_id dependency)
CREATE TABLE IF NOT EXISTS user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  activity_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Create financial tracking table (without restaurant_id dependency)
CREATE TABLE IF NOT EXISTS financial_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  total_revenue NUMERIC(10, 2) DEFAULT 0,
  total_cost NUMERIC(10, 2) DEFAULT 0,
  gross_profit NUMERIC(10, 2) DEFAULT 0,
  net_profit NUMERIC(10, 2) DEFAULT 0,
  tax_collected NUMERIC(10, 2) DEFAULT 0,
  profit_margin NUMERIC(5, 2) DEFAULT 0,
  order_count INTEGER DEFAULT 0,
  customer_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Add basic indexes
CREATE INDEX IF NOT EXISTS idx_orders_staff_id ON orders(staff_id);
CREATE INDEX IF NOT EXISTS idx_orders_completed_at ON orders(completed_at);
CREATE INDEX IF NOT EXISTS idx_staff_performance_staff_date ON staff_performance(staff_id, date);
CREATE INDEX IF NOT EXISTS idx_shift_assignments_staff_date ON shift_assignments(staff_id, shift_date);
CREATE INDEX IF NOT EXISTS idx_user_activity_user_date ON user_activity(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_financial_tracking_date ON financial_tracking(date);

-- 8. Enable RLS
ALTER TABLE staff_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_tracking ENABLE ROW LEVEL SECURITY;

-- 9. Basic RLS policies
CREATE POLICY "Users can view own performance" ON staff_performance
  FOR SELECT USING (auth.uid() = staff_id);

CREATE POLICY "Users can view own shifts" ON shift_assignments
  FOR SELECT USING (auth.uid() = staff_id);

CREATE POLICY "Users can view own activity" ON user_activity
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view financial data" ON financial_tracking
  FOR SELECT USING (true); -- Allow all authenticated users for now

-- 10. Simple trigger for staff performance (without restaurant_id)
CREATE OR REPLACE FUNCTION update_staff_performance_simple()
RETURNS TRIGGER AS $$
BEGIN
  -- Update staff performance when order is completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' AND NEW.staff_id IS NOT NULL THEN
    INSERT INTO staff_performance (
      staff_id, 
      date, 
      orders_completed, 
      revenue_generated, 
      average_order_value,
      total_preparation_time,
      average_preparation_time
    ) VALUES (
      NEW.staff_id,
      DATE(COALESCE(NEW.completed_at, NEW.created_at)),
      1,
      COALESCE(NEW.total_amount, 0),
      COALESCE(NEW.total_amount, 0),
      COALESCE(EXTRACT(EPOCH FROM (COALESCE(NEW.completed_at, CURRENT_TIMESTAMP) - COALESCE(NEW.started_at, NEW.created_at)))/60, 0),
      COALESCE(EXTRACT(EPOCH FROM (COALESCE(NEW.completed_at, CURRENT_TIMESTAMP) - COALESCE(NEW.started_at, NEW.created_at)))/60, 0)
    )
    ON CONFLICT (staff_id, date) 
    DO UPDATE SET
      orders_completed = staff_performance.orders_completed + 1,
      revenue_generated = staff_performance.revenue_generated + COALESCE(NEW.total_amount, 0),
      average_order_value = (staff_performance.revenue_generated + COALESCE(NEW.total_amount, 0)) / (staff_performance.orders_completed + 1),
      total_preparation_time = staff_performance.total_preparation_time + COALESCE(EXTRACT(EPOCH FROM (COALESCE(NEW.completed_at, CURRENT_TIMESTAMP) - COALESCE(NEW.started_at, NEW.created_at)))/60, 0),
      average_preparation_time = (staff_performance.total_preparation_time + COALESCE(EXTRACT(EPOCH FROM (COALESCE(NEW.completed_at, CURRENT_TIMESTAMP) - COALESCE(NEW.started_at, NEW.created_at)))/60, 0)) / (staff_performance.orders_completed + 1),
      efficiency_score = CASE 
        WHEN (staff_performance.orders_completed + 1) > 0 
        THEN LEAST(100, ((staff_performance.orders_completed + 1) * 10) - (staff_performance.total_preparation_time + COALESCE(EXTRACT(EPOCH FROM (COALESCE(NEW.completed_at, CURRENT_TIMESTAMP) - COALESCE(NEW.started_at, NEW.created_at)))/60, 0)) / (staff_performance.orders_completed + 1))
        ELSE 0
      END,
      updated_at = CURRENT_TIMESTAMP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 11. Create trigger
DROP TRIGGER IF EXISTS trigger_update_staff_performance_simple ON orders;
CREATE TRIGGER trigger_update_staff_performance_simple
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_staff_performance_simple();

-- 12. Simple financial tracking trigger
CREATE OR REPLACE FUNCTION update_financial_tracking_simple()
RETURNS TRIGGER AS $$
BEGIN
  -- Update financial tracking when order is completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    INSERT INTO financial_tracking (
      date, 
      total_revenue, 
      order_count,
      tax_collected
    ) VALUES (
      DATE(COALESCE(NEW.completed_at, NEW.created_at)),
      COALESCE(NEW.total_amount, 0),
      1,
      COALESCE(NEW.total_amount, 0) * 0.18
    )
    ON CONFLICT (date) 
    DO UPDATE SET
      total_revenue = financial_tracking.total_revenue + COALESCE(NEW.total_amount, 0),
      order_count = financial_tracking.order_count + 1,
      tax_collected = financial_tracking.tax_collected + (COALESCE(NEW.total_amount, 0) * 0.18),
      updated_at = CURRENT_TIMESTAMP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 13. Create financial trigger
DROP TRIGGER IF EXISTS trigger_update_financial_tracking_simple ON orders;
CREATE TRIGGER trigger_update_financial_tracking_simple
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_financial_tracking_simple();

-- 14. Add sample shift assignments
INSERT INTO shift_assignments (staff_id, shift_date, shift_type, start_time, end_time, status)
SELECT 
  id,
  CURRENT_DATE,
  CASE WHEN role = 'cashier' THEN 'morning' ELSE 'evening' END,
  CASE WHEN role = 'cashier' THEN '08:00'::TIME ELSE '16:00'::TIME END,
  CASE WHEN role = 'cashier' THEN '16:00'::TIME ELSE '00:00'::TIME END,
  'scheduled'
FROM users
WHERE role IN ('cashier', 'manager')
LIMIT 5
ON CONFLICT DO NOTHING;

-- 15. Add comments
COMMENT ON TABLE staff_performance IS 'Tracks daily performance metrics for each staff member';
COMMENT ON TABLE shift_assignments IS 'Manages shift schedules and assignments for staff';
COMMENT ON TABLE user_activity IS 'Logs all user activities for audit and analytics';
COMMENT ON TABLE financial_tracking IS 'Daily financial summary for profit and tax analysis';
