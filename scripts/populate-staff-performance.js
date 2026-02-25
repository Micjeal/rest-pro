#!/usr/bin/env node

/**
 * Populate Staff Performance Data from Users
 * This script creates sample staff performance records for existing users
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

async function populateStaffPerformance() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

  try {
    console.log('🚀 Starting staff performance population...')
    
    // Fetch all users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email, role')
      .in('role', ['admin', 'manager', 'cashier', 'chef'])
      .order('created_at', { ascending: true })

    if (usersError) {
      console.error('❌ Error fetching users:', usersError)
      return
    }

    console.log(`📋 Found ${users.length} users`)

    if (users.length === 0) {
      console.log('⚠️ No users found. Please create some users first.')
      return
    }

    // Create sample staff performance data for each user
    const performanceData = []
    const today = new Date().toISOString().split('T')[0]
    
    for (const user of users) {
      // Create performance data for the last 7 days
      for (let i = 0; i < 7; i++) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        
        // Generate realistic performance metrics based on role
        let ordersCompleted = 0
        let revenueGenerated = 0
        let efficiencyScore = 0
        
        switch (user.role) {
          case 'cashier':
            ordersCompleted = Math.floor(Math.random() * 20) + 10
            revenueGenerated = ordersCompleted * (Math.random() * 5000 + 3000)
            efficiencyScore = 75 + Math.random() * 20
            break
          case 'chef':
            ordersCompleted = Math.floor(Math.random() * 15) + 5
            revenueGenerated = ordersCompleted * (Math.random() * 6000 + 4000)
            efficiencyScore = 80 + Math.random() * 15
            break
          case 'manager':
            ordersCompleted = Math.floor(Math.random() * 25) + 15
            revenueGenerated = ordersCompleted * (Math.random() * 7000 + 5000)
            efficiencyScore = 85 + Math.random() * 10
            break
          case 'admin':
            ordersCompleted = Math.floor(Math.random() * 30) + 20
            revenueGenerated = ordersCompleted * (Math.random() * 8000 + 6000)
            efficiencyScore = 90 + Math.random() * 10
            break
          default:
            ordersCompleted = Math.floor(Math.random() * 10) + 5
            revenueGenerated = ordersCompleted * (Math.random() * 4000 + 2000)
            efficiencyScore = 70 + Math.random() 15
        }

        const performanceRecord = {
          staff_id: user.id,
          date: dateStr,
          orders_completed: ordersCompleted,
          orders_cancelled: Math.floor(Math.random() * 3),
          revenue_generated: Math.round(revenueGenerated * 100) / 100,
          average_order_value: ordersCompleted > 0 ? Math.round((revenueGenerated / ordersCompleted) * 100) / 100 : 0,
          total_preparation_time: ordersCompleted * (Math.random() * 15 + 10), // 10-25 minutes per order
          average_preparation_time: Math.round((ordersCompleted * (Math.random() * 15 + 10)) / ordersCompleted),
          efficiency_score: Math.round(efficiencyScore),
          shift_type: ['morning', 'evening', 'night'][Math.floor(Math.random() * 3)],
          hours_worked: 8, // 8 hours per day
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        performanceData.push(performanceRecord)
      }
    }

    // Insert staff performance data into database
    console.log('📝 Inserting staff performance data...')
    
    const { data: insertedData, error: insertError } = await supabase
      .from('staff_performance')
      .insert(performanceData)
      .select('*')

    if (insertError) {
      console.error('❌ Error inserting staff performance data:', insertError)
      return
    }

    console.log(`✅ Successfully inserted ${insertedData.length} staff performance records`)
    
    // Create sample shift assignments
    const shiftData = []
    const shiftTypes = ['morning', 'evening', 'night']
    const shiftTimes = {
      morning: { start: '08:00', end: '16:00' },
      evening: { start: '16:00', end: '00:00' },
      night: { start: '00:00', end: '08:00' }
    }

    for (const user of users) {
      // Create shift assignments for the next 7 days
      for (let i = 0; i < 7; i++) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        const shiftType = shiftTypes[Math.floor(Math.random() * 3)]
        const shiftTime = shiftTimes[shiftType]
        
        const shiftRecord = {
          staff_id: user.id,
          shift_date: dateStr,
          shift_type: shiftType,
          start_time: shiftTime.start,
          end_time: shiftTime.end,
          status: Math.random() > 0.8 ? 'completed' : 'scheduled',
          notes: `${user.name} - ${shiftType} shift`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        shiftData.push(shiftRecord)
      }
    }

    console.log('📅 Creating shift assignments...')
    
    const { data: insertedShifts, error: shiftError } = await supabase
      .from('shift_assignments')
      .insert(shiftData)
      .select('*')

    if (shiftError) {
      console.error('❌ Error creating shift assignments:', shiftError)
      return
    }

    console.log(`✅ Successfully created ${insertedShifts.length} shift assignments`)

    // Create sample user activity logs
    const activityData = []
    const activityTypes = ['login', 'order_created', 'order_completed', 'logout']
    
    for (const user of users) {
      // Create activity logs for the last 7 days
      for (let i = 0; i < 7; i++) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        
        // Create multiple activity records per day
        const activitiesPerDay = Math.floor(Math.random() * 5) + 2
        
        for (let j = 0; j < activitiesPerDay; j++) {
          const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)]
          const activityRecord = {
            user_id: user.id,
            activity_type: activityType,
            activity_data: {
              timestamp: new Date().toISOString(),
              details: `${user.name} performed ${activityType}`
            },
            created_at: dateStr + 'T' + new Date().toTimeString().slice(0, 8),
            ip_address: '127.0.0.1',
            user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.44724'
          }

          activityData.push(activityRecord)
        }
      }
    }

    console.log('📋 Creating user activity logs...')
    
    const { data: insertedActivities, error: activityError } = await supabase
      .from('user_activity')
      .insert(activityData)
      .select('*')

    if (activityError) {
      console.error('❌ Error creating user activity logs:', activityError)
      return
    }

    console.log(`✅ Successfully created ${insertedActivities.length} user activity logs`)

    console.log('\n🎉 Staff performance population completed!')
    console.log(`📊 Summary:`)
    console.log(`  - Users: ${users.length}`)
    console.log(`  - Performance Records: ${insertedData.length}`)
    console.log(`  - Shift Assignments: ${insertedShifts.length}`)
    console.log(`  - Activity Logs: ${insertedActivities.length}`)
    console.log(`\n📈 The staff tab will now show real staff performance data!`)

  } catch (error) {
    console.error('💥 Error during staff performance population:', error)
    process.exit(1)
  }
}

// Run the population script
if (require.main === module) {
  populateStaffPerformance()
}

module.exports = { populateStaffPerformance }
