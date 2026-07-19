export default function NotFound() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', padding: '1rem', textAlign: 'center' }}>
      <h1 style={{ color: '#dc2626', fontSize: '2rem', fontWeight: 'bold' }}>404 - Page Not Found</h1>
      <p style={{ marginTop: '1rem', color: '#4b5563' }}>Sorry, the page you are looking for does not exist.</p>
      <a href="/" style={{ marginTop: '1.5rem', padding: '0.75rem 1.5rem', backgroundColor: '#3b82f6', color: 'white', borderRadius: '0.5rem', textDecoration: 'none' }}>
        Go to Homepage
      </a>
    </div>
  );
}
