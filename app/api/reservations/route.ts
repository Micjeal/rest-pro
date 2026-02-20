/**
 * @fileoverview Reservations API Route
 * Handles CRUD operations for restaurant table reservations
 * 
 * Query Parameters:
 * - restaurantId: UUID of the restaurant (required for GET)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/reservations?restaurantId=<uuid>
 * Retrieves all reservations for a specific restaurant
 * Reservations are sorted by date (earliest first)
 * 
 * @param request - NextJS request with restaurantId query parameter
 * @returns JSON array of reservations or error
 * 
 * Success Response (200):
 * [
 *   {
 *     id: "uuid",
 *     restaurant_id: "uuid",
 *     customer_name: "Jane Smith",
 *     customer_phone: "555-5678",
 *     customer_email: "jane@example.com",
 *     party_size: 4,
 *     reservation_date: "2024-01-15T19:00:00Z",
 *     status: "confirmed",
 *     notes: "Window seat preferred",
 *     created_at: "2024-01-01T00:00:00Z",
 *     updated_at: "2024-01-01T00:00:00Z"
 *   }
 * ]
 * 
 * Status values: confirmed, cancelled, completed, no-show
 * 
 * Error Responses:
 * - 400: Missing restaurantId or database error
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const restaurantId = request.nextUrl.searchParams.get('restaurantId')

  if (!restaurantId) {
    return NextResponse.json({ error: 'Restaurant ID required' }, { status: 400 })
  }

  const { data: reservations, error } = await supabase
    .from('reservations')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('reservation_date', { ascending: true })

  if (error) {
    console.error('[API] GET reservations error:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(reservations)
}

/**
 * POST /api/reservations
 * Creates a new table reservation
 * 
 * @param request - NextJS request with JSON body:
 *   {
 *     restaurant_id: string (uuid, required),
 *     customer_name: string (required),
 *     customer_phone: string (required),
 *     customer_email?: string,
 *     party_size: number (required),
 *     reservation_date: string (ISO 8601 datetime, required),
 *     status?: string (default: "confirmed"),
 *     notes?: string
 *   }
 * 
 * @returns Created reservation object (201) or error
 * 
 * Success Response (201):
 * {
 *   id: "uuid",
 *   restaurant_id: "uuid",
 *   customer_name: "Jane Smith",
 *   customer_phone: "555-5678",
 *   customer_email: "jane@example.com",
 *   party_size: 4,
 *   reservation_date: "2024-01-15T19:00:00Z",
 *   status: "confirmed",
 *   notes: "Window seat preferred",
 *   created_at: "2024-01-01T00:00:00Z",
 *   updated_at: "2024-01-01T00:00:00Z"
 * }
 * 
 * Error Responses:
 * - 400: Invalid data or database error
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  try {
    const body = await request.json()

    const { data, error } = await supabase
      .from('reservations')
      .insert([body])
      .select()

    if (error) {
      console.error('[API] POST reservation error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error('[API] POST reservation parse error:', error)
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
