import React, { useState } from 'react';
import { BuildRender } from '@buildcores/render-client';
import './App.css';

// ===========================================
// 🔐 ADD YOUR API CREDENTIALS HERE
// ===========================================
const API_CONFIG = {
  environment: 'staging',  // or 'staging'
  authToken: 'test-token'  // Replace with your actual token
};
// ===========================================

// Build specifications for display
const buildSpecs = [
  { label: 'CPU', value: 'AMD Ryzen 7 9800X3D' },
  { label: 'GPU', value: 'ASUS GeForce RTX 5080 ASTRAL' },
  { label: 'RAM', value: 'PNY DDR5' },
  { label: 'Motherboard', value: 'Asus ROG STRIX X870E-E GAMING WIFI' },
  { label: 'PSU', value: 'LIAN LI 1300W' },
  { label: 'Storage', value: 'SAMSUNG 990 EVO' },
  { label: 'Case', value: 'MONTECH KING 95 PRO' },
  { label: 'CPU Cooler', value: 'ARCTIC LIQUID FREEZER 360' },
];

function App() {
  // Resolution controls
  const [width, setWidth] = useState(1024);
  const [height, setHeight] = useState(1024);
  const [useCustomResolution, setUseCustomResolution] = useState(false);
  
  // Quality profile control
  const [profile, setProfile] = useState('cinematic');
  
  // Track applied resolution (what's currently rendered)
  const [appliedWidth, setAppliedWidth] = useState(1024);
  const [appliedHeight, setAppliedHeight] = useState(1024);
  const [appliedCustomResolution, setAppliedCustomResolution] = useState(false);
  const [appliedProfile, setAppliedProfile] = useState('cinematic');
  const [renderKey, setRenderKey] = useState(0); // Force re-render by changing key

  // Check if settings have changed
  const hasChanges = useCustomResolution !== appliedCustomResolution || 
                     (useCustomResolution && (width !== appliedWidth || height !== appliedHeight)) ||
                     profile !== appliedProfile;

  // Apply new resolution and trigger re-render
  const handleRerender = () => {
    setAppliedWidth(width);
    setAppliedHeight(height);
    setAppliedCustomResolution(useCustomResolution);
    setAppliedProfile(profile);
    setRenderKey(prev => prev + 1); // Increment to force re-render
  };

  // Calculate display dimensions to match aspect ratio
  const calculateDisplaySize = () => {
    if (!appliedCustomResolution) {
      return { size: 500 }; // Default square size
    }

    // Max container size
    const maxWidth = 700;
    const maxHeight = 600;
    
    // Calculate aspect ratio
    const aspectRatio = appliedWidth / appliedHeight;
    
    let displayWidth, displayHeight;
    
    if (aspectRatio > 1) {
      // Landscape
      displayWidth = Math.min(maxWidth, appliedWidth);
      displayHeight = displayWidth / aspectRatio;
      
      if (displayHeight > maxHeight) {
        displayHeight = maxHeight;
        displayWidth = displayHeight * aspectRatio;
      }
    } else {
      // Portrait or square
      displayHeight = Math.min(maxHeight, appliedHeight);
      displayWidth = displayHeight * aspectRatio;
      
      if (displayWidth > maxWidth) {
        displayWidth = maxWidth;
        displayHeight = displayWidth / aspectRatio;
      }
    }
    
    return {
      width: Math.round(displayWidth),
      height: Math.round(displayHeight)
    };
  };

  const displaySize = calculateDisplaySize();

  // PC Build Configuration
  const parts = {
    parts: {
      CPU: ["7xjqsomhr"],              // AMD Ryzen 7 9800X3D
      GPU: ["z7pyphm9k"],              // ASUS GeForce RTX 5080 ASTRAL
      RAM: ["dpl1iyvb5"],              // PNY DDR5
      Motherboard: ["iwin2u9vx"],      // Asus ROG STRIX X870E-E GAMING WIFI
      PSU: ["m4kilv190"],              // LIAN LI 1300W
      Storage: ["0bkvs17po"],          // SAMSUNG 990 EVO
      PCCase: ["qq9jamk7c"],           // MONTECH KING 95 PRO
      CPUCooler: ["62d8zelr5"],        // ARCTIC LIQUID FREEZER 360
    },
    // Use applied resolution settings (not pending ones)
    ...(appliedCustomResolution ? { width: appliedWidth, height: appliedHeight } : {}),
    // Include quality profile
    profile: appliedProfile
  };

  return (
    <div className="App">
      <div className="container">
        <header className="header">
          <h1>BuildRender Demo</h1>
          <p className="subtitle">Interactive 360° PC Build Visualization</p>
        </header>

        {/* Resolution Controls */}
        <div className="resolution-controls">
          <div className="control-header">
            <h3>Resolution Settings</h3>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={useCustomResolution}
                onChange={(e) => setUseCustomResolution(e.target.checked)}
              />
              <span className="toggle-slider"></span>
              <span className="toggle-label">
                {useCustomResolution ? 'Custom Resolution' : 'Default Resolution'}
              </span>
            </label>
          </div>

          {useCustomResolution && (
            <div className="sliders-container">
              <div className="slider-group">
                <label htmlFor="width-slider">
                  Width: <span className="value">{width}px</span>
                </label>
                <input
                  id="width-slider"
                  type="range"
                  min="256"
                  max="2000"
                  step="8"
                  value={width}
                  onChange={(e) => setWidth(parseInt(e.target.value))}
                  className="slider"
                />
              </div>

              <div className="slider-group">
                <label htmlFor="height-slider">
                  Height: <span className="value">{height}px</span>
                </label>
                <input
                  id="height-slider"
                  type="range"
                  min="256"
                  max="2000"
                  step="8"
                  value={height}
                  onChange={(e) => setHeight(parseInt(e.target.value))}
                  className="slider"
                />
              </div>

              <div className="preset-buttons">
                <button onClick={() => { setWidth(1024); setHeight(1024); }}>1024×1024</button>
                <button onClick={() => { setWidth(1920); setHeight(1080); }}>1920×1080 (HD)</button>
                <button onClick={() => { setWidth(1280); setHeight(720); }}>1280×720</button>
              </div>
            </div>
          )}
        </div>

        {/* Quality Profile Controls */}
        <div className="resolution-controls">
          <div className="control-header">
            <h3>Quality Profile</h3>
          </div>
          
          <div className="quality-select-container">
            <select 
              value={profile} 
              onChange={(e) => setProfile(e.target.value)}
              className="quality-select"
            >
              <option value="cinematic">Cinematic - All effects (shadows, AO, bloom)</option>
              <option value="flat">Flat - No effects, clean product shots</option>
              <option value="fast">Fast - Minimal rendering, fastest speed</option>
            </select>
          </div>
        </div>

        {hasChanges && (
          <div className="rerender-button-container">
            <button className="rerender-button" onClick={handleRerender}>
              Re-render with New Settings
            </button>
          </div>
        )}

        <div className="demo-section">
          <div className="demo-wrapper">
            <BuildRender
              key={renderKey}
              parts={parts}
              {...displaySize}
              mouseSensitivity={0.2}
              touchSensitivity={0.2}
              apiConfig={API_CONFIG}
            />
          </div>

          <div className="instructions">
            <p>Drag to rotate the build 360°</p>
            {appliedCustomResolution && (
              <p className="resolution-info">
                Rendered at {appliedWidth}×{appliedHeight}px
                {displaySize.width && displaySize.height && (
                  <span className="display-info"> • Displaying at {displaySize.width}×{displaySize.height}px</span>
                )}
              </p>
            )}
            <p className="quality-info">
              Quality: <strong>{appliedProfile}</strong>
              {appliedProfile === 'cinematic' && ' (All effects enabled)'}
              {appliedProfile === 'flat' && ' (No effects, clean look)'}
              {appliedProfile === 'fast' && ' (Minimal rendering)'}
            </p>
          </div>
        </div>

        <div className="build-specs">
          <h2>Build Configuration</h2>
          <div className="specs-grid">
            {buildSpecs.map((spec, index) => (
              <div key={index} className="spec-item">
                <span className="spec-label">{spec.label}</span>
                <span className="spec-value">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>

        <footer className="footer">
          <p>
            Built with{' '}
            <a
              href="https://github.com/buildcores/buildcores-render-client"
              target="_blank"
              rel="noopener noreferrer"
            >
              @buildcores/render-client
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;

