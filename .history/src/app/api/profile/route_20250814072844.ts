import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json()
    console.log('📥 Profile API received:', body)

    const { email, business_name, category, phone, name } = body

    // Basic validation with helpful error messages
    if (!email) {
      return NextResponse.json({ 
        error: 'Email is required',
        received: { email, business_name, category, phone }
      }, { status: 400 })
    }

    if (!business_name || business_name.trim() === '') {
      return NextResponse.json({ 
        error: 'Business name is required',
        received: { email, business_name, category, phone }
      }, { status: 400 })
    }

    if (!category || category.trim() === '') {
      return NextResponse.json({ 
        error: 'Category is required',
        received: { email, business_name, category, phone }
      }, { status: 400 })
    }

    console.log('✅ Validation passed, updating seller profile...')

    // Update the seller profile in database
    const { data, error } = await supabaseAdmin
      .from('sellers')
      .update({ 
        business_name: business_name.trim(), 
        category: category.trim(), 
        phone: phone?.trim() || null,
        updated_at: new Date().toISOString()
      })
      .eq('email', email)
      .select()

    if (error) {
      console.error('❌ Supabase error:', error)
      return NextResponse.json({ 
        error: 'Database update failed', 
        details: error.message 
      }, { status: 500 })
    }

    if (!data || data.length === 0) {
      console.log('❌ No user found with email:', email)
      return NextResponse.json({ 
        error: 'User not found. Please sign in again.' 
      }, { status: 404 })
    }

    console.log('✅ Profile updated successfully for:', email)
    return NextResponse.json({ 
      success: true, 
      message: 'Profile updated successfully',
      data: data[0]
    })

  } catch (err) {
    console.error('❌ Unexpected error:', err)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Profile API is working' })
}