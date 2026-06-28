'use client';

import { useState } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';

interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  thumbnail_path: string;
}

interface StorefrontClientProps {
  courses: Course[];
  purchasedCourseIds: number[];
  isAuthenticated: boolean;
}

export default function StorefrontClient({ courses, purchasedCourseIds, isAuthenticated }: StorefrontClientProps) {
  const router = useRouter();
  const [loadingCourseId, setLoadingCourseId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleEnroll = async (courseId: number) => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/courses`);
      return;
    }

    setLoadingCourseId(courseId);
    setErrorMsg(null);

    try {
      // Create Razorpay Order
      const res = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      });

      const orderData = await res.json();

      if (!res.ok || !orderData.success) {
        throw new Error(orderData.error || 'Failed to initiate order.');
      }

      // Configure Razorpay Options
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Photography Academy',
        description: 'Recorded Lecture Access',
        order_id: orderData.orderId,
        handler: async function (response: any) {
          // Verify payment on backend manually (simulation or webhook check)
          // Since webhooks verify database, we can poll or simply redirect to verify completion.
          // In Razorpay, the client handler returns payment_id, order_id, signature.
          // Let's call verify endpoint to instantly update purchase state and redirect!
          try {
            const verifyRes = await fetch('/api/checkout/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            if (verifyRes.ok) {
              router.push(`/courses/${courseId}`);
              router.refresh();
            } else {
              setErrorMsg('Payment verification failed. Please contact support.');
            }
          } catch (err) {
            setErrorMsg('Payment succeeded but verification timed out. Refresh the page to check access.');
          }
        },
        prefill: {
          name: 'Student Name',
          email: 'student@example.com',
        },
        theme: {
          color: '#d4af37',
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (err: any) {
      setErrorMsg(err.message || 'Payment server currently unavailable.');
    } finally {
      setLoadingCourseId(null);
    }
  };

  return (
    <div>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      {errorMsg && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid var(--danger-color)',
          color: '#fca5a5',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '30px',
          fontSize: '14px',
          textAlign: 'center'
        }}>
          {errorMsg}
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: '30px'
      }}>
        {courses.map((course) => {
          const isPurchased = purchasedCourseIds.includes(course.id);
          const priceInINR = (course.price / 100).toLocaleString('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
          });

          return (
            <div
              key={course.id}
              id={`course-card-${course.id}`}
              className="glass-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '24px'
              }}
            >
              <div>
                {/* Visual Thumbnail */}
                <div style={{
                  width: '100%',
                  aspectRatio: '16/9',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #151518 0%, #070709 100%)',
                  marginBottom: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.03)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '36px',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  🎬
                  {/* Subtle Badge */}
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: 'rgba(10, 10, 12, 0.7)',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'var(--text-secondary)'
                  }}>
                    Recorded Video
                  </span>
                </div>

                <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#fff', marginBottom: '10px' }}>{course.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5, marginBottom: '24px' }}>
                  {course.description}
                </p>
              </div>

              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                  paddingTop: '20px',
                  marginBottom: '20px'
                }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Pricing:</span>
                  <span style={{ fontSize: '22px', fontWeight: 700, color: 'var(--accent-gold)' }}>
                    {isPurchased ? 'Unlocked' : priceInINR}
                  </span>
                </div>

                {isPurchased ? (
                  <a
                    id={`watch-course-btn-${course.id}`}
                    href={`/courses/${course.id}`}
                    style={{
                      background: 'transparent',
                      border: '1px solid var(--accent-gold)',
                      color: 'var(--accent-gold)',
                      textAlign: 'center',
                      padding: '12px',
                      borderRadius: '8px',
                      fontWeight: 600,
                      display: 'block',
                      width: '100%',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    Watch Lectures
                  </a>
                ) : (
                  <button
                    id={`enroll-course-btn-${course.id}`}
                    onClick={() => handleEnroll(course.id)}
                    disabled={loadingCourseId === course.id}
                    style={{
                      background: 'var(--accent-gold)',
                      color: '#000',
                      border: 'none',
                      padding: '12px',
                      borderRadius: '8px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      width: '100%',
                      transition: 'background-color 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--accent-gold-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--accent-gold)';
                    }}
                  >
                    {loadingCourseId === course.id ? 'Loading Checkout...' : 'Enroll Now'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
