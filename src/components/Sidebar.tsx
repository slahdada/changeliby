import React from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { 
  ArrowLeftRight, TrendingUp, Users, Wallet, 
  FileCheck, ShieldAlert, Smartphone, Landmark
} from 'lucide-react';
import { NavTab } from '../types';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, t, currentUser, setIsCblModalOpen } = useApp();

  const navItems: { id: NavTab; label: string; icon: React.FC<{ className?: string }>; adminOnly?: boolean }[] = [
    { id: 'POS', label: t.posTitle, icon: ArrowLeftRight },
    { id: 'RATES', label: t.ratesTitle, icon: TrendingUp },
    { id: 'CUSTOMERS', label: t.customersTitle, icon: Users },
    { id: 'DRAWER', label: t.drawerTitle, icon: Wallet },
    { id: 'CLOSURE', label: t.closureTitle, icon: FileCheck },
    { id: 'USERS', label: t.usersTitle, icon: ShieldAlert, adminOnly: true },
    { id: 'ANDROID_CODE', label: t.androidCodeTitle, icon: Smartphone },
  ];

  return (
    <aside className="w-full lg:w-64 p-3 lg:p-4 shrink-0">
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        
        <div className="mb-4 px-1 hidden lg:block border-b border-slate-100 pb-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {t.appName}
          </div>
          <div className="text-xs font-bold text-slate-700 mt-0.5">
            قائمة النظام الرئيسية
          </div>
        </div>

        <nav className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-none">
          {navItems.map((item) => {
            if (item.adminOnly && currentUser.role !== 'ADMIN') return null;

            const Icon = item.icon;
            const isActive = activeTab === item.id;

            const customStyle: React.CSSProperties = {};
            if (item.id === 'CUSTOMERS') {
              customStyle.backgroundColor = '#0ed8e6';
              customStyle.fontStyle = 'italic';
            } else if (item.id === 'DRAWER') {
              customStyle.backgroundColor = '#80ed9b';
            } else if (item.id === 'CLOSURE') {
              customStyle.backgroundColor = '#5edf0c';
            }

            return (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(item.id)}
                style={customStyle}
                className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap lg:whitespace-normal ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-md border-r-4 border-yellow-500'
                    : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 transition-colors ${isActive ? 'text-yellow-400' : 'text-slate-400'}`} />
                <span className="relative z-10">{item.label}</span>
                {isActive && (
                  <motion.span
                    layoutId="activeTabGlow"
                    className="absolute inset-0 rounded-xl bg-slate-900/10 -z-0 pointer-events-none"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Central Bank of Libya Live Monitor Action Button */}
        <div className="mt-4 pt-3 border-t border-slate-100 hidden lg:block">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsCblModalOpen(true)}
            className="w-full p-3 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black rounded-xl text-xs flex items-center justify-between gap-2 shadow-sm transition-all group"
          >
            <div className="flex items-center gap-2 text-right">
              <div className="p-1.5 bg-slate-900 text-yellow-400 rounded-lg group-hover:scale-105 transition-transform">
                <Landmark className="w-4 h-4" />
              </div>
              <div>
                <div className="font-black text-[11px] leading-tight">تحديثات البنك المركزي</div>
                <div className="text-[9px] text-slate-800 font-bold">نشرات وبيانات رسمية حية</div>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-700 animate-pulse"></span>
          </motion.button>
        </div>

        {/* Role Indicator Banner */}
        <div className="mt-6 pt-4 border-t border-slate-100 hidden lg:block text-xs">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="text-slate-500 text-[11px] font-bold mb-0.5">
              {t.loggedAs}:
            </div>
            <div className="font-bold text-slate-900 truncate">
              {currentUser.fullName}
            </div>
            <div className="text-yellow-600 font-mono text-[10px] mt-0.5 font-bold">
              {currentUser.role === 'ADMIN' ? `⚙️ ${t.admin}` : `💼 ${t.teller}`}
            </div>
          </div>
        </div>

      </div>
    </aside>
  );
};
