import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase'

// GET /api/chat?product_id=xxx&session=xxx - Get chat messages
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('product_id')
    const customerSession = searchParams.get('session')

    if (!productId || !customerSession) {
      return NextResponse.json(
        { error: 'Product ID and session are required' },
        { status: 400 }
      )
    }

    const messages = await db.chat.getByProductAndSession(
      productId,
      customerSession
    )

    return NextResponse.json({ 
      success: true, 
      data: messages 
    })
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to fetch chat messages' },
      { status: 500 }
    )
  }
}

// POST /api/chat - Send chat message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Basic validation for Day 1
    const { product_id, customer_session, message } = body

    if (!product_id || !customer_session || !message) {
      return NextResponse.json(
        { error: 'Product ID, customer session, and message are required' },
        { status: 400 }
      )
    }

    // Get product to verify it exists
    const product = await db.products.getById(product_id)
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Save customer message
    const customerMessage = await db.chat.create({
      product_id,
      customer_session,
      sender_type: 'customer',
      message,
    })

    // Generate AI response (simplified for Day 1)
    let aiResponse = "I'd be happy to help! Let me get that information for you."
    
    // Simple AI logic - check if message matches predefined questions
    const messageText = message.toLowerCase()
    if (messageText.includes('size') || messageText.includes('sizing')) {
      aiResponse = product.answer1 || aiResponse
    } else if (messageText.includes('shipping') || messageText.includes('delivery')) {
      aiResponse = product.answer2 || aiResponse
    } else if (messageText.includes('return') || messageText.includes('refund')) {
      aiResponse = product.answer3 || aiResponse
    }

    // Save AI response
    const aiMessage = await db.chat.create({
      product_id,
      customer_session,
      sender_type: 'ai',
      message: aiResponse,
      metadata: { confidence: 0.8, question_type: 'general' },
    })

    return NextResponse.json({ 
      success: true, 
      data: {
        customer_message: customerMessage,
        ai_response: aiMessage
      }
    }, { status: 201 })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}