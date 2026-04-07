// One.jsx
import React, { useState, useRef, useEffect } from 'react';
// Use the regular React version instead of Next.js version
import Spline from '@splinetool/react-spline';

const Dmodel = ({ 
  websiteUrl = "https://your-website.com",
  websiteTitle = "My Website",
  showControls = true,
  autoRotate = false,
  showWatermark = true
}) => {
  const splineRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showWebsite, setShowWebsite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [scale, setScale] = useState(1);
  const [activeTab, setActiveTab] = useState('info');
  const [showHints, setShowHints] = useState(true);
  const [cameraMode, setCameraMode] = useState('default');
  
  // Your Spline scene URL
  const splineScene = "https://prod.spline.design/yN5olLJA5U-XkChZ/scene.splinecode";

  // Load Spline scene
  const onLoad = (spline) => {
    splineRef.current = spline;
    setIsLoaded(true);
    console.log('Spline scene loaded');
    
    // Setup interactive objects
    setTimeout(() => {
      setupInteractiveObjects(spline);
    }, 1000);
  };

  // Setup clickable/interactive objects
  const setupInteractiveObjects = (spline) => {
    try {
      // Look for common interactive object names
      const interactiveObjects = [
        'website', 'link', 'portal', 'screen', 'monitor',
        'computer', 'laptop', 'tablet', 'phone', 'window',
        'button', 'clickme', 'interact', 'web'
      ];

      interactiveObjects.forEach(objName => {
        const obj = spline.findObjectByName(objName);
        if (obj) {
          console.log(`Found interactive object: ${objName}`);
          
          obj.addEventListener('click', () => {
            console.log(`Clicked ${objName}`);
            setShowWebsite(true);
            
            // Add click animation
            obj.scale.x = 1.15;
            obj.scale.y = 1.15;
            obj.scale.z = 1.15;
            
            setTimeout(() => {
              obj.scale.x = 1;
              obj.scale.y = 1;
              obj.scale.z = 1;
            }, 300);
          });

          obj.addEventListener('mouseover', () => {
            document.body.style.cursor = 'pointer';
          });

          obj.addEventListener('mouseout', () => {
            document.body.style.cursor = 'default';
          });
        }
      });

      // Try to find specific objects by position or type
      const allObjects = spline.getAllObjects();
      allObjects.forEach(obj => {
        // Look for objects that might be screens or displays
        if (obj.name && (obj.name.includes('screen') || 
            obj.name.includes('display') ||
            obj.name.includes('monitor'))) {
          setupObjectInteraction(obj);
        }
      });

    } catch (error) {
      console.log('Could not setup all interactive objects:', error);
    }
  };

  const setupObjectInteraction = (obj) => {
    obj.addEventListener('click', () => {
      setShowWebsite(true);
      highlightObject(obj);
    });
  };

  const highlightObject = (obj) => {
    const originalScale = { ...obj.scale };
    obj.scale.x = originalScale.x * 1.2;
    obj.scale.y = originalScale.y * 1.2;
    obj.scale.z = originalScale.z * 1.2;
    
    setTimeout(() => {
      obj.scale.x = originalScale.x;
      obj.scale.y = originalScale.y;
      obj.scale.z = originalScale.z;
    }, 500);
  };

  // Camera controls
  const resetCamera = () => {
    if (splineRef.current && splineRef.current.resetCamera) {
      splineRef.current.resetCamera();
      setCameraMode('default');
    }
  };

  const orbitCamera = () => {
    if (splineRef.current && splineRef.current.setCameraPosition) {
      splineRef.current.setCameraPosition(10, 5, 10);
      setCameraMode('orbit');
    }
  };

  const closeUpCamera = () => {
    if (splineRef.current && splineRef.current.setCameraPosition) {
      splineRef.current.setCameraPosition(2, 1, 3);
      setCameraMode('close');
    }
  };

  // Zoom controls
  const zoomIn = () => {
    if (splineRef.current && splineRef.current.zoom) {
      splineRef.current.zoom(1.2);
    }
  };

  const zoomOut = () => {
    if (splineRef.current && splineRef.current.zoom) {
      splineRef.current.zoom(0.8);
    }
  };

  // Website overlay controls
  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 1.5));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleResetZoom = () => {
    setScale(1);
  };

  const openInNewTab = () => {
    window.open(websiteUrl, '_blank');
  };

  // Handle scene click
  const handleSceneClick = (event) => {
    // If clicking on background, close website
    if (showWebsite && (!event.target.name || event.target.name === 'floor' || event.target.name === 'background')) {
      setShowWebsite(false);
    }
  };

  // Auto-rotate effect
  useEffect(() => {
    let animationId;
    
    if (autoRotate && splineRef.current && isLoaded) {
      const rotate = () => {
        if (splineRef.current && splineRef.current.camera) {
          splineRef.current.camera.rotation.y += 0.001;
        }
        animationId = requestAnimationFrame(rotate);
      };
      
      animationId = requestAnimationFrame(rotate);
      
      return () => {
        if (animationId) {
          cancelAnimationFrame(animationId);
        }
      };
    }
  }, [autoRotate, isLoaded]);

  // Hide hints after 10 seconds
  useEffect(() => {
    if (showHints) {
      const timer = setTimeout(() => {
        setShowHints(false);
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [showHints]);

  return (
    <div className="relative w-full h-[100vh] bg-gradient-to-br from-gray-950 via-black to-gray-950 overflow-hidden rounded-lg">
  {/* Content here */}


      {/* Spline 3D Scene */}
      <div className="absolute inset-0">
        <Spline
          scene={splineScene}
          onLoad={onLoad}
          onMouseDown={handleSceneClick}
          className="w-full h-full"
        />
      </div>

      {/* Loading Screen */}
      {!isLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-50">
          <div className="relative">
            <div className="w-32 h-32 border-4 border-blue-500/20 rounded-full"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-transparent border-t-white rounded-full animate-spin" style={{ animationDelay: '-0.5s' }}></div>
            </div>
          </div>
          <div className="mt-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Loading 3D Experience</h2>
            <p className="text-gray-400">Initializing interactive environment...</p>
            <div className="mt-4 w-64 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse" style={{ width: '70%' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Website Overlay */}
      {showWebsite && (
        <div className="absolute inset-0 flex items-center justify-center p-2 md:p-4 lg:p-8 z-40">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-xl transition-all duration-500"
            onClick={() => setShowWebsite(false)}
          />
          
          {/* Website Container */}
          <div 
            className="relative w-full max-w-7xl h-[90vh] bg-gradient-to-br from-gray-900 to-black rounded-3xl shadow-2xl overflow-hidden border border-gray-700/50"
            style={{ 
              transform: `scale(${scale})`,
              transformOrigin: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Browser Header */}
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white p-4 z-50 flex items-center justify-between border-b border-gray-700/50">
              {/* Left Controls */}
              <div className="flex items-center space-x-4">
                {/* Browser Controls */}
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setShowWebsite(false)}
                    className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
                    title="Close"
                  />
                  <button 
                    onClick={handleResetZoom}
                    className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors"
                    title="Minimize"
                  />
                  <button 
                    onClick={openInNewTab}
                    className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors"
                    title="Maximize"
                  />
                </div>
                
                {/* URL Bar */}
                <div className="flex-1 max-w-xl">
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input 
                      type="text" 
                      value={websiteUrl} 
                      readOnly
                      className="w-full pl-10 pr-4 py-2 bg-gray-800/80 border border-gray-700 rounded-lg text-sm font-mono text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                </div>
              </div>
              
              {/* Right Controls */}
              <div className="flex items-center space-x-3">
                {/* Zoom Controls */}
                <div className="flex items-center space-x-2 bg-gray-800/80 rounded-lg px-3 py-1 border border-gray-700/50">
                  <button 
                    onClick={handleZoomOut}
                    className="text-gray-300 hover:text-white transition-colors"
                    title="Zoom Out"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="text-sm text-gray-300 px-2">{Math.round(scale * 100)}%</span>
                  <button 
                    onClick={handleZoomIn}
                    className="text-gray-300 hover:text-white transition-colors"
                    title="Zoom In"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
                
                {/* Close Button */}
                <button
                  onClick={() => setShowWebsite(false)}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg transition-all duration-300 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="hidden sm:inline">Close</span>
                </button>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-black pt-16">
                <div className="text-center">
                  <div className="relative inline-block mb-6">
                    <div className="w-20 h-20 border-4 border-blue-900/30 rounded-full"></div>
                    <div className="w-20 h-20 border-4 border-transparent border-t-blue-600 rounded-full absolute top-0 left-0 animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 border-4 border-transparent border-t-white rounded-full animate-spin" style={{ animationDirection: 'reverse' }}></div>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Loading {websiteTitle}</h3>
                  <p className="text-gray-400">Please wait while we load the content...</p>
                  <div className="mt-4 w-48 h-1 bg-gray-800 rounded-full overflow-hidden mx-auto">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse"></div>
                  </div>
                </div>
              </div>
            )}

            {/* Website Iframe */}
            <iframe
              src={websiteUrl}
              title={websiteTitle}
              className="w-full h-full border-0 pt-16"
              onLoad={handleIframeLoad}
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              loading="eager"
            />

            {/* Footer Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-4 z-50">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
                <div className="text-gray-300 text-sm">
                  <span className="font-medium">{websiteTitle}</span>
                  <span className="mx-2">•</span>
                  <span className="text-gray-400">Embedded in 3D Environment</span>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={openInNewTab}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-300 flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <span>Open in New Tab</span>
                  </button>
                  <button
                    onClick={handleResetZoom}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors duration-300"
                  >
                    Reset View
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Control Panel */}
      {showControls && isLoaded && (
        <div className="absolute bottom-6 right-6 z-30">
          <div className="bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-gray-700/30">
            {/* Main Controls */}
            <div className="flex flex-col space-y-4">
              {/* Website Button */}
              <button
                onClick={() => setShowWebsite(!showWebsite)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-3 group"
              >
                <div className="relative">
                  <div className="w-5 h-5 border-2 border-white rounded-sm"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400"></div>
                  </div>
                </div>
                <span className="text-lg">{showWebsite ? 'Hide Website' : 'Open Website'}</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
              
              {/* Camera Controls */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={resetCamera}
                  className="p-3 bg-gray-800/70 hover:bg-gray-700/70 text-gray-300 hover:text-white rounded-xl transition-all duration-300 flex flex-col items-center space-y-1 group"
                >
                  <svg className="w-5 h-5 group-hover:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span className="text-xs">Reset View</span>
                </button>
                
                <button
                  onClick={orbitCamera}
                  className="p-3 bg-gray-800/70 hover:bg-gray-700/70 text-gray-300 hover:text-white rounded-xl transition-all duration-300 flex flex-col items-center space-y-1 group"
                >
                  <svg className="w-5 h-5 group-hover:rotate-45 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                  <span className="text-xs">Orbit View</span>
                </button>
              </div>
              
              {/* Hints Toggle */}
              <button
                onClick={() => setShowHints(!showHints)}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center justify-center space-x-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{showHints ? 'Hide Hints' : 'Show Hints'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Hints */}
      {showHints && isLoaded && !showWebsite && (
        <div className="absolute top-6 left-6 z-30">
          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 backdrop-blur-md rounded-xl p-4 border border-blue-500/20 shadow-xl animate-fadeIn">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Interactive Experience</h3>
                <p className="text-gray-300 text-sm">
                  Click on objects in the 3D scene to open the website
                  <br />
                  Use the controls to navigate and interact
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Watermark */}
      {showWatermark && isLoaded && (
        <div className="absolute bottom-4 left-4 z-20">
          <div className="text-gray-500/40 text-sm font-light">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
              <span>3D + Web Integration</span>
            </div>
          </div>
        </div>
      )}

      {/* Status Indicator */}
      {isLoaded && (
        <div className="absolute top-4 right-4 z-20">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-400">Connected</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dmodel;