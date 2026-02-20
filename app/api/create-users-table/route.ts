/**
 * @fileoverview Create Users Table API Route
 * Direct SQL execution to create users table
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    console.log('[CreateTable] Creating users table...')

    // Create users table using raw SQL
    const { error: createError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'users')
      .eq('table_schema', 'public')

    if (createError) {
      console.error('[CreateTable] Error checking table existence:', createError)
    }

    // Try to create table using a different approach
    const { data, error } = await supabase
      .rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            name TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'cashier' CHECK (role IN ('admin', 'manager', 'cashier')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `
      })

    if (error) {
      console.log('[CreateTable] RPC failed, trying alternative method...')
      
      // Return the SQL that needs to be run manually
      return NextResponse.json({
        message: 'Table creation requires manual SQL execution',
        sql: `
          CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            name TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'cashier' CHECK (role IN ('admin', 'manager', 'cashier')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
          
          -- Update restaurants table foreign key
          ALTER TABLE restaurants 
          DROP CONSTRAINT IF EXISTS restaurants_owner_id_fkey,
          ADD CONSTRAINT restaurants_owner_id_fkey 
          FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE;
        `,
        needsManualExecution: true
      })
    }

    return NextResponse.json({
      message: 'Users table created successfully',
      data
    })

  } catch (error) {
    console.error('[CreateTable] Error:', error)
    return NextResponse.json(
      { error: 'Failed to create users table' },
      { status: 500 }
    )
  }
}
