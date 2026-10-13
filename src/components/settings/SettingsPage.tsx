import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  RotateCcw,
  Sliders,
  Check,
  AlertCircle,
  Database,
  Code,
  Layers,
  HelpCircle,
  Play,
  CheckCircle2,
} from 'lucide-react';
import { useWasteManagement } from '../../context/WasteManagementContext';
import { ThresholdSettings } from '../../types';
import { ConfirmResetModal } from '../modals/ConfirmResetModal';

export const SettingsPage: React.FC = () => {
  const {
    thresholds,
    updateThresholds,
    resetData,
    advanceSimulation,
    emptyAllUrgent,
    metrics,
  } = useWasteManagement();

  const [formThresholds, setFormThresholds] = useState<ThresholdSettings>(thresholds);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const handleSaveThresholds = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveMessage(null);

    const urgent = Number(formThresholds.urgentMin);
    const high = Number(formThresholds.highMin);
    const medium = Number(formThresholds.mediumMin);

    if (urgent <= high || high <= medium || medium <= 0 || urgent > 100) {
      setSaveMessage({
        type: 'error',
        text: 'Invalid range: Thresholds must strictly satisfy 100 >= Urgent > High > Medium > 0.',
      });
      return;
    }

    const res = updateThresholds({
      urgentMin: urgent,
      highMin: high,
      mediumMin: medium,
    });

    if (res.success) {
      setSaveMessage({
        type: 'success',
        text: 'Priority thresholds updated! All bin priorities have been dynamically reclassified.',
      });
    } else {
      setSaveMessage({ type: 'error', text: res.message });
    }
  };

  const handleResetToDefaults = () => {
    setFormThresholds({
      urgentMin: 90,
      highMin: 70,
      mediumMin: 40,
    });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          System Settings & Thresholds
        </h2>
        <p className="text-xs text-slate-500">
          Configure classification rules, manage demonstration states, and inspect backend architecture.
        </p>
      </div>

      {/* Threshold Configuration Form */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <Sliders className="w-5 h-5 text-emerald-600" />
          <h3 className="text-base font-bold text-slate-900">
            Collection Priority Threshold Rules
          </h3>
        </div>
        <p className="text-xs text-slate-500 mb-6">
          Adjust the fill-level boundary percentages used by the automated classifier to assign
          urgency tiers to each garbage bin.
        </p>

        {saveMessage && (
          <div
            className={`p-3.5 mb-6 rounded-lg text-xs flex items-center gap-2 ${
              saveMessage.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {saveMessage.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{saveMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleSaveThresholds} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Urgent Threshold */}
            <div className="p-4 rounded-lg bg-red-50/50 border border-red-200">
              <label className="block text-xs font-bold text-red-900 uppercase tracking-wider mb-1">
                Urgent Priority (&ge; %)
              </label>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={formThresholds.urgentMin}
                  onChange={(e) =>
                    setFormThresholds({ ...formThresholds, urgentMin: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 text-sm font-mono font-bold border border-red-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <span className="text-sm font-bold text-red-700">%</span>
              </div>
              <p className="text-[11px] text-red-700 mt-2">
                Applied to bins from {formThresholds.urgentMin}% to 100% capacity.
              </p>
            </div>

            {/* High Threshold */}
            <div className="p-4 rounded-lg bg-orange-50/50 border border-orange-200">
              <label className="block text-xs font-bold text-orange-900 uppercase tracking-wider mb-1">
                High Priority (&ge; %)
              </label>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="number"
                  min="30"
                  max="95"
                  value={formThresholds.highMin}
                  onChange={(e) =>
                    setFormThresholds({ ...formThresholds, highMin: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 text-sm font-mono font-bold border border-orange-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <span className="text-sm font-bold text-orange-700">%</span>
              </div>
              <p className="text-[11px] text-orange-700 mt-2">
                Applied from {formThresholds.highMin}% to {formThresholds.urgentMin - 1}%.
              </p>
            </div>

            {/* Medium Threshold */}
            <div className="p-4 rounded-lg bg-yellow-50/50 border border-yellow-200">
              <label className="block text-xs font-bold text-yellow-900 uppercase tracking-wider mb-1">
                Medium Priority (&ge; %)
              </label>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="number"
                  min="10"
                  max="80"
                  value={formThresholds.mediumMin}
                  onChange={(e) =>
                    setFormThresholds({ ...formThresholds, mediumMin: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 text-sm font-mono font-bold border border-yellow-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                <span className="text-sm font-bold text-yellow-700">%</span>
              </div>
              <p className="text-[11px] text-yellow-700 mt-2">
                Applied from {formThresholds.mediumMin}% to {formThresholds.highMin - 1}%. (Below {formThresholds.mediumMin}% is Low)
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleResetToDefaults}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
            >
              Reset to Recommended (90% / 70% / 40%)
            </button>

            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-xs"
            >
              Save & Apply Thresholds
            </button>
          </div>
        </form>
      </div>

      {/* Demonstration Management & Simulation Box */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">
          Simulation & Demonstration Controls
        </h3>
        <p className="text-xs text-slate-500">
          Tools to advance time, test urgency shifts, and restore standard demonstration baseline records.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Action 1: Advance +1h */}
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-800 mb-1">Simulate Time Advance (+1h)</h4>
              <p className="text-[11px] text-slate-500 mb-3">
                Adds 1 hour of accumulation based on each bin&apos;s fill velocity, triggering priority shifts.
              </p>
            </div>
            <button
              onClick={() => advanceSimulation(1)}
              className="w-full py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-900 text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 text-emerald-400" />
              <span>Simulate +1h Fill</span>
            </button>
          </div>

          {/* Action 2: Collect Urgent */}
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-800 mb-1">Sanitation Shift Clear</h4>
              <p className="text-[11px] text-slate-500 mb-3">
                Simulates sanitation trucks completing collection of all {metrics.urgentCount} urgent bins.
              </p>
            </div>
            <button
              onClick={emptyAllUrgent}
              disabled={metrics.urgentCount === 0}
              className="w-full py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Collect All Urgent ({metrics.urgentCount})</span>
            </button>
          </div>

          {/* Action 3: Reset All Demo Data */}
          <div className="p-4 rounded-lg border border-red-200 bg-red-50/30 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-red-900 mb-1">Reset Demonstration Data</h4>
              <p className="text-[11px] text-slate-500 mb-3">
                Restores original demonstration bins across LB Nagar, Vanasthalipuram, and Hayathnagar.
              </p>
            </div>
            <button
              onClick={() => setIsResetModalOpen(true)}
              className="w-full py-2 text-xs font-semibold rounded-lg border border-red-300 bg-white hover:bg-red-50 text-red-700 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-red-600" />
              <span>Reset to Defaults</span>
            </button>
          </div>
        </div>
      </div>

      {/* Backend Architecture & Methodology Reference */}
      <div className="bg-slate-900 text-slate-300 rounded-xl border border-slate-800 p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-2 text-white">
          <Code className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold">
            System Architecture & Production Workflow
          </h3>
        </div>
        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          From Learning Block 1 Project Report (Figure 5.1 & Table 6). Designed for future integration
          with Python Flask and Scikit-learn:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-emerald-400 font-bold block mb-1">Architecture Flow</span>
            <p className="text-slate-300 text-[11px]">
              SENSOR / DATASET &rarr; PYTHON FLASK BACKEND &rarr; DATA PREPROCESSING (Pandas/NumPy) &rarr; ML MODEL (Scikit-Learn) &rarr; PRIORITY RESULTS &rarr; WEB DASHBOARD
            </p>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-emerald-400 font-bold block mb-1">Proposed Backend Stack</span>
            <ul className="text-[11px] space-y-1 text-slate-300 list-disc list-inside">
              <li>Backend Framework: Python / Flask</li>
              <li>Data Analysis: Pandas &amp; NumPy</li>
              <li>Machine Learning: Scikit-learn (Linear Regression / RF)</li>
              <li>Database: SQLite for sensor records</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Confirm Reset Modal */}
      <ConfirmResetModal
        isOpen={isResetModalOpen}
        onConfirm={() => {
          resetData();
          setIsResetModalOpen(false);
          setSaveMessage({
            type: 'success',
            text: 'Demonstration data and thresholds successfully reset to original defaults.',
          });
          setFormThresholds({
            urgentMin: 90,
            highMin: 70,
            mediumMin: 40,
          });
        }}
        onCancel={() => setIsResetModalOpen(false)}
      />
    </div>
  );
};
