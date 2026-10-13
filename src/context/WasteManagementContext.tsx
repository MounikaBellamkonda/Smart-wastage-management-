import React, { createContext, useContext, useState, useEffect } from 'react';
import { BinRecord, PageTab, ThresholdSettings } from '../types';
import {
  INITIAL_BINS,
  DEFAULT_THRESHOLDS,
  calculatePriority,
  calculateTimeToFull,
} from '../data/initialBins';

interface WasteManagementContextType {
  bins: BinRecord[];
  thresholds: ThresholdSettings;
  activeTab: PageTab;
  setActiveTab: (tab: PageTab) => void;
  selectedBinId: string;
  setSelectedBinId: (id: string) => void;
  selectedBin: BinRecord | undefined;
  
  // Actions
  markAsCollected: (binId: string) => void;
  updateCollectionStatus: (binId: string, status: 'Pending' | 'In Progress' | 'Collected') => void;
  addBin: (bin: Omit<BinRecord, 'id' | 'priority' | 'predictedFill' | 'estimatedTimeToFull' | 'historicalReadings'> & { id?: string }) => { success: boolean; message: string };
  updateBin: (id: string, updates: Partial<BinRecord>) => { success: boolean; message: string };
  deleteBin: (id: string) => { success: boolean; message: string };
  updateThresholds: (newThresholds: ThresholdSettings) => { success: boolean; message: string };
  resetData: () => void;
  advanceSimulation: (hours?: number) => void;
  emptyAllUrgent: () => void;

  // Computed metrics
  metrics: {
    totalBins: number;
    districtTotalCount: number; // 128 municipal demonstration figure
    needCollection: number;
    urgentCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    averageFill: number;
    pendingCount: number;
    inProgressCount: number;
    collectedCount: number;
  };
}

const WasteManagementContext = createContext<WasteManagementContextType | undefined>(undefined);

const STORAGE_KEY_BINS = 'smart_waste_bins_hyd_v2';
const STORAGE_KEY_THRESHOLDS = 'smart_waste_thresholds_hyd_v2';

