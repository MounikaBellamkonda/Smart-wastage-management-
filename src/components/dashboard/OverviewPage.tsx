import React, { useState } from 'react';
import {
  Trash2,
  AlertTriangle,
  Flame,
  Gauge,
  Info,
  CheckCircle,
  Eye,
  Search,
  Filter,
  ArrowUpDown,
  Building2,
  TrendingUp,
} from 'lucide-react';
import { useWasteManagement } from '../../context/WasteManagementContext';
import { PriorityBadge } from '../common/PriorityBadge';
import { FillProgressBar } from '../common/FillProgressBar';
import { BinDetailsModal } from '../modals/BinDetailsModal';
import { BinFormModal } from '../modals/BinFormModal';
import { BinRecord, PriorityLevel } from '../../types';

export const OverviewPage: React.FC = () => {
  const {
    bins,
    metrics,
    markAsCollected,
    setSelectedBinId,
    setActiveTab,
  } = useWasteManagement();

  const [selectedBin, setSelectedBin] = useState<BinRecord | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [binToEdit, setBinToEdit] = useState<BinRecord | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'All' | PriorityLevel>('All');

  // Priority sorting order
  const priorityWeight: Record<PriorityLevel, number> = {
    Urgent: 4,
    High: 3,
    Medium: 2,
    Low: 1,
  };

  // Filter and sort bins so most urgent appear first
  const filteredBins = bins
    .filter((bin) => {
      const matchesSearch =
        bin.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bin.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = priorityFilter === 'All' || bin.priority === priorityFilter;
      return matchesSearch && matchesPriority;
    })
    .sort((a, b) => {
      const weightDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
      if (weightDiff !== 0) return weightDiff;
      return b.currentFill - a.currentFill; // highest fill first
    });

  const handleOpenDetails = (bin: BinRecord) => {
    setSelectedBin(bin);
    setIsDetailsOpen(true);
  };

  const handleOpenEdit = (bin: BinRecord) => {
    setBinToEdit(bin);
    setIsEditOpen(true);
  };

  const handleNavigateToPrediction = (binId: string) => {
    setSelectedBinId(binId);
    setActiveTab('predictions');
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Operational Context */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Overview Dashboard
          </h2>
          <p className="text-xs text-slate-500">
            Current bin status, predictive urgency ranking, and sanitation priority queues.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('planning')}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            <span>View Collection Queue ({metrics.needCollection})</span>
          </button>
        </div>
      </div>

      {/* Demonstration Banner */}
      <div className="p-3.5 rounded-lg bg-amber-50/80 border border-amber-200 text-amber-900 flex items-start gap-3">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs">
          <span className="font-bold">Demonstration Environment Notice:</span>{' '}
          All statistics, fill percentages, and priority estimates displayed on this dashboard are
          calculated from sample demonstration data and predictive trend models. They do not represent
          physical IoT sensor telemetry.
        </div>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Garbage Bins */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Garbage Bins
            </span>
            <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
              {metrics.districtTotalCount}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              <strong className="text-slate-700">{metrics.totalBins}</strong> monitored in LB Nagar, Vanasthalipuram &amp; Hayathnagar zone
            </div>
          </div>
        </div>

        {/* Card 2: Bins Requiring Collection */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Need Collection
            </span>
            <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-amber-600 font-mono tabular-nums">
              {metrics.needCollection}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Urgent + High capacity bins pending pickup
            </div>
          </div>
        </div>

        {/* Card 3: Urgent Collection Bins */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Urgent Collection Bins
            </span>
            <div className="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-red-600 font-mono tabular-nums">
              {metrics.urgentCount}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Fill level &ge; 90% (Imminent overflow risk)
            </div>
          </div>
        </div>

        {/* Card 4: Average Bin Fill Level */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Average Bin Fill Level
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Gauge className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
              {metrics.averageFill}%
            </div>
            <div className="mt-2">
              <FillProgressBar fill={metrics.averageFill} showLabel={false} size="sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Container: BIN COLLECTION PRIORITY */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Header & Search/Filter Toolbar */}
        <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              BIN COLLECTION PRIORITY
            </h3>
            <p className="text-xs text-slate-500">
              Prioritized dispatch queue based on current telemetry readings and forward ML estimates.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Bin ID or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>

            {/* Priority Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-medium">
              {(['All', 'Urgent', 'High', 'Medium', 'Low'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriorityFilter(p)}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    priorityFilter === p
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Priority Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Bin ID</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4 min-w-[170px]">Current Fill Level</th>
                <th className="py-3 px-4">Predicted Fill Level</th>
                <th className="py-3 px-4">Estimated Time Until Full</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredBins.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500">
                    No bins match the selected search or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredBins.map((bin) => {
                  return (
                    <tr
                      key={bin.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Bin ID */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        <button
                          onClick={() => handleNavigateToPrediction(bin.id)}
                          className="text-emerald-700 hover:underline hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
                          title="Click to view full prediction model"
                        >
                          <span>{bin.id}</span>
                          <TrendingUp className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                        </button>
                      </td>

                      {/* Location */}
                      <td className="py-3 px-4 text-slate-900 font-medium">
                        {bin.location}
                        <span className="block text-[10px] text-slate-400">
                          {bin.binType} · {bin.capacityLitres}L
                        </span>
                      </td>

                      {/* Current Fill Level */}
                      <td className="py-3 px-4">
                        <FillProgressBar fill={bin.currentFill} size="md" />
                      </td>

                      {/* Predicted Fill Level */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-700 tabular-nums">
                        {bin.predictedFill}%
                        <span className="text-[10px] font-normal text-slate-400 block">
                          in ~2.5 hours
                        </span>
                      </td>

                      {/* Estimated Time Until Full */}
                      <td className="py-3 px-4 font-mono text-slate-700">
                        <span
                          className={`font-semibold ${
                            bin.priority === 'Urgent'
                              ? 'text-red-700'
                              : bin.priority === 'High'
                              ? 'text-orange-700'
                              : 'text-slate-700'
                          }`}
                        >
                          {bin.estimatedTimeToFull}
                        </span>
                      </td>

                      {/* Priority Badge */}
                      <td className="py-3 px-4">
                        <PriorityBadge priority={bin.priority} size="md" />
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {bin.collectionStatus !== 'Collected' ? (
                            <button
                              onClick={() => markAsCollected(bin.id)}
                              title="Mark bin as emptied/collected"
                              className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Collected</span>
                            </button>
                          ) : (
                            <span className="px-2 py-1 text-[11px] font-medium text-slate-400 italic">
                              Emptied
                            </span>
                          )}

                          <button
                            onClick={() => handleOpenDetails(bin)}
                            title="Inspect bin details and sensor history"
                            className="px-2.5 py-1 text-xs font-medium rounded bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Details</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <strong className="text-slate-700">{filteredBins.length}</strong> of{' '}
            <strong className="text-slate-700">{bins.length}</strong> registered bins
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
              <span>Urgent (&ge;90%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />
              <span>High (70–89%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
              <span>Medium (40–69%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span>Low (&lt;40%)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Modals */}
      <BinDetailsModal
        bin={selectedBin}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onEdit={handleOpenEdit}
      />

      <BinFormModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        binToEdit={binToEdit}
      />
    </div>
  );
};
