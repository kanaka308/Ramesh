import { NextResponse } from 'next/server';
import repo from '@/db/repo';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const batches = await repo.getBootcampBatches();
    const portfolio = await repo.getPortfolioImages();
    const testimonials = await repo.getTestimonials();

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
