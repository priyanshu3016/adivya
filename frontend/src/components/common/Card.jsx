import React from 'react';

export const Card = ({
  children,
  className = '',
  title = null,
  subtitle = null,
  headerAction = null,
  footer = null,
  bordered = true,
  hoverable = false
}) => {
  return (
    <div
      className={`bg-white rounded-xl ${bordered ? 'border border-[#E8DDD7]' : ''} ${
        hoverable ? 'hover:shadow-md hover:border-[#CBD5E1] transition-all duration-200' : 'shadow-xs'
      } overflow-hidden ${className}`}
    >
      {(title || headerAction) && (
        <div className="px-5 py-4 border-b border-[#E8DDD7] flex items-center justify-between gap-4">
          <div>
            {title && <h3 className="text-base font-semibold text-slate-900">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
      {footer && (
        <div className="px-5 py-3 bg-[#F8F3F0]/60 border-t border-[#E8DDD7] text-xs text-slate-600">
          {footer}
        </div>
      )}
    </div>
  );
};
