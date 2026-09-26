import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, Globe, ShieldCheck, User, LogOut, 
  RotateCcw, Sparkles, Clock, CheckCircle2, ChevronDown, Landmark, Bell 
} from 'lucide-react';
import { LoginModal } from './LoginModal';
import { OfflineSyncIndicator } from './OfflineSync/OfflineSyncIndicator';
import { PerplexityFeedModal } from './PerplexitySync/PerplexityFeedModal';
import { CblNotificationCenterModal } from './CblPushAlerts/CblNotificationCenterModal';
import { RateFreshnessIndicator } from './Rates/RateFreshnessIndicator';
import { GoogleIcon } from './GoogleSearchGrounding/GoogleIcon';

export const Header: React.FC = () => {
  const { 
    lang, 
    setLang, 
    t, 
    currentUser, 
    resetDataToDefault, 
    setIsCblModalOpen, 
    setIsGoogleGroundingOpen, 
    unreadAlertsCount, 
    rates 
  } = useApp();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPerplexityModal, setShowPerplexityModal] = useState(false);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString(lang === 'ar' ? 'ar-LY' : 'fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [lang]);

  return (
    <>
      <header className="bg-slate-900 text-white border-b-4 border-yellow-500 sticky top-0 z-30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          
          {/* Logo & Bureau Badge */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center font-black text-slate-900 text-xl shadow-md shrink-0">
              LY
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg sm:text-xl text-white tracking-tight">{t.appName}</h1>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-slate-800 text-yellow-400 border border-slate-700 hidden sm:flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Offline-First
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-yellow-500" /> {currentUser.branch}
              </p>
            </div>
          </div>

          {/* Time, Rate Accuracy Indicator & Live Offline Sync Visual Indicator */}
          <div className="flex items-center gap-2.5">
            {/* Clock */}
            <div className="hidden lg:flex items-center gap-1.5 bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700 text-xs text-slate-200 font-mono">
              <Clock className="w-3.5 h-3.5 text-yellow-400" />
              <span>طرابلس {timeStr}</span>
            </div>

            {/* Global Rate Freshness & Accuracy Status Indicator */}
            <div className="hidden sm:block">
              <RateFreshnessIndicator
                updatedAt={rates[0]?.updatedAt}
                variant="compact"
              />
            </div>

            {/* Offline Sync Indicator Component */}
            <OfflineSyncIndicator />
          </div>

          {/* Actions & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Google Search Live Grounding Button */}
            <button
              onClick={() => setIsGoogleGroundingOpen(true)}
              className="px-3 py-1.5 text-xs font-black bg-white hover:bg-slate-100 text-slate-900 rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-blue-500/20 border border-slate-200 group"
              title="تقصي أسعار الصرف بـ Google Search Grounding"
            >
              <GoogleIcon className="w-4 h-4 group-hover:scale-110 transition-transform shrink-0" />
              <span className="hidden md:inline">Google Grounding</span>
              <span className="md:hidden">Google</span>
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            </button>

            {/* Perplexity AI Instant Live Sync Button */}
            <button
              onClick={() => setShowPerplexityModal(true)}
              className="px-3 py-1.5 text-xs font-black bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20 border border-cyan-400"
              title="تحديث فوري ذكي مع Perplexity"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span className="hidden md:inline">تحديث فوري (Perplexity)</span>
              <span className="md:hidden">Perplexity</span>
            </button>

            {/* Central Bank Live Updates & Official Bulletins Button */}
            <button
              onClick={() => setIsCblModalOpen(true)}
              className="px-3 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl flex items-center gap-1.5 sm:gap-2 transition-all shadow-md shadow-amber-900/20 border border-amber-400 group"
              title="المتابعة اللحظية لتحديثات البنك المركزي والبيانات الرسمية"
            >
              <div className="relative">
                <Landmark className="w-4 h-4 text-slate-950 group-hover:scale-110 transition-transform" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-slate-900 animate-pulse"></span>
              </div>
              <span className="hidden xl:inline">متابعة تحديثات البنك المركزي والبيانات الرسمية</span>
              <span className="xl:hidden">تحديثات CBL</span>
            </button>

            {/* Notification Center Trigger */}
            <button
              onClick={() => setShowNotificationCenter(true)}
              className="relative p-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition-all shadow-sm group"
              title="مركز تنبيهات وإشعارات البنك المركزي CBL"
            >
              <Bell className="w-4 h-4 text-yellow-400 group-hover:scale-110 transition-transform" />
              {unreadAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white rounded-full text-[10px] font-black flex items-center justify-center ring-2 ring-slate-900 animate-bounce">
                  {unreadAlertsCount}
                </span>
              )}
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'ar' ? 'fr' : 'ar')}
              className="px-2.5 sm:px-3 py-1.5 text-xs font-bold bg-yellow-500 text-slate-900 hover:bg-yellow-400 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
              title="تغيير اللغة / Changer la langue"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'FR' : 'AR'}</span>
            </button>

            {/* Reset Data */}
            <button
              onClick={() => {
                if (window.confirm('هل تريد إعادة تعيين كافة البيانات إلى البيانات التجريبية الافتراضية؟')) {
                  resetDataToDefault();
                }
              }}
              className="p-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg transition-colors"
              title={t.resetData}
            >
              <RotateCcw className="w-4 h-4 text-amber-400" />
            </button>

            {/* User Profile / Role Trigger */}
            <button
              onClick={() => setShowLoginModal(true)}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 pl-2.5 pr-2 py-1.5 rounded-xl transition-colors text-right"
            >
              <img
                src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'}
                alt={currentUser.fullName}
                className="w-7 h-7 rounded-full object-cover ring-2 ring-yellow-500/40"
              />
              <div className="hidden sm:block text-xs">
                <div className="font-bold text-slate-100">{currentUser.fullName}</div>
                <div className="text-[10px] text-yellow-400 font-mono">
                  {currentUser.role === 'ADMIN' ? `⚙️ ${t.admin}` : `💼 ${t.teller}`}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

          </div>

        </div>
      </header>

      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}

      {showPerplexityModal && (
        <PerplexityFeedModal 
          isOpen={showPerplexityModal} 
          onClose={() => setShowPerplexityModal(false)} 
        />
      )}

      {showNotificationCenter && (
        <CblNotificationCenterModal
          isOpen={showNotificationCenter}
          onClose={() => setShowNotificationCenter(false)}
        />
      )}
    </>
  );
};
