import React, { useState } from 'react';
import {
  Download,
  Calendar,
  BarChart3,
  PieChart,
  Info,
  CheckCircle,
  AlertTriangle,
  Building2,
  Gauge,
  FileSpreadsheet,
} from 'lucide-react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement,
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { useWasteManagement } from '../../context/WasteManagementContext';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement
);

export const ReportsPage: React.FC = () => {
  const { bins, metrics } = useWasteManagement();
  const [dateFilter, setDateFilter] = useState<'today' | '7days' | '30days'>('today');

  // Priority Distribution Data
  const priorityChartData = {
    labels: ['Urgent (>=90%)', 'High (70-89%)', 'Medium (40-69%)', 'Low (<40%)'],
    datasets: [
      {
        data: [metrics.urgentCount, metrics.highCount, metrics.mediumCount, metrics.lowCount],
        backgroundColor: [
          '#ef4444', // Red
          '#f97316', // Orange
          '#eab308', // Yellow
          '#10b981', // Green
        ],
        borderWidth: 1,
        borderColor: '#ffffff',
      },
    ],
  };

  // Fill-level distribution brackets
  const bracketUnder40 = bins.filter((b) => b.currentFill < 40).length;
  const bracket40to69 = bins.filter((b) => b.currentFill >= 40 && b.currentFill < 70).length;
  const bracket70to89 = bins.filter((b) => b.currentFill >= 70 && b.currentFill < 90).length;
  const bracket90plus = bins.filter((b) => b.currentFill >= 90).length;

  const fillDistributionData = {
    labels: ['< 40% (Low)', '40%–69% (Medium)', '70%–89% (High)', '>= 90% (Urgent)'],
    datasets: [
      {
        label: 'Number of Bins',
        data: [bracketUnder40, bracket40to69, bracket70to89, bracket90plus],
        backgroundColor: ['#10b981', '#f59e0b', '#f97316', '#ef4444'],
        borderRadius: 4,
      },
    ],
  };

  // Collection Status Distribution
  const statusChartData = {
    labels: ['Pending Pickup', 'In Progress', 'Collected / Emptied'],
    datasets: [
      {
        data: [metrics.pendingCount, metrics.inProgressCount, metrics.collectedCount],
        backgroundColor: ['#f59e0b', '#3b82f6', '#10b981'],
        borderWidth: 1,
        borderColor: '#ffffff',
      },
    ],
  };

  // Top locations by average fill level
  const locationGroups: Record<string, { totalFill: number; count: number }> = {};
  bins.forEach((b) => {
    if (!locationGroups[b.location]) {
      locationGroups[b.location] = { totalFill: 0, count: 0 };
    }
    locationGroups[b.location].totalFill += b.currentFill;
    locationGroups[b.location].count += 1;
  });

  const locationLabels = Object.keys(locationGroups).slice(0, 8);
  const locationAvgFill = locationLabels.map((loc) =>
    Math.round(locationGroups[loc].totalFill / locationGroups[loc].count)
  );

  const locationComparisonData = {
    labels: locationLabels,
    datasets: [
      {
        label: 'Average Fill Level (%)',
        data: locationAvgFill,
        backgroundColor: '#0284c7',
        borderRadius: 4,
      },
    ],
  };

  // Function to generate and trigger CSV download
  const handleDownloadCSV = () => {
    const headers = [
      'Bin ID',
      'Location',
      'Bin Type',
      'Capacity (Litres)',
      'Current Fill (%)',
      'Predicted Fill (%)',
      'Time Until Full',
      'Priority Level',
      'Collection Status',
      'Hourly Fill Rate (%/h)',
      'Last Telemetry Reading',
      'Field Notes',
    ];

    const rows = bins.map((b) => [
      `"${b.id}"`,
      `"${b.location.replace(/"/g, '""')}"`,
      `"${b.binType}"`,
      b.capacityLitres,
      b.currentFill,
      b.predictedFill,
      `"${b.estimatedTimeToFull}"`,
      `"${b.priority}"`,
      `"${b.collectionStatus}"`,
      b.hourlyFillRate,
      `"${b.lastReadingTime}"`,
      `"${(b.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `smart_waste_management_report_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          boxWidth: 12,
          font: { family: 'Plus Jakarta Sans', size: 11 },
          color: '#475569',
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Header & CSV Download */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Reports and Analytics
          </h2>
          <p className="text-xs text-slate-500">
            Municipal sanitation reporting, capacity distributions, and telemetry data export.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Date Range Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setDateFilter('today')}
              className={`px-3 py-1.5 rounded-md font-medium cursor-pointer transition-colors ${
                dateFilter === 'today' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setDateFilter('7days')}
              className={`px-3 py-1.5 rounded-md font-medium cursor-pointer transition-colors ${
                dateFilter === '7days' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              Past 7 Days
            </button>
            <button
              onClick={() => setDateFilter('30days')}
              className={`px-3 py-1.5 rounded-md font-medium cursor-pointer transition-colors ${
                dateFilter === '30days' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              Past 30 Days
            </button>
          </div>

          {/* Download CSV button */}
          <button
            onClick={handleDownloadCSV}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
            title="Download CSV containing all current bin records"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV Report</span>
          </button>
        </div>
      </div>

      {/* Demonstration Banner */}
      <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs">
          <strong>Demonstration Statistics Label:</strong> All metrics, distributions, and exported
          tables represent sample demonstration telemetry data for academic and municipal prototype evaluation.
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Total Bins Monitored
          </span>
          <div className="text-3xl font-extrabold text-slate-900 font-mono mt-2 tabular-nums">
            {metrics.totalBins}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Registered in active reporting sector
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Bins Collected Today
          </span>
          <div className="text-3xl font-extrabold text-emerald-600 font-mono mt-2 tabular-nums">
            {metrics.collectedCount}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Serviced and baseline reset
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Urgent Bins Count
          </span>
          <div className="text-3xl font-extrabold text-red-600 font-mono mt-2 tabular-nums">
            {metrics.urgentCount}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Capacity &ge; 90% (Imminent overflow)
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Average Fill Percentage
          </span>
          <div className="text-3xl font-extrabold text-slate-900 font-mono mt-2 tabular-nums">
            {metrics.averageFill}%
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Across all monitored containers
          </p>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chart 1: Priority Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Priority Distribution
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Breakdown of monitored bins classified into priority tiers
            </p>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <Doughnut data={priorityChartData} options={commonChartOptions} />
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-4 gap-2 text-center text-xs">
            <div>
              <span className="text-red-600 font-bold font-mono">{metrics.urgentCount}</span>
              <span className="block text-[10px] text-slate-400">Urgent</span>
            </div>
            <div>
              <span className="text-orange-600 font-bold font-mono">{metrics.highCount}</span>
              <span className="block text-[10px] text-slate-400">High</span>
            </div>
            <div>
              <span className="text-amber-600 font-bold font-mono">{metrics.mediumCount}</span>
              <span className="block text-[10px] text-slate-400">Medium</span>
            </div>
            <div>
              <span className="text-emerald-600 font-bold font-mono">{metrics.lowCount}</span>
              <span className="block text-[10px] text-slate-400">Low</span>
            </div>
          </div>
        </div>

        {/* Chart 2: Fill-Level Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Fill-Level Range Distribution
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Histogram of bin fill percentages segmented across capacity ranges
            </p>
          </div>
          <div className="h-64 w-full">
            <Bar
              data={fillDistributionData}
              options={{
                ...commonChartOptions,
                plugins: { legend: { display: false } },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { stepSize: 2, font: { family: 'JetBrains Mono' } },
                  },
                  x: { ticks: { font: { family: 'Plus Jakarta Sans', size: 10 } } },
                },
              }}
            />
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 text-center">
            Current system peak: {bracket90plus} bins in critical (&ge;90%) bracket
          </div>
        </div>

        {/* Chart 3: Collection Status Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Collection Status Breakdown
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Current operational queue status across sanitation beats
            </p>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <Doughnut data={statusChartData} options={commonChartOptions} />
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <span className="text-amber-600 font-bold font-mono">{metrics.pendingCount}</span>
              <span className="block text-[10px] text-slate-400">Pending</span>
            </div>
            <div>
              <span className="text-blue-600 font-bold font-mono">{metrics.inProgressCount}</span>
              <span className="block text-[10px] text-slate-400">In Progress</span>
            </div>
            <div>
              <span className="text-emerald-600 font-bold font-mono">{metrics.collectedCount}</span>
              <span className="block text-[10px] text-slate-400">Collected</span>
            </div>
          </div>
        </div>

        {/* Chart 4: Location Comparison */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Average Fill Level by Location
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Average capacity fill across major municipal sectors and landmarks
            </p>
          </div>
          <div className="h-64 w-full">
            <Bar
              data={locationComparisonData}
              options={{
                ...commonChartOptions,
                plugins: { legend: { display: false } },
                scales: {
                  y: {
                    min: 0,
                    max: 100,
                    ticks: {
                      stepSize: 20,
                      callback: (v: any) => `${v}%`,
                      font: { family: 'JetBrains Mono' },
                    },
                  },
                  x: { ticks: { font: { family: 'Plus Jakarta Sans', size: 9 } } },
                },
              }}
            />
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 text-center">
            LB Nagar Ring Road, Vanasthalipuram Rythu Bazaar, and Hayathnagar Market register highest accumulation
          </div>
        </div>
      </div>
    </div>
  );
};
