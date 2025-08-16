import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabase } from '@/lib/supabase'
import { profileSetupSchema } from '@/lib/validations'
import type { ProfileUpdateRequest, ProfileResponse } from '@/lib/types/profile'

// GET /api/profile - Fetch user profile data
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Fetch seller profile
    const { data: seller, error: dbError } = await supabase
      .from('sellers')
      .select('id, email, name, business_name, category, phone, is_active, created_at')
      .eq('email', session.user.email)
      .single()

    if (dbError) {
      if (dbError.code === 'PGRST116') {
        // No profile found - return empty profile structure
        return NextResponse.json({
          success: true,
          data: {
            exists: false,
            profile: null
          }
        })
      }
      
      console.error('Profile fetch error:', dbError)
      return NextResponse.json(
        { error: 'Failed to fetch profile data' },
        { status: 500 }
      )
    }

    // Check if profile is complete
    const isComplete = Boolean(
      seller?.business_name?.trim() && 
      seller?.category?.trim() && 
      seller?.phone?.trim()
    )

    const response: ProfileResponse = {
      success: true,
      data: {
        exists: true,
        profile: {
          id: seller.id,
          email: seller.email,
          name: seller.name,
          business_name: seller.business_name,
          category: seller.category,
          phone: seller.phone,
          is_active: seller.is_active,
          created_at: seller.created_at,
          is_complete: isComplete
        }
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Profile API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/profile - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body: ProfileUpdateRequest = await request.json()
    
    const validation = profileSetupSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validation.error.format() 
        },
        { status: 400 }
      )
    }

    const { business_name, category, phone } = validation.data

    // Update seller profile
    const { data: updatedSeller, error: updateError } = await supabase
      .from('sellers')
      .update({
        business_name: business_name.trim(),
        category: category,
        phone: phone?.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('email', session.user.email)
      .select('id, email, name, business_name, category, phone, is_active, created_at, updated_at')
      .single()

    if (updateError) {
      console.error('Profile update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    // Return updated profile
    const response: ProfileResponse = {
      success: true,
      data: {
        exists: true,
        profile: {
          id: updatedSeller.id,
          email: updatedSeller.email,
          name: updatedSeller.name,
          business_name: updatedSeller.business_name,
          category: updatedSeller.category,
          phone: updatedSeller.phone,
          is_active: updatedSeller.is_active,
          created_at: updatedSeller.created_at,
          updated_at: updatedSeller.updated_at,
          is_complete: true // Will be complete after successful update
        }
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Profile update API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/profile - Partial profile update
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse request body - allow partial updates
    const body = await request.json()
    
    // Build update object with only provided fields
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString()
    }

    if (body.business_name !== undefined) {
      if (!body.business_name?.trim()) {
        return NextResponse.json(
          { error: 'Business name cannot be empty' },
          { status: 400 }
        )
      }
      updateData.business_name = body.business_name.trim()
    }

    if (body.category !== undefined) {
      if (!body.category) {
        return NextResponse.json(
          { error: 'Category is required' },
          { status: 400 }
        )
      }
      updateData.category = body.category
    }

    if (body.phone !== undefined) {
      updateData.phone = body.phone?.trim() || null
    }

    // Update seller profile
    const { data: updatedSeller, error: updateError } = await supabase
      .from('sellers')
      .update(updateData)
      .eq('email', session.user.email)
      .select('id, email, name, business_name, category, phone, is_active, created_at, updated_at')
      .single()

    if (updateError) {
      console.error('Profile patch error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    // Check if profile is complete after update
    const isComplete = Boolean(
      updatedSeller?.business_name?.trim() && 
      updatedSeller?.category?.trim() && 
      updatedSeller?.phone?.trim()
    )

    const response: ProfileResponse = {
      success: true,
      data: {
        exists: true,
        profile: {
          id: updatedSeller.id,
          email: updatedSeller.email,
          name: updatedSeller.name,
          business_name: updatedSeller.business_name,
          category: updatedSeller.category,
          phone: updatedSeller.phone,
          is_active: updatedSeller.is_active,
          created_at: updatedSeller.created_at,
          updated_at: updatedSeller.updated_at,
          is_complete: isComplete
        }
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Profile patch API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}