import React, { useState } from 'react';
import {
  TrendingUp,
  Clock,
  AlertTriangle,
  Info,
  Calendar,
  Layers,
  ChevronRight,
  Code2,
  Database,
  Cpu,
  BarChart2,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { useWasteManagement } from '../../context/WasteManagementContext';
import { PriorityBadge } from '../common/PriorityBadge';
import { FillProgressBar } from '../common/FillProgressBar';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const PredictionsPage: React.FC = () => {
  const { bins, selectedBinId, setSelectedBinId, selectedBin, markAsCollected } =
    useWasteManagement();

  const [forecastHorizon, setForecastHorizon] = useState<number>(5); // hours

  const currentBin = selectedBin || bins[0];

  // Calculate forward projections for the selected bin based on its hourlyFillRate
  const hourlyRate = currentBin.hourlyFillRate || 8;
  const currentFill = currentBin.currentFill;

  // Forecast points: Now, +1h, +2h, +3h, +4h, +5h
  const timeLabels = ['Now', '+1h', '+2h', '+3h', '+4h', '+5h'];
  const projectedValues = timeLabels.map((_, idx) => {
    return Math.min(100, Math.round(currentFill + idx * hourlyRate));
  });

  // Historical combined labels: -4h, -3h, -2h, -1h, Now, +1h, +2h, +3h, +4h, +5h
  const combinedLabels = [
    '-4h',
    '-3h',
    '-2h',
    '-1h',
    'Now',
    '+1h',
    '+2h',
    '+3h',
    '+4h',
    '+5h',
  ];

  // Interpolate historical points from bin
  const history = currentBin.historicalReadings || [];
  const historicalFillValues = [
    history[0]?.fillLevel ?? Math.max(0, currentFill - hourlyRate * 4),
    history[1]?.fillLevel ?? Math.max(0, currentFill - hourlyRate * 3),
    history[2]?.fillLevel ?? Math.max(0, currentFill - hourlyRate * 2),
    history[3]?.fillLevel ?? Math.max(0, currentFill - hourlyRate),
    currentFill,
    null,
    null,
    null,
    null,
    null,
  ];

  const forecastFillValues = [
    null,
    null,
    null,
    null,
    currentFill, // connecting point
    ...projectedValues.slice(1),
  ];

  const lineChartData = {
    labels: combinedLabels,
    datasets: [
      {
        label: 'Recorded Historical Reading (Demo)',
        data: historicalFillValues,
        borderColor: '#0284c7', // sky-600
        backgroundColor: 'rgba(2, 132, 199, 0.1)',
        borderWidth: 2.5,
        pointBackgroundColor: '#0284c7',
        pointRadius: 4,
        tension: 0.3,
        spanGaps: true,
      },
      {
        label: 'Estimated Trend Projection (ML Estimate)',
        data: forecastFillValues,
        borderColor: '#10b981', // emerald-500
        backgroundColor: 'rgba(16, 185, 129, 0.12)',
        borderWidth: 2.5,
        borderDash: [6, 4],
        pointBackgroundColor: '#10b981',
        pointRadius: 4,
        tension: 0.25,
        fill: true,
        spanGaps: true,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          boxWidth: 14,
          font: { family: 'Plus Jakarta Sans', size: 12, weight: 600 as any },
          color: '#334155',
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.dataset.label}: ${context.parsed.y}%`,
        },
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20,
          callback: (value: any) => `${value}%`,
          font: { family: 'JetBrains Mono', size: 11 },
          color: '#64748b',
        },
        grid: {
          color: 'rgba(226, 232, 240, 0.8)',
        },
      },
      x: {
        ticks: {
          font: { family: 'JetBrains Mono', size: 11 },
          color: '#64748b',
        },
        grid: {
          display: false,
        },
      },
    },
  };

  // Bar Comparison Data: Current vs Predicted
  const comparisonData = {
    labels: ['Current Level', `Predicted (+${forecastHorizon}h)`],
    datasets: [
      {
        label: 'Fill Level (%)',
        data: [currentFill, projectedValues[forecastHorizon] || currentBin.predictedFill],
        backgroundColor: [
          currentFill >= 90 ? '#ef4444' : currentFill >= 70 ? '#f97316' : '#10b981',
          projectedValues[forecastHorizon] >= 90 ? '#dc2626' : '#ea580c',
        ],
        borderRadius: 6,
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Fill-Level Predictions
          </h2>
          <p className="text-xs text-slate-500">
            Predictive estimation engine analyzing historical accumulation velocity to prevent overflow.
          </p>
        </div>

        {/* Bin Selector Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">Select Bin:</span>
          <select
            value={currentBin.id}
            onChange={(e) => setSelectedBinId(e.target.value)}
            className="px-3 py-1.5 text-xs font-mono font-bold border border-slate-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            {bins.map((b) => (
              <option key={b.id} value={b.id}>
                {b.id} — {b.location} ({b.currentFill}%)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Model & Demonstration Disclaimer (Explicitly addressing requirement) */}
      <div className="p-4 rounded-xl bg-slate-900 text-slate-200 shadow-xs border border-slate-800">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Demonstration Prediction Architecture (Scikit-Learn / Regression Readiness)
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Notice:</strong> Physical ultrasonic sensors and the Python Scikit-learn
              machine-learning model are not yet deployed in production. Current predictions are
              demonstration linear trend calculations estimating near-future capacity based on
              sample historical fill rates. The data structure is formatted for immediate drop-in
              integration with a Python Flask + Scikit-Learn (LinearRegression / Random Forest) + SQLite backend.
            </p>
          </div>
        </div>
      </div>

      {/* Main Prediction Layout: Chart on Left, Selected Bin Panel on Right (matching Figure 8.2) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Trend Chart & Comparison */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Chart Box */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-2 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Estimated Fill Level Over Time
                </h3>
                <p className="text-xs text-slate-500">
                  Illustrative forecast based on recent fill-level readings and rate of change
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-500 font-medium">Forecast Horizon:</span>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold font-mono">
                  +5 Hours
                </span>
              </div>
            </div>

            {/* Line Chart Canvas */}
            <div className="h-72 w-full">
              <Line data={lineChartData} options={lineChartOptions} />
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-[#0284c7] inline-block" />
                  <span>Historical Record (-4h to Now)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 border-t-2 border-dashed border-[#10b981] inline-block" />
                  <span>Forward ML Estimate (+1h to +5h)</span>
                </span>
              </div>
              <span>Computed Fill Velocity: ~{hourlyRate}% / hour</span>
            </div>
          </div>

          {/* Secondary Comparison Panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                Current vs. Predicted Comparison
              </h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Current Reading</span>
                    <span className="font-mono font-bold text-slate-900">{currentFill}%</span>
                  </div>
                  <FillProgressBar fill={currentFill} showLabel={false} size="md" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Predicted Level (in ~2.5h)</span>
                    <span className="font-mono font-bold text-red-600">
                      {currentBin.predictedFill}%
                    </span>
                  </div>
                  <FillProgressBar fill={currentBin.predictedFill} showLabel={false} size="md" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Projected Peak (+5h)</span>
                    <span className="font-mono font-bold text-red-700">
                      {projectedValues[5]}%
                    </span>
                  </div>
                  <FillProgressBar fill={projectedValues[5]} showLabel={false} size="md" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Sanitation Priority Recommendation
                </h4>
                <div className="mt-2">
                  <PriorityBadge priority={currentBin.priority} size="lg" />
                </div>
                <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                  {currentBin.currentFill >= 90
                    ? 'Bin has reached critical threshold. Immediate dispatch recommended to prevent public overflow.'
                    : currentBin.currentFill >= 70
                    ? 'Fill velocity indicates bin will reach capacity within 1–2 hours. Include in upcoming route loop.'
                    : currentBin.currentFill >= 40
                    ? 'Normal accumulation pace. Schedule for afternoon collection cycle.'
                    : 'Low fill level. No immediate collection needed.'}
                </p>
              </div>

              {currentBin.collectionStatus !== 'Collected' && (
                <button
                  onClick={() => markAsCollected(currentBin.id)}
                  className="mt-4 w-full py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
                >
                  Mark Bin {currentBin.id} as Collected Now
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Selected Bin Details Panel (matching Figure 8.2 mockup from project report) */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Selected Bin
            </div>
            <div className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight mb-4">
              {currentBin.id}
            </div>

            <div className="space-y-4 pt-3 border-t border-slate-100">
              {/* Current Fill */}
              <div>
                <div className="text-xs text-slate-500">Current fill</div>
                <div className="text-3xl font-extrabold text-slate-800 font-mono tabular-nums">
                  {currentBin.currentFill}%
                </div>
                <div className="mt-1">
                  <FillProgressBar fill={currentBin.currentFill} size="sm" showLabel={false} />
                </div>
              </div>

              {/* Predicted in 5 hours */}
              <div>
                <div className="text-xs text-slate-500">Predicted in 5 hours</div>
                <div className="text-3xl font-extrabold text-red-600 font-mono tabular-nums">
                  {projectedValues[5]}%
                </div>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Estimated full in: <strong>{currentBin.estimatedTimeToFull}</strong></span>
                </div>
              </div>

              {/* Priority Banner Card */}
              <div className="pt-2">
                <div
                  className={`p-3 rounded-lg text-center font-bold text-xs uppercase tracking-wider border ${
                    currentBin.priority === 'Urgent'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : currentBin.priority === 'High'
                      ? 'bg-orange-50 text-orange-700 border-orange-200'
                      : currentBin.priority === 'Medium'
                      ? 'bg-yellow-50 text-yellow-800 border-yellow-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {currentBin.priority} COLLECTION
                </div>
                <p className="text-[10px] text-slate-400 text-center mt-2 italic">
                  Priority can be adjusted after real-data validation.
                </p>
              </div>

              {/* Location & Metadata List */}
              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Location:</span>
                  <span className="font-semibold text-slate-800">{currentBin.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Waste Type:</span>
                  <span className="font-semibold text-slate-800">{currentBin.binType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Container Size:</span>
                  <span className="font-semibold text-slate-800">{currentBin.capacityLitres} L</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Fill Velocity:</span>
                  <span className="font-semibold text-slate-800 font-mono">~{currentBin.hourlyFillRate}%/hr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-semibold text-slate-800">{currentBin.collectionStatus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Last Telemetry:</span>
                  <span className="font-mono text-slate-600">{currentBin.lastReadingTime}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Select Grid for Other High Urgency Bins */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
              Switch to Other Urgent Bins
            </h4>
            <div className="space-y-1.5">
              {bins
                .filter((b) => b.id !== currentBin.id && (b.priority === 'Urgent' || b.priority === 'High'))
                .slice(0, 5)
                .map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBinId(b.id)}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 border border-slate-100 text-left transition-colors cursor-pointer"
                  >
                    <div>
                      <span className="font-mono font-bold text-xs text-slate-900 block">
                        {b.id} · {b.location}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {b.currentFill}% full · {b.estimatedTimeToFull}
                      </span>
                    </div>
                    <PriorityBadge priority={b.priority} size="sm" />
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
