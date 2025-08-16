import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/supabase'
import { orderCreateSchema } from '@/lib/validations'

// GET /api/orders - Get user's orders
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const orders = await db.orders.getByUserId(session.user.id)
    
    return NextResponse.json({ 
      success: true, 
      data: orders 
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

// POST /api/orders - Create new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = orderCreateSchema.parse(body)

    // Get product to verify it exists and get seller_id
    const product = await db.products.getByMagicCode(validatedData.product_magic_code)
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    const order = await db.orders.create({
      product_id: product.id,
      seller_id: product.seller_id,
      customer_email: validatedData.customer_email,
      customer_name: validatedData.customer_name,
      shipping_address: validatedData.shipping_address,
      quantity: validatedData.quantity || 1,
      unit_price: product.price,
      total_amount: product.price * (validatedData.quantity || 1),
      currency: 'USD',
    })

    // Create notification for seller
    await db.notifications.create({
      seller_id: product.seller_id,
      product_id: product.id,
      type: 'new_order',
      title: 'New Order Received!',
      message: `You received a new order for ${product.name}`,
      metadata: { order_id: order.id },
    })

    return NextResponse.json({ 
      success: true, 
      data: order 
    }, { status: 201 })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}