import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/supabase'

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

    const orders = await db.orders.getBySeller(session.user.id)
    
    return NextResponse.json({ 
      success: true, 
      data: orders 
    })
  } catch (_error) {
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
    
    // Basic validation for Day 1
    const { product_magic_code, customer_email, customer_name, shipping_address, quantity } = body

    if (!product_magic_code || !customer_email || !shipping_address) {
      return NextResponse.json(
        { error: 'Product code, customer email, and shipping address are required' },
        { status: 400 }
      )
    }

    // Get product to verify it exists and get seller_id
    const product = await db.products.getByMagicCode(product_magic_code)
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    const orderQuantity = quantity || 1
    const totalAmount = product.price * orderQuantity

    const order = await db.orders.create({
      product_id: product.id,
      seller_id: product.seller_id,
      customer_email,
      customer_name: customer_name || null,
      shipping_address,
      quantity: orderQuantity,
      unit_price: product.price,
      total_amount: totalAmount,
      currency: 'USD',
      status: 'pending',
      paypal_order_id: null,
      paypal_payment_id: null,
      payment_status: 'pending',
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