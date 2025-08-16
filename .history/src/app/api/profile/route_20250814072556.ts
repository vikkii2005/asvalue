import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, business_name, category, phone } = body

    // Simple validation
    if (!email || !business_name || !category) {
      return NextResponse.json({ 
        error: `Missing fields. Got: email=${!!email}, business_name=${!!business_name}, category=${!!category}` 
      }, { status: 400 })
    }

    // Update profile
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
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })

  } catch (err) {
    return NextResponse.json({ 
      error: `Server error: ${err instanceof Error ? err.message : 'Unknown'}` 
    }, { status: 500 })
  }
}