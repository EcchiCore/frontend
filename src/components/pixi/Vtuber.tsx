"use client";

import React, { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

interface ModelInfo {
  width: number;
  height: number;
  modelName: string;
  type: string;
}

const VtuberPixi = ({
  modelUrl = "https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/assets/haru/haru_greeter_t03.model3.json",
  width = 800,
  height = 600,
  backgroundColor = 0x1a1a2e,
  scale = 0.3,
  showUI = true,
  autoInteract = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [scriptsLoaded, setScriptsLoaded] = useState({
    cubism2: false,
    cubism4: false,
  });

  // Determine model type from URL
  const isCubism4 = modelUrl.includes('.model3.json');
  const isCubism2 = modelUrl.includes('.model.json') && !isCubism4;

  useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined') return;

    // Check if we need to wait for scripts
    const needsCubism2 = isCubism2 && !scriptsLoaded.cubism2;
    const needsCubism4 = isCubism4 && !scriptsLoaded.cubism4;

    if (needsCubism2 || needsCubism4) {
      return; // Wait for scripts to load
    }

    let app: any = null;
    let model: any = null;
    let destroyed = false;

    const initLive2D = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Import PIXI
        const PIXI = await import('pixi.js');
        window.PIXI = PIXI;

        // Import Live2D display
        const live2d = await import('pixi-live2d-display');

        // Register Cubism 4 if needed
        if (isCubism4 && window.PIXI.live2d) {
          // Cubism 4 core should be loaded via script tag
          if (window.Live2DCubismCore) {
            window.PIXI.live2d.Live2DModel.registerTicker(PIXI.Ticker);
          }
        }

        if (destroyed) return;

        // Create canvas
        const canvas = document.createElement('canvas');
        if (!containerRef.current) return;
        containerRef.current.appendChild(canvas);

        // Create PIXI app
        app = new PIXI.Application({
          view: canvas,
          width,
          height,
          backgroundColor,
          antialias: true,
          resolution: window.devicePixelRatio || 1,
          autoDensity: true,
        });

        // Load model
        model = await live2d.Live2DModel.from(modelUrl, {
          autoInteract: autoInteract,
        });

        if (destroyed) {
          model.destroy();
          return;
        }

        app.stage.addChild(model);

        // Position model
        model.anchor.set(0.5, 0.5);
        model.scale.set(scale);
        model.position.set(width / 2, height / 2);

        // Make interactive
        model.interactive = true;
        model.cursor = 'pointer';

        // Model info
        const info = {
          width: model.width,
          height: model.height,
          modelName: model.internalModel?.settings?.name || 'Live2D Model',
          type: isCubism4 ? 'Cubism 4' : 'Cubism 2',
        };
        setModelInfo(info);

        // Mouse tracking
        let mouseX = width / 2;
        let mouseY = height / 2;

        canvas.addEventListener('mousemove', (e) => {
          const rect = canvas.getBoundingClientRect();
          mouseX = e.clientX - rect.left;
          mouseY = e.clientY - rect.top;
        });

        // Update focus
        app.ticker.add(() => {
          if (model && !destroyed) {
            model.focus(mouseX, mouseY);
          }
        });

        // Click to play motion
        model.on('pointerdown', () => {
          try {
            if (model.internalModel?.motionManager) {
              const groups = Object.keys(model.internalModel.motionManager.definitions);
              if (groups.length > 0) {
                const group = groups[Math.floor(Math.random() * groups.length)];
                model.motion(group);
              }
            }
          } catch (e) {
            console.warn('Motion play failed:', e);
          }
        });

        setIsLoading(false);

      } catch (err) {
        console.error('Failed to initialize Live2D:', err);
        if (err instanceof Error) {
          setError(err.message || 'Failed to load model');
        } else {
          setError('Failed to load model');
        }
        setIsLoading(false);
      }
    };

    initLive2D();

    return () => {
      destroyed = true;
      if (model) {
        try {
          model.destroy({ children: true });
        } catch (e) {
          console.warn('Model destroy error:', e);
        }
      }
      if (app) {
        try {
          app.destroy(true, { children: true });
        } catch (e) {
          console.warn('App destroy error:', e);
        }
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [modelUrl, width, height, backgroundColor, scale, autoInteract, scriptsLoaded, isCubism2, isCubism4]);

  if (!showUI) {
    return (
      <>
        {/* Load Cubism 2 runtime if needed */}
        {isCubism2 && (
          <Script
            src="https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js"
            onLoad={() => setScriptsLoaded(prev => ({ ...prev, cubism2: true }))}
            strategy="afterInteractive"
          />
        )}

        {/* Load Cubism 4 core if needed */}
        {isCubism4 && (
          <Script
            src="https://cdn.jsdelivr.net/gh/dylanNew/live2d/webgl/Live2D/lib/live2d.min.js"
            onLoad={() => setScriptsLoaded(prev => ({ ...prev, cubism4: true }))}
            strategy="afterInteractive"
          />
        )}

        <div ref={containerRef} className="relative" style={{ width, height }}>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="text-white">Loading...</div>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-900">
              <div className="text-white text-center p-4 text-sm">{error}</div>
            </div>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      {/* Load Cubism 2 runtime */}
      {isCubism2 && (
        <Script
          src="https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js"
          onLoad={() => {
            console.log('Cubism 2 loaded');
            setScriptsLoaded(prev => ({ ...prev, cubism2: true }));
          }}
          onError={(e) => {
            console.error('Failed to load Cubism 2:', e);
            setError('Failed to load Cubism 2 runtime');
          }}
          strategy="afterInteractive"
        />
      )}

      {/* Load Cubism 4 core */}
      {isCubism4 && (
        <Script
          src="https://cdn.jsdelivr.net/npm/live2dcubismcore@4.0.0/live2dcubismcore.min.js"
          onLoad={() => {
            console.log('Cubism 4 loaded');
            setScriptsLoaded(prev => ({ ...prev, cubism4: true }));
          }}
          onError={(e) => {
            console.error('Failed to load Cubism 4:', e);
            setError('Failed to load Cubism 4 runtime');
          }}
          strategy="afterInteractive"
        />
      )}

      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-4">
        <div className="bg-gray-800 rounded-lg shadow-2xl p-6 mb-4">
          <h1 className="text-3xl font-bold text-white mb-2 text-center">
            Live2D VTuber Character
          </h1>
          <p className="text-gray-400 text-center mb-4">
            {isLoading ? 'Loading model...' : 'Move mouse to interact • Click character'}
          </p>

          <div
            ref={containerRef}
            className="relative rounded-lg overflow-hidden shadow-lg border-4 border-purple-500/30"
            style={{ width, height }}
          >
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-95 z-10">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <div className="text-white">Loading Live2D Model...</div>
                  <div className="text-gray-400 text-xs mt-2">
                    {isCubism4 ? 'Cubism 4' : 'Cubism 2'}
                  </div>
                </div>
              </div>
            )}
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-900 bg-opacity-95 z-10">
                <div className="text-white text-center p-4">
                  <p className="font-bold mb-2">❌ Error</p>
                  <p className="text-sm mb-3">{error}</p>
                  <p className="text-xs text-gray-300">
                    Check console for details
                  </p>
                </div>
              </div>
            )}
          </div>

          {modelInfo && (
            <div className="mt-4 p-3 bg-gray-700 rounded text-sm text-gray-300">
              <p className="font-semibold text-purple-400 mb-1">✅ Model Loaded</p>
              <p>Type: {modelInfo.type}</p>
              <p>Name: {modelInfo.modelName}</p>
              <p>Size: {Math.round(modelInfo.width)} x {Math.round(modelInfo.height)}px</p>
            </div>
          )}
        </div>

        <div className="bg-gray-800 rounded-lg shadow-xl p-4 max-w-md w-full">
          <h2 className="text-lg font-semibold text-purple-400 mb-2">🎮 Features</h2>
          <ul className="text-gray-300 text-sm space-y-1 mb-4">
            <li>✨ Cubism 2 & 4 support</li>
            <li>👁️ Eye tracking</li>
            <li>💬 Click for animations</li>
            <li>🎭 Interactive areas</li>
          </ul>

          <div className="p-3 bg-gray-700 rounded text-xs text-gray-300">
            <p className="font-semibold mb-2">📦 Install:</p>
            <code className="block bg-gray-900 p-2 rounded">
              bun add pixi.js pixi-live2d-display
            </code>
          </div>
        </div>
      </div>
    </>
  );
};

export default VtuberPixi;