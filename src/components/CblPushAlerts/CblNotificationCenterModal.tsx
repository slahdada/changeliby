import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, Landmark, Volume2, VolumeX, RefreshCw, Sparkles, 
  CheckCircle2, ArrowUpRight, ArrowDownRight, Trash2, X, 
  ExternalLink, Filter, ShieldCheck, Check, Clock, Eye
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CblRateAlert } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CblNotificationCenterModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { 
    cblAlerts, 
    unreadAlertsCount, 
    markAlertAsRead, 
    clearAllAlerts, 
    simulateCblMarketEvent,
    applyAlertRateToBureau, 
    setIsCblModalOpen,
    notificationSettings,
    updateNotificationSettings,
    lang 
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'UNREAD' | 'INCREASE' | 'DECREASE'>('ALL');
  const [isSimulating, setIsSimulating] = useState(false);

  const isFr = lang === 'fr';

  if (!isOpen) return null;

  const filteredAlerts = cblAlerts.filter(a => {
    if (activeFilter === 'UNREAD') return !a.isRead;
    if (activeFilter === 'INCREASE') return a.delta > 0;
    if (activeFilter === 'DECREASE') return a.delta < 0;
    return true;
  });

  const handleSimulate = () => {
    setIsSimulating(true);
    simulateCblMarketEvent();
    setTimeout(() => {
      setIsSimulating(false);
    }, 600);
  };

  const handleMarkAllRead = () => {
    cblAlerts.forEach(a => markAlertAsRead(a.id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="w-full max-w-2xl bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-yellow-500/20">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-wide">
                  {isFr ? 'Centre d\'Alertes et Notifications CBL' : 'مركز تنبيهات مصرف ليبيا المركزي'}
                </h3>
                {unreadAlertsCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-xs font-black">
                    {unreadAlertsCount} {isFr ? 'non lus' : 'جديد'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {isFr 
                  ? 'Surveillance en direct des taux de change officiels et circulaires' 
                  : 'رصد لحظي فوري للنشرات الرسمية، أسعار الصرف، ومخصصات الأغراض الشخصية'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action & Settings Bar */}
        <div className="bg-slate-50 border-b border-slate-200 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2.5">
          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeFilter === 'ALL'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {isFr ? 'Tous' : 'الكل'} ({cblAlerts.length})
            </button>
            <button
              onClick={() => setActiveFilter('UNREAD')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeFilter === 'UNREAD'
                  ? 'bg-yellow-500 text-slate-950 shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {isFr ? 'Non lus' : 'غير مقروءة'} ({unreadAlertsCount})
            </button>
            <button
              onClick={() => setActiveFilter('INCREASE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeFilter === 'INCREASE'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {isFr ? 'Hausses' : 'ارتفاع'}
            </button>
            <button
              onClick={() => setActiveFilter('DECREASE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeFilter === 'DECREASE'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {isFr ? 'Baisses' : 'انخفاض'}
            </button>
          </div>

          {/* Quick Simulation & Sound Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateNotificationSettings({ soundEnabled: !notificationSettings.soundEnabled })}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                notificationSettings.soundEnabled
                  ? 'bg-yellow-50 border-yellow-300 text-yellow-800'
                  : 'bg-slate-100 border-slate-200 text-slate-500'
              }`}
              title={isFr ? 'Basculer les alertes sonores' : 'تبديل التنبيهات الصوتية'}
            >
              {notificationSettings.soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-yellow-600" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
              <span className="hidden sm:inline">{notificationSettings.soundEnabled ? (isFr ? 'Son Actif' : 'الصوت مفعل') : (isFr ? 'Son Coupé' : 'صامت')}</span>
            </button>

            <button
              onClick={handleSimulate}
              disabled={isSimulating}
              className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
              <span>{isFr ? 'Simuler une mise à jour CBL' : 'محاكاة إشعار رسمي فوري'}</span>
            </button>
          </div>
        </div>

        {/* Alerts List */}
        <div className="p-4 sm:p-5 max-h-[50vh] overflow-y-auto space-y-3">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <ShieldCheck className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-bold text-slate-600">
                {isFr ? 'Aucune alerte à afficher pour le moment' : 'لا توجد تنبيهات حالياً في هذا القسم'}
              </p>
              <p className="text-xs text-slate-400">
                {isFr 
                  ? 'Cliquez sur "Simuler une mise à jour CBL" pour tester le système de notification en direct.' 
                  : 'اضغط على "محاكاة إشعار رسمي فوري" لتجربة التنبيه الحركي والصوتي.'}
              </p>
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const isUp = alert.delta >= 0;
              return (
                <div
                  key={alert.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    !alert.isRead
                      ? 'bg-amber-50/50 border-yellow-300 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    {/* Left: Info */}
                    <div className="flex items-start gap-3">
                      <span className="text-2xl shrink-0 mt-0.5">{alert.flag}</span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-slate-900 text-sm">
                            {isFr ? alert.currencyNameFr : alert.currencyNameAr}
                          </h4>
                          <span className="font-mono text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded font-bold border border-slate-200">
                            {alert.currencyCode}
                          </span>
                          {!alert.isRead && (
                            <span className="px-1.5 py-0.5 bg-amber-500 text-slate-950 rounded text-[9px] font-black">
                              {isFr ? 'Nouveau' : 'جديد'}
                            </span>
                          )}
                          {alert.autoApplied && (
                            <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[9px] font-bold flex items-center gap-1 border border-emerald-200">
                              <Check className="w-2.5 h-2.5" />
                              {isFr ? 'Appliqué' : 'تم التطبيق'}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-500 mt-0.5">
                          {alert.bulletinTitle || alert.notes}
                        </p>

                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {alert.bulletinNo && (
                            <span className="font-mono">{alert.bulletinNo}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Rates & Delta */}
                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="text-right">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-slate-400 line-through font-mono">
                            {alert.oldOfficialSell.toFixed(3)}
                          </span>
                          <span className="text-sm font-black text-slate-900 font-mono">
                            {alert.newOfficialSell.toFixed(3)} د.ل
                          </span>
                        </div>
                        <div className={`text-[10px] font-mono font-bold flex items-center justify-end gap-0.5 ${
                          isUp ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          <span>{isUp ? '+' : ''}{alert.delta.toFixed(3)} ({alert.deltaPercent > 0 ? '+' : ''}{alert.deltaPercent}%)</span>
                        </div>
                      </div>

                      {/* Quick Apply Button */}
                      <button
                        onClick={() => applyAlertRateToBureau(alert)}
                        className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shrink-0"
                        title={isFr ? 'Appliquer au bureau' : 'تطبيق بالمكتب'}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-yellow-400" />
                        <span className="hidden sm:inline">{isFr ? 'Appliquer' : 'تطبيق'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-100 border-t border-slate-200 p-3 sm:p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {unreadAlertsCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-slate-600 hover:text-slate-900 font-bold transition-colors flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{isFr ? 'Tout marquer comme lu' : 'تحديد الكل كمقروء'}</span>
              </button>
            )}
            {cblAlerts.length > 0 && (
              <button
                onClick={clearAllAlerts}
                className="text-xs text-rose-600 hover:text-rose-700 font-bold transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isFr ? 'Effacer l\'historique' : 'مسح السجل'}</span>
              </button>
            )}
          </div>

          <button
            onClick={() => {
              onClose();
              setIsCblModalOpen(true);
            }}
            className="px-3.5 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Landmark className="w-3.5 h-3.5" />
            <span>{isFr ? 'Ouvrir le Moniteur CBL' : 'فتح مراقب مصرف ليبيا المركزي'}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
