'use client'
// File: src/app/error.tsx
export default function Error({
  reset,
}: {
  error: Error
  reset: () => void
}) {
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
        500
      </div>
      <p style={{ fontSize: '1.2rem', color: '#7a90a8', marginBottom: '32px' }}>
        Something went wrong
      </p>
      <button
        onClick={reset}
        style={{
          padding: '12px 32px',
          background: '#ff6b1a',
          color: '#04080f',
          fontWeight: 700,
          border: 'none',
          cursor: 'pointer',
          fontSize: '0.9rem',
        }}
      >
        Try Again →
      </button>
    </div>
  )
}
