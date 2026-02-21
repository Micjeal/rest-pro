-- Create restaurant_settings table
-- This table stores configuration settings for each restaurant

CREATE TABLE IF NOT EXISTS restaurant_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  restaurant JSONB DEFAULT '{}',
  pos JSONB DEFAULT '{}',
  system JSONB DEFAULT '{}',
  security JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure one settings record per restaurant
  UNIQUE(restaurant_id)
);

-- Enable Row Level Security
ALTER TABLE restaurant_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for restaurant_settings
-- Drop existing policies if they exist
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can view settings of their restaurants" ON restaurant_settings;
    DROP POLICY IF EXISTS "Users can insert settings for their restaurants" ON restaurant_settings;
    DROP POLICY IF EXISTS "Users can update settings of their restaurants" ON restaurant_settings;
    DROP POLICY IF EXISTS "Users can delete settings of their restaurants" ON restaurant_settings;
END $$;

-- Create new policies
CREATE POLICY "Users can view settings of their restaurants"
  ON restaurant_settings FOR SELECT
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE owner_id = current_setting('app.current_user_id', true)::UUID
    )
  );

CREATE POLICY "Users can insert settings for their restaurants"
  ON restaurant_settings FOR INSERT
  WITH CHECK (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE owner_id = current_setting('app.current_user_id', true)::UUID
    )
  );

CREATE POLICY "Users can update settings of their restaurants"
  ON restaurant_settings FOR UPDATE
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE owner_id = current_setting('app.current_user_id', true)::UUID
    )
  );

CREATE POLICY "Users can delete settings of their restaurants"
  ON restaurant_settings FOR DELETE
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE owner_id = current_setting('app.current_user_id', true)::UUID
    )
  );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_restaurant_settings_updated_at
    BEFORE UPDATE ON restaurant_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings for existing restaurants
INSERT INTO restaurant_settings (restaurant_id, restaurant, pos, system, security)
SELECT 
  id,
  '{
    "name": "",
    "address": "",
    "phone": "",
    "email": "",
    "taxRate": 8.5,
    "currency": "UGX"
  }'::jsonb,
  '{
    "receiptHeader": "Thank you for dining with us!",
    "receiptFooter": "Please come again!",
    "autoPrintReceipts": false,
    "showTaxBreakdown": true,
    "allowDiscounts": true,
    "maxDiscountPercent": 25
  }'::jsonb,
  '{
    "backupEnabled": true,
    "backupFrequency": "daily",
    "notificationEmail": "",
    "maintenanceMode": false,
    "debugMode": false
  }'::jsonb,
  '{
    "sessionTimeout": 30,
    "requirePasswordForRefunds": true,
    "requirePasswordForDiscounts": true,
    "allowStaffLogin": true
  }'::jsonb
FROM restaurants
WHERE NOT EXISTS (
  SELECT 1 FROM restaurant_settings WHERE restaurant_id = restaurants.id
);

SELECT 'restaurant_settings table created successfully!' as status;
