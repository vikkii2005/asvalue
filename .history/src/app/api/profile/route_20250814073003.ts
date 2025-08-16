import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, business_name, category, phone } = body

    // Validate required fields
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    if (!business_name || !business_name.trim()) {
      return NextResponse.json({ error: 'Business name is required' }, { status: 400 })
    }

    if (!category || !category.trim()) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 })
    }

    // Update seller profile
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
      // eslint-disable-next-line no-console
      console.error('Supabase update error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: data[0] })

  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Profile API is working' })
}