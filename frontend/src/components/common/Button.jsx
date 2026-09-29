import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  onClick,
  disabled = false,
  loading = false,
  className = '',
  icon: Icon = null,
  iconPosition = 'left'
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed select-none shadow-xs';

  const variants = {
    primary: 'bg-[#014BAA] hover:bg-[#003882] text-white focus:ring-[#014BAA] border border-[#014BAA]',
    secondary: 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 focus:ring-slate-400',
    outline: 'bg-transparent hover:bg-[#014BAA]/5 text-[#014BAA] border border-[#014BAA] focus:ring-[#014BAA]',
    cream: 'bg-[#F8F3F0] hover:bg-[#EFE8E2] text-[#014BAA] border border-[#E8DDD7] focus:ring-[#014BAA]',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white border border-rose-600 focus:ring-rose-500',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-600 focus:ring-emerald-500',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-700 border-transparent shadow-none focus:ring-slate-300'
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
    xl: 'text-lg px-6 py-3 gap-3'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variants[variant] || variants.primary} ${sizes[size]} ${className}`}
    >
      {loading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />
      )}
      <span>{children}</span>
      {!loading && Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
    </button>
  );
};
