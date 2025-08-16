import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase'

// GET /api/chat?session=xxx - Get chat messages by session
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerSession = searchParams.get('session')

    if (!customerSession) {
      return NextResponse.json(
        { error: 'Session is required' },
        { status: 400 }
      )
    }

    const messages = await db.chat.getBySession(customerSession)

    return NextResponse.json({ 
      success: true, 
      data: messages 
    })
  } catch {
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

    // Save customer message with required metadata
    const customerMessage = await db.chat.create({
      product_id,
      customer_session,
      sender_type: 'customer',
      message,
      metadata: null, // Required field, can be null for customer messages
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

    // Save AI response with proper metadata structure
    const aiMessage = await db.chat.create({
      product_id,
      customer_session,
      sender_type: 'ai',
      message: aiResponse,
      metadata: { 
        ai_confidence: 0.8, // FIXED: Changed from 'confidence' to 'ai_confidence'
        question_type: undefined // Set to undefined for Day 1 compatibility
      },
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