import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/neon';

export async function POST(request: NextRequest) {
  try {
    const { firebaseUid, email, name } = await request.json();

    console.log('🔐 Signup attempt:', { email, firebaseUid });

    // Check if seller already exists
    let seller = await db.sellers.getByFirebaseUid(firebaseUid);
    let isNewUser = false;

    if (!seller) {
      // Check by email (for existing users)
      seller = await db.sellers.getByEmail(email);
      
      if (seller && !seller.auth_user_id) {
        // Update existing seller with Firebase UID
        console.log('🔄 Updating existing seller:', email);
        seller = await db.sellers.updateProfile(email, {});
        // Update auth_user_id separately
        await sql`UPDATE sellers SET auth_user_id = ${firebaseUid} WHERE email = ${email}`;
      } else if (!seller) {
        // Create new seller
        console.log('🆕 Creating new seller:', email);
        seller = await db.sellers.create({
          email,
          name: name || '',
          auth_user_id: firebaseUid,
          is_active: true,
          email_verified: true
        });
        isNewUser = true;
      }
    }

    console.log('✅ Seller ready:', seller.id);

    return NextResponse.json({
      success: true,
      user: seller,
      isNewUser
    });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    );
  }
}