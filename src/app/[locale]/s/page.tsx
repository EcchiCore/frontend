// app/[locale]/s/page.tsx
import React from 'react';
import Link from 'next/link';
import './spage.css'; // Import CSS file

interface Stats {
  totalClicks: number;
  uniqueCountries: string[];
  topCountries: [string, number][];
  adNetworkStats: [string, number][];
}

// Server-side function to fetch stats
async function getStats(): Promise<Stats | null> {
  try {
    const API_BASE_URL = process.env.API_URL || 'http://localhost:3001';
    const response = await fetch(`${API_BASE_URL}/api/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(`Failed to fetch stats: ${response.status}`);
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching stats:', error);
    return null;
  }
}

// Server Component (SSR by default)
const SPage = async () => {
  // Fetch data on server
  const stats = await getStats();

  const testLinks = [
    { slug: 'example1', description: 'Google (Test Link)' },
    { slug: 'github', description: 'GitHub (Test Link)' },
    { slug: 'youtube', description: 'YouTube (Test Link)' },
  ];

  return (
    <div className="home-container">
      <header className="header">
        <div className="container">
          <h1>🔗 ShortLink</h1>
          <p className="tagline">Monetized URL Shortener with Smart Geo-Targeting</p>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <section className="hero">
            <h2>Transform Your Links into Revenue</h2>
            <p>
              Advanced URL shortener with intelligent geo-targeting,
              multiple ad networks, and real-time analytics.
            </p>
          </section>

          <section className="test-section">
            <h3>🧪 Test the System</h3>
            <div className="test-links">
              {testLinks.map((link) => (
                <div key={link.slug} className="test-link-card">
                  <div className="link-info">
                    <strong>/s/{link.slug}</strong>
                    <span>{link.description}</span>
                  </div>
                  <Link href={`/s/${link.slug}`} className="test-btn">
                    Test Link →
                  </Link>
                </div>
              ))}
            </div>
          </section>

          <section className="stats-section">
            <h3>📊 Live Statistics</h3>
            {stats ? (
              <div className="stats-grid">
                <div className="stat-card">
                  <h4>Total Clicks</h4>
                  <div className="stat-number">{stats.totalClicks}</div>
                </div>

                <div className="stat-card">
                  <h4>Countries</h4>
                  <div className="stat-number">{stats.uniqueCountries.length}</div>
                </div>

                <div className="stat-card">
                  <h4>Top Countries</h4>
                  <div className="stat-list">
                    {stats.topCountries.slice(0, 3).map(([country, count]) => (
                      <div key={country} className="stat-item">
                        {country}: {count}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="stat-card">
                  <h4>Ad Networks</h4>
                  <div className="stat-list">
                    {stats.adNetworkStats.map(([network, count]) => (
                      <div key={network} className="stat-item">
                        {network}: {count}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="error">Failed to load statistics</div>
            )}
          </section>

          <section className="features-section">
            <h3>✨ Features</h3>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🌍</div>
                <h4>Geo-Targeting</h4>
                <p>Automatically detects user location and serves relevant ads</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">💰</div>
                <h4>Multiple Ad Networks</h4>
                <p>PropellerAds, CPAlead, PopAds, and more</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">⚡</div>
                <h4>Fast & Reliable</h4>
                <p>Built with Next.js and NestJS for optimal performance</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">📈</div>
                <h4>Real-time Analytics</h4>
                <p>Track clicks, countries, and ad performance</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2025 ShortLink. Built with Next.js & NestJS.</p>
        </div>
      </footer>
    </div>
  );
};

export default SPage;