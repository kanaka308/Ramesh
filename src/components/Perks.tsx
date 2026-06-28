import React from 'react';

interface Perk {
  id: string;
  icon: string;
  title: string;
  description: string;
}

const perksData: Perk[] = [
  {
    id: 'perk-stay',
    icon: '🏡',
    title: 'Free Accommodation Included',
    description: 'Stay in our modern student housing in Vijayapur for the entire 30 days at zero extra cost. Safe, secure, and right next to the studio.'
  },
  {
    id: 'perk-food',
    icon: '🍲',
    title: 'Home-Cooked Meals Provided',
    description: 'We take care of your breakfast, lunch, and dinner. Healthy, fresh, local North Karnataka style food served daily.'
  },
  {
    id: 'perk-equipment',
    icon: '🎥',
    title: 'Camera & Editing Rigs Provided',
    description: 'No gear? No problem. Access professional mirrorless cameras, prime cinema lenses, and high-end video editing workstations in the studio.'
  }
];

export default function Perks() {
  return (
    <section id="perks-section" style={{
      padding: '80px 5%',
      background: 'linear-gradient(180deg, #0a0a0c 0%, #111115 100%)',
      borderTop: '1px solid rgba(255, 255, 255, 0.02)'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <p style={{ color: 'var(--accent-gold)', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '13px', fontWeight: 600 }}>Unmatched Student Support</p>
        <h2 style={{ fontSize: '36px', marginTop: '10px', fontFamily: 'var(--font-serif)' }} className="gradient-text">Complete Learning Environment</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '15px auto 0 auto', fontSize: '16px' }}>
          We remove all logistical friction so you can focus entirely on mastering your visual craft.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '30px'
      }}>
        {perksData.map((perk) => (
          <div
            key={perk.id}
            id={perk.id}
            className="glass-card"
            style={{
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px 30px'
            }}
          >
            <div style={{
              fontSize: '48px',
              marginBottom: '20px',
              width: '90px',
              height: '90px',
              background: 'rgba(212, 175, 55, 0.05)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(212, 175, 55, 0.1)'
            }}>
              {perk.icon}
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '15px', color: '#fff' }}>{perk.title}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>{perk.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
