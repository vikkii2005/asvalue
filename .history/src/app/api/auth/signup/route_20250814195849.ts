import { NextRequest, NextResponse } from 'next/server';
import { db, sql } from '@/lib/neon'; // ✅ Added missing sql import

export async function POST(request: NextRequest) {
  try {
    const { firebaseUid, email, name } = await request.json();

    // eslint-disable-next-line no-console
    console.log('🔐 Signup attempt:', { email, firebaseUid });

    // Check if seller already exists
    let seller = await db.sellers.getByFirebaseUid(firebaseUid);
    let isNewUser = false;

    if (!seller) {
      // Check by email (for existing users)
      seller = await db.sellers.getByEmail(email);
      
      if (seller && !seller.auth_user_id) {
        // Update existing seller with Firebase UID
        // eslint-disable-next-line no-console
        console.log('🔄 Updating existing seller:', email);
        
        // ✅ Fixed: Update auth_user_id properly
        const result = await sql`
          UPDATE sellers 
          SET auth_user_id = ${firebaseUid}, updated_at = ${new Date().toISOString()}
          WHERE email = ${email}
          RETURNING *
        `;
        seller = result[0];
        
      } else if (!seller) {
        // Create new seller
        // eslint-disable-next-line no-console
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

    // eslint-disable-next-line no-console
    console.log('✅ Seller ready:', seller.id);

    return NextResponse.json({
      success: true,
      user: seller,
      isNewUser
    });

  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Signup error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    );
  }
}