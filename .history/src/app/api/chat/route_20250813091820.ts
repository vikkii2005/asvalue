import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase'
import { chatMessageSchema } from '@/lib/validations'

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

    const messages = await db.chat_messages.getByProductAndSession(
      productId,
      customerSession
    )

    return NextResponse.json({ 
      success: true, 
      data: messages 
    })
  } catch (error) {
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
    const validatedData = chatMessageSchema.parse(body)

    // Get product to verify it exists
    const product = await db.products.getById(validatedData.product_id)
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Save customer message
    const customerMessage = await db.chat_messages.create({
      product_id: validatedData.product_id,
      customer_session: validatedData.customer_session,
      sender_type: 'customer',
      message: validatedData.message,
    })

    // Generate AI response (simplified for Day 1)
    let aiResponse = "I'd be happy to help! Let me get that information for you."
    
    // Simple AI logic - check if message matches predefined questions
    const message = validatedData.message.toLowerCase()
    if (message.includes('size') || message.includes('sizing')) {
      aiResponse = product.answer1 || aiResponse
    } else if (message.includes('shipping') || message.includes('delivery')) {
      aiResponse = product.answer2 || aiResponse
    } else if (message.includes('return') || message.includes('refund')) {
      aiResponse = product.answer3 || aiResponse
    }

    // Save AI response
    const aiMessage = await db.chat_messages.create({
      product_id: validatedData.product_id,
      customer_session: validatedData.customer_session,
      sender_type: 'ai',
      message: aiResponse,
      metadata: { confidence: 0.8, question_type: 'general' },
    })

    // Create notification for seller
    await db.notifications.create({
      seller_id: product.seller_id,
      product_id: product.id,
      type: 'customer_question',
      title: 'New Customer Question',
      message: `A customer asked: "${validatedData.message}"`,
      metadata: { 
        customer_session: validatedData.customer_session,
        message_id: customerMessage.id 
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