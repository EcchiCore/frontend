"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ShortlinkPageProps, AdNetworkType } from '../types/shortlink';

const ShortlinkClient: React.FC<ShortlinkPageProps> = ({
                                                         redirectData,
                                                         error
                                                       }) => {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(redirectData?.timerDuration || 5);
  const [adLoaded, setAdLoaded] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const loadAdNetwork = useCallback((adNetwork: any) => {
    try {
      switch (adNetwork.type) {
        case AdNetworkType.POPUNDER:
          loadPopunderAd(adNetwork);
          break;
        case AdNetworkType.SMARTLINK:
          setAdLoaded(true);
          break;
        case AdNetworkType.INTERSTITIAL:
          loadInterstitialAd(adNetwork);
          break;
        default:
          setAdLoaded(true);
      }
    } catch (err) {
      console.error('Error loading ad network:', err);
      setAdLoaded(true);
    }
  }, []); // Empty deps since loadPopunderAd and loadInterstitialAd are defined within the component

  const handleRedirect = useCallback(() => {
    if (isRedirecting) return;

    setIsRedirecting(true);

    if (redirectData?.adNetwork.type === AdNetworkType.SMARTLINK) {
      const smartlinkUrl = redirectData.adNetwork.config.redirectUrl;
      if (smartlinkUrl) {
        window.location.href = `${smartlinkUrl}&url=${encodeURIComponent(redirectData.destinationUrl)}`;
        return;
      }
    }

    window.location.href = redirectData.destinationUrl;
  }, [isRedirecting, redirectData]);

  const loadPopunderAd = (adNetwork: any) => {
    try {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.innerHTML = adNetwork.config.script || '';
      document.body.appendChild(script);

      setAdLoaded(true);
      console.log(`${adNetwork.name} popunder loaded`);
    } catch (err) {
      console.error('Error loading popunder ad:', err);
      setAdLoaded(true);
    }
  };

  const loadInterstitialAd = (adNetwork: any) => {
    try {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.innerHTML = adNetwork.config.script || '';
      document.body.appendChild(script);

      setTimeout(() => {
        if (typeof (window as any).interstitialAd !== 'undefined') {
          (window as any).interstitialAd.show();
        }
      }, 1000);

      setAdLoaded(true);
      console.log(`${adNetwork.name} interstitial loaded`);
    } catch (err) {
      console.error('Error loading interstitial ad:', err);
      setAdLoaded(true);
    }
  };

  const handleSkip = () => {
    if (timeLeft <= 1) {
      handleRedirect();
    }
  };

  useEffect(() => {
    if (error || !redirectData?.success) {
      return;
    }

    loadAdNetwork(redirectData.adNetwork);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleRedirect();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [error, redirectData, handleRedirect, loadAdNetwork]);

  // Error state
  if (error || !redirectData?.success) {
    return (
      <div className="error-container">
        <div className="error-content">
          <h1>🔗 Link Not Found</h1>
          <p>{error || redirectData?.message || 'The requested link could not be found.'}</p>
          <button onClick={() => router.push('/')}>
            Go Home
          </button>
        </div>

        <style jsx>{`
            .error-container {
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            .error-content {
                text-align: center;
                background: white;
                padding: 2rem;
                border-radius: 10px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                max-width: 400px;
            }
            .error-content h1 {
                color: #333;
                margin-bottom: 1rem;
            }
            .error-content p {
                color: #666;
                margin-bottom: 1.5rem;
            }
            .error-content button {
                background: #667eea;
                color: white;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 5px;
                cursor: pointer;
                font-size: 1rem;
            }
            .error-content button:hover {
                background: #5a67d8;
            }
        `}</style>
      </div>
    );
  }

  return (
    <div className="shortlink-container">
      <div className="content">
        <div className="redirect-card">
          <div className="header">
            <h1>🔗 ShortLink</h1>
            <p className="subtitle">Preparing your link...</p>
          </div>

          <div className="timer-section">
            <div className="timer-circle">
              <span className="timer-number">{timeLeft}</span>
            </div>
            <p className="timer-text">
              {timeLeft > 0 ? `Redirecting in ${timeLeft} seconds...` : 'Redirecting now...'}
            </p>
          </div>

          <div className="link-info">
            <p className="destination">
              <strong>Destination:</strong> {redirectData.destinationUrl}
            </p>
            <p className="details">
              <span>Country: {redirectData.country}</span>
              <span>Ad Network: {redirectData.adNetwork.name}</span>
            </p>
          </div>

          <div className="actions">
            <button
              className={`skip-btn ${timeLeft <= 1 ? 'active' : 'disabled'}`}
              onClick={handleSkip}
              disabled={timeLeft > 1}
            >
              {timeLeft <= 1 ? 'Continue →' : `Wait ${timeLeft}s`}
            </button>
          </div>

          <div className="ad-status">
            <small className={`ad-indicator ${adLoaded ? 'loaded' : 'loading'}`}>
              Ad Status: {adLoaded ? '✓ Loaded' : '⏳ Loading...'}
            </small>
          </div>
        </div>

        {/* Ad placeholder for interstitial */}
        <div id="ad-container" className="ad-container">
          {/* Ads will be loaded here by the ad networks */}
        </div>
      </div>

      <style jsx>{`
          .shortlink-container {
              min-height: 100vh;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              display: flex;
              align-items: center;
              justify-content: center;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              padding: 1rem;
          }

          .content {
              width: 100%;
              max-width: 500px;
          }

          .redirect-card {
              background: white;
              border-radius: 15px;
              padding: 2rem;
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              text-align: center;
          }

          .header h1 {
              color: #333;
              margin: 0 0 0.5rem 0;
              font-size: 2rem;
          }

          .subtitle {
              color: #666;
              margin: 0 0 2rem 0;
              font-size: 1rem;
          }

          .timer-section {
              margin: 2rem 0;
          }

          .timer-circle {
              width: 100px;
              height: 100px;
              border-radius: 50%;
              background: linear-gradient(135deg, #667eea, #764ba2);
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 1rem auto;
              animation: pulse 2s infinite;
          }

          .timer-number {
              color: white;
              font-size: 2.5rem;
              font-weight: bold;
          }

          .timer-text {
              color: #666;
              font-size: 1.1rem;
              margin: 0;
          }

          .link-info {
              background: #f8f9fa;
              border-radius: 10px;
              padding: 1.5rem;
              margin: 2rem 0;
              text-align: left;
          }

          .destination {
              margin: 0 0 1rem 0;
              word-break: break-all;
          }

          .details {
              display: flex;
              justify-content: space-between;
              margin: 0;
              font-size: 0.9rem;
              color: #666;
          }

          .actions {
              margin: 2rem 0 1rem 0;
          }

          .skip-btn {
              background: #667eea;
              color: white;
              border: none;
              padding: 1rem 2rem;
              border-radius: 10px;
              font-size: 1.1rem;
              cursor: pointer;
              transition: all 0.3s ease;
              width: 100%;
          }

          .skip-btn:hover:not(:disabled) {
              background: #5a67d8;
              transform: translateY(-2px);
          }

          .skip-btn.disabled {
              background: #ccc;
              cursor: not-allowed;
          }

          .skip-btn.active {
              background: #48bb78;
              animation: glow 1s infinite alternate;
          }

          .ad-status {
              margin-top: 1rem;
          }

          .ad-indicator {
              color: #666;
              font-size: 0.8rem;
          }

          .ad-indicator.loaded {
              color: #48bb78;
          }

          .ad-indicator.loading {
              color: #ed8936;
          }

          .ad-container {
              margin-top: 1rem;
              min-height: 50px;
          }

          @keyframes pulse {
              0% { box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.4); }
              70% { box-shadow: 0 0 0 20px rgba(102, 126, 234, 0); }
              100% { box-shadow: 0 0 0 0 rgba(102, 126, 234, 0); }
          }

          @keyframes glow {
              from { box-shadow: 0 0 5px #48bb78; }
              to { box-shadow: 0 0 20px #48bb78; }
          }

          @media (max-width: 480px) {
              .redirect-card {
                  padding: 1.5rem;
              }

              .timer-circle {
                  width: 80px;
                  height: 80px;
              }

              .timer-number {
                  font-size: 2rem;
              }

              .details {
                  flex-direction: column;
                  gap: 0.5rem;
              }
          }
      `}</style>
    </div>
  );
};

export default ShortlinkClient;