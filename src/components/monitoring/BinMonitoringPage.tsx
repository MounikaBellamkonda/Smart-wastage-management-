import React, { useState } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Edit,
  Eye,
  SlidersHorizontal,
  CheckCircle,
  Clock,
  Layers,
  MapPin,
  Calendar,
} from 'lucide-react';
import { useWasteManagement } from '../../context/WasteManagementContext';
import { PriorityBadge } from '../common/PriorityBadge';
import { FillProgressBar } from '../common/FillProgressBar';
import { BinDetailsModal } from '../modals/BinDetailsModal';
import { BinFormModal } from '../modals/BinFormModal';
import { ConfirmDeleteModal } from '../modals/ConfirmDeleteModal';
import { BinRecord, PriorityLevel, CollectionStatus } from '../../types';

export const BinMonitoringPage: React.FC = () => {
  const { bins, deleteBin, markAsCollected, updateCollectionStatus } = useWasteManagement();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<'All' | PriorityLevel>('All');
  const [minFill, setMinFill] = useState<number>(0);
  const [maxFill, setMaxFill] = useState<number>(100);
  const [statusFilter, setStatusFilter] = useState<'All' | CollectionStatus>('All');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Modal states
  const [detailsBin, setDetailsBin] = useState<BinRecord | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [binToEdit, setBinToEdit] = useState<BinRecord | null>(null);

  const [deleteBinId, setDeleteBinId] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Filter bins
  const filteredBins = bins.filter((bin) => {
    const matchesSearch =
      bin.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bin.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority =
      selectedPriority === 'All' || bin.priority === selectedPriority;
    const matchesFill = bin.currentFill >= minFill && bin.currentFill <= maxFill;
    const matchesStatus =
      statusFilter === 'All' || bin.collectionStatus === statusFilter;
    return matchesSearch && matchesPriority && matchesFill && matchesStatus;
  });

  const handleOpenAdd = () => {
    setBinToEdit(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (bin: BinRecord) => {
    setBinToEdit(bin);
    setFormOpen(true);
  };

  const handleOpenDelete = (id: string) => {
    setDeleteBinId(id);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deleteBinId) {
      deleteBin(deleteBinId);
    }
    setIsDeleteOpen(false);
    setDeleteBinId(null);
  };

  const handleOpenDetails = (bin: BinRecord) => {
    setDetailsBin(bin);
    setIsDetailsOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Bin Monitoring
          </h2>
          <p className="text-xs text-slate-500">
            Monitor, edit, and inspect active garbage bins, fill thresholds, and physical telemetry status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Table View
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                viewMode === 'cards' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Grid View
            </button>
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Garbage Bin</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Bin ID (e.g. B-014) or Location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            />
          </div>

          {/* Quick Clear Button */}
          {(searchQuery || selectedPriority !== 'All' || minFill > 0 || maxFill < 100 || statusFilter !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedPriority('All');
                setMinFill(0);
                setMaxFill(100);
                setStatusFilter('All');
              }}
              className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Filter Badges & Fill Range Controls */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
          {/* Priority filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-semibold">Priority:</span>
            <div className="flex items-center gap-1">
              {(['All', 'Urgent', 'High', 'Medium', 'Low'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedPriority(p)}
                  className={`px-2.5 py-1 rounded-md cursor-pointer transition-colors ${
                    selectedPriority === p
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1 border border-slate-300 rounded-md bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Collected">Collected</option>
            </select>
          </div>

          {/* Fill level slider filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-semibold">Fill Range:</span>
            <div className="flex items-center gap-1 font-mono">
              <span className="font-bold text-slate-700">{minFill}%</span>
              <input
                type="range"
                min="0"
                max="100"
                value={minFill}
                onChange={(e) => setMinFill(Math.min(Number(e.target.value), maxFill))}
                className="w-24 accent-emerald-600"
              />
              <span className="text-slate-400">to</span>
              <input
                type="range"
                min="0"
                max="100"
                value={maxFill}
                onChange={(e) => setMaxFill(Math.max(Number(e.target.value), minFill))}
                className="w-24 accent-emerald-600"
              />
              <span className="font-bold text-slate-700">{maxFill}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Table or Grid View */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Bin ID</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Type & Capacity</th>
                  <th className="py-3 px-4 min-w-[180px]">Current Fill Level</th>
                  <th className="py-3 px-4">Last Reading</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredBins.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-slate-500">
                      No bins match your current filters. Try resetting the search or fill range.
                    </td>
                  </tr>
                ) : (
                  filteredBins.map((bin) => (
                    <tr key={bin.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {bin.id}
                      </td>
                      <td className="py-3 px-4 text-slate-800 font-medium">
                        {bin.location}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <span>{bin.binType}</span>
                        <span className="block text-[10px] text-slate-400 font-mono">
                          {bin.capacityLitres}L
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <FillProgressBar fill={bin.currentFill} size="md" />
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {bin.lastReadingTime}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                            bin.collectionStatus === 'Collected'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : bin.collectionStatus === 'In Progress'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {bin.collectionStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <PriorityBadge priority={bin.priority} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenDetails(bin)}
                            title="View details"
                            className="p-1.5 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(bin)}
                            title="Edit bin"
                            className="p-1.5 rounded text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(bin.id)}
                            title="Delete bin"
                            className="p-1.5 rounded text-slate-600 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="p-3.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex justify-between">
            <span>
              Showing <strong className="text-slate-700">{filteredBins.length}</strong> of{' '}
              <strong className="text-slate-700">{bins.length}</strong> bins
            </span>
            <span>
              Automatic Priority Rule: Urgent &ge;90% | High 70–89% | Medium 40–69% | Low &lt;40%
            </span>
          </div>
        </div>
      ) : (
        /* Grid Cards View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredBins.map((bin) => (
            <div
              key={bin.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-sm text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {bin.id}
                  </span>
                  <PriorityBadge priority={bin.priority} size="sm" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 truncate" title={bin.location}>
                  {bin.location}
                </h4>
                <div className="text-[11px] text-slate-400 mb-3">
                  {bin.binType} · {bin.capacityLitres}L
                </div>
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500 font-medium">Current Fill</span>
                    <span className="font-mono font-bold text-slate-800">{bin.currentFill}%</span>
                  </div>
                  <FillProgressBar fill={bin.currentFill} showLabel={false} size="sm" />
                </div>
                <div className="text-[11px] text-slate-500 space-y-1 bg-slate-50 p-2 rounded-lg border border-slate-100 mb-4">
                  <div className="flex justify-between">
                    <span>Predicted (~2.5h):</span>
                    <strong className="text-slate-700 font-mono">{bin.predictedFill}%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Full in:</span>
                    <strong className="text-slate-700">{bin.estimatedTimeToFull}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Last updated:</span>
                    <span>{bin.lastReadingTime}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span
                  className={`text-[11px] font-semibold ${
                    bin.collectionStatus === 'Collected'
                      ? 'text-emerald-700'
                      : bin.collectionStatus === 'In Progress'
                      ? 'text-blue-700'
                      : 'text-amber-700'
                  }`}
                >
                  {bin.collectionStatus}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenDetails(bin)}
                    className="p-1 text-slate-500 hover:text-slate-900 rounded cursor-pointer"
                    title="View details"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleOpenEdit(bin)}
                    className="p-1 text-slate-500 hover:text-emerald-700 rounded cursor-pointer"
                    title="Edit bin"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleOpenDelete(bin.id)}
                    className="p-1 text-slate-500 hover:text-red-700 rounded cursor-pointer"
                    title="Delete bin"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <BinDetailsModal
        bin={detailsBin}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onEdit={handleOpenEdit}
      />

      <BinFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        binToEdit={binToEdit}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        binId={deleteBinId}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteOpen(false)}
      />
    </div>
  );
};
