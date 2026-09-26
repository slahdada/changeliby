import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle2, Share2, PlusSquare, ArrowLeft, Globe } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'menu' | 'banner';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ 
  variant = 'header',
  className = ''
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  // If already installed or running in standalone mode, hide the install button
  if (isInstalled) {
    return null;
  }

  // Handle click
  const handleClick = async () => {
    if (isInstallable) {
      const installed = await install();
      if (!installed) {
        setShowGuideModal(true);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  // Render header compact button
  if (variant === 'header') {
    return (
      <>
        <button
          type="button"
          onClick={handleClick}
          className={`px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-yellow-500/20 border border-yellow-300 active:scale-95 group shrink-0 ${className}`}
          title="تثبيت تطبيق صرافة ليبيا على الهاتف (PWA)"
        >
          <div className="relative">
            <Smartphone className="w-4 h-4 text-slate-950 group-hover:scale-110 transition-transform" />
            <span className="w-2 h-2 rounded-full bg-emerald-600 absolute -top-0.5 -right-0.5 animate-ping"></span>
          </div>
          <span className="hidden sm:inline">تثبيت التطبيق</span>
          <span className="sm:hidden">تثبيت</span>
        </button>

        {showGuideModal && (
          <PWAInstallGuideModal 
            isIOS={isIOS} 
            isInstallable={isInstallable}
            onClose={() => setShowGuideModal(false)}
            onDirectInstall={install}
          />
        )}
      </>
    );
  }

  // Render menu full button (for mobile drawer or sidebar)
  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`w-full p-3 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black rounded-xl text-xs flex items-center justify-between gap-2 shadow-sm transition-all active:scale-95 group ${className}`}
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-slate-900 text-yellow-400 rounded-lg group-hover:scale-105 transition-transform">
            <Download className="w-4 h-4" />
          </div>
          <div className="text-right">
            <div className="font-black text-xs leading-tight">تثبيت التطبيق على الهاتف</div>
            <div className="text-[10px] text-slate-800 font-bold">تشغيل بملء الشاشة وبدون إنترنت</div>
          </div>
        </div>
        <span className="w-2 h-2 rounded-full bg-emerald-700 animate-pulse"></span>
      </button>

      {showGuideModal && (
        <PWAInstallGuideModal 
          isIOS={isIOS} 
          isInstallable={isInstallable}
          onClose={() => setShowGuideModal(false)}
          onDirectInstall={install}
        />
      )}
    </>
  );
};

interface PWAInstallGuideModalProps {
  isIOS: boolean;
  isInstallable: boolean;
  onClose: () => void;
  onDirectInstall: () => Promise<boolean>;
}

export const PWAInstallGuideModal: React.FC<PWAInstallGuideModalProps> = ({
  isIOS,
  isInstallable,
  onClose,
  onDirectInstall
}) => {
  const [activeDevice, setActiveDevice] = useState<'android' | 'ios'>(isIOS ? 'ios' : 'android');

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      dir="rtl"
    >
      <div 
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b-2 border-yellow-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-xl shadow-inner">
              📱
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-1.5">
                <span>تثبيت تطبيق صرافة ليبيا</span>
              </h3>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                تطبيق PWA مستقل وسريع يعمل بدون إنترنت
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          
          {/* OS Switcher Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveDevice('android')}
              className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                activeDevice === 'android'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🤖 أندرويد (Chrome/Samsung)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveDevice('ios')}
              className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                activeDevice === 'ios'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🍏 آيفون (Safari)</span>
            </button>
          </div>

          {/* Android Instructions */}
          {activeDevice === 'android' && (
            <div className="space-y-3">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 text-xs text-emerald-900 space-y-2">
                <div className="font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>خطوات التثبيت على هواتف أندرويد:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-700 font-medium pr-1">
                  <li>
                    إذا كان زر التثبيت المباشر متاحاً، اضغط على زر <strong>«تثبيت الآن»</strong> أدناه.
                  </li>
                  <li>
                    أو اضغط على زر القائمة <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-300">⋮</span> (ثلاث نقاط أعلى المتصفح).
                  </li>
                  <li>
                    اختر <strong>«تثبيت التطبيق»</strong> أو <strong>«إضافة إلى الشاشة الرئيسية»</strong>.
                  </li>
                  <li>
                    سيظهر التطبيق كأيقونة مستقلة على شاشتك الرئيسية ويعمل بملء الشاشة وبدون إنترنت.
                  </li>
                </ol>
              </div>

              {isInstallable && (
                <button
                  type="button"
                  onClick={async () => {
                    const ok = await onDirectInstall();
                    if (ok) onClose();
                  }}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>تثبيت الآن بنقرة واحدة (Install)</span>
                </button>
              )}
            </div>
          )}

          {/* iOS Instructions */}
          {activeDevice === 'ios' && (
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3.5 text-xs text-blue-900 space-y-2">
                <div className="font-bold flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>خطوات التثبيت على iPhone و iPad (متصفح Safari):</span>
                </div>
                <ol className="list-decimal list-inside space-y-2 text-slate-700 font-medium pr-1">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-blue-600">1.</span>
                    <span>اضغط على أيقونة <strong>المشاركة (Share)</strong> <span className="inline-block px-1 bg-white border border-slate-200 rounded text-blue-600 font-mono">⎋</span> في شريط Safari أسفل الشاشة.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-blue-600">2.</span>
                    <span>مرر للأسفل واضغط على <strong>«إضافة إلى الصفحة الرئيسية»</strong> (Add to Home Screen).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-blue-600">3.</span>
                    <span>اضغط على <strong>«إضافة»</strong> (Add) في الزاوية العلوية.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-blue-600">4.</span>
                    <span>افتح التطبيق من شاشة الهاتف للاستمتاع بوضع ملء الشاشة Standalone بدون أشرطة المتصفح.</span>
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* PWA Advantages */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2 font-bold">
              <span className="text-base">⚡</span>
              <span>يعمل بدون إنترنت (Offline)</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2 font-bold">
              <span className="text-base">📱</span>
              <span>ملء الشاشة Standalone</span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-100 p-3 sm:p-4 border-t border-slate-200 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            فهمت، إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
