#!/usr/bin/env node

/**
 * Setup Staff Tracking SQL Script
 * This script prepares the SQL for Supabase execution
 */

const fs = require('fs')
const path = require('path')

function setupStaffTracking() {
  try {
    console.log('🚀 Setting up staff tracking SQL...')
    
    // Read the SQL file
    const sqlFile = path.join(__dirname, '../database-plans/add-staff-tracking.sql')
    const sqlContent = fs.readFileSync(sqlFile, 'utf8')
    
    console.log('📄 SQL file read successfully')
    console.log('📝 SQL content length:', sqlContent.length, 'characters')
    
    // Save SQL to a file for manual execution
    const outputPath = path.join(__dirname, '../staff-tracking-setup.sql')
    fs.writeFileSync(outputPath, sqlContent)
    
    console.log(`\n💾 SQL script saved to: ${outputPath}`)
    console.log('\n📋 To complete the setup:')
    console.log('1. Open Supabase Dashboard')
    console.log('2. Go to SQL Editor')
    console.log('3. Copy and paste the contents of staff-tracking-setup.sql')
    console.log('4. Execute the script')
    console.log('\n🎯 This will create all necessary tables and triggers for staff tracking!')
    
    console.log('\n📊 Tables that will be created:')
    console.log('  - staff_performance (staff performance tracking)')
    console.log('  - shift_assignments (shift scheduling)')
    console.log('  - user_activity (activity logging)')
    console.log('  - financial_tracking (financial analytics)')
    
    console.log('\n🔧 Tables that will be updated:')
    console.log('  - orders (added staff_id, completed_at, preparation_time, started_at)')
    console.log('  - menu_items (added cost_price, tax_category, profit_margin)')
    
    console.log('\n⚡ Features that will be enabled:')
    console.log('  - Automatic staff performance tracking')
    console.log('  - Financial analytics and profit calculations')
    console.log('  - User activity logging')
    console.log('  - Shift management')
    console.log('  - Tax and profit reporting')
    
  } catch (error) {
    console.error('💥 Error during setup:', error)
  }
}

// Run the setup
if (require.main === module) {
  setupStaffTracking()
}

module.exports = { setupStaffTracking }
