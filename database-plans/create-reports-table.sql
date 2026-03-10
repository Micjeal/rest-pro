-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('monthly', 'weekly', 'daily', 'custom')),
    date DATE NOT NULL,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'archived')),
    data JSONB, -- Store report data as JSON
    file_url TEXT, -- URL to generated PDF/Excel file
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX idx_reports_restaurant_id ON reports(restaurant_id);
CREATE INDEX idx_reports_type ON reports(type);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_date ON reports(date);
CREATE INDEX idx_reports_created_at ON reports(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view reports for their restaurants
CREATE POLICY "Users can view reports for their restaurants" ON reports
    FOR SELECT USING (
        restaurant_id IN (
            SELECT id FROM restaurants WHERE owner_id = auth.uid()
        )
        OR created_by = auth.uid()
    );

-- Users can create reports for their restaurants
CREATE POLICY "Users can create reports for their restaurants" ON reports
    FOR INSERT WITH CHECK (
        restaurant_id IN (
            SELECT id FROM restaurants WHERE owner_id = auth.uid()
        )
        OR created_by = auth.uid()
    );

-- Users can update reports they created
CREATE POLICY "Users can update their own reports" ON reports
    FOR UPDATE USING (created_by = auth.uid());

-- Users can delete reports they created
CREATE POLICY "Users can delete their own reports" ON reports
    FOR DELETE USING (created_by = auth.uid());

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_reports_updated_at 
    BEFORE UPDATE ON reports 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample reports for testing
INSERT INTO reports (title, description, type, date, status, data)
VALUES 
    ('July Report 2024', 'Monthly sales and performance report for July 2024', 'monthly', '2024-07-31', 'completed', '{"total_sales": 15000, "orders": 450, "customers": 320}'),
    ('June Report 2024', 'Monthly sales and performance report for June 2024', 'monthly', '2024-06-30', 'completed', '{"total_sales": 13500, "orders": 410, "customers": 295}');
