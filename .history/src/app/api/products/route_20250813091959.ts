import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/supabase'
import { productUpdateSchema } from '@/lib/validations'
import { generateMagicCode } from '@/lib/utils'

// GET /api/products - Get user's products
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const products = await db.products.getBySeller(session.user.id)
    
    return NextResponse.json({ 
      success: true, 
      data: products 
    })
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

// POST /api/products - Create new product
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Basic validation for Day 1 (we'll use productUpdateSchema as base)
    const { name, price, description, image_url } = body
    
    if (!name || !price || !image_url) {
      return NextResponse.json(
        { error: 'Name, price, and image_url are required' },
        { status: 400 }
      )
    }

    // Generate unique magic code
    const magicCode = generateMagicCode()

    const product = await db.products.create({
      seller_id: session.user.id,
      name,
      price: parseFloat(price),
      description: description || null,
      image_url,
      magic_code: magicCode,
    })

    return NextResponse.json({ 
      success: true, 
      data: product 
    }, { status: 201 })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}