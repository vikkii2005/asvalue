import { NextResponse } from 'next/server';
import { db } from '@/lib/neon';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, business_name, category, phone } = body;

    // Same validation as before
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (!business_name || !business_name.trim()) {
      return NextResponse.json({ error: 'Business name is required' }, { status: 400 });
    }

    if (!category || !category.trim()) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }

    // Update seller profile using Neon
    const data = await db.sellers.updateProfile(email, {
      business_name: business_name.trim(),
      category: category.trim(),
      phone: phone?.trim() || null,
    });

    if (!data) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data });

  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Profile API is working' });
}