import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import repo from '@/db/repo';
import { verifySessionToken } from '@/lib/auth';
import { config } from '@/lib/config';
import Razorpay from 'razorpay';

export const dynamic = 'force-dynamic';

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

    const { courseId, materialId } = await req.json();

    if (!courseId && !materialId) {
      return NextResponse.json(
        { success: false, error: 'Course ID or Material ID is required.' },
        { status: 400 }
      );
    }

    let price = 0;
    let receipt = '';

    if (materialId) {
      const materials = await repo.getMaterials();
      const material = materials.find(m => m.id === Number(materialId));
      if (!material) {
        return NextResponse.json(
          { success: false, error: 'Material not found.' },
          { status: 404 }
        );
      }
      price = material.price;
      receipt = `receipt_m_${material.id}_e_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
    } else {
      // Fetch course details
      const course = await repo.getRecordedCourse(courseId);

      if (!course) {
        return NextResponse.json(
          { success: false, error: 'Course not found.' },
          { status: 404 }
        );
      }
      price = course.price;

      // Resolve student
      let student = await repo.getStudentByEmail(email);
      if (!student) {
        const studentId = await repo.createStudent(email);
        student = { id: studentId };
      }
      receipt = `receipt_c_${course.id}_s_${student.id}`;
    }

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
        amount: price, // Amount in paise
        currency: 'INR',
        receipt,
      });

      orderId = order.id;
    }

    if (materialId) {
      await repo.registerPendingMaterialPurchase(email, Number(materialId), orderId);
    } else {
      const student = await repo.getStudentByEmail(email);
      if (student) {
        await repo.registerPendingPurchase(student.id, courseId, orderId);
      }
    }

    return NextResponse.json({
      success: true,
      orderId,
      amount: price,
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
