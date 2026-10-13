import React from 'react';
import { X, Trash2, Clock, MapPin, Gauge, ShieldAlert, CheckCircle, Edit3 } from 'lucide-react';
import { BinRecord } from '../../types';
import { PriorityBadge } from '../common/PriorityBadge';
import { FillProgressBar } from '../common/FillProgressBar';
import { useWasteManagement } from '../../context/WasteManagementContext';

interface BinDetailsModalProps {
  bin: BinRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (bin: BinRecord) => void;
}

export const BinDetailsModal: React.FC<BinDetailsModalProps> = ({
  bin,
  isOpen,
  onClose,
  onEdit,
}) => {
  const { markAsCollected, updateCollectionStatus } = useWasteManagement();

  if (!isOpen || !bin) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-mono font-bold text-sm">
              {bin.id}
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>{bin.location}</span>
                <span className="text-xs font-normal text-slate-400">({bin.binType})</span>
              </h3>
              <p className="text-xs text-slate-400">
                Last reading: {bin.lastReadingTime}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-6">
          {/* Main Status Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 block mb-1">Current Fill Level</span>
              <div className="text-2xl font-extrabold text-slate-900 tabular-nums font-mono">
                {bin.currentFill}%
              </div>
              <div className="mt-2">
                <FillProgressBar fill={bin.currentFill} showLabel={false} size="sm" />
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 block mb-1">Predicted Fill (in ~2.5h)</span>
              <div className="text-2xl font-extrabold text-slate-900 tabular-nums font-mono">
                {bin.predictedFill}%
              </div>
              <div className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Full in: <strong>{bin.estimatedTimeToFull}</strong></span>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 block mb-1">Collection Priority</span>
                <div className="mt-1">
                  <PriorityBadge priority={bin.priority} size="lg" />
                </div>
              </div>
              <div className="text-xs text-slate-600 mt-2">
                Status:{' '}
                <span
                  className={`font-semibold ${
                    bin.collectionStatus === 'Collected'
                      ? 'text-emerald-700'
                      : bin.collectionStatus === 'In Progress'
                      ? 'text-blue-700'
                      : 'text-amber-700'
                  }`}
                >
                  {bin.collectionStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
              Hardware & Sensor Specifications
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Bin Capacity:</span>
                <span className="font-semibold text-slate-800">{bin.capacityLitres} Litres</span>
              </div>
              <div>
                <span className="text-slate-500 block">Fill Rate:</span>
                <span className="font-semibold text-slate-800 tabular-nums font-mono">
                  ~{bin.hourlyFillRate}% / hour
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Sensor Protocol:</span>
                <span className="font-semibold text-slate-800">Ultrasonic Telemetry</span>
              </div>
              <div>
                <span className="text-slate-500 block">Last Emptied:</span>
                <span className="font-semibold text-slate-800">
                  {bin.lastCollectedAt || 'Not recorded today'}
                </span>
              </div>
            </div>
            {bin.notes && (
              <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-600">
                <span className="font-semibold text-slate-700">Location Notes: </span>
                {bin.notes}
              </div>
            )}
          </div>

          {/* Historical Trend Records */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Recent Sensor Readings Log
            </h4>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Time Offset</th>
                    <th className="py-2 px-3">Reading (%)</th>
                    <th className="py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bin.historicalReadings.map((reading, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-mono text-slate-600">{reading.timestamp}</td>
                      <td className="py-2 px-3 font-mono font-bold text-slate-800 tabular-nums">
                        {reading.fillLevel}%
                      </td>
                      <td className="py-2 px-3 text-slate-500">
                        {reading.fillLevel >= 90
                          ? 'Critical threshold breached'
                          : reading.fillLevel >= 70
                          ? 'Elevated fill'
                          : reading.fillLevel <= 10
                          ? 'Emptied'
                          : 'Normal accumulation'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {bin.collectionStatus !== 'Collected' ? (
              <button
                onClick={() => {
                  markAsCollected(bin.id);
                  onClose();
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Mark as Collected</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  updateCollectionStatus(bin.id, 'Pending');
                  onClose();
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 transition-colors cursor-pointer"
              >
                Reset to Pending
              </button>
            )}

            <button
              onClick={() => {
                onClose();
                onEdit(bin);
              }}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
