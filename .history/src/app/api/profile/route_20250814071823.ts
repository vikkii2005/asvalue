import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use server-side environment variables with proper fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseKey) {
  throw new Error('Missing Supabase service role key environment variable')
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    detectSessionInUrl: false,
  },
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, business_name, category, phone } = body

    // Validate required fields
    if (!email || !business_name || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: email, business_name, and category are required' }, 
        { status: 400 }
      )
    }

    // Update seller profile
    const { data, error } = await supabase
      .from('sellers')
      .update({ 
        business_name, 
        category, 
        phone,
        updated_at: new Date().toISOString()
      })
      .eq('email', email)
      .select()

    if (error) {
      console.error('Supabase update error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Profile updated successfully',
      data 
    })

  } catch (err) {
    console.error('Unexpected error in profile API:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ error: 'Email parameter required' }, { status: 400 })
    }

    // Get seller profile
    const { data, error } = await supabase
      .from('sellers')
      .select('*')
      .eq('email', email)
      .single()

    if (error) {
      console.error('Supabase select error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })

  } catch (err) {
    console.error('Unexpected error in profile GET:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}