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
  pay_now_enabled?: boolean;
}

interface Material {
  id: number;
  title: string;
  description: string;
  price: number;
  file_url: string;
  whatsapp_enabled: boolean;
  online_enabled: boolean;
}

interface StorefrontClientProps {
  courses: Course[];
  purchasedCourseIds: number[];
  isAuthenticated: boolean;
  whatsappNumber: string;
  ratings?: Record<string, Record<string, number>>;
  materials?: Material[];
  purchasedMaterialIds?: number[];
}

export default function StorefrontClient({ 
  courses, 
  purchasedCourseIds, 
  isAuthenticated, 
  whatsappNumber, 
  ratings = {}, 
  materials = [], 
  purchasedMaterialIds = [] 
}: StorefrontClientProps) {
  const router = useRouter();
  const [loadingCourseId, setLoadingCourseId] = useState<number | null>(null);
  const [loadingMaterialId, setLoadingMaterialId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const getRatingStats = (courseId: number) => {
    const courseRatings = ratings[String(courseId)] || {};
    const entries = Object.values(courseRatings);
    if (entries.length === 0) return null;
    const sum = entries.reduce((acc, r) => acc + r, 0);
    const average = Math.round((sum / entries.length) * 10) / 10;
    return { average, count: entries.length };
  };

  const handleEnrollMaterial = async (materialId: number) => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/courses`);
      return;
    }

    setLoadingMaterialId(materialId);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ materialId }),
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
        description: 'Material & Template Access',
        order_id: orderData.orderId,
        handler: async function (response: any) {
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
      setLoadingMaterialId(null);
    }
  };

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

      {/* Section 1: Recorded Masterclasses */}
      <section id="recorded-courses-storefront" style={{ marginBottom: '80px' }}>
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '28px', fontFamily: 'var(--font-serif)' }} className="gradient-text">🎬 Recorded Masterclasses</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginTop: '6px' }}>Self-paced learning lectures with life-time stream access.</p>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          justifyContent: 'center',
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
                    background: course.thumbnail_path ? `url(${course.thumbnail_path}) center/cover no-repeat` : 'linear-gradient(135deg, #151518 0%, #070709 100%)',
                    marginBottom: '20px',
                    border: '1px solid rgba(255, 255, 255, 0.03)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '36px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    {!course.thumbnail_path && '🎬'}
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

                  <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>{course.title}</h3>
                  
                  {/* Star rating metric */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px', fontSize: '13px', color: 'var(--accent-gold)' }}>
                    {(() => {
                      const stats = getRatingStats(course.id);
                      if (stats) {
                        return (
                          <>
                            <span>★ {stats.average.toFixed(1)}</span>
                            <span style={{ color: 'var(--text-secondary)' }}>({stats.count} {stats.count === 1 ? 'rating' : 'ratings'})</span>
                          </>
                        );
                      }
                      return <span style={{ color: 'var(--text-secondary)' }}>★ No ratings yet</span>;
                    })()}
                  </div>

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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {course.pay_now_enabled !== false && (
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
                      <a
                        id={`wa-buy-course-btn-${course.id}`}
                        href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi Ramclicks, I would like to purchase the recorded course "${course.title}" for ₹${(course.price / 100).toFixed(2)}. Please share details on how to make the payment and access the lectures.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          background: 'rgba(37, 211, 102, 0.08)',
                          border: '1px solid #25D366',
                          color: '#25D366',
                          textAlign: 'center',
                          padding: '10px',
                          borderRadius: '8px',
                          fontWeight: 600,
                          fontSize: '13px',
                          display: 'block',
                          width: '100%',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#25D366';
                          e.currentTarget.style.color = '#fff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(37, 211, 102, 0.08)';
                          e.currentTarget.style.color = '#25D366';
                        }}
                      >
                        💬 Buy via WhatsApp
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 2: Materials & Templates */}
      <section id="materials-storefront" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '60px' }}>
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '28px', fontFamily: 'var(--font-serif)' }} className="gradient-text">📦 Materials & Templates</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginTop: '6px' }}>Premium assets, tone curves, and Lightroom presets to speed up your production flow.</p>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          justifyContent: 'center',
          gap: '30px'
        }}>
          {materials.length > 0 ? (
            materials.map((material) => {
              const isPurchased = purchasedMaterialIds.includes(material.id);
              const priceInINR = (material.price / 100).toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0
              });

              return (
                <div
                  key={material.id}
                  id={`material-card-${material.id}`}
                  className="glass-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '24px'
                  }}
                >
                  <div>
                    {/* Visual Icon Box */}
                    <div style={{
                      width: '100%',
                      aspectRatio: '16/9',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #2b1f4d 0%, #0c091f 100%)',
                      marginBottom: '20px',
                      border: '1px solid rgba(139, 92, 246, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '48px',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      📦
                      {/* Subtle Badge */}
                      <span style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        background: 'rgba(139, 92, 246, 0.25)',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        border: '1px solid rgba(139, 92, 246, 0.4)',
                        color: '#c084fc',
                        fontWeight: 600
                      }}>
                        Asset Template
                      </span>
                    </div>

                    <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#fff', marginBottom: '10px' }}>{material.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5, marginBottom: '24px' }}>
                      {material.description}
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
                        id={`download-material-btn-${material.id}`}
                        href={material.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          background: 'linear-gradient(135deg, var(--success-color) 0%, #059669 100%)',
                          color: '#fff',
                          textAlign: 'center',
                          padding: '12px',
                          borderRadius: '8px',
                          fontWeight: 600,
                          display: 'block',
                          width: '100%',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 4px 15px rgba(52, 211, 153, 0.25)'
                        }}
                      >
                        📥 Download from Google Drive
                      </a>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {material.online_enabled && (
                          <button
                            id={`enroll-material-btn-${material.id}`}
                            onClick={() => handleEnrollMaterial(material.id)}
                            disabled={loadingMaterialId === material.id}
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
                            {loadingMaterialId === material.id ? 'Loading Checkout...' : 'Pay Now'}
                          </button>
                        )}
                        
                        <a
                          id={`wa-buy-material-btn-${material.id}`}
                          href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi Ramclicks, I would like to purchase the template asset "${material.title}" for ₹${(material.price / 100).toFixed(2)}. Please share details on how to make the payment and access the Google Drive files.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            background: 'rgba(37, 211, 102, 0.08)',
                            border: '1px solid #25D366',
                            color: '#25D366',
                            textAlign: 'center',
                            padding: '10px',
                            borderRadius: '8px',
                            fontWeight: 600,
                            fontSize: '13px',
                            display: 'block',
                            width: '100%',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#25D366';
                            e.currentTarget.style.color = '#fff';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(37, 211, 102, 0.08)';
                            e.currentTarget.style.color = '#25D366';
                          }}
                        >
                          💬 Buy via WhatsApp
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 0' }}>
              <span style={{ fontSize: '48px' }}>📂</span>
              <p style={{ color: 'var(--text-secondary)', marginTop: '20px' }}>No materials or templates are currently available for purchase.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
