// File: src/app/not-found.tsx
export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#04080f',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif',
      color: '#f5f0e8',
    }}>
      <div style={{
        fontSize: '6rem',
        fontWeight: 900,
        background: 'linear-gradient(135deg, #ff6b1a, #00c2a8)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        lineHeight: 1,
        marginBottom: '16px',
      }}>
        404
      </div>
      <p style={{ fontSize: '1.2rem', color: '#7a90a8', marginBottom: '32px' }}>
        Page not found
      </p>
      <a href="/" style={{
        padding: '12px 32px',
        background: '#ff6b1a',
        color: '#04080f',
        fontWeight: 700,
        textDecoration: 'none',
        fontSize: '0.9rem',
      }}>
        Go Home →
      </a>
    </div>
  )
}
