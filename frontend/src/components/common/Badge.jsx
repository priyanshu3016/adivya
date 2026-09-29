import React from 'react';

export const Badge = ({ children, variant = 'default', size = 'md', className = '' }) => {
  const variants = {
    default: 'bg-slate-100 text-slate-700 border-slate-300',
    primary: 'bg-blue-50 text-[#014BAA] border-blue-200',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    warning: 'bg-amber-50 text-amber-800 border-amber-300',
    danger: 'bg-rose-50 text-rose-800 border-rose-300',
    info: 'bg-sky-50 text-sky-800 border-sky-300',
    // Status specific tokens
    verified: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    pending: 'bg-amber-50 text-amber-800 border-amber-300',
    review: 'bg-amber-50 text-amber-900 border-amber-300',
    deficient: 'bg-rose-50 text-rose-800 border-rose-300',
    eligible: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    screened: 'bg-indigo-50 text-indigo-800 border-indigo-300',
    approved: 'bg-emerald-100 text-emerald-900 border-emerald-400 font-semibold',
    rejected: 'bg-rose-100 text-rose-900 border-rose-400'
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5'
  };

  const activeVariant = variants[variant.toLowerCase()] || variants.default;

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border tracking-wide transition-colors ${activeVariant} ${sizes[size]} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {children}
    </span>
  );
};
