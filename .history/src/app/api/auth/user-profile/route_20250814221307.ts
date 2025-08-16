import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/neon';

export async function POST(request: NextRequest) {
  try {
    const { firebaseUid } = await request.json();

    console.log('📋 User profile API called for:', firebaseUid);

    if (!firebaseUid) {
      return NextResponse.json({ error: 'Firebase UID required' }, { status: 400 });
    }

    // Get seller data from database
    const seller = await db.sellers.getByFirebaseUid(firebaseUid);

    console.log('👤 Found seller data:', seller);

    if (!seller) {
      console.log('❌ No seller found for Firebase UID:', firebaseUid);
      return NextResponse.json({ 
        success: false, 
        seller: null,
        error: 'Seller not found' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      seller
    });

  } catch (error) {
    console.error('❌ User profile API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get user profile' },
      { status: 500 }
    );
  }
}

// Optional: Add GET method for testing
export async function GET() {
  return NextResponse.json({ 
    message: 'User Profile API is working',
    endpoints: ['POST /api/auth/user-profile']
  });
}