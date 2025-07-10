// global-error.tsx
"use client";

export default function GlobalError({
                                      error,
                                      reset
                                    }: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Log error details for development/monitoring
  if (process.env.NODE_ENV === 'development') {
    console.error('Global error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error digest:', error.digest);
  } else {
    // In production, log minimal info for monitoring
    console.error('Application error occurred:', {
      message: error.message,
      digest: error.digest,
      timestamp: new Date().toISOString()
    });
  }

  // Report to error monitoring service (optional)
  // if (typeof window !== 'undefined') {
  //   // Send to your error tracking service like Sentry, LogRocket, etc.
  // }

  return (
    <html>
    <body>
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: '#f9fafb',
      color: '#374151'
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '500px'
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '16px',
          color: '#dc2626'
        }}>
          เกิดข้อผิดพลาด
        </h1>

        <p style={{
          fontSize: '16px',
          marginBottom: '24px',
          lineHeight: '1.5'
        }}>
          ขออภัย เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง หากปัญหายังคงอยู่ กรุณาติดต่อทีมสนับสนุน
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={reset}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
          >
            ลองใหม่
          </button>

          <button
            onClick={() => window.location.href = '/'}
            style={{
              backgroundColor: '#6b7280',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6b7280'}
          >
            กลับหน้าหลัก
          </button>
        </div>

        {/* Show error details only in development */}
        {process.env.NODE_ENV === 'development' && (
          <details style={{
            marginTop: '32px',
            padding: '16px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            textAlign: 'left'
          }}>
            <summary style={{
              cursor: 'pointer',
              fontWeight: '500',
              color: '#dc2626',
              marginBottom: '8px'
            }}>
              Developer Information
            </summary>
            <pre style={{
              fontSize: '12px',
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              color: '#7f1d1d'
            }}>
                  {error.stack || error.message}
              {error.digest && `\n\nDigest: ${error.digest}`}
                </pre>
          </details>
        )}
      </div>
    </div>
    </body>
    </html>
  );
}