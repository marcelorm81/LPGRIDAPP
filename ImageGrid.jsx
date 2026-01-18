
import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { motion, useMotionValue, useSpring, animate } from 'framer-motion';
import ImageTile from './ImageTile.jsx';

const GRID_GAP_DESKTOP = 60;
const GRID_GAP_MOBILE = 24;
const TILE_ASPECT = 3 / 4;
const LENS_RADIUS = 0.55; 
const VELOCITY_MULTIPLIER = 0.2; 
const SETTLE_THRESHOLD = 2.0; 

const ImageGrid = ({ images, onFocusedProductChange, onIsSettledChange, onProductImageClick, isExiting, onInteractionStart, isIdle }) => {
  const viewportRef = useRef(null);
  const isFirstRender = useRef(true);
  
  const rawPanX = useMotionValue(0);
  const rawPanY = useMotionValue(0);
  
  const springConfig = { damping: 50, stiffness: 280, mass: 1 };
  const springPanX = useSpring(rawPanX, springConfig);
  const springPanY = useSpring(rawPanY, springConfig);

  const [layout, setLayout] = useState({
    tileWidth: 280,
    tileHeight: 373,
    cols: 6,
    rows: 5,
    gap: GRID_GAP_DESKTOP
  });

  const [isInteracting, setIsInteracting] = useState(false);
  const [viewportSize, setViewportSize] = useState({ w: 0, h: 0 });
  const [enableEntranceAnim, setEnableEntranceAnim] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  // Disable entrance animation capabilities after initial intro period
  useEffect(() => {
    const timer = setTimeout(() => {
      setEnableEntranceAnim(false);
    }, 2000); 
    return () => clearTimeout(timer);
  }, []);

  const calculateInitialPos = useCallback((vW, vH, tW, tH) => {
    const initX = (vW / 2) - (tW / 2);
    const initY = (vH / 2) - (tH / 2);
    rawPanX.set(initX);
    rawPanY.set(initY);
    springPanX.set(initX);
    springPanY.set(initY);
    setCoords({ x: initX, y: initY });
  }, [rawPanX, rawPanY, springPanX, springPanY]);

  // Idle Animation Effect
  useEffect(() => {
    if (!isIdle || !isReady) return;

    const centerX = rawPanX.get();
    const centerY = rawPanY.get();
    const drift = 120; // Amplitude of idle movement

    // Animate in a diamond/cross pattern to match the instruction hand
    // Hand X: [0, 15, 0, -15, 0, 0]
    // Hand Y: [0, 0, 15, 0, -15, 0]
    
    const animX = animate(rawPanX, 
      [centerX, centerX + drift, centerX, centerX - drift, centerX, centerX], 
      {
        duration: 4,
        times: [0, 0.2, 0.4, 0.6, 0.8, 1],
        repeat: Infinity,
        ease: "easeInOut"
      }
    );

    const animY = animate(rawPanY, 
      [centerY, centerY, centerY + drift, centerY, centerY - drift, centerY], 
      {
        duration: 4,
        times: [0, 0.2, 0.4, 0.6, 0.8, 1],
        repeat: Infinity,
        ease: "easeInOut"
      }
    );

    return () => {
      animX.stop();
      animY.stop();
      snapToCenter(); // Return to a centered state when idle ends
    };
  }, [isIdle, isReady, rawPanX, rawPanY]); // snapToCenter is stable, but excluded to avoid circle dep if it wasn't

  useEffect(() => {
    const updateSize = () => {
      if (!viewportRef.current) return;
      const w = viewportRef.current.offsetWidth;
      const h = viewportRef.current.offsetHeight;
      if (w === viewportSize.w && h === viewportSize.h) return;
      
      setViewportSize({ w, h });
      
      const isMobile = w < 768;
      const tW = isMobile ? w * 0.36 : Math.min(w * 0.18, 260);
      const tH = tW / TILE_ASPECT;
      const gap = isMobile ? GRID_GAP_MOBILE : GRID_GAP_DESKTOP;
      
      setLayout({
        tileWidth: tW,
        tileHeight: tH,
        cols: isMobile ? 4 : 8,
        rows: isMobile ? 4 : 6,
        gap
      });

      document.documentElement.style.setProperty('--tile-width', `${tW}px`);
      document.documentElement.style.setProperty('--tile-height', `${tH}px`);

      if (isFirstRender.current) {
        calculateInitialPos(w, h, tW, tH);
        isFirstRender.current = false;
        // Small delay to ensure state (coords) propagation before revealing
        setTimeout(() => {
          setIsReady(true);
        }, 50);
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [calculateInitialPos, viewportSize]);

  useEffect(() => {
    let checkInterval;
    const checkSettle = () => {
      const vx = springPanX.getVelocity();
      const vy = springPanY.getVelocity();
      const isActuallySettled = !isInteracting && Math.abs(vx) < SETTLE_THRESHOLD && Math.abs(vy) < SETTLE_THRESHOLD;
      onIsSettledChange(isActuallySettled);
    };

    checkInterval = setInterval(checkSettle, 100);
    return () => clearInterval(checkInterval);
  }, [isInteracting, onIsSettledChange, springPanX, springPanY]);

  const snapToCenter = useCallback((vx = 0, vy = 0) => {
    const { tileWidth, tileHeight, gap } = layout;
    const cellW = tileWidth + gap;
    const cellH = tileHeight + gap;
    const targetX = rawPanX.get() + vx * VELOCITY_MULTIPLIER;
    const targetY = rawPanY.get() + vy * VELOCITY_MULTIPLIER;
    const vCenterX = (viewportSize.w / 2) - targetX;
    const vCenterY = (viewportSize.h / 2) - targetY;
    const nearestVc = Math.round((vCenterX - tileWidth / 2) / cellW);
    const nearestVr = Math.round((vCenterY - tileHeight / 2) / cellH);
    const snapX = (viewportSize.w / 2) - (nearestVc * cellW + tileWidth / 2);
    const snapY = (viewportSize.h / 2) - (nearestVr * cellH + tileHeight / 2);

    animate(rawPanX, snapX, { type: 'spring', ...springConfig });
    animate(rawPanY, snapY, { type: 'spring', ...springConfig });

    const idx = ((nearestVr * layout.cols + nearestVc) % images.length + images.length) % images.length;
    if (images[idx]) onFocusedProductChange(images[idx]);
  }, [layout, viewportSize, images, onFocusedProductChange]);

  // --- Wheel / Trackpad Logic ---
  const wheelTimeoutRef = useRef(null);
  const lastWheelDeltaRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return;

    const handleWheel = (e) => {
      e.preventDefault();
      
      if (onInteractionStart) onInteractionStart();
      setIsInteracting(true);
      
      const multiplier = 1.0; 
      rawPanX.set(rawPanX.get() - e.deltaX * multiplier);
      rawPanY.set(rawPanY.get() - e.deltaY * multiplier);

      lastWheelDeltaRef.current = { x: -e.deltaX, y: -e.deltaY };

      if (wheelTimeoutRef.current) clearTimeout(wheelTimeoutRef.current);
      
      wheelTimeoutRef.current = setTimeout(() => {
        setIsInteracting(false);
        const vx = lastWheelDeltaRef.current.x * 15; 
        const vy = lastWheelDeltaRef.current.y * 15;
        snapToCenter(vx, vy);
      }, 60); 
    };

    element.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      element.removeEventListener('wheel', handleWheel);
      if (wheelTimeoutRef.current) clearTimeout(wheelTimeoutRef.current);
    };
  }, [rawPanX, rawPanY, snapToCenter, onInteractionStart]);


  const onPanStart = useCallback(() => {
    setIsInteracting(true);
    if (onInteractionStart) onInteractionStart();
  }, [onInteractionStart]);
  
  const onPan = useCallback((e, info) => {
    rawPanX.set(rawPanX.get() + info.delta.x);
    rawPanY.set(rawPanY.get() + info.delta.y);
  }, [rawPanX, rawPanY]);
  
  const onPanEnd = useCallback((e, info) => {
    setIsInteracting(false);
    snapToCenter(info.velocity.x, info.velocity.y);
  }, [snapToCenter]);

  useEffect(() => {
    const unsubX = springPanX.on('change', v => setCoords(prev => ({ ...prev, x: v })));
    const unsubY = springPanY.on('change', v => setCoords(prev => ({ ...prev, y: v })));
    return () => { unsubX(); unsubY(); };
  }, [springPanX, springPanY]);

  const tiles = useMemo(() => {
    if (!viewportSize.w || !images.length || !isReady) return [];
    
    const { tileWidth, tileHeight, gap } = layout;
    const cellW = tileWidth + gap;
    const cellH = tileHeight + gap;
    
    const curX = coords.x;
    const curY = coords.y;

    const buffer = viewportSize.w < 768 ? 100 : 250;
    const minVc = Math.floor((-curX - buffer) / cellW);
    const maxVc = Math.ceil((-curX + viewportSize.w + buffer) / cellW);
    const minVr = Math.floor((-curY - buffer) / cellH);
    const maxVr = Math.ceil((-curY + viewportSize.h + buffer) / cellH);

    const result = [];
    const halfW = viewportSize.w / 2;
    const halfH = viewportSize.h / 2;
    const maxPossibleDist = Math.sqrt(halfW ** 2 + halfH ** 2);
    
    for (let vr = minVr; vr <= maxVr; vr++) {
      for (let vc = minVc; vc <= maxVc; vc++) {
        const idx = ((vr * layout.cols + vc) % images.length + images.length) % images.length;
        const img = images[idx];
        if (!img) continue;

        const tx = vc * cellW;
        const ty = vr * cellH;

        const centerX = tx + tileWidth / 2 + curX;
        const centerY = ty + tileHeight / 2 + curY;
        const dx = centerX - halfW;
        const dy = centerY - halfH;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        const distanceFactor = Math.min(1, dist / (maxPossibleDist * LENS_RADIUS));
        const delayFactor = dist / maxPossibleDist;

        result.push({
          ...img,
          key: `${img.id}-${vr}-${vc}`,
          x: tx,
          y: ty,
          w: tileWidth,
          h: tileHeight,
          distanceFactor,
          delayFactor
        });
      }
    }
    return result;
  }, [layout, viewportSize, images, coords, isReady]);

  return (
    <motion.div 
      ref={viewportRef}
      className="image-grid-viewport"
      onPanStart={onPanStart}
      onPan={onPan}
      onPanEnd={onPanEnd}
      style={{ touchAction: 'none' }}
    >
      <motion.div 
        className="image-grid-container"
        style={{ 
          x: springPanX, 
          y: springPanY,
          opacity: isReady ? 1 : 0 
        }}
      >
        {isReady && tiles.map(tile => (
          <ImageTile 
            key={tile.key}
            image={tile}
            distanceFactor={tile.distanceFactor}
            delayFactor={tile.delayFactor}
            onClick={() => onProductImageClick(tile)}
            enableEntranceAnim={enableEntranceAnim}
            isExiting={isExiting}
          />
        ))}
      </motion.div>
    </motion.div>
  );
};

export default React.memo(ImageGrid);
