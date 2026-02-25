-- Add Staff Tracking and User Performance Tables (Simple Version)
-- This script adds the necessary tables and columns to track staff assignments and performance

-- 1. Add missing columns to orders table (skip staff_id if it already exists)
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
        RAISE NOTICE 'Added completed_at column to orders table';
    END IF;

    -- Check and add preparation_time column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'preparation_time'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE orders ADD COLUMN preparation_time INTEGER; -- minutes from start to completion
        RAISE NOTICE 'Added preparation_time column to orders table';
    END IF;

    -- Check and add started_at column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'started_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE orders ADD COLUMN started_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added started_at column to orders table';
    END IF;
END $$;

-- 2. Add missing columns to menu_items table
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
        RAISE NOTICE 'Added cost_price column to menu_items table';
    END IF;

    -- Check and add tax_category column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'menu_items' 
        AND column_name = 'tax_category'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE menu_items ADD COLUMN tax_category TEXT DEFAULT 'standard';
        RAISE NOTICE 'Added tax_category column to menu_items table';
    END IF;

    -- Check and add profit_margin column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'menu_items' 
        AND column_name = 'profit_margin'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE menu_items ADD COLUMN profit_margin NUMERIC(5, 2);
        RAISE NOTICE 'Added profit_margin column to menu_items table';
    END IF;
END $$;

-- 3. Create staff performance tracking table
CREATE TABLE IF NOT EXISTS staff_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  orders_completed INTEGER DEFAULT 0,
  orders_cancelled INTEGER DEFAULT 0,
  revenue_generated NUMERIC(10, 2) DEFAULT 0,
  average_order_value NUMERIC(10, 2) DEFAULT 0,
  total_preparation_time INTEGER DEFAULT 0, -- total minutes
  average_preparation_time NUMERIC(5, 2) DEFAULT 0, -- average minutes per order
  efficiency_score NUMERIC(5, 2) DEFAULT 0, -- calculated efficiency score
  shift_type TEXT DEFAULT 'regular', -- morning, evening, night, regular
  hours_worked NUMERIC(4, 2) DEFAULT 0, -- hours worked during shift
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create shift assignments table
CREATE TABLE IF NOT EXISTS shift_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  shift_date DATE NOT NULL,
  shift_type TEXT NOT NULL, -- morning, evening, night
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT DEFAULT 'scheduled', -- scheduled, active, completed, cancelled
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create user activity tracking table
CREATE TABLE IF NOT EXISTS user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- login, logout, order_created, order_completed, etc.
  activity_data JSONB, -- additional data about the activity
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Create financial tracking table for profit analysis
CREATE TABLE IF NOT EXISTS financial_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
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

-- 7. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_staff_id ON orders(staff_id);
CREATE INDEX IF NOT EXISTS idx_orders_completed_at ON orders(completed_at);
CREATE INDEX IF NOT EXISTS idx_staff_performance_staff_date ON staff_performance(staff_id, date);
CREATE INDEX IF NOT EXISTS idx_staff_performance_restaurant_date ON staff_performance(restaurant_id, date);
CREATE INDEX IF NOT EXISTS idx_shift_assignments_staff_date ON shift_assignments(staff_id, shift_date);
CREATE INDEX IF NOT EXISTS idx_user_activity_user_date ON user_activity(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_financial_tracking_restaurant_date ON financial_tracking(restaurant_id, date);

-- 8. Add RLS policies for staff performance tracking
ALTER TABLE staff_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_tracking ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS policies for staff performance
CREATE POLICY "Staff can view own performance" ON staff_performance
  FOR SELECT USING (auth.uid() = staff_id);

CREATE POLICY "Staff can update own performance" ON staff_performance
  FOR UPDATE USING (auth.uid() = staff_id);

CREATE POLICY "Managers and admins can view all staff performance" ON staff_performance
  FOR SELECT USING (
    auth.uid() IN (
      SELECT owner_id FROM restaurants WHERE id = restaurant_id
    )
    OR EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('manager', 'admin')
      AND users.id IN (
        SELECT owner_id FROM restaurants WHERE id = restaurant_id
      )
    )
  );

-- 10. Create RLS policies for shift assignments
CREATE POLICY "Staff can view own shifts" ON shift_assignments
  FOR SELECT USING (auth.uid() = staff_id);

CREATE POLICY "Managers and admins can view all shifts" ON shift_assignments
  FOR SELECT USING (
    auth.uid() IN (
      SELECT owner_id FROM restaurants WHERE id = restaurant_id
    )
    OR EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('manager', 'admin')
      AND users.id IN (
        SELECT owner_id FROM restaurants WHERE id = restaurant_id
      )
    )
  );

-- 11. Create RLS policies for user activity
CREATE POLICY "Users can view own activity" ON user_activity
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Managers and admins can view all activity" ON user_activity
  FOR SELECT USING (
    auth.uid() IN (
      SELECT owner_id FROM restaurants WHERE id = restaurant_id
    )
    OR EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('manager', 'admin')
      AND users.id IN (
        SELECT owner_id FROM restaurants WHERE id = restaurant_id
      )
    )
  );

-- 12. Create RLS policies for financial tracking
CREATE POLICY "Restaurant owners can view own financial data" ON financial_tracking
  FOR SELECT USING (
    auth.uid() IN (
      SELECT owner_id FROM restaurants WHERE id = restaurant_id
    )
  );

