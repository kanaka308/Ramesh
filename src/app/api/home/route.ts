import { NextResponse } from 'next/server';
import db from '@/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const batches = db.prepare('SELECT * FROM bootcamp_batches').all();
    const portfolio = db.prepare('SELECT * FROM portfolio_images ORDER BY display_order ASC').all();
    const testimonials = db.prepare('SELECT * FROM testimonials ORDER BY display_order ASC').all();

    return NextResponse.json({
      success: true,
      batches,
      portfolio,
      testimonials,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch homepage data' },
      { status: 500 }
    );
  }
}
