import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { BinRecord, BinType, CollectionStatus } from '../../types';
import { useWasteManagement } from '../../context/WasteManagementContext';

interface BinFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  binToEdit?: BinRecord | null;
}

export const BinFormModal: React.FC<BinFormModalProps> = ({
  isOpen,
  onClose,
  binToEdit,
}) => {
  const { addBin, updateBin } = useWasteManagement();

  const [id, setId] = useState('');
  const [location, setLocation] = useState('');
  const [currentFill, setCurrentFill] = useState(50);
  const [capacityLitres, setCapacityLitres] = useState(660);
  const [binType, setBinType] = useState<BinType>('General Waste');
  const [hourlyFillRate, setHourlyFillRate] = useState(6);
  const [collectionStatus, setCollectionStatus] = useState<CollectionStatus>('Pending');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isEditing = Boolean(binToEdit);

  useEffect(() => {
    if (binToEdit) {
      setId(binToEdit.id);
      setLocation(binToEdit.location);
      setCurrentFill(binToEdit.currentFill);
      setCapacityLitres(binToEdit.capacityLitres);
      setBinType(binToEdit.binType);
      setHourlyFillRate(binToEdit.hourlyFillRate);
      setCollectionStatus(binToEdit.collectionStatus);
      setNotes(binToEdit.notes || '');
    } else {
      setId('');
      setLocation('');
      setCurrentFill(50);
      setCapacityLitres(660);
      setBinType('General Waste');
      setHourlyFillRate(6);
      setCollectionStatus('Pending');
      setNotes('');
    }
    setError(null);
  }, [binToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!location.trim()) {
      setError('Please provide a valid location name (e.g. Market Road).');
      return;
    }

    if (currentFill < 0 || currentFill > 100) {
      setError('Current fill percentage must be between 0% and 100%.');
      return;
    }

    if (hourlyFillRate <= 0) {
      setError('Hourly fill rate must be greater than 0.');
      return;
    }

    if (isEditing && binToEdit) {
      const result = updateBin(binToEdit.id, {
        location: location.trim(),
        currentFill: Number(currentFill),
        capacityLitres: Number(capacityLitres),
        binType,
        hourlyFillRate: Number(hourlyFillRate),
        collectionStatus,
        notes: notes.trim(),
      });

      if (!result.success) {
        setError(result.message);
        return;
      }
    } else {
      const result = addBin({
        id: id.trim() || undefined,
        location: location.trim(),
        currentFill: Number(currentFill),
        capacityLitres: Number(capacityLitres),
        binType,
        hourlyFillRate: Number(hourlyFillRate),
        collectionStatus,
        notes: notes.trim(),
        lastReadingTime: 'Just registered',
      });

      if (!result.success) {
        setError(result.message);
        return;
      }
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <h3 className="text-base font-bold text-white">
            {isEditing ? `Edit Bin ${binToEdit?.id}` : 'Register New Garbage Bin'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bin ID {isEditing && <span className="text-slate-400 font-normal">(Immutable)</span>}
              </label>
              <input
                type="text"
                disabled={isEditing}
                placeholder="e.g. B-051 (Auto if blank)"
                value={id}
                onChange={(e) => setId(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bin Type *
              </label>
              <select
                value={binType}
                onChange={(e) => setBinType(e.target.value as BinType)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="General Waste">General Waste</option>
                <option value="Recyclable">Recyclable (Paper/Plastic)</option>
                <option value="Organic">Organic / Compostable</option>
                <option value="Hazardous">Hazardous / Industrial</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Location / Landmark *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Market Road, Bus Terminal, College Gate"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Current Fill Level (%) *
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={currentFill}
                  onChange={(e) => setCurrentFill(Math.max(0, Math.min(100, Number(e.target.value))))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
                <span className="text-xs font-bold text-slate-500">%</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Capacity (Litres) *
              </label>
              <select
                value={capacityLitres}
                onChange={(e) => setCapacityLitres(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value={240}>240 L (Standard Wheelie)</option>
                <option value={660}>660 L (Commercial 4-Wheel)</option>
                <option value={1100}>1100 L (Municipal Large)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Est. Hourly Fill Rate (%/h) *
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="30"
                required
                value={hourlyFillRate}
                onChange={(e) => setHourlyFillRate(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Typical range: 2% (quiet) to 14% (market rush)
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Collection Status
              </label>
              <select
                value={collectionStatus}
                onChange={(e) => setCollectionStatus(e.target.value as CollectionStatus)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="Pending">Pending Collection</option>
                <option value="In Progress">In Progress (Crew Assigned)</option>
                <option value="Collected">Collected (Emptied)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Field Notes / Landmarks (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Near gate 2 pedestrian subway exit..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
            >
              {isEditing ? 'Save Changes' : 'Create Bin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
