
import React from 'react';
import { motion } from 'framer-motion';

const ImageTile = ({ image, distanceFactor, delayFactor, onClick, enableEntranceAnim, isExiting }) => {
  const { id, src, alt, name } = image;

  // Fisheye Lens Calculations
  const scale = 1.22 - (distanceFactor * 0.42);
  const opacity = 1 - (distanceFactor * 0.3);
  const blur = distanceFactor * 1.2;
  const zIndex = Math.round(100 - distanceFactor * 50);

  // Stagger Calculation
  // We use delayFactor (linear distance ratio) for the animation stagger
  // Center (0) -> 0s, Corners (~1) -> 0.4s
  const STAGGER_DURATION = 0.5;
  const animDelay = delayFactor * STAGGER_DURATION; 

  const variants = {
    // Hidden state for BEFORE entrance (loading)
    initial: { opacity: 0, scale: 0.2 },
    
    // Normal Visible State
    visible: { 
      opacity: 1, 
      scale: 1, 
      transition: { 
        duration: 0.7, 
        ease: [0.16, 1, 0.3, 1], // Expo-out easing
        delay: animDelay 
      }
    },
    
    // Exit State (shrinking to zero, fading out)
    exit: { 
      opacity: 0, 
      scale: 0, 
      transition: { 
        duration: 0.5, 
        ease: [0.33, 1, 0.68, 1], // Cubic-out
        delay: animDelay // Center leaves first (delay 0), Edges leave last
      }
    }
  };

  // Determine which state to animate to
  let animateState = "visible";
  
  if (isExiting) {
    animateState = "exit";
  } else if (enableEntranceAnim) {
    animateState = "visible";
  }

  // If entering, start from "initial". If simply mounting without animation intent (unlikely due to isReady logic, 
  // but if we disabled entrance anim globally), start from "visible".
  const initialVariant = enableEntranceAnim ? "initial" : "visible";

  return (
    <motion.div
      className="image-tile"
      initial={false}
      animate={{
        opacity: isExiting ? 1 : opacity, // Let inner div handle opacity during exit to avoid conflicts
        scale,
        zIndex,
        filter: `blur(${blur}px)`,
        boxShadow: "none",
      }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      style={{
        left: image.x,
        top: image.y,
        width: image.w,
        height: image.h,
        willChange: 'transform, opacity',
        transform: 'translateZ(0)'
      }}
      onClick={onClick}
    >
      <motion.div
        style={{ width: '100%', height: '100%' }}
        initial={initialVariant}
        animate={animateState}
        variants={variants}
      >
        <img src={src} alt={alt || name} draggable="false" />
      </motion.div>
    </motion.div>
  );
};

export default React.memo(ImageTile);
