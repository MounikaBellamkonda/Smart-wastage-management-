import React, { useState } from 'react';
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  Truck,
  Filter,
  Search,
  AlertTriangle,
  ArrowRight,
  MapPin,
  CheckCheck,
  RotateCcw,
} from 'lucide-react';
import { useWasteManagement } from '../../context/WasteManagementContext';
import { PriorityBadge } from '../common/PriorityBadge';
import { FillProgressBar } from '../common/FillProgressBar';
import { BinRecord, PriorityLevel, CollectionStatus } from '../../types';

export const CollectionPlanningPage: React.FC = () => {
  const {
    bins,
    metrics,
    markAsCollected,
    updateCollectionStatus,
    emptyAllUrgent,
  } = useWasteManagement();

  const [locationFilter, setLocationFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState<'All' | PriorityLevel>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | CollectionStatus>('Pending');
  const [searchQuery, setSearchQuery] = useState('');

  // Extract unique locations for filter
  const locations = ['All', ...Array.from(new Set(bins.map((b) => b.location)))];

  const priorityWeight: Record<PriorityLevel, number> = {
    Urgent: 4,
    High: 3,
    Medium: 2,
    Low: 1,
  };

  // Filter & sort bins requiring collection by urgency
  const filteredBins = bins
    .filter((bin) => {
      const matchesSearch =
        bin.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bin.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLocation = locationFilter === 'All' || bin.location === locationFilter;
      const matchesPriority = priorityFilter === 'All' || bin.priority === priorityFilter;
      const matchesStatus = statusFilter === 'All' || bin.collectionStatus === statusFilter;
      return matchesSearch && matchesLocation && matchesPriority && matchesStatus;
    })
    .sort((a, b) => {
      // Urgent first
      const weightDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
      if (weightDiff !== 0) return weightDiff;
      return b.currentFill - a.currentFill;
    });

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Collection Planning
          </h2>
          <p className="text-xs text-slate-500">
            Operational dispatch queue organizing sanitation team collection rounds by urgency.
          </p>
        </div>

        {metrics.urgentCount > 0 && (
          <button
            onClick={emptyAllUrgent}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All Urgent As Collected ({metrics.urgentCount})</span>
          </button>
        )}
      </div>

      {/* Honest Feature Disclaimer (as instructed in prompt) */}
      <div className="p-3.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 flex items-start gap-3">
        <Truck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div className="text-xs">
          <strong>Operational Notice:</strong> This collection planner sorts bins strictly by fill
          capacity urgency and priority classification. In accordance with honest system limitations,
          no live GPS fleet telematics or automated TSP route solver is claimed.
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Pending Pickups</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600 font-mono tabular-nums">
            {metrics.pendingCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Awaiting sanitation vehicle dispatch
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>In Progress (Crews Dispatched)</span>
            <Truck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-blue-600 font-mono tabular-nums">
            {metrics.inProgressCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Assigned to sanitation beat teams
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Completed Collections Today</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 font-mono tabular-nums">
            {metrics.collectedCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Emptied and reset to low baseline
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative min-w-[180px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter ID or street..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Location filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-500">Location:</span>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-md bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Priority filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-500">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-md bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Priorities</option>
              <option value="Urgent">Urgent Only</option>
              <option value="High">High Only</option>
              <option value="Medium">Medium Only</option>
              <option value="Low">Low Only</option>
            </select>
          </div>

          {/* Status filter tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md border border-slate-200">
            {(['All', 'Pending', 'In Progress', 'Collected'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                  statusFilter === s
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Total match counter */}
        <div className="text-slate-500 font-mono text-[11px]">
          {filteredBins.length} bins shown
        </div>
      </div>

      {/* Collection Queue Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Priority Sequence</th>
                <th className="py-3 px-4">Bin ID</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4 min-w-[160px]">Current Fill Level</th>
                <th className="py-3 px-4">Time Until Full</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Dispatch Status</th>
                <th className="py-3 px-4 text-right">Sanitation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredBins.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-500">
                    No bins match the selected collection planning filters.
                  </td>
                </tr>
              ) : (
                filteredBins.map((bin, index) => (
                  <tr key={bin.id} className="hover:bg-slate-50 transition-colors">
                    {/* Priority Sequence Index */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-400">
                      #{index + 1}
                    </td>

                    {/* Bin ID */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {bin.id}
                    </td>

                    {/* Location */}
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {bin.location}
                      <span className="block text-[10px] text-slate-400">
                        {bin.binType} · {bin.capacityLitres}L
                      </span>
                    </td>

                    {/* Fill Level */}
                    <td className="py-3 px-4">
                      <FillProgressBar fill={bin.currentFill} size="md" />
                    </td>

                    {/* Time Until Full */}
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {bin.estimatedTimeToFull}
                    </td>

                    {/* Priority */}
                    <td className="py-3 px-4">
                      <PriorityBadge priority={bin.priority} size="sm" />
                    </td>

                    {/* Collection Status Selector */}
                    <td className="py-3 px-4">
                      <select
                        value={bin.collectionStatus}
                        onChange={(e) =>
                          updateCollectionStatus(bin.id, e.target.value as CollectionStatus)
                        }
                        className={`text-xs font-semibold px-2 py-1 rounded border cursor-pointer ${
                          bin.collectionStatus === 'Collected'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : bin.collectionStatus === 'In Progress'
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : 'bg-amber-50 text-amber-800 border-amber-300'
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Collected">Collected</option>
                      </select>
                    </td>

                    {/* Quick Action */}
                    <td className="py-3 px-4 text-right">
                      {bin.collectionStatus !== 'Collected' ? (
                        <button
                          onClick={() => markAsCollected(bin.id)}
                          className="px-3 py-1 text-xs font-semibold rounded bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Emptied</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => updateCollectionStatus(bin.id, 'Pending')}
                          className="px-2.5 py-1 text-xs font-medium rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reset</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
