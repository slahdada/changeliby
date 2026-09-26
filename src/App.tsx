import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { PosTerminal } from './components/POS/PosTerminal';
import { RatesManager } from './components/Rates/RatesManager';
import { CustomerKycManager } from './components/Customers/CustomerKycManager';
import { DailyCashDrawer } from './components/CashDrawer/DailyCashDrawer';
import { DailyClosureReport } from './components/Closure/DailyClosureReport';
import { UsersManager } from './components/Users/UsersManager';
import { AndroidCodeViewer } from './components/AndroidCodeExporter/AndroidCodeViewer';
import { CblMonitorModal } from './components/CblMonitor/CblMonitorModal';
import { CblPushToastContainer } from './components/CblPushAlerts/CblPushToastContainer';
import { GoogleSearchGroundingModal } from './components/GoogleSearchGrounding/GoogleSearchGroundingModal';

const MainContent: React.FC = () => {
  const { 
    activeTab, 
    isCblModalOpen, 
    setIsCblModalOpen, 
    isGoogleGroundingOpen, 
    setIsGoogleGroundingOpen, 
    lang 
  } = useApp();

  // Slide direction slightly depending on RTL/LTR
  const isRtl = lang === 'ar';

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col selection:bg-yellow-400 selection:text-slate-950 font-sans relative">
      
      {/* Floating Push Notification Toast Alerts for CBL rate updates */}
      <CblPushToastContainer />

      {/* Top Header */}
      <Header />

      {/* Body Layout */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto">
        
        {/* Navigation Drawer / Sidebar */}
        <Sidebar />

        {/* View Viewport with Smooth Fade / Slide Transitions */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto overflow-x-hidden min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10, x: isRtl ? 10 : -10 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, y: -8, x: isRtl ? -10 : 10 }}
              transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
              className="w-full"
            >
              {activeTab === 'POS' && <PosTerminal />}
              {activeTab === 'RATES' && <RatesManager />}
              {activeTab === 'CUSTOMERS' && <CustomerKycManager />}
              {activeTab === 'DRAWER' && <DailyCashDrawer />}
              {activeTab === 'CLOSURE' && <DailyClosureReport />}
              {activeTab === 'USERS' && <UsersManager />}
              {activeTab === 'ANDROID_CODE' && <AndroidCodeViewer />}
            </motion.div>
          </AnimatePresence>
        </main>

      </div>

      {/* Central Bank of Libya Live Monitor Modal */}
      <CblMonitorModal 
        isOpen={isCblModalOpen} 
        onClose={() => setIsCblModalOpen(false)} 
      />

      {/* Google Search Grounding Live Modal */}
      <GoogleSearchGroundingModal
        isOpen={isGoogleGroundingOpen}
        onClose={() => setIsGoogleGroundingOpen(false)}
      />

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