CREATE POLICY "Managers and admins can view financial data" ON financial_tracking
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('manager', 'admin')
      AND users.id IN (
        SELECT owner_id FROM restaurants WHERE id = restaurant_id
      )
    )
  );

-- 13. Create functions to automatically update staff performance
CREATE OR REPLACE FUNCTION update_staff_performance()
RETURNS TRIGGER AS $$
BEGIN
  -- Update staff performance when order is completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    INSERT INTO staff_performance (
      staff_id, 
      restaurant_id, 
      date, 
      orders_completed, 
      revenue_generated, 
      average_order_value,
      total_preparation_time,
      average_preparation_time
    ) VALUES (
      NEW.staff_id,
      NEW.restaurant_id,
      DATE(NEW.completed_at),
      1,
      NEW.total_amount,
      NEW.total_amount,
      EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at))/60,
      EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at))/60
    )
    ON CONFLICT (staff_id, restaurant_id, date) 
    DO UPDATE SET
      orders_completed = staff_performance.orders_completed + 1,
      revenue_generated = staff_performance.revenue_generated + NEW.total_amount,
      average_order_value = (staff_performance.revenue_generated + NEW.total_amount) / (staff_performance.orders_completed + 1),
      total_preparation_time = staff_performance.total_preparation_time + EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at))/60,
      average_preparation_time = (staff_performance.total_preparation_time + EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at))/60) / (staff_performance.orders_completed + 1),
      efficiency_score = CASE 
        WHEN (staff_performance.orders_completed + 1) > 0 
        THEN LEAST(100, ((staff_performance.orders_completed + 1) * 10) - (staff_performance.total_preparation_time + EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at))/60) / (staff_performance.orders_completed + 1))
        ELSE 0
      END,
      updated_at = CURRENT_TIMESTAMP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 14. Create trigger to automatically update staff performance
DROP TRIGGER IF EXISTS trigger_update_staff_performance ON orders;
CREATE TRIGGER trigger_update_staff_performance
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_staff_performance();

-- 15. Create function to update financial tracking
CREATE OR REPLACE FUNCTION update_financial_tracking()
RETURNS TRIGGER AS $$
BEGIN
  -- Update financial tracking when order is completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    INSERT INTO financial_tracking (
      restaurant_id, 
      date, 
      total_revenue, 
      order_count,
      tax_collected
    ) VALUES (
      NEW.restaurant_id,
      DATE(NEW.completed_at),
      NEW.total_amount,
      1,
      NEW.total_amount * 0.18 -- Assuming 18% tax rate
    )
    ON CONFLICT (restaurant_id, date) 
    DO UPDATE SET
      total_revenue = financial_tracking.total_revenue + NEW.total_amount,
      order_count = financial_tracking.order_count + 1,
      tax_collected = financial_tracking.tax_collected + (NEW.total_amount * 0.18),
      updated_at = CURRENT_TIMESTAMP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 16. Create trigger to automatically update financial tracking
DROP TRIGGER IF EXISTS trigger_update_financial_tracking ON orders;
CREATE TRIGGER trigger_update_financial_tracking
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_financial_tracking();

-- 17. Create function to track user activity
CREATE OR REPLACE FUNCTION track_user_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Log user activity for orders
  IF TG_OP = 'INSERT' THEN
    INSERT INTO user_activity (user_id, restaurant_id, activity_type, activity_data)
    VALUES (
      NEW.staff_id,
      NEW.restaurant_id,
      'order_created',
      json_build_object('order_id', NEW.id, 'customer_name', NEW.customer_name, 'total_amount', NEW.total_amount)
    );
  ELSIF TG_OP = 'UPDATE' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    INSERT INTO user_activity (user_id, restaurant_id, activity_type, activity_data)
    VALUES (
      NEW.staff_id,
      NEW.restaurant_id,
      'order_completed',
      json_build_object('order_id', NEW.id, 'customer_name', NEW.customer_name, 'total_amount', NEW.total_amount, 'preparation_time', EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at))/60)
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 18. Create trigger to track user activity
DROP TRIGGER IF EXISTS trigger_track_user_activity ON orders;
CREATE TRIGGER trigger_track_user_activity
  AFTER INSERT OR UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION track_user_activity();

-- 19. Add sample shift assignments for demonstration
INSERT INTO shift_assignments (staff_id, restaurant_id, shift_date, shift_type, start_time, end_time, status)
SELECT 
  u.id,
  r.id,
  CURRENT_DATE,
  CASE WHEN u.role = 'cashier' THEN 'morning' ELSE 'evening' END,
  CASE WHEN u.role = 'cashier' THEN '08:00' ELSE '16:00' END,
  CASE WHEN u.role = 'cashier' THEN '16:00' ELSE '00:00' END,
  'scheduled'
FROM users u
JOIN restaurants r ON r.owner_id = u.id
WHERE u.role IN ('cashier', 'manager')
LIMIT 5
ON CONFLICT DO NOTHING;

-- 20. Add comments to tables
COMMENT ON TABLE staff_performance IS 'Tracks daily performance metrics for each staff member';
COMMENT ON TABLE shift_assignments IS 'Manages shift schedules and assignments for staff';
COMMENT ON TABLE user_activity IS 'Logs all user activities for audit and analytics';
COMMENT ON TABLE financial_tracking IS 'Daily financial summary for profit and tax analysis';
