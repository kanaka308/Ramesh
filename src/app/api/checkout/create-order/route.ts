import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/db';
import { verifySessionToken } from '@/lib/auth';
import { config } from '@/lib/config';
import Razorpay from 'razorpay';

interface Course {
  id: number;
  title: string;
  price: number;
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get('session_token')?.value;
    const email = sessionToken ? verifySessionToken(sessionToken) : null;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required. Please sign in to purchase.' },
        { status: 401 }
      );
    }

    const { courseId } = await req.json();

    if (!courseId) {
      return NextResponse.json(
        { success: false, error: 'Course ID is required.' },
        { status: 400 }
      );
    }

    // Fetch course details
    const course = db.prepare('SELECT id, title, price FROM recorded_courses WHERE id = ?').get(courseId) as Course | undefined;

    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found.' },
        { status: 404 }
      );
    }

    // Resolve student
    const student = db.prepare('SELECT id FROM students WHERE email = ?').get(email) as { id: number };

    // Register pending purchase first to keep track of state transitions
    const pendingPurchase = db.prepare('SELECT id FROM purchases WHERE student_id = ? AND course_id = ? AND status = ?')
      .get(student.id, course.id, 'pending');

    let orderId = '';

    // Mock order creation if key is default/mock
    if (config.razorpay.keyId === 'rzp_test_mock_id') {
      orderId = 'order_mock_' + Math.random().toString(36).substring(2, 10);
    } else {
      // Standard Razorpay Order creation
      const rzp = new Razorpay({
        key_id: config.razorpay.keyId,
        key_secret: config.razorpay.keySecret,
      });

      const order = await rzp.orders.create({
        amount: course.price, // Amount in paise
        currency: 'INR',
        receipt: `receipt_c_${course.id}_s_${student.id}`,
      });

      orderId = order.id;
    }

    if (!pendingPurchase) {
      db.prepare('INSERT INTO purchases (student_id, course_id, payment_id, status, purchased_at) VALUES (?, ?, ?, ?, ?)')
        .run(student.id, course.id, orderId, 'pending', new Date().toISOString());
    } else {
      db.prepare('UPDATE purchases SET payment_id = ?, purchased_at = ? WHERE id = ?')
        .run(orderId, new Date().toISOString(), (pendingPurchase as any).id);
    }

    return NextResponse.json({
      success: true,
      orderId,
      amount: course.price,
      currency: 'INR',
      key: config.razorpay.keyId
    });

  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Payment initiation failed.' },
      { status: 500 }
    );
  }
}
