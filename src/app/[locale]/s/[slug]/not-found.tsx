// app/[locale]/s/[slug]/not-found.tsx
"use client";
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="error-container">
      <div className="error-content">
        <h1>🔗 Link Not Found</h1>
        <p>The requested shortlink could not be found or has expired.</p>
        <div className="actions">
          <Link href="/" className="home-btn">
            Go Home
          </Link>
        </div>
      </div>

      <style jsx>{`
        .error-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          padding: 1rem;
        }

        .error-content {
          text-align: center;
          background: white;
          padding: 3rem 2rem;
          border-radius: 15px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          max-width: 500px;
          width: 100%;
        }

        .error-content h1 {
          color: #333;
          margin: 0 0 1rem 0;
          font-size: 2.5rem;
        }

        .error-content p {
          color: #666;
          margin: 0 0 2rem 0;
          font-size: 1.1rem;
          line-height: 1.6;
        }

        .actions {
          margin-top: 2rem;
        }

        .home-btn {
          background: #667eea;
          color: white;
          text-decoration: none;
          padding: 1rem 2rem;
          border-radius: 10px;
          font-size: 1.1rem;
          display: inline-block;
          transition: all 0.3s ease;
        }

        .home-btn:hover {
          background: #5a67d8;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }

        @media (max-width: 480px) {
          .error-content {
            padding: 2rem 1.5rem;
          }
          
          .error-content h1 {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
}