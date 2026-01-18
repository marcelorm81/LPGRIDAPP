
import React from 'react';

const ChevronLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

const RestartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 2v6h6M2.66 15.57a10 10 0 1 0 .57-8.38"/>
  </svg>
);

const FloatingCTA = ({ onFindSimilar, onPrevious, onRestart }) => {
  return (
    <div className="cta-row">
      <button 
        className="circle-nav-btn" 
        onClick={(e) => { e.stopPropagation(); onPrevious(); }}
        aria-label="Go back"
      >
        <ChevronLeft />
      </button>

      <button 
        className="find-similar-btn-floating" 
        onClick={(e) => { e.stopPropagation(); onFindSimilar(); }}
        aria-label="View similar products"
      >
        View similar products
      </button>

      <button 
        className="circle-nav-btn" 
        onClick={(e) => { e.stopPropagation(); onRestart(); }}
        aria-label="Restart"
      >
        <RestartIcon />
      </button>
    </div>
  );
};

export default FloatingCTA;
