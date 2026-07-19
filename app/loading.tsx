export default function Loading() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ 
        width: '3rem', 
        height: '3rem', 
        border: '2px solid #3b82f6', 
        borderTopColor: 'transparent', 
        borderRadius: '50%', 
        animation: 'spin 1s linear infinite' 
      }}></div>
    </div>
  );
}
