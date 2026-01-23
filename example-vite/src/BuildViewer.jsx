import React, { useState, useCallback } from 'react';
import { getBuildByShareCode, BuildRender } from '@buildcores/render-client';
import './BuildViewer.css';

/**
 * BuildViewer - Demo component for loading and rendering builds by share code
 * 
 * This component demonstrates:
 * 1. Fetching build details using getBuildByShareCode
 * 2. Displaying build information and parts
 * 3. Interactive 3D visualization with BuildRender using shareCode
 *    (this preserves the build's interactive state including case fan slots and RGB effects)
 */
function BuildViewer({ apiConfig }) {
  // Share code input state
  const [shareCodeInput, setShareCodeInput] = useState('');
  
  // Build data state
  const [build, setBuild] = useState(null);
  const [loadingBuild, setLoadingBuild] = useState(false);
  const [buildError, setBuildError] = useState(null);
  
  // The confirmed share code to render (set after successful load)
  const [confirmedShareCode, setConfirmedShareCode] = useState(null);
  
  // Resolution controls (matching App.jsx pattern)
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [useCustomResolution, setUseCustomResolution] = useState(true);
  
  // Quality profile control
  const [profile, setProfile] = useState('cinematic');
  
  // Composition controls
  const [showGrid, setShowGrid] = useState(true);
  const [cameraOffsetX, setCameraOffsetX] = useState(0);
  
  // Grid settings for enhanced visibility in renders
  const [gridCellThickness, setGridCellThickness] = useState(1.0);
  const [gridSectionThickness, setGridSectionThickness] = useState(1.5);
  const [gridColor, setGridColor] = useState('#888888');
  const [gridFadeDistance, setGridFadeDistance] = useState(25);
  const [gridRenderOrder, setGridRenderOrder] = useState(-1);
  const [useCustomGridSettings, setUseCustomGridSettings] = useState(true); // Enhanced grid by default
  
  // Track applied settings (what's currently rendered)
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
  const [renderKey, setRenderKey] = useState(0);

  // Build current grid settings object
  const currentGridSettings = useCustomGridSettings ? {
    cellThickness: gridCellThickness,
    sectionThickness: gridSectionThickness,
    color: gridColor,
    fadeDistance: gridFadeDistance,
    renderOrder: gridRenderOrder
  } : undefined;

  // Check if settings have changed
  const hasChanges = confirmedShareCode && (
    useCustomResolution !== appliedCustomResolution || 
    (useCustomResolution && (width !== appliedWidth || height !== appliedHeight)) ||
    profile !== appliedProfile ||
    showGrid !== appliedShowGrid ||
    cameraOffsetX !== appliedCameraOffsetX ||
    useCustomGridSettings !== appliedUseCustomGridSettings ||
    (useCustomGridSettings && JSON.stringify(currentGridSettings) !== JSON.stringify(appliedGridSettings))
  );

  // Apply new settings and trigger re-render
  const handleRerender = () => {
    setAppliedWidth(width);
    setAppliedHeight(height);
    setAppliedCustomResolution(useCustomResolution);
    setAppliedProfile(profile);
    setAppliedShowGrid(showGrid);
    setAppliedCameraOffsetX(cameraOffsetX);
    setAppliedUseCustomGridSettings(useCustomGridSettings);
    setAppliedGridSettings(currentGridSettings);
    setRenderKey(prev => prev + 1);
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

  // Load build by share code
  const handleLoadBuild = useCallback(async () => {
    if (!shareCodeInput.trim()) {
      setBuildError('Please enter a share code');
      return;
    }

    setLoadingBuild(true);
    setBuildError(null);
    setBuild(null);
    setConfirmedShareCode(null);

    try {
      const buildData = await getBuildByShareCode(shareCodeInput.trim(), apiConfig);
      setBuild(buildData);
      setConfirmedShareCode(shareCodeInput.trim());
      
      // Apply current settings on first load
      setAppliedWidth(width);
      setAppliedHeight(height);
      setAppliedCustomResolution(useCustomResolution);
      setAppliedProfile(profile);
      setAppliedShowGrid(showGrid);
      setAppliedCameraOffsetX(cameraOffsetX);
      setAppliedUseCustomGridSettings(useCustomGridSettings);
      setAppliedGridSettings(currentGridSettings);
      setRenderKey(prev => prev + 1);
    } catch (err) {
      setBuildError(err.message || 'Failed to load build');
    } finally {
      setLoadingBuild(false);
    }
  }, [shareCodeInput, apiConfig, width, height, useCustomResolution, profile, showGrid, cameraOffsetX, useCustomGridSettings, currentGridSettings]);

  // Handle Enter key in share code input
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleLoadBuild();
    }
  };

  // Get category display name
  const getCategoryDisplayName = (category) => {
    const names = {
      CPU: 'CPU',
      GPU: 'Graphics Card',
      RAM: 'Memory',
      Motherboard: 'Motherboard',
      PSU: 'Power Supply',
      Storage: 'Storage',
      PCCase: 'Case',
      CPUCooler: 'CPU Cooler',
      CaseFan: 'Case Fans',
      Monitor: 'Monitor',
      Keyboard: 'Keyboard',
      Mouse: 'Mouse',
    };
    return names[category] || category;
  };

  return (
    <div className="build-viewer">
      {/* Share Code Input Section */}
      <div className="share-code-section">
        <h3>Load Build by Share Code</h3>
        <div className="share-code-input-group">
          <input
            type="text"
            placeholder="Enter share code (e.g., abc123xyz)"
            value={shareCodeInput}
            onChange={(e) => setShareCodeInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="share-code-input"
            disabled={loadingBuild}
          />
          <button
            onClick={handleLoadBuild}
            disabled={loadingBuild || !shareCodeInput.trim()}
            className="load-button"
          >
            {loadingBuild ? 'Loading...' : 'Load Build'}
          </button>
        </div>
        {buildError && <div className="error-message">{buildError}</div>}
      </div>

      {/* Resolution Controls - same style as App.jsx */}
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
              <label htmlFor="viewer-width-slider">
                Width: <span className="value">{width}px</span>
              </label>
              <input
                id="viewer-width-slider"
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
              <label htmlFor="viewer-height-slider">
                Height: <span className="value">{height}px</span>
              </label>
              <input
                id="viewer-height-slider"
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

      {/* Quality Profile Controls - same style as App.jsx */}
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
            <label htmlFor="camera-offset-slider">
              Camera Offset: <span className="value">{cameraOffsetX.toFixed(2)}</span>
              <span className="offset-hint">
                {cameraOffsetX > 0 ? ' (build shifted right)' : cameraOffsetX < 0 ? ' (build shifted left)' : ' (centered)'}
              </span>
            </label>
            <input
              id="camera-offset-slider"
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

      {/* Re-render Button - only show when there are pending changes */}
      {hasChanges && (
        <div className="rerender-button-container">
          <button className="rerender-button" onClick={handleRerender}>
            Re-render with New Settings
          </button>
        </div>
      )}

      {/* Build Details Section */}
      {build && (
        <div className="build-details-section">
          <div className="build-header">
            <h2>{build.name || 'Untitled Build'}</h2>
            <span className="share-code-badge">{build.shareCode}</span>
          </div>
          
          {build.description && (
            <p className="build-description">{build.description}</p>
          )}

          {/* Interactive 3D Viewer - uses shareCode to preserve interactive state */}
          {confirmedShareCode && (
            <div className="interactive-viewer-section">
              <h4>Interactive 3D View</h4>

              <div className="demo-wrapper" style={{ minHeight: displaySize.height ? displaySize.height + 40 : 540 }}>
                <BuildRender
                  key={renderKey}
                  shareCode={confirmedShareCode}
                  {...displaySize}
                  mouseSensitivity={0.2}
                  touchSensitivity={0.2}
                  apiConfig={apiConfig}
                  showGrid={appliedShowGrid}
                  cameraOffsetX={appliedCameraOffsetX}
                  gridSettings={appliedUseCustomGridSettings ? appliedGridSettings : undefined}
                />
              </div>
              
              <div className="viewer-instructions">
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
                </p>
              </div>
            </div>
          )}

          {/* Parts List */}
          <div className="parts-list">
            <h4>Parts in this Build</h4>
            {Object.entries(build.partDetails || {}).map(([category, parts]) => (
              parts && parts.length > 0 && (
                <div key={category} className="part-category">
                  <span className="category-name">{getCategoryDisplayName(category)}</span>
                  <div className="parts-in-category">
                    {parts.map((part, idx) => (
                      <div key={`${part.id}-${idx}`} className="part-item">
                        {part.image && (
                          <img 
                            src={part.image} 
                            alt={part.name}
                            className="part-image"
                            onError={(e) => e.target.style.display = 'none'}
                          />
                        )}
                        <span className="part-name">{part.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default BuildViewer;
