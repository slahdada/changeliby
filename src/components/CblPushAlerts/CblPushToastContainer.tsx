import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Landmark, Bell, ArrowUpRight, ArrowDownRight, CheckCircle2, 
  ExternalLink, X, Sparkles, Volume2, VolumeX, ShieldAlert, Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CblRateAlert } from '../../types';

interface SingleToastProps {
  alert: CblRateAlert;
  onDismiss: (id: string) => void;
  onOpenCblModal: () => void;
  onApplyRate: (alert: CblRateAlert) => void;
  isFr: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

const SingleToast: React.FC<SingleToastProps> = ({
  alert,
  onDismiss,
  onOpenCblModal,
  onApplyRate,
  isFr,
  soundEnabled,
  onToggleSound
}) => {
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const [applied, setApplied] = useState(false);

  const durationMs = 9000;
  const intervalMs = 90;

  useEffect(() => {
    if (isPaused || applied) return;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          onDismiss(alert.id);
          return 0;
        }
        return prev - (intervalMs / durationMs) * 100;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [alert.id, isPaused, applied, onDismiss]);

  const handleApply = () => {
    setApplied(true);
    onApplyRate(alert);
    setTimeout(() => {
      onDismiss(alert.id);
    }, 1200);
  };

  const isUp = alert.delta >= 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -24, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: -20, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="w-full max-w-md bg-slate-900/95 text-slate-100 border-2 border-yellow-500/80 rounded-2xl shadow-2xl shadow-slate-950/80 overflow-hidden backdrop-blur-xl pointer-events-auto"
      role="alert"
    >
      {/* Top Banner / Push Header */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-yellow-500 text-slate-950 flex items-center justify-center font-black shadow-sm">
            <Landmark className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-white tracking-wide">
                {isFr ? 'Banque Centrale de Libye' : 'مصرف ليبيا المركزي'}
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-mono font-bold border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                {isFr ? 'Direct' : 'نشرة فورية'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-400">
          <button
            onClick={onToggleSound}
            className="p-1 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title={soundEnabled ? (isFr ? 'Couper le son' : 'كتم الصوت') : (isFr ? 'Activer le son' : 'تفعيل الصوت')}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-yellow-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
          </button>
          <button
            onClick={() => onDismiss(alert.id)}
            className="p-1 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title={isFr ? 'Fermer' : 'إغلاق'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Toast Body */}
      <div className="p-4 space-y-3">
        {/* Currency & Title Row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="text-3xl shrink-0">{alert.flag}</span>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-black text-white text-sm">
                  {isFr ? alert.currencyNameFr : alert.currencyNameAr}
                </h4>
                <span className="font-mono text-[10px] px-1.5 py-0.5 bg-slate-800 text-yellow-300 rounded font-bold border border-slate-700">
                  {alert.currencyCode}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                {alert.bulletinNo || (isFr ? 'Mise à jour officielle CBL' : 'تعديل السعر المرجعي الصادر عن إدارة العمليات')}
              </p>
            </div>
          </div>

          {/* Delta Pill */}
          <div className={`px-2.5 py-1 rounded-xl text-xs font-mono font-black flex items-center gap-1 border shrink-0 ${
            isUp 
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
              : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
          }`}>
            {isUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            <span>{isUp ? '+' : ''}{alert.delta.toFixed(3)} د.ل</span>
          </div>
        </div>

        {/* Rates Difference Card */}
        <div className="bg-slate-950/80 rounded-xl p-2.5 border border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">السعر السابق</span>
            <span className="font-mono font-bold text-slate-400 line-through">
              {alert.oldOfficialSell.toFixed(3)}
            </span>
          </div>
          <div className="border-x border-slate-800 px-1 bg-yellow-500/5 rounded">
            <span className="text-[10px] text-yellow-400 block font-bold">السعر الرسمي الجديد</span>
            <span className="font-mono font-black text-yellow-300 text-sm">
              {alert.newOfficialSell.toFixed(3)} <span className="text-[9px] font-normal text-slate-400">د.ل</span>
            </span>
          </div>
          <div>
            <span className="text-[10px] text-indigo-300 block font-medium">المصارف (+الرسم)</span>
            <span className="font-mono font-bold text-indigo-200">
              {alert.commercialBankRate.toFixed(3)}
            </span>
          </div>
        </div>

        {/* Note / Context */}
        {alert.notes && (
          <p className="text-[11px] text-slate-300 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/60 leading-relaxed flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
            <span className="line-clamp-2">{alert.notes}</span>
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => {
              onOpenCblModal();
              onDismiss(alert.id);
            }}
            className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-slate-700"
          >
            <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isFr ? 'Voir le bulletin CBL' : 'عرض بالنشرة الرسمية'}</span>
          </button>

          <button
            onClick={handleApply}
            disabled={applied}
            className="flex-1 py-2 px-3 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-md shadow-yellow-500/20"
          >
            {applied ? (
              <>
                <Check className="w-3.5 h-3.5 text-slate-950 font-black" />
                <span>{isFr ? 'Appliqué !' : 'تم التطبيق بنجاح'}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
                <span>{isFr ? 'Appliquer au Bureau' : 'تطبيق فوري بالمكتب'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Auto Dismiss Countdown Progress Bar */}
      <div className="h-1 w-full bg-slate-800">
        <motion.div 
          className="h-full bg-gradient-to-r from-yellow-500 to-amber-400"
          style={{ width: `${progress}%` }}
          transition={{ ease: 'linear' }}
        />
      </div>
    </motion.div>
  );
};

export const CblPushToastContainer: React.FC = () => {
  const { 
    activeToasts, 
    dismissToast, 
    setIsCblModalOpen, 
    applyAlertRateToBureau, 
    lang, 
    notificationSettings, 
    updateNotificationSettings 
  } = useApp();

  const isFr = lang === 'fr';

  const handleToggleSound = () => {
    updateNotificationSettings({ soundEnabled: !notificationSettings.soundEnabled });
  };

  if (!activeToasts || activeToasts.length === 0) return null;

  return (
    <aside 
      aria-label="Central Bank of Libya push notifications"
      className="fixed top-4 start-4 sm:top-6 sm:start-6 z-50 flex flex-col gap-3 max-w-md w-[calc(100vw-2rem)] sm:w-full pointer-events-none"
    >
      <AnimatePresence mode="popLayout">
        {activeToasts.map((alert) => (
          <SingleToast
            key={alert.id}
            alert={alert}
            onDismiss={dismissToast}
            onOpenCblModal={() => setIsCblModalOpen(true)}
            onApplyRate={applyAlertRateToBureau}
            isFr={isFr}
            soundEnabled={notificationSettings.soundEnabled}
            onToggleSound={handleToggleSound}
          />
        ))}
      </AnimatePresence>
    </aside>
  );
};
