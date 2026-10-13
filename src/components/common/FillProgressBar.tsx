import React from 'react';

interface FillProgressBarProps {
  fill: number; // 0 to 100
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const FillProgressBar: React.FC<FillProgressBarProps> = ({
  fill,
  showLabel = true,
  size = 'md',
}) => {
  const clampedFill = Math.min(100, Math.max(0, fill));

  // Determine bar color according to fill level
  let barColor = 'bg-emerald-500';
  let textColor = 'text-emerald-700';
  if (clampedFill >= 90) {
    barColor = 'bg-red-500';
    textColor = 'text-red-700';
  } else if (clampedFill >= 70) {
    barColor = 'bg-orange-500';
    textColor = 'text-orange-700';
  } else if (clampedFill >= 40) {
    barColor = 'bg-amber-400';
    textColor = 'text-amber-800';
  }

  const heightClass = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  }[size];

  return (
    <div className="w-full flex items-center gap-2.5">
      <div className={`flex-1 bg-slate-200 rounded-full overflow-hidden ${heightClass}`}>
        <div
          className={`${heightClass} ${barColor} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${clampedFill}%` }}
        />
      </div>
      {showLabel && (
        <span className={`text-xs font-bold tabular-nums font-mono min-w-[36px] text-right ${textColor}`}>
          {clampedFill}%
        </span>
      )}
    </div>
  );
};
