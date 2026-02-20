/**
 * @fileoverview Individual Reservation API Route
 * Handles CRUD operations for individual reservations
 * 
 * Dynamic Route: /api/reservations/[id]
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * PUT /api/reservations/[id]
 * Updates an existing reservation
 * 
 * @param request - NextJS request with JSON body:
 *   {
 *     customer_name?: string,
 *     customer_phone?: string,
 *     customer_email?: string,
 *     party_size?: number,
 *     reservation_date?: string,
 *     status?: string,
 *     notes?: string
 *   }
 * 
 * @returns Updated reservation object (200) or error
 * 
 * Success Response (200):
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
 * - 404: Reservation not found
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id: reservationId } = await params

  try {
    const body = await request.json()

    const { data, error } = await supabase
      .from('reservations')
      .update(body)
      .eq('id', reservationId)
      .select()

    if (error) {
      console.error('[API] PUT reservation error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error('[API] PUT reservation parse error:', error)
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

/**
 * DELETE /api/reservations/[id]
 * Deletes a reservation
 * 
 * @param request - NextJS request
 * @returns Success message (200) or error
 * 
 * Success Response (200):
 * {
 *   success: true
 * }
 * 
 * Error Responses:
 * - 400: Missing id or database error
 * - 404: Reservation not found
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id: reservationId } = await params

  const { error } = await supabase
    .from('reservations')
    .delete()
    .eq('id', reservationId)

  if (error) {
    console.error('[API] DELETE reservation error:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
