import React, { useState } from 'react';
import { BuildRender } from '@buildcores/render-client';
import BuildViewer from './BuildViewer';
import './App.css';

// ===========================================
// 🔐 ADD YOUR API CREDENTIALS HERE
// ===========================================
const API_CONFIG = {
  environment: 'prod',
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

// Demo modes
const DEMO_MODES = {
  MANUAL: 'manual',
  SHARE_CODE: 'share_code',
  SHOWCASE: 'showcase'
};

function App() {
  // Demo mode selector
  const [demoMode, setDemoMode] = useState(DEMO_MODES.MANUAL);

  // Resolution controls
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [useCustomResolution, setUseCustomResolution] = useState(true);
  
  // Quality profile control
  const [profile, setProfile] = useState('cinematic');
  
  // Composition controls
  const [showGrid, setShowGrid] = useState(true);
  const [cameraOffsetX, setCameraOffsetX] = useState(0);
  
  // Grid settings
  const [gridCellThickness, setGridCellThickness] = useState(1.0);
  const [gridSectionThickness, setGridSectionThickness] = useState(1.5);
  const [gridColor, setGridColor] = useState('#888888');
  const [gridFadeDistance, setGridFadeDistance] = useState(25);
  const [gridRenderOrder, setGridRenderOrder] = useState(-1);
  const [useCustomGridSettings, setUseCustomGridSettings] = useState(true);
  
  // Track applied resolution (what's currently rendered)
  const [appliedWidth, setAppliedWidth] = useState(1920);
  const [appliedHeight, setAppliedHeight] = useState(1080);
  const [appliedCustomResolution, setAppliedCustomResolution] = useState(true);
  const [appliedProfile, setAppliedProfile] = useState('cinematic');
  const [appliedShowGrid, setAppliedShowGrid] = useState(true);
  const [appliedCameraOffsetX, setAppliedCameraOffsetX] = useState(0);
  const [appliedGridSettings, setAppliedGridSettings] = useState({
    cellThickness: 1.0,
    sectionThickness: 1.5,
    color: '#888888',
    fadeDistance: 25,
    renderOrder: -1
  });
  const [appliedUseCustomGridSettings, setAppliedUseCustomGridSettings] = useState(true);
  const [renderKey, setRenderKey] = useState(0); // Force re-render by changing key

  // Showcase mode settings
  const [showcaseSpinDuration, setShowcaseSpinDuration] = useState(5000);
  const [showcaseInteractive, setShowcaseInteractive] = useState(false);
  const [showcaseAnimationMode, setShowcaseAnimationMode] = useState('spin360');
  const [showcaseZoom, setShowcaseZoom] = useState(1.0);

  // Frame quality for smoother animation (default to 'high' for showcase mode)
  const [frameQuality, setFrameQuality] = useState('high');
  const [appliedFrameQuality, setAppliedFrameQuality] = useState('high');

  // Server-side camera zoom (values > 1 = camera further away, build appears smaller in sprite)
  const [cameraZoom, setCameraZoom] = useState(1.0);
  const [appliedCameraZoom, setAppliedCameraZoom] = useState(1.0);

  // Build current grid settings object
  const currentGridSettings = useCustomGridSettings ? {
    cellThickness: gridCellThickness,
    sectionThickness: gridSectionThickness,
    color: gridColor,
    fadeDistance: gridFadeDistance,
    renderOrder: gridRenderOrder
  } : undefined;

  // Check if settings have changed
  const hasChanges = useCustomResolution !== appliedCustomResolution || 
                     (useCustomResolution && (width !== appliedWidth || height !== appliedHeight)) ||
                     profile !== appliedProfile ||
                     showGrid !== appliedShowGrid ||
                     cameraOffsetX !== appliedCameraOffsetX ||
                     cameraZoom !== appliedCameraZoom ||
                     useCustomGridSettings !== appliedUseCustomGridSettings ||
                     (useCustomGridSettings && JSON.stringify(currentGridSettings) !== JSON.stringify(appliedGridSettings)) ||
                     frameQuality !== appliedFrameQuality;

  // Apply new resolution and trigger re-render
  const handleRerender = () => {
    setAppliedWidth(width);
    setAppliedHeight(height);
    setAppliedCustomResolution(useCustomResolution);
    setAppliedProfile(profile);
    setAppliedShowGrid(showGrid);
    setAppliedCameraOffsetX(cameraOffsetX);
    setAppliedCameraZoom(cameraZoom);
    setAppliedUseCustomGridSettings(useCustomGridSettings);
    setAppliedGridSettings(currentGridSettings);
    setAppliedFrameQuality(frameQuality);
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

  // Build grid settings for composition
  const appliedGridSettingsObj = appliedUseCustomGridSettings ? appliedGridSettings : undefined;

  return (
    <div className="App">
      <div className="container">
        <header className="header">
          <h1>BuildRender Demo</h1>
          <p className="subtitle">Interactive 360° PC Build Visualization</p>
        </header>

        {/* Mode Selector Tabs */}
        <div className="mode-tabs">
          <button 
            className={`mode-tab ${demoMode === DEMO_MODES.MANUAL ? 'active' : ''}`}
            onClick={() => setDemoMode(DEMO_MODES.MANUAL)}
          >
            Manual Parts Config
          </button>
          <button 
            className={`mode-tab ${demoMode === DEMO_MODES.SHARE_CODE ? 'active' : ''}`}
            onClick={() => setDemoMode(DEMO_MODES.SHARE_CODE)}
          >
            Load by Share Code
          </button>
          <button 
            className={`mode-tab ${demoMode === DEMO_MODES.SHOWCASE ? 'active' : ''}`}
            onClick={() => setDemoMode(DEMO_MODES.SHOWCASE)}
          >
            Showcase Mode
          </button>
        </div>

        {/* Share Code Mode - BuildViewer */}
        {demoMode === DEMO_MODES.SHARE_CODE && (
          <BuildViewer apiConfig={API_CONFIG} />
        )}

        {/* Showcase Mode - Non-interactive 360 spin */}
        {demoMode === DEMO_MODES.SHOWCASE && (
          <>
            <div className="resolution-controls">
              <div className="control-header">
                <h3>Animation Settings</h3>
              </div>
              
              <div className="composition-controls">
                {/* Animation Mode */}
                <div className="slider-group">
                  <label>Animation Mode:</label>
                  <div className="preset-buttons">
                    <button 
                      onClick={() => setShowcaseAnimationMode('spin360')} 
                      className={showcaseAnimationMode === 'spin360' ? 'active' : ''}
                    >
                      360° Spin
                    </button>
                    <button 
                      onClick={() => setShowcaseAnimationMode('bounce')} 
                      className={showcaseAnimationMode === 'bounce' ? 'active' : ''}
                    >
                      Bounce
                    </button>
                  </div>
                </div>

                {/* Spin Duration (only for spin360) */}
                {showcaseAnimationMode === 'spin360' && (
                  <div className="slider-group">
                    <label>
                      Spin Duration: <span className="value">{(showcaseSpinDuration / 1000).toFixed(1)}s</span> per rotation
                    </label>
                    <input
                      type="range"
                      min="3000"
                      max="15000"
                      step="1000"
                      value={showcaseSpinDuration}
                      onChange={(e) => setShowcaseSpinDuration(parseInt(e.target.value))}
                      className="slider"
                    />
                    <div className="preset-buttons">
                      <button onClick={() => setShowcaseSpinDuration(5000)}>5s (Fast)</button>
                      <button onClick={() => setShowcaseSpinDuration(10000)}>10s (Normal)</button>
                      <button onClick={() => setShowcaseSpinDuration(15000)}>15s (Slow)</button>
                    </div>
                  </div>
                )}

                {/* Interactive Toggle */}
                <div className="composition-row">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={showcaseInteractive}
                      onChange={(e) => setShowcaseInteractive(e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-label">
                      {showcaseInteractive ? 'Interactive (drag to rotate)' : 'Non-interactive (click passes through)'}
                    </span>
                  </label>
                </div>

                {/* Frame Quality */}
                <div className="slider-group">
                  <label>Frame Quality:</label>
                  <div className="preset-buttons">
                    <button 
                      onClick={() => setFrameQuality('standard')} 
                      className={frameQuality === 'standard' ? 'active' : ''}
                    >
                      Standard (72)
                    </button>
                    <button 
                      onClick={() => setFrameQuality('high')} 
                      className={frameQuality === 'high' ? 'active' : ''}
                    >
                      High (144)
                    </button>
                  </div>
                </div>

                {/* Zoom Level */}
                <div className="slider-group">
                  <label>
                    Zoom: <span className="value">{(showcaseZoom * 100).toFixed(0)}%</span>
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.1"
                    value={showcaseZoom}
                    onChange={(e) => setShowcaseZoom(parseFloat(e.target.value))}
                    className="slider"
                  />
                  <div className="preset-buttons">
                    <button onClick={() => setShowcaseZoom(0.5)}>50%</button>
                    <button onClick={() => setShowcaseZoom(0.75)}>75%</button>
                    <button onClick={() => setShowcaseZoom(1.0)}>100%</button>
                    <button onClick={() => setShowcaseZoom(1.5)}>150%</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="demo-section">
              <div className="showcase-demo-container">
                {/* Simulated link wrapper to show click-through */}
                <a 
                  href="https://buildcores.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="showcase-link-wrapper"
                  onClick={(e) => {
                    if (!showcaseInteractive) {
                      // Allow the click to go through
                    } else {
                      e.preventDefault();
                    }
                  }}
                >
                  <BuildRender
                    parts={parts}
                    size={400}
                    apiConfig={API_CONFIG}
                    animationMode={showcaseAnimationMode}
                    spinDuration={showcaseSpinDuration}
                    interactive={showcaseInteractive}
                    showGrid={true}
                    frameQuality={frameQuality}
                    zoom={showcaseZoom}
                  />
                  {!showcaseInteractive && (
                    <div className="click-hint">Click to visit BuildCores.com</div>
                  )}
                </a>
              </div>

              <div className="instructions">
                <p>
                  <strong>Mode:</strong> {showcaseAnimationMode === 'spin360' ? 'Continuous 360° spin' : 'Bounce animation'}
                </p>
                {showcaseAnimationMode === 'spin360' && (
                  <p><strong>Speed:</strong> {showcaseSpinDuration / 1000} seconds per rotation</p>
                )}
                <p>
                  <strong>Interaction:</strong> {showcaseInteractive ? 'Enabled (drag to rotate, scroll to zoom)' : 'Disabled (clicks pass through to link)'}
                </p>
              </div>

              <div className="code-example">
                <h4>Code Example</h4>
                <pre>{`<a href="https://buildcores.com">
  <BuildRender
    shareCode="your-share-code"
    size={400}
    apiConfig={config}
    animationMode="${showcaseAnimationMode}"${showcaseAnimationMode === 'spin360' ? `
    spinDuration={${showcaseSpinDuration}}` : ''}
    interactive={${showcaseInteractive}}
  />
</a>`}</pre>
              </div>
            </div>
          </>
        )}

        {/* Manual Config Mode */}
        {demoMode === DEMO_MODES.MANUAL && (
          <>
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

          <div className="quality-select-container" style={{ marginTop: '12px' }}>
            <label style={{ fontSize: '14px', marginBottom: '6px', display: 'block' }}>Frame Quality</label>
            <select 
              value={frameQuality} 
              onChange={(e) => setFrameQuality(e.target.value)}
              className="quality-select"
            >
              <option value="standard">Standard - 72 frames (faster, smaller file)</option>
              <option value="high">High - 144 frames (smoother animation)</option>
            </select>
          </div>
        </div>

        {/* Composition Settings */}
        <div className="resolution-controls">
          <div className="control-header">
            <h3>Composition Settings</h3>
          </div>
          
          <div className="composition-controls">
            {/* Show Grid Toggle */}
            <div className="composition-row">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                />
                <span className="toggle-slider"></span>
                <span className="toggle-label">Show Grid</span>
              </label>
            </div>
            
            {/* Camera Offset Slider */}
            <div className="slider-group">
              <label htmlFor="offset-slider">
                Camera Offset: <span className="value">{cameraOffsetX.toFixed(2)}</span>
                <span className="offset-hint">
                  {cameraOffsetX > 0 ? ' (build shifted right)' : cameraOffsetX < 0 ? ' (build shifted left)' : ' (centered)'}
                </span>
              </label>
              <input
                id="offset-slider"
                type="range"
                min="-0.3"
                max="0.3"
                step="0.01"
                value={cameraOffsetX}
                onChange={(e) => setCameraOffsetX(parseFloat(e.target.value))}
                className="slider"
              />
              <div className="offset-presets">
                <button 
                  onClick={() => setCameraOffsetX(-0.15)} 
                  className={cameraOffsetX === -0.15 ? 'active' : ''}
                >
                  Left
                </button>
                <button 
                  onClick={() => setCameraOffsetX(0)} 
                  className={cameraOffsetX === 0 ? 'active' : ''}
                >
                  Center
                </button>
                <button 
                  onClick={() => setCameraOffsetX(0.15)} 
                  className={cameraOffsetX === 0.15 ? 'active' : ''}
                >
                  Right
                </button>
              </div>
            </div>

            {/* Camera Zoom (Server-side) */}
            <div className="slider-group">
              <label htmlFor="camera-zoom-slider">
                Render Zoom: <span className="value">{(cameraZoom * 100).toFixed(0)}%</span>
                <span className="offset-hint">
                  {cameraZoom > 1 ? ' (build appears smaller)' : cameraZoom < 1 ? ' (build appears larger)' : ' (default)'}
                </span>
              </label>
              <input
                id="camera-zoom-slider"
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={cameraZoom}
                onChange={(e) => setCameraZoom(parseFloat(e.target.value))}
                className="slider"
              />
              <div className="offset-presets">
                <button onClick={() => setCameraZoom(0.7)} className={cameraZoom === 0.7 ? 'active' : ''}>70%</button>
                <button onClick={() => setCameraZoom(1.0)} className={cameraZoom === 1.0 ? 'active' : ''}>100%</button>
                <button onClick={() => setCameraZoom(1.3)} className={cameraZoom === 1.3 ? 'active' : ''}>130%</button>
                <button onClick={() => setCameraZoom(1.5)} className={cameraZoom === 1.5 ? 'active' : ''}>150%</button>
              </div>
            </div>

            {/* Grid Settings */}
            {showGrid && (
              <div className="grid-settings">
                <div className="grid-settings-header">
                  <label className="toggle-switch small">
                    <input
                      type="checkbox"
                      checked={useCustomGridSettings}
                      onChange={(e) => setUseCustomGridSettings(e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-label">
                      {useCustomGridSettings ? 'Enhanced Grid' : 'Default Grid'}
                    </span>
                  </label>
                </div>

                {useCustomGridSettings && (
                  <div className="grid-controls">
                    <div className="slider-group compact">
                      <label>
                        Cell Thickness: <span className="value">{gridCellThickness.toFixed(1)}</span>
                      </label>
                      <input
                        type="range"
                        min="0.1"
                        max="3"
                        step="0.1"
                        value={gridCellThickness}
                        onChange={(e) => setGridCellThickness(parseFloat(e.target.value))}
                        className="slider"
                      />
                    </div>

                    <div className="slider-group compact">
                      <label>
                        Section Thickness: <span className="value">{gridSectionThickness.toFixed(1)}</span>
                      </label>
                      <input
                        type="range"
                        min="0.5"
                        max="5"
                        step="0.1"
                        value={gridSectionThickness}
                        onChange={(e) => setGridSectionThickness(parseFloat(e.target.value))}
                        className="slider"
                      />
                    </div>

                    <div className="slider-group compact">
                      <label>
                        Fade Distance: <span className="value">{gridFadeDistance}</span>
                      </label>
                      <input
                        type="range"
                        min="3"
                        max="50"
                        step="1"
                        value={gridFadeDistance}
                        onChange={(e) => setGridFadeDistance(parseInt(e.target.value))}
                        className="slider"
                      />
                    </div>

                    <div className="inline-controls">
                      <label className="color-picker">
                        Color: 
                        <input
                          type="color"
                          value={gridColor}
                          onChange={(e) => setGridColor(e.target.value)}
                        />
                      </label>
                      
                      <label className="render-order-select">
                        Render Order:
                        <select
                          value={gridRenderOrder}
                          onChange={(e) => setGridRenderOrder(parseInt(e.target.value))}
                        >
                          <option value={-1}>Behind (default)</option>
                          <option value={0}>Normal</option>
                          <option value={1}>Above</option>
                        </select>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            )}
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
              showGrid={appliedShowGrid}
              cameraOffsetX={appliedCameraOffsetX}
              cameraZoom={appliedCameraZoom}
              gridSettings={appliedGridSettingsObj}
              frameQuality={appliedFrameQuality}
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
            <p className="composition-info">
              Grid: <strong>{appliedShowGrid ? 'On' : 'Off'}</strong>
              {appliedCameraOffsetX !== 0 && (
                <span> • Offset: <strong>{appliedCameraOffsetX > 0 ? 'Right' : 'Left'}</strong></span>
              )}
              {appliedCameraZoom !== 1 && (
                <span> • Render Zoom: <strong>{(appliedCameraZoom * 100).toFixed(0)}%</strong></span>
              )}
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
          </>
        )}

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

