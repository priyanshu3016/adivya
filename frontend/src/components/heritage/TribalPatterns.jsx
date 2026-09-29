import React from 'react';

/**
 * Subtle Indian Tribal Heritage Visual Language Elements
 * Inspired by geometric diamond lattices and folk line motifs.
 * Strictly low visual intensity (opacity 4%-15%).
 */

// Subtle geometric diamond band divider
export const TribalMotifDivider = ({ className = '', color = 'currentColor', opacity = 0.25 }) => (
  <div className={`flex items-center justify-center my-4 overflow-hidden ${className}`}>
    <div className="h-px bg-slate-300 flex-1 max-w-[120px]"></div>
    <div className="flex items-center space-x-1.5 px-3">
      <svg width="64" height="14" viewBox="0 0 64 14" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity }}>
        <path d="M7 7L0 0H14L7 7Z" fill={color} />
        <path d="M7 7L0 14H14L7 7Z" fill={color} />
        <path d="M23 7L16 0H30L23 7Z" fill={color} />
        <path d="M23 7L16 14H30L23 7Z" fill={color} />
        <path d="M39 7L32 0H46L39 7Z" fill={color} />
        <path d="M39 7L32 14H46L39 7Z" fill={color} />
        <path d="M55 7L48 0H62L55 7Z" fill={color} />
        <path d="M55 7L48 14H62L55 7Z" fill={color} />
      </svg>
    </div>
    <div className="h-px bg-slate-300 flex-1 max-w-[120px]"></div>
  </div>
);

// Geometric decorative corner motif for cards
export const TribalCornerMotif = ({ className = '', position = 'top-right' }) => {
  const posClasses = {
    'top-right': 'top-0 right-0',
    'top-left': 'top-0 left-0',
    'bottom-right': 'bottom-0 right-0',
    'bottom-left': 'bottom-0 left-0'
  };

  return (
    <div className={`absolute pointer-events-none ${posClasses[position]} ${className}`} aria-hidden="true">
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-15 text-royal-blue">
        <path d="M0 0H40V8H8V40H0V0Z" fill="currentColor" />
        <path d="M12 12H28V16H16V28H12V12Z" fill="currentColor" />
      </svg>
    </div>
  );
};

// Subtle geometric ribbon border for section heads
export const TribalBorderRibbon = ({ className = '' }) => (
  <div className={`w-full h-1.5 flex overflow-hidden opacity-30 ${className}`} aria-hidden="true">
    <div className="w-full bg-[repeating-linear-gradient(45deg,#014BAA_0px,#014BAA_4px,#F8F3F0_4px,#F8F3F0_8px)]" />
  </div>
);

// Subtle Emblem placeholder
export const MinistryEmblem = ({ className = 'w-10 h-10', light = false }) => (
  <div className={`flex items-center justify-center rounded-full ${light ? 'bg-white/10 text-white' : 'bg-royal-blue/10 text-royal-blue'} ${className}`}>
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-1.5">
      {/* Abstract Ashoka/Tribal sun emblem geometric motif */}
      <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2.5" strokeDasharray="3 3" />
      <circle cx="24" cy="24" r="14" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="24" cy="24" r="5" fill="currentColor" />
      <path d="M24 4V10M24 38V44M4 24H10M38 24H44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9.8 9.8L14.1 14.1M33.9 33.9L38.2 38.2M9.8 38.2L14.1 33.9M33.9 14.1L38.2 9.8" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  </div>
);
