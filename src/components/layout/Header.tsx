import React from 'react';
import { Calendar, Play, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useWasteManagement } from '../../context/WasteManagementContext';

export const Header: React.FC = () => {
  const { advanceSimulation, emptyAllUrgent, metrics } = useWasteManagement();

  // Current formatted date
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-8 py-3.5 flex items-center justify-between shadow-xs">
      {/* Title & Subtitle */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 font-sans">
            SMART WASTE MANAGEMENT
          </h1>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            Demonstration Mode · Sample Data
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs text-slate-500">
            A Data-Driven System That Predicts Which Garbage Bins Need Collection.
          </p>
          <span className="text-slate-300">·</span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <span>Hyderabad, Telangana</span>
            <span className="text-emerald-500 font-normal">|</span>
            <span>GHMC: LB Nagar · Vanasthalipuram · Hayathnagar</span>
          </span>
        </div>
      </div>

      {/* Controls & Quick Simulation Tools */}
      <div className="flex items-center gap-3">
        {/* Date Display */}
        <div className="hidden xl:flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-md border border-slate-200">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>{currentDate}</span>
        </div>

        {/* Quick Simulation controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => advanceSimulation(1)}
            title="Simulate 1 hour of waste accumulation across municipal bins"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 text-emerald-600" />
            <span>Simulate +1h Fill</span>
          </button>

          {metrics.urgentCount > 0 && (
            <button
              onClick={emptyAllUrgent}
              title="Clear all urgently full bins (mark as collected)"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors shadow-xs cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Collect {metrics.urgentCount} Urgent</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
