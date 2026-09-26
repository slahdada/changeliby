import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { 
  ArrowLeftRight, TrendingUp, Users, Wallet, 
  FileCheck, ShieldAlert, Smartphone, Landmark,
  MoreHorizontal, X, Download, Building2, Globe
} from 'lucide-react';
import { NavTab } from '../../types';
import { PWAInstallButton } from '../PWA/PWAInstallButton';
import { GoogleIcon } from '../GoogleSearchGrounding/GoogleIcon';
import { UserAvatar } from '../Common/UserAvatar';

export const MobileBottomNav: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    t, 
    currentUser, 
    setIsCblModalOpen, 
    setIsGoogleGroundingOpen,
    lang,
    setLang
  } = useApp();

  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const mainTabs: { id: NavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'POS', label: 'نقطة البيع', icon: ArrowLeftRight },
    { id: 'RATES', label: 'الأسعار', icon: TrendingUp },
    { id: 'DRAWER', label: 'الخزينة', icon: Wallet },
    { id: 'CUSTOMERS', label: 'الزبائن', icon: Users },
  ];

  const secondaryTabs: { id: NavTab; label: string; icon: React.FC<{ className?: string }>; adminOnly?: boolean }[] = [
    { id: 'CLOSURE', label: t.closureTitle, icon: FileCheck },
    { id: 'USERS', label: t.usersTitle, icon: ShieldAlert, adminOnly: true },
    { id: 'ANDROID_CODE', label: t.androidCodeTitle, icon: Smartphone },
  ];

  const handleSelectTab = (tabId: NavTab) => {
    setActiveTab(tabId);
    setIsMoreMenuOpen(false);
  };

  const isMoreActive = secondaryTabs.some(tab => tab.id === activeTab);

  return (
    <>
      {/* Fixed Bottom Navigation Bar on Mobile */}
      <nav 
        className="fixed bottom-0 inset-x-0 z-40 bg-slate-900 text-white border-t-2 border-yellow-500 shadow-2xl flex items-center justify-around px-1 py-1.5 lg:hidden select-none"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 6px)' }}
        dir="rtl"
      >
        {mainTabs.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelectTab(item.id)}
              className={`flex-1 py-1 px-1 flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all active:scale-95 ${
                isActive 
                  ? 'text-yellow-400 font-black' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-yellow-500/20 text-yellow-400' : 'text-slate-400'}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] leading-tight truncate w-full text-center">
                {item.label}
              </span>
            </button>
          );
        })}

        {/* More Tab Button */}
        <button
          type="button"
          onClick={() => setIsMoreMenuOpen(true)}
          className={`flex-1 py-1 px-1 flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all active:scale-95 ${
            isMoreActive || isMoreMenuOpen
              ? 'text-yellow-400 font-black' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-lg ${isMoreActive || isMoreMenuOpen ? 'bg-yellow-500/20 text-yellow-400' : 'text-slate-400'}`}>
            <MoreHorizontal className="w-5 h-5" />
          </div>
          <span className="text-[10px] leading-tight">المزيد</span>
        </button>
      </nav>

      {/* Slide-Up Bottom Drawer for "More" Menu */}
      <AnimatePresence>
        {isMoreMenuOpen && (
          <div 
            className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex flex-col justify-end lg:hidden animate-fade-in"
            onClick={() => setIsMoreMenuOpen(false)}
            dir="rtl"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="bg-white rounded-t-3xl border-t-4 border-yellow-500 max-h-[82vh] overflow-y-auto p-4 space-y-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)' }}
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-yellow-500 flex items-center justify-center font-black text-slate-900 text-sm">
                    LY
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{t.appName}</h3>
                    <p className="text-[10px] text-slate-500">القائمة السريعة للعمليات</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMoreMenuOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Install PWA Button Prominent in Drawer */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-2.5">
                <PWAInstallButton variant="menu" />
              </div>

              {/* Secondary Navigation Options */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-slate-400 px-1">
                  إدارة المبيعات والتقارير
                </div>

                {secondaryTabs.map((item) => {
                  if (item.adminOnly && currentUser.role !== 'ADMIN') return null;
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectTab(item.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl text-xs font-bold transition-all text-right ${
                        isActive
                          ? 'bg-slate-900 text-white border-r-4 border-yellow-500 shadow-sm'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-yellow-400' : 'text-slate-500'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Special External Feeds */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <div className="text-[11px] font-bold text-slate-400 px-1">
                  التقصي وتحديثات السوق
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    setIsCblModalOpen(true);
                  }}
                  className="w-full flex items-center justify-between p-3 bg-amber-500/10 hover:bg-amber-500/20 text-slate-900 rounded-xl text-xs font-bold border border-amber-300"
                >
                  <div className="flex items-center gap-2.5">
                    <Landmark className="w-4 h-4 text-amber-700" />
                    <span>نشرة مصرف ليبيا المركزي (CBL)</span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    setIsGoogleGroundingOpen(true);
                  }}
                  className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 text-slate-900 rounded-xl text-xs font-bold border border-slate-200"
                >
                  <div className="flex items-center gap-2.5">
                    <GoogleIcon className="w-4 h-4" />
                    <span>تقصي Google Grounding المباشر</span>
                  </div>
                  <span className="text-[10px] text-blue-600 font-mono font-bold">Live</span>
                </button>
              </div>

              {/* User Profile Info & Language */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <UserAvatar
                    user={currentUser}
                    size="sm"
                    ringColor="ring-yellow-500/50"
                  />
                  <div>
                    <div className="font-bold text-slate-800 truncate max-w-[150px]">
                      {currentUser.fullName}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {currentUser.role === 'ADMIN' ? 'مدير عام' : 'صراف'} • {currentUser.branch}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setLang(lang === 'ar' ? 'fr' : 'ar')}
                  className="px-2.5 py-1.5 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold text-xs flex items-center gap-1"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'Français' : 'العربية'}</span>
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
