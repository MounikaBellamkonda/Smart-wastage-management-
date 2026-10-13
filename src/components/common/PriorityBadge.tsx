import React from 'react';
import { PriorityLevel } from '../../types';

interface PriorityBadgeProps {
  priority: PriorityLevel;
  size?: 'sm' | 'md' | 'lg';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  }[size];

  switch (priority) {
    case 'Urgent':
      return (
        <span
          className={`inline-flex items-center font-bold uppercase tracking-wider rounded border border-red-200 bg-red-50 text-red-700 ${sizeClasses}`}
        >
          Urgent
        </span>
      );
    case 'High':
      return (
        <span
          className={`inline-flex items-center font-semibold uppercase tracking-wider rounded border border-orange-200 bg-orange-50 text-orange-700 ${sizeClasses}`}
        >
          High
        </span>
      );
    case 'Medium':
      return (
        <span
          className={`inline-flex items-center font-medium uppercase tracking-wider rounded border border-yellow-200 bg-yellow-50 text-yellow-800 ${sizeClasses}`}
        >
          Medium
        </span>
      );
    case 'Low':
    default:
      return (
        <span
          className={`inline-flex items-center font-medium uppercase tracking-wider rounded border border-emerald-200 bg-emerald-50 text-emerald-700 ${sizeClasses}`}
        >
          Low
        </span>
      );
  }
};