export const WasteManagementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<PageTab>('overview');
  const [selectedBinId, setSelectedBinId] = useState<string>('B-014');

  // Load thresholds from localStorage or default
  const [thresholds, setThresholds] = useState<ThresholdSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_THRESHOLDS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse thresholds', e);
    }
    return DEFAULT_THRESHOLDS;
  });

  // Load bins from localStorage or default
  const [bins, setBins] = useState<BinRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BINS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse bins from storage', e);
    }
    return INITIAL_BINS;
  });

  // Save to localStorage whenever bins or thresholds change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_BINS, JSON.stringify(bins));
    } catch (e) {
      console.error('Failed to save bins to storage', e);
    }
  }, [bins]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_THRESHOLDS, JSON.stringify(thresholds));
    } catch (e) {
      console.error('Failed to save thresholds to storage', e);
    }
  }, [thresholds]);

  // Selected bin reference
  const selectedBin = bins.find((b) => b.id === selectedBinId) || bins[0];

  // Mark bin as collected
  const markAsCollected = (binId: string) => {
    setBins((prev) =>
      prev.map((b) => {
        if (b.id !== binId) return b;
        const newFill = Math.floor(Math.random() * 4) + 2; // 2% to 5%
        const newPriority = calculatePriority(newFill, thresholds);
        const newPredicted = Math.min(100, Math.round(newFill + b.hourlyFillRate * 3));
        const newEstimatedTime = calculateTimeToFull(newFill, b.hourlyFillRate);
        const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const updatedHistory = [
          ...b.historicalReadings.slice(-5),
          { timestamp: 'Collected', fillLevel: newFill },
        ];

        return {
          ...b,
          currentFill: newFill,
          predictedFill: newPredicted,
          estimatedTimeToFull: newEstimatedTime,
          priority: newPriority,
          collectionStatus: 'Collected',
          lastReadingTime: 'Just now',
          lastCollectedAt: `${nowTime} (Today)`,
          historicalReadings: updatedHistory,
        };
      })
    );
  };

  // Update collection status
  const updateCollectionStatus = (binId: string, status: 'Pending' | 'In Progress' | 'Collected') => {
    if (status === 'Collected') {
      markAsCollected(binId);
    } else {
      setBins((prev) =>
        prev.map((b) => (b.id === binId ? { ...b, collectionStatus: status } : b))
      );
    }
  };

  // Add new bin
  const addBin = (
    newBinData: Omit<BinRecord, 'id' | 'priority' | 'predictedFill' | 'estimatedTimeToFull' | 'historicalReadings'> & { id?: string }
  ) => {
    // Generate clean ID if not provided
    const newId = newBinData.id?.trim() || `B-${String(bins.length + 1).padStart(3, '0')}`;

    if (bins.some((b) => b.id.toLowerCase() === newId.toLowerCase())) {
      return { success: false, message: `Bin ID "${newId}" already exists.` };
    }

    const currentFill = Math.max(0, Math.min(100, Number(newBinData.currentFill) || 0));
    const hourlyRate = Math.max(0.5, Number(newBinData.hourlyFillRate) || 5);
    const predicted = Math.min(100, Math.round(currentFill + hourlyRate * 2.5));
    const priority = calculatePriority(currentFill, thresholds);
    const timeToFull = calculateTimeToFull(currentFill, hourlyRate);

    const newRecord: BinRecord = {
      id: newId,
      location: newBinData.location.trim() || 'Central Zone',
      currentFill,
      predictedFill: predicted,
      estimatedTimeToFull: timeToFull,
      priority,
      collectionStatus: newBinData.collectionStatus || 'Pending',
      lastReadingTime: 'Just now',
      capacityLitres: Number(newBinData.capacityLitres) || 660,
      binType: newBinData.binType || 'General Waste',
      hourlyFillRate: hourlyRate,
      historicalReadings: [
        { timestamp: '-4h', fillLevel: Math.max(0, currentFill - hourlyRate * 4) },
        { timestamp: '-3h', fillLevel: Math.max(0, currentFill - hourlyRate * 3) },
        { timestamp: '-2h', fillLevel: Math.max(0, currentFill - hourlyRate * 2) },
        { timestamp: '-1h', fillLevel: Math.max(0, currentFill - hourlyRate) },
        { timestamp: 'Now', fillLevel: currentFill },
      ],
      notes: newBinData.notes || 'Newly registered sensor telemetry bin.',
    };

    setBins((prev) => [newRecord, ...prev]);
    return { success: true, message: `Bin ${newId} created successfully.` };
  };

  // Update existing bin
  const updateBin = (id: string, updates: Partial<BinRecord>) => {
    let found = false;
    setBins((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        found = true;
        const currentFill = updates.currentFill !== undefined ? updates.currentFill : b.currentFill;
        const hourlyRate = updates.hourlyFillRate !== undefined ? updates.hourlyFillRate : b.hourlyFillRate;
        const priority = calculatePriority(currentFill, thresholds);
        const predicted = Math.min(100, Math.round(currentFill + hourlyRate * 2.5));
        const estimatedTimeToFull = calculateTimeToFull(currentFill, hourlyRate);

        return {
          ...b,
          ...updates,
          currentFill,
          hourlyFillRate: hourlyRate,
          priority,
          predictedFill: predicted,
          estimatedTimeToFull,
        };
      })
    );

    if (!found) return { success: false, message: `Bin ${id} not found.` };
    return { success: true, message: `Bin ${id} updated successfully.` };
  };

  // Delete bin
  const deleteBin = (id: string) => {
    setBins((prev) => prev.filter((b) => b.id !== id));
    if (selectedBinId === id) {
      const remaining = bins.filter((b) => b.id !== id);
      if (remaining.length > 0) setSelectedBinId(remaining[0].id);
    }
    return { success: true, message: `Bin ${id} removed.` };
  };

  // Update thresholds & recompute all bin priorities
  const updateThresholds = (newThresholds: ThresholdSettings) => {
    if (
      newThresholds.urgentMin <= newThresholds.highMin ||
      newThresholds.highMin <= newThresholds.mediumMin ||
      newThresholds.mediumMin <= 0 ||
      newThresholds.urgentMin > 100
    ) {
      return {
        success: false,
        message: 'Invalid thresholds: must maintain 100 >= Urgent > High > Medium > 0.',
      };
    }

    setThresholds(newThresholds);
    setBins((prev) =>
      prev.map((b) => ({
        ...b,
        priority: calculatePriority(b.currentFill, newThresholds),
      }))
    );
    return { success: true, message: 'Priority thresholds updated successfully.' };
  };

  // Reset to initial demo records
  const resetData = () => {
    setBins(INITIAL_BINS);
    setThresholds(DEFAULT_THRESHOLDS);
    setSelectedBinId('B-014');
    try {
      localStorage.removeItem(STORAGE_KEY_BINS);
      localStorage.removeItem(STORAGE_KEY_THRESHOLDS);
    } catch (e) {
      console.error(e);
    }
  };

  // Advance simulation (adds simulated waste accumulation based on hourly rates)
  const advanceSimulation = (hours = 1) => {
    setBins((prev) =>
      prev.map((b) => {
        if (b.collectionStatus === 'Collected') {
          // Bins that were recently collected start filling up slowly
          const increment = Math.round(b.hourlyFillRate * hours);
          const newFill = Math.min(100, b.currentFill + increment);
          const newPriority = calculatePriority(newFill, thresholds);
          return {
            ...b,
            currentFill: newFill,
            collectionStatus: newFill >= thresholds.highMin ? 'Pending' : 'Collected',
            priority: newPriority,
            lastReadingTime: 'Just now (simulated)',
            estimatedTimeToFull: calculateTimeToFull(newFill, b.hourlyFillRate),
            predictedFill: Math.min(100, Math.round(newFill + b.hourlyFillRate * 2)),
          };
        }

        const increment = Math.round(b.hourlyFillRate * hours);
        const newFill = Math.min(100, b.currentFill + increment);
        const newPriority = calculatePriority(newFill, thresholds);
        const newPredicted = Math.min(100, Math.round(newFill + b.hourlyFillRate * 2.5));
        const newTimeToFull = calculateTimeToFull(newFill, b.hourlyFillRate);

        return {
          ...b,
          currentFill: newFill,
          predictedFill: newPredicted,
          priority: newPriority,
          estimatedTimeToFull: newTimeToFull,
          lastReadingTime: 'Just now (simulated)',
          historicalReadings: [
            ...b.historicalReadings.slice(-5),
            { timestamp: `+${hours}h`, fillLevel: newFill },
          ],
        };
      })
    );
  };

  // Quick empty all urgent bins
  const emptyAllUrgent = () => {
    setBins((prev) =>
      prev.map((b) => {
        if (b.priority === 'Urgent') {
          const newFill = Math.floor(Math.random() * 4) + 2;
          return {
            ...b,
            currentFill: newFill,
            predictedFill: Math.min(100, Math.round(newFill + b.hourlyFillRate * 3)),
            priority: calculatePriority(newFill, thresholds),
            collectionStatus: 'Collected',
            lastReadingTime: 'Just now',
            lastCollectedAt: `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (Emergency Cleared)`,
          };
        }
        return b;
      })
    );
  };

  // Computed metrics
  const totalCount = bins.length;
  const urgentCount = bins.filter((b) => b.priority === 'Urgent').length;
  const highCount = bins.filter((b) => b.priority === 'High').length;
  const mediumCount = bins.filter((b) => b.priority === 'Medium').length;
  const lowCount = bins.filter((b) => b.priority === 'Low').length;

  const needCollection = bins.filter(
    (b) => (b.priority === 'Urgent' || b.priority === 'High') && b.collectionStatus !== 'Collected'
  ).length;

  const totalFillSum = bins.reduce((acc, b) => acc + b.currentFill, 0);
  const averageFill = totalCount > 0 ? Math.round(totalFillSum / totalCount) : 0;

  const pendingCount = bins.filter((b) => b.collectionStatus === 'Pending').length;
  const inProgressCount = bins.filter((b) => b.collectionStatus === 'In Progress').length;
  const collectedCount = bins.filter((b) => b.collectionStatus === 'Collected').length;

  // District Total: Report specifies 128 total registered municipal bins
  // We showcase dynamic live-monitored bins with this district benchmark
  const districtTotalCount = Math.max(128, totalCount);

  return (
    <WasteManagementContext.Provider
      value={{
        bins,
        thresholds,
        activeTab,
        setActiveTab,
        selectedBinId,
        setSelectedBinId,
        selectedBin,
        markAsCollected,
        updateCollectionStatus,
        addBin,
        updateBin,
        deleteBin,
        updateThresholds,
        resetData,
        advanceSimulation,
        emptyAllUrgent,
        metrics: {
          totalBins: totalCount,
          districtTotalCount,
          needCollection,
          urgentCount,
          highCount,
          mediumCount,
          lowCount,
          averageFill,
          pendingCount,
          inProgressCount,
          collectedCount,
        },
      }}
    >
      {children}
    </WasteManagementContext.Provider>
  );
};

export const useWasteManagement = () => {
  const context = useContext(WasteManagementContext);
  if (!context) {
    throw new Error('useWasteManagement must be used within a WasteManagementProvider');
  }
  return context;
};
