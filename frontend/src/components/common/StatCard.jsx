import React from 'react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'blue',
  trend = null,
  onClick
}) => {
  const colorMaps = {
    blue: {
      border: 'border-blue-100 hover:border-blue-300',
      iconBg: 'bg-blue-50 text-[#014BAA]',
      valColor: 'text-[#014BAA]'
    },
    amber: {
      border: 'border-amber-100 hover:border-amber-300',
      iconBg: 'bg-amber-50 text-amber-700',
      valColor: 'text-amber-700'
    },
    green: {
      border: 'border-emerald-100 hover:border-emerald-300',
      iconBg: 'bg-emerald-50 text-emerald-700',
      valColor: 'text-emerald-700'
    },
    red: {
      border: 'border-rose-100 hover:border-rose-300',
      iconBg: 'bg-rose-50 text-rose-700',
      valColor: 'text-rose-700'
    },
    purple: {
      border: 'border-indigo-100 hover:border-indigo-300',
      iconBg: 'bg-indigo-50 text-indigo-700',
      valColor: 'text-indigo-700'
    }
  };

  const style = colorMaps[variant] || colorMaps.blue;
  const displayVal = value !== undefined && value !== null ? value : 0;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl p-3.5 sm:p-4 border ${style.border} shadow-xs transition-all duration-200 h-full flex flex-col justify-between overflow-hidden ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2 min-w-0">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider leading-snug line-clamp-2">
            {title}
          </p>
          <h4 className={`text-xl sm:text-2xl font-black mt-1.5 ${style.valColor}`}>
            {displayVal}
          </h4>
        </div>
        {Icon && (
          <div className={`p-2 rounded-lg ${style.iconBg} shrink-0 flex items-center justify-center self-start`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-2 pt-1.5 border-t border-slate-100 min-w-0">
          {subtitle && <p className="text-[10px] text-slate-500 truncate">{subtitle}</p>}
          {trend && (
            <div className="flex items-center space-x-1 text-[10px] truncate">
              <span className={`font-semibold ${trend.positive ? 'text-emerald-600' : 'text-rose-600'}`}>
                {trend.value}
              </span>
              <span className="text-slate-400 truncate">{trend.label}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
