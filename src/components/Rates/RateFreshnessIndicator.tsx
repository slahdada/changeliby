import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, AlertTriangle, Clock, RefreshCw, 
  Sparkles, CheckCircle2, ChevronDown, Info, Landmark 
} from 'lucide-react';
import { evaluateRateFreshness, RateFreshnessInfo } from '../../utils/rateFreshnessUtils';
import { useApp } from '../../context/AppContext';

interface Props {
  updatedAt?: string;
  currencyCode?: string;
  variant?: 'badge' | 'inline' | 'compact' | 'detailed';
  showDetailsOnClick?: boolean;
  className?: string;
}

export const RateFreshnessIndicator: React.FC<Props> = ({
  updatedAt,
  currencyCode,
  variant = 'badge',
  showDetailsOnClick = true,
  className = ''
}) => {
  const { lang, syncWithMarketFeed, setIsCblModalOpen } = useApp();
  const [freshness, setFreshness] = useState<RateFreshnessInfo>(() => evaluateRateFreshness(updatedAt));
  const [showPopover, setShowPopover] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const isFr = lang === 'fr';

  // Live timer interval to keep timeAgo text updated in real time
  useEffect(() => {
    setFreshness(evaluateRateFreshness(updatedAt));
    const timer = setInterval(() => {
      setFreshness(evaluateRateFreshness(updatedAt));
    }, 30000); // refresh every 30 seconds

    return () => clearInterval(timer);
  }, [updatedAt]);

  const handleQuickSync = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSyncing(true);
    setTimeout(() => {
      syncWithMarketFeed();
      setIsSyncing(false);
      setFreshness(evaluateRateFreshness(new Date().toISOString()));
      setShowPopover(false);
    }, 500);
  };

  const statusLabel = isFr ? freshness.statusLabelFr : freshness.statusLabelAr;
  const timeAgo = isFr ? freshness.timeAgoTextFr : freshness.timeAgoTextAr;
  const description = isFr ? freshness.descriptionFr : freshness.descriptionAr;

  // Inline minimal dot
  if (variant === 'inline') {
    return (
      <div 
        className={`inline-flex items-center gap-1.5 cursor-pointer select-none text-[11px] font-mono font-bold ${freshness.colorClass.text} ${className}`}
        onClick={() => showDetailsOnClick && setShowPopover(!showPopover)}
        title={`${statusLabel} (${timeAgo})`}
      >
        <span className="relative flex h-2 w-2">
          {freshness.level === 'LIVE_OPTIMAL' && (
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${freshness.colorClass.dot} opacity-75`}></span>
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${freshness.colorClass.dot}`}></span>
        </span>
        <span>{timeAgo}</span>
      </div>
    );
  }

  // Compact badge
  if (variant === 'compact') {
    return (
      <div className="relative inline-block">
        <button
          type="button"
          onClick={() => showDetailsOnClick && setShowPopover(!showPopover)}
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border transition-all ${freshness.colorClass.bg} ${freshness.colorClass.text} ${freshness.colorClass.border} hover:opacity-90 ${className}`}
        >
          <span className="relative flex h-1.5 w-1.5">
            {freshness.level === 'LIVE_OPTIMAL' && (
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${freshness.colorClass.dot} opacity-75`}></span>
            )}
            <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${freshness.colorClass.dot}`}></span>
          </span>
          <span>{freshness.confidencePercent}%</span>
          <span className="opacity-75">• {timeAgo}</span>
        </button>

        {/* Popover */}
        <AnimatePresence>
          {showPopover && (
            <PopoverContent
              freshness={freshness}
              updatedAt={updatedAt}
              currencyCode={currencyCode}
              isFr={isFr}
              isSyncing={isSyncing}
              onQuickSync={handleQuickSync}
              onOpenCbl={() => {
                setShowPopover(false);
                setIsCblModalOpen(true);
              }}
              onClose={() => setShowPopover(false)}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Standard Badge (Default)
  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => showDetailsOnClick && setShowPopover(!showPopover)}
        className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-xl text-xs font-bold border transition-all shadow-xs group ${freshness.colorClass.bg} ${freshness.colorClass.text} ${freshness.colorClass.border} hover:scale-[1.02] active:scale-[0.98] ${className}`}
      >
        <span className="relative flex h-2 w-2">
          {freshness.level === 'LIVE_OPTIMAL' && (
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${freshness.colorClass.dot} opacity-75`}></span>
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${freshness.colorClass.dot}`}></span>
        </span>
        
        <span className="font-bold flex items-center gap-1">
          <span>{statusLabel}</span>
          <span className="font-mono text-[10px] px-1 py-0.2 bg-white/70 rounded font-black">
            {freshness.confidencePercent}%
          </span>
        </span>

        <span className="opacity-60 text-[10px] font-mono font-medium hidden sm:inline">
          ({timeAgo})
        </span>

        {showDetailsOnClick && (
          <ChevronDown className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
        )}
      </button>

      {/* Popover Modal / Tooltip */}
      <AnimatePresence>
        {showPopover && (
          <PopoverContent
            freshness={freshness}
            updatedAt={updatedAt}
            currencyCode={currencyCode}
            isFr={isFr}
            isSyncing={isSyncing}
            onQuickSync={handleQuickSync}
            onOpenCbl={() => {
              setShowPopover(false);
              setIsCblModalOpen(true);
            }}
            onClose={() => setShowPopover(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

interface PopoverContentProps {
  freshness: RateFreshnessInfo;
  updatedAt?: string;
  currencyCode?: string;
  isFr: boolean;
  isSyncing: boolean;
  onQuickSync: (e: React.MouseEvent) => void;
  onOpenCbl: () => void;
  onClose: () => void;
}

const PopoverContent: React.FC<PopoverContentProps> = ({
  freshness,
  updatedAt,
  currencyCode,
  isFr,
  isSyncing,
  onQuickSync,
  onOpenCbl,
  onClose
}) => {
  const formattedTime = updatedAt 
    ? new Date(updatedAt).toLocaleTimeString(isFr ? 'fr-FR' : 'ar-LY', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '-';

  return (
    <>
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 6, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 4, scale: 0.96 }}
        transition={{ duration: 0.15 }}
        className="absolute top-full mt-2 end-0 z-50 w-72 sm:w-80 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 p-4 space-y-3.5 backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${freshness.colorClass.bg} ${freshness.colorClass.text}`}>
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white">
                {isFr ? 'Indicateur de Précision' : 'مؤشر دقة وصحة سعر الصرف'}
              </h4>
              {currencyCode && (
                <span className="text-[10px] text-slate-400 font-mono">
                  {currencyCode} / LYD
                </span>
              )}
            </div>
          </div>

          <div className="text-right font-mono">
            <span className="text-xs font-black text-emerald-400">
              {freshness.confidencePercent}%
            </span>
            <span className="block text-[9px] text-slate-400 font-sans">
              {isFr ? 'Fiabilité' : 'مستوى الثقة'}
            </span>
          </div>
        </div>

        {/* Confidence Meter Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>{isFr ? 'Niveau de fraîcheur' : 'مقياس حداثة البيانات'}</span>
            <span className="font-bold text-slate-200">{isFr ? freshness.statusLabelFr : freshness.statusLabelAr}</span>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${freshness.confidencePercent}%` }}
              transition={{ duration: 0.4 }}
              className={`h-full rounded-full ${
                freshness.confidencePercent >= 90
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : freshness.confidencePercent >= 75
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                  : 'bg-gradient-to-r from-rose-500 to-orange-400'
              }`}
            />
          </div>
        </div>

        {/* Details & Description */}
        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1 text-[11px] text-slate-400">
              <Clock className="w-3 h-3 text-yellow-400" />
              <span>{isFr ? 'Dernière mise à jour' : 'زمن آخر تعديل:'}</span>
            </span>
            <span className="font-mono font-bold text-yellow-300 text-[11px]">
              {formattedTime} ({isFr ? freshness.timeAgoTextFr : freshness.timeAgoTextAr})
            </span>
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed pt-1 border-t border-slate-800">
            {isFr ? freshness.descriptionFr : freshness.descriptionAr}
          </p>

          <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium pt-1">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>{isFr ? 'Vérifié auprès du marché parallèle & CBL' : 'مطابق لنشرات الصرافة وسوق المشير الفعلي'}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={onQuickSync}
            disabled={isSyncing}
            className="flex-1 py-1.5 px-2.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isFr ? 'Actualiser' : 'مزامنة وتحديث فوري'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenCbl}
            className="py-1.5 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 border border-slate-700"
            title={isFr ? 'Bulletin CBL' : 'نشرة CBL'}
          >
            <Landmark className="w-3.5 h-3.5 text-yellow-400" />
            <span className="hidden sm:inline">{isFr ? 'CBL' : 'نشرة CBL'}</span>
          </button>
        </div>
      </motion.div>
    </>
  );
};
