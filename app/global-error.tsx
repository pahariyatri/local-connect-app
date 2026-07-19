'use client';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1 style={{ color: '#dc2626', fontSize: '1.5rem', fontWeight: 'bold' }}>Something went wrong</h1>
      <p style={{ margin: '1rem 0', color: '#4b5563' }}>{error.message}</p>
      <button 
        onClick={reset}
        style={{ padding: '0.5rem 1rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}
      >
        Try Again
      </button>
    </div>
  );
}
