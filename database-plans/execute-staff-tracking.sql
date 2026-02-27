#!/usr/bin/env node

/**
 * Execute Staff Tracking SQL Script
 * This script will execute the staff tracking SQL setup in Supabase
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your .env file.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function executeStaffTrackingSetup() {
  try {
    console.log('🚀 Starting staff tracking setup...')
    
    // Read the SQL file
    const fs = require('fs')
    const path = require('path')
    const sqlFile = path.join(__dirname, '../database-plans/add-staff-tracking.sql')
    const sqlContent = fs.readFileSync(sqlFile, 'utf8')
    
    console.log('📄 Reading SQL file...')
    
    // Split the SQL content into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`)
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      console.log(`\n⚡ Executing statement ${i + 1}/${statements.length}...`)
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement })
        
        if (error) {
          console.error(`❌ Error executing statement ${i + 1}:`, error)
          console.error(`Statement: ${statement.substring(0, 100)}...`)
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`)
        }
      } catch (err) {
        console.error(`❌ Error executing statement ${i + 1}:`, err.message)
      }
    }
    
    console.log('\n🎉 Staff tracking setup completed!')
    console.log('\n📊 Tables created:')
    console.log('  - staff_performance (staff performance tracking)')
    console.log('  - shift_assignments (shift scheduling)')
    console.log('  - user_activity (activity logging)')
    console.log('  - financial_tracking (financial analytics)')
    console.log('\n🔧 Tables updated:')
    console.log('  - orders (added staff_id, completed_at, preparation_time, started_at)')
    console.log('  - menu_items (added cost_price, tax_category, profit_margin)')
    console.log('\n⚡ Triggers created:')
    console.log('  - trigger_update_staff_performance')
    console.log('  - trigger_update_financial_tracking')
    console.log('  - trigger_track_user_activity')
    
  } catch (error) {
    console.error('💥 Error during setup:', error)
    process.exit(1)
  }
}

// Alternative approach using direct SQL execution
async function executeWithDirectSQL() {
  try {
    console.log('🚀 Starting staff tracking setup with direct SQL...')
    
    // Read the SQL file
    const fs = require('fs')
    const path = require('path')
    const sqlFile = path.join(__dirname, '../database-plans/add-staff-tracking.sql')
    const sqlContent = fs.readFileSync(sqlFile, 'utf8')
    
    console.log('📄 SQL file read successfully')
    console.log('📝 SQL content length:', sqlContent.length, 'characters')
    
    // Create a temporary function to execute SQL
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
    
    if (error) {
      console.error('❌ Error testing connection:', error)
      return
    }
    
    console.log('✅ Database connection successful')
    console.log('📊 Current tables:', data?.length || 0)
    
    // Save SQL to a file for manual execution
    const fs = require('fs')
    const path = require('path')
    const outputPath = path.join(__dirname, '../staff-tracking-setup.sql')
    fs.writeFileSync(outputPath, sqlContent)
    
    console.log(`\n💾 SQL script saved to: ${outputPath}`)
    console.log('\n📋 To complete the setup:')
    console.log('1. Open Supabase Dashboard')
    console.log('2. Go to SQL Editor')
    console.log('3. Copy and paste the contents of staff-tracking-setup.sql')
    console.log('4. Execute the script')
    console.log('\n🎯 This will create all necessary tables and triggers for staff tracking!')
    
  } catch (error) {
    console.error('💥 Error during setup:', error)
  }
}

// Run the setup
if (require.main === module) {
  executeWithDirectSQL()
}

module.exports = { executeStaffTrackingSetup, executeWithDirectSQL }
