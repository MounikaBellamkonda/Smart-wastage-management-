import React from 'react';
import {
  WasteManagementProvider,
  useWasteManagement,
} from './context/WasteManagementContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { OverviewPage } from './components/dashboard/OverviewPage';
import { BinMonitoringPage } from './components/monitoring/BinMonitoringPage';
import { PredictionsPage } from './components/predictions/PredictionsPage';
import { CollectionPlanningPage } from './components/planning/CollectionPlanningPage';
import { ReportsPage } from './components/reports/ReportsPage';
import { SettingsPage } from './components/settings/SettingsPage';

const AppContent: React.FC = () => {
  const { activeTab } = useWasteManagement();

  return (
    <div className="min-h-screen flex bg-slate-100 text-slate-800 antialiased font-sans">
      {/* Fixed Left Sidebar for Desktop Website */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {activeTab === 'overview' && <OverviewPage />}
          {activeTab === 'monitoring' && <BinMonitoringPage />}
          {activeTab === 'predictions' && <PredictionsPage />}
          {activeTab === 'planning' && <CollectionPlanningPage />}
          {activeTab === 'reports' && <ReportsPage />}
          {activeTab === 'settings' && <SettingsPage />}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <WasteManagementProvider>
      <AppContent />
    </WasteManagementProvider>
  );
}
