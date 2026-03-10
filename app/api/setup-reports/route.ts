/**
 * Setup Reports Table API
 * POST /api/setup-reports - Create the reports table and sample data
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    console.log('[Setup Reports] Creating reports table...')

    // SQL to create reports table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS reports (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title VARCHAR(255) NOT NULL,
          description TEXT,
          type VARCHAR(50) NOT NULL CHECK (type IN ('monthly', 'weekly', 'daily', 'custom')),
          date DATE NOT NULL,
          restaurant_id UUID REFERENCES restaurants(id) ON DELETE SET NULL,
          status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'archived')),
          data JSONB,
          file_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
      );

      CREATE INDEX IF NOT EXISTS idx_reports_restaurant_id ON reports(restaurant_id);
      CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(type);
      CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
      CREATE INDEX IF NOT EXISTS idx_reports_date ON reports(date);
      CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at);

      ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

      -- Drop existing policies if they exist
      DROP POLICY IF EXISTS "Users can view reports for their restaurants" ON reports;
      DROP POLICY IF EXISTS "Users can create reports for their restaurants" ON reports;
      DROP POLICY IF EXISTS "Users can update their own reports" ON reports;
      DROP POLICY IF EXISTS "Users can delete their own reports" ON reports;

      -- Create RLS policies
      CREATE POLICY "Users can view reports for their restaurants" ON reports
          FOR SELECT USING (
              restaurant_id IN (
                  SELECT id FROM restaurants WHERE owner_id = auth.uid()
              )
              OR created_by = auth.uid()
          );

      CREATE POLICY "Users can create reports for their restaurants" ON reports
          FOR INSERT WITH CHECK (
              restaurant_id IN (
                  SELECT id FROM restaurants WHERE owner_id = auth.uid()
              )
              OR created_by = auth.uid()
          );

      CREATE POLICY "Users can update their own reports" ON reports
          FOR UPDATE USING (created_by = auth.uid());

      CREATE POLICY "Users can delete their own reports" ON reports
          FOR DELETE USING (created_by = auth.uid());
    `

    // Execute the table creation
    const { error: tableError } = await supabase.rpc('exec_sql', { sql: createTableSQL })
    
    if (tableError) {
      console.log('[Setup Reports] RPC method not available, trying direct SQL execution...')
      
      // Try using service role key for direct SQL execution
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      
      if (!serviceRoleKey || !supabaseUrl) {
        return NextResponse.json(
          { error: 'Service role key or URL not configured' },
          { status: 500 }
        )
      }

      // For now, return a simpler response that guides the user
      return NextResponse.json({
        message: 'Reports table setup requires manual execution',
        instructions: [
          '1. Go to your Supabase dashboard',
          '2. Navigate to SQL Editor',
          '3. Copy and execute the SQL from database-plans/create-reports-table.sql',
          '4. The table will be created with sample data'
        ],
        sql_file: 'database-plans/create-reports-table.sql'
      })
    }

    // Insert sample data
    const sampleDataSQL = `
      INSERT INTO reports (title, description, type, date, status, data)
      VALUES 
          ('July Report 2024', 'Monthly sales and performance report for July 2024', 'monthly', '2024-07-31', 'completed', '{"total_sales": 15000, "orders": 450, "customers": 320}'),
          ('June Report 2024', 'Monthly sales and performance report for June 2024', 'monthly', '2024-06-30', 'completed', '{"total_sales": 13500, "orders": 410, "customers": 295}')
      ON CONFLICT DO NOTHING;
    `

    const { error: dataError } = await supabase.rpc('exec_sql', { sql: sampleDataSQL })

    if (dataError) {
      console.log('[Setup Reports] Sample data insertion failed, but table was created successfully')
    }

    console.log('[Setup Reports] Reports table created successfully')
    
    return NextResponse.json({
      success: true,
      message: 'Reports table created successfully',
      sample_data_inserted: !dataError
    })

  } catch (error) {
    console.error('[Setup Reports] Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to setup reports table',
        details: error instanceof Error ? error.message : 'Unknown error',
        instructions: 'Please manually execute database-plans/create-reports-table.sql in Supabase SQL Editor'
      },
      { status: 500 }
    )
  }
}
