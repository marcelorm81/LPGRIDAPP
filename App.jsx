
import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ImageGrid from './ImageGrid.jsx';
import FloatingProductInfo from './FloatingProductInfo.jsx';
import FloatingCTA from './FloatingCTA.jsx';
import { mockImageData, extraBagProducts } from './data.js';
import './index.css';

const InstructionOverlay = ({ onStart }) => {
  return (
    <motion.div 
      className="instruction-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      onClick={onStart}
    >
      <motion.div 
        className="instruction-card"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
      >
        <div className="instruction-frame">
          <svg viewBox="0 0 500 510" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.28322 489.14V504.212L15.4959 491.196L17.8926 493.437L5.42982 506.721H19.6753V510H0V489.14H3.28322ZM500 489.14V510H480.326V506.721H494.572L482.109 493.437L484.506 491.196L496.717 504.211V489.14H500ZM19.6737 0V3.27895H5.42821L17.891 16.5613L15.4959 18.8043L3.28322 5.78619V20.8601H0V0H19.6737ZM500 20.8601H496.717V5.7878L484.506 18.8043L482.109 16.5629L494.572 3.27895H480.326V0H500V20.8601Z" fill="#9D5248"/>
          </svg>
        </div>

        <div className="instruction-content">
          <motion.div 
            className="instruction-hand"
            animate={{ 
              x: [0, 15, 0, -15, 0, 0],
              y: [0, 0, 15, 0, -15, 0],
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "easeInOut",
              times: [0, 0.2, 0.4, 0.6, 0.8, 1]
            }}
          >
            <svg viewBox="0 0 66 56" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.6759 9.22284C13.6242 7.32125 16.7834 7.32145 18.7319 9.22284L28.9407 19.1853L42.6489 10.0364C44.6303 8.7138 47.2961 8.95573 48.9935 10.6122L60.873 22.205C67.37 28.5452 67.738 38.7087 61.7153 45.4803L57.5935 50.1144C53.0032 55.2752 45.7025 57.2699 39.0337 55.1849L33.5964 53.4849L19.3057 49.1202C17.4551 48.555 16.1078 46.9945 15.8508 45.1189L15.3344 41.3522C15.0675 39.4048 16.5131 37.6307 18.5175 37.4461L29.5471 36.4296L29.86 39.6617L18.8304 40.6771C18.7053 40.6886 18.6148 40.7996 18.6312 40.9211L19.1477 44.6889C19.2334 45.3138 19.682 45.8338 20.2986 46.0223L34.5903 50.387L34.6011 50.3902L40.0482 52.0934C45.4499 53.7821 51.3636 52.1666 55.0816 47.9865L59.2035 43.3523C64.0815 37.8675 63.7838 29.6352 58.5214 24.4999L46.6419 12.9071C46.0761 12.355 45.1868 12.274 44.5263 12.7148L28.5412 23.3852L16.3803 11.5177C15.7308 10.884 14.6781 10.8841 14.0286 11.5177L11.3727 14.1095C10.7402 14.7269 10.7216 15.7225 11.3305 16.3621L26.1744 31.954L23.7383 34.1633L8.89335 18.5714C7.06662 16.6526 7.12348 13.6668 9.02111 11.8146L11.6759 9.22284ZM0 14.8206C3.08856e-05 6.75238 6.24592 0 14.2084 0C18.6192 4.21629e-05 22.5311 2.09392 25.1166 5.32197L22.4954 7.32101C20.4784 4.80285 17.4992 3.24584 14.2084 3.2458C8.3138 3.2458 3.3261 8.31101 3.32607 14.8206C3.32607 18.9091 5.31495 22.4655 8.2643 24.5168L6.33383 27.1593C2.49178 24.4871 0 19.938 0 14.8206Z" fill="#9D5248"/>
            </svg>
          </motion.div>
          
          <p>Drag in any direction<br />to explore</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function App() {
  const [focusedProduct, setFocusedProduct] = useState(mockImageData[0]);
  const [isGridSettled, setIsGridSettled] = useState(true);
  const [productsToDisplay, setProductsToDisplay] = useState(mockImageData);
  const [historyStack, setHistoryStack] = useState([]);
  
  const [isExiting, setIsExiting] = useState(false);
  const [isEntranceActive, setIsEntranceActive] = useState(true);
  const [gridResetKey, setGridResetKey] = useState(0);

  const [showUI, setShowUI] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);

  // Initial Entrance Logic
  useEffect(() => {
    const timer = setTimeout(() => setIsEntranceActive(false), 1600);
    return () => clearTimeout(timer);
  }, []);

  // UI Settling Logic
  useEffect(() => {
    let timeout;
    if (isGridSettled) {
      timeout = setTimeout(() => setShowUI(true), 150);
    } else {
      setShowUI(false);
    }
    return () => clearTimeout(timeout);
  }, [isGridSettled]);

  const performTransition = (updateStateCallback) => {
    setIsExiting(true);
    setTimeout(() => {
      updateStateCallback();
      setGridResetKey(prev => prev + 1);
      setIsEntranceActive(true);
      setTimeout(() => setIsEntranceActive(false), 1600);
      setIsExiting(false);
    }, 850);
  };

  const handleRestart = () => {
    performTransition(() => {
      setProductsToDisplay(mockImageData);
      setHistoryStack([]);
      setFocusedProduct(mockImageData[0]);
      setIsGridSettled(true);
    });
  };

  const handlePrevious = () => {
    if (historyStack.length > 0) {
      performTransition(() => {
        const prev = historyStack[historyStack.length - 1];
        setProductsToDisplay(prev.products);
        setHistoryStack(h => h.slice(0, -1));
        const restoredProduct = prev.products.find(p => p.id === prev.focusId) || prev.products[0];
        setFocusedProduct(restoredProduct);
      });
    }
  };

  const handleFindSimilar = () => {
    if (!focusedProduct) return;
    
    performTransition(() => {
      pushToHistory({ 
        products: productsToDisplay, 
        focusId: focusedProduct.id 
      });

      const isExtraBag = focusedProduct.name === 'Extra Bag L27';
      if (isExtraBag) {
        setProductsToDisplay(extraBagProducts);
      } else {
        setProductsToDisplay([focusedProduct]);
      }
    });
  };

  const pushToHistory = (currentState) => {
    setHistoryStack(prev => [...prev, currentState]);
  };

  const handleInteractionStart = () => {
    if (!hasStarted) {
      setHasStarted(true);
    }
  };

  const shouldDisplayUI = showUI && focusedProduct && !isExiting && !isEntranceActive;

  return (
    <div className={`app-container product-explorer full-canvas`}>
      <motion.div
        style={{ width: '100%', height: '100%' }}
      >
        <ImageGrid 
          key={gridResetKey}
          images={productsToDisplay} 
          onFocusedProductChange={setFocusedProduct}
          onIsSettledChange={setIsGridSettled}
          onProductImageClick={(p) => {
            console.log(`Centered: ${p.name}`);
            handleInteractionStart();
          }}
          isExiting={isExiting}
          onInteractionStart={handleInteractionStart}
          isIdle={!hasStarted}
        />
      </motion.div>

      <AnimatePresence>
        {!hasStarted && (
          <InstructionOverlay onStart={() => setHasStarted(true)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {shouldDisplayUI && hasStarted && (
          <motion.div 
            className="focus-metadata-container"
            initial={{ opacity: 0, y: 10, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 5, x: '-50%' }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <FloatingProductInfo 
              product={focusedProduct} 
              isGridSettled={true} 
            />
            <FloatingCTA 
              onFindSimilar={handleFindSimilar} 
              onPrevious={handlePrevious}
              onRestart={handleRestart}
              isGridSettled={true} 
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {isExiting && (
          <motion.div 
            className="search-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0 }} 
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
