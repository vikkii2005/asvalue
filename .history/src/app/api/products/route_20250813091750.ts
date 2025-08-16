import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/supabase'
import { productCreateSchema } from '@/lib/validations'
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

    const products = await db.products.getByUserId(session.user.id)
    
    return NextResponse.json({ 
      success: true, 
      data: products 
    })
  } catch (error) {
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
    const validatedData = productCreateSchema.parse(body)

    // Generate unique magic code
    const magicCode = generateMagicCode()

    const product = await db.products.create({
      ...validatedData,
      seller_id: session.user.id,
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