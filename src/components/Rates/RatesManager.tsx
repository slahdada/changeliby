import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  TrendingUp, Save, Clock, RefreshCw, AlertCircle, Sparkles, 
  CheckCircle2, Landmark, Radio, ArrowUpRight, ArrowDownRight, 
  ShieldCheck, Layers, ExternalLink, Globe, Calculator
} from 'lucide-react';
import { ExchangeRate } from '../../types';
import { LIBYA_CURRENT_MARKET_FEED } from '../../data/marketRatesFeed';
import { PerplexityFeedModal } from '../PerplexitySync/PerplexityFeedModal';
import { RateFreshnessIndicator } from './RateFreshnessIndicator';
import { GoogleIcon } from '../GoogleSearchGrounding/GoogleIcon';
import { CurrencyCalculator } from './CurrencyCalculator';

export const RatesManager: React.FC = () => {
  const { 
    currencies, 
    rates, 
    updateRate, 
    syncWithMarketFeed, 
    t, 
    currentUser, 
    lang, 
    setIsCblModalOpen,
    setIsGoogleGroundingOpen,
    simulateCblMarketEvent
  } = useApp();
  
  const [editingRates, setEditingRates] = useState<Record<string, { buy: number; sell: number; note: string }>>(() => {
    const initial: Record<string, { buy: number; sell: number; note: string }> = {};
    rates.forEach(r => {
      initial[r.currencyCode] = { buy: r.buyRate, sell: r.sellRate, note: r.note || '' };
    });
    return initial;
  });

  // Sync editingRates when rates state in context changes
  useEffect(() => {
    const updated: Record<string, { buy: number; sell: number; note: string }> = {};
    rates.forEach(r => {
      updated[r.currencyCode] = { buy: r.buyRate, sell: r.sellRate, note: r.note || '' };
    });
    setEditingRates(updated);
  }, [rates]);

  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPerplexityOpen, setIsPerplexityOpen] = useState(false);
  const [activeCalculatorCode, setActiveCalculatorCode] = useState<string | null>(null);

  const isFr = lang === 'fr';

  const handleRateChange = (code: string, field: 'buy' | 'sell', value: string) => {
    const num = parseFloat(value) || 0;
    setEditingRates(prev => ({
      ...prev,
      [code]: {
        ...prev[code],
        [field]: num
      }
    }));
  };

  const handleNoteChange = (code: string, note: string) => {
    setEditingRates(prev => ({
      ...prev,
      [code]: {
        ...prev[code],
        note
      }
    }));
  };

  const handleSaveRates = (code: string) => {
    const data = editingRates[code];
    if (data) {
      updateRate(code, data.buy, data.sell, data.note);
      setSavedSuccessMsg(`تم تثبيت وتحديث سعر صرف ${code} بنجاح!`);
      setTimeout(() => setSavedSuccessMsg(null), 3000);
    }
  };

  const handleSyncAllLiveMarket = () => {
    setIsSyncing(true);
    setTimeout(() => {
      syncWithMarketFeed();
      setIsSyncing(false);
      setSavedSuccessMsg('تمت مزامنة كافة أسعار العملات (الأعمدة الأربعة) مع السوق الموازي الفعلي ونشرة CBL بنجاح!');
      simulateCblMarketEvent();
      setTimeout(() => setSavedSuccessMsg(null), 4000);
    }, 600);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white border-b-4 border-yellow-500 p-4 sm:p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-yellow-400" />
              <span>{t.ratesTitle}</span>
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              Perplexity Live Feed
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            {isFr 
              ? 'Gestion des 4 piliers : Cours officiel (Achat/Vente), Banques commerciales (+Taxe) et Marché parallèle effectif.'
              : 'إدارة ومطابقة الأعمدة الأربعة: السعر الرسمي (شراء/بيع)، سعر المصارف التجارية (+الرسم)، وسعر السوق الموازي بالمكتب.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Google Search Live Grounding Button */}
          <button
            onClick={() => setIsGoogleGroundingOpen(true)}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-900 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-md shadow-blue-500/20 border border-slate-200"
            title="تقصي أسعار الصرف بـ Google Search Grounding"
          >
            <GoogleIcon className="w-4 h-4 shrink-0" />
            <span>تقصي Google Grounding</span>
          </button>

          {/* Perplexity AI Instant Live Sync Button */}
          <button
            onClick={() => setIsPerplexityOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-md shadow-cyan-500/20"
            title="تحديث فوري ذكي مع Perplexity"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>تحديث فوري (Perplexity)</span>
          </button>

          {/* Quick Real Market Sync Button */}
          {currentUser.role === 'ADMIN' && (
            <button
              onClick={handleSyncAllLiveMarket}
              disabled={isSyncing}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-sm disabled:opacity-50"
              title="مزامنة فورية مع الأسعار الفعلية للسوق"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'جاري المزامنة...' : 'مزامنة سريعة'}</span>
            </button>
          )}

          <button
            onClick={() => setIsCblModalOpen(true)}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Landmark className="w-4 h-4" />
            <span>نشرة البنك المركزي (CBL)</span>
          </button>
        </div>
      </div>

      {/* Google Search Grounding Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-4 sm:p-5 shadow-md border border-blue-500/40 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-2 shadow-sm shrink-0">
            <GoogleIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                <span>تقصي أسعار السوق المباشرة بـ Google Search Grounding</span>
              </h3>
              <span className="bg-blue-500/30 text-blue-200 border border-blue-400/40 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                gemini-2.5-flash
              </span>
            </div>
            <p className="text-xs text-blue-200/80 mt-0.5 max-w-xl">
              استخراج فوري لأسعار الصرف الرسمية من مصرف ليبيا المركزي CBL، وأسعار السوق الموازي (سوق المشير وسوق الرشيد بطرابلس)، وأسعار الذهب مع روابط المصادر الموثقة.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsGoogleGroundingOpen(true)}
          className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-blue-950/40 transition-all hover:scale-105"
        >
          <GoogleIcon className="w-4 h-4" />
          <span>فتح نافذة التقصي والتحقق المباشر</span>
        </button>
      </div>

      {/* 4-Column Live Rates Quick Benchmark Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-yellow-500/10 text-yellow-600 rounded-xl font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span>الجدول المرجعي للأعمدة الأربعة (Live Market Pillars)</span>
                <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                  مطابقة فورية مع Perplexity
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                مقارنة فورية ومباشرة بين التسعير الرسمي للبنك المركزي، المصارف التجارية، والسوق الموازي بالمكتب.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsPerplexityOpen(true)}
            className="text-xs text-cyan-600 hover:text-cyan-700 font-bold flex items-center gap-1 font-mono"
          >
            <span>تقرير التقصي المباشر</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4 Pillars Header Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 block mb-1">العمود 1: السعر الرسمي (شراء)</span>
            <div className="font-mono font-black text-slate-800 text-sm">مصرف ليبيا المركزي (CBL)</div>
            <span className="text-[10px] text-slate-400">سعر شراء النشرة الرسمية</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 block mb-1">العمود 2: السعر الرسمي (بيع)</span>
            <div className="font-mono font-black text-slate-800 text-sm">نشرة العمليات المصرفية</div>
            <span className="text-[10px] text-slate-400">سعر البيع المعتمد للدولة</span>
          </div>

          <div className="bg-indigo-50/70 p-3 rounded-xl border border-indigo-200">
            <span className="text-[10px] font-bold text-indigo-700 block mb-1">العمود 3: المصارف التجارية (+الرسم)</span>
            <div className="font-mono font-black text-indigo-900 text-sm">منظومة 4000$ والاعتمادات</div>
            <span className="text-[10px] text-indigo-600">السعر + الضريبة والعمولة المعتمدة</span>
          </div>

          <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200">
            <span className="text-[10px] font-bold text-emerald-800 block mb-1">العمود 4: السوق الموازي بالمكتب</span>
            <div className="font-mono font-black text-emerald-950 text-sm">سوق المشير والصاغة كاش</div>
            <span className="text-[10px] text-emerald-600">التنفيذ الفعلي بالخزينة والشباك</span>
          </div>

        </div>
      </div>

      {savedSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 font-bold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{savedSuccessMsg}</span>
        </div>
      )}

      {/* Rates Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {currencies.filter(c => !c.isBaseCurrency).map((curr) => {
          const rateObj = rates.find(r => r.currencyCode === curr.code);
          const editState = editingRates[curr.code] || { buy: rateObj?.buyRate || 0, sell: rateObj?.sellRate || 0, note: '' };
          const spread = Math.max(0, editState.sell - editState.buy);
          const feed = LIBYA_CURRENT_MARKET_FEED.find(f => f.code === curr.code);

          return (
            <div 
              key={curr.code}
              className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm hover:border-slate-300 transition-colors"
            >
              
              {/* Currency Top Info */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{curr.flag}</span>
                  <div>
                    <div className="font-bold text-slate-900 text-base flex items-center gap-2">
                      <span>{curr.nameAr}</span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 font-bold">
                        {curr.code}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 font-medium">{curr.nameFr}</div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <div className="flex items-center gap-1.5">
                    {/* Top Calculator Button */}
                    <button
                      type="button"
                      onClick={() => setActiveCalculatorCode(curr.code)}
                      className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/90 rounded-lg text-xs font-bold flex items-center gap-1 transition-all shadow-2xs hover:border-amber-300 active:scale-95"
                      title={`فتح حاسبة الصرف لعملة ${curr.nameAr}`}
                    >
                      <Calculator className="w-3.5 h-3.5 text-amber-600" />
                      <span>حاسبة</span>
                    </button>

                    {/* Status Indicator on Accuracy & Freshness */}
                    <RateFreshnessIndicator 
                      updatedAt={rateObj?.updatedAt} 
                      currencyCode={curr.code}
                      variant="badge"
                    />
                  </div>
                  {feed && (
                    <div className="text-left font-mono text-[10px] text-indigo-700 font-bold">
                      المصارف: {feed.commercialBankRate.toFixed(3)} د.ل
                    </div>
                  )}
                </div>
              </div>

              {/* 4 Pillars Mini-Metrics for Currency */}
              {feed && (
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 text-[10px] font-mono">
                  <div>
                    <span className="text-slate-500 block">رسمي (شراء):</span>
                    <strong className="text-slate-800">{feed.officialBuy.toFixed(3)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">رسمي (بيع):</span>
                    <strong className="text-slate-800">{feed.officialSell.toFixed(3)}</strong>
                  </div>
                  <div>
                    <span className="text-indigo-600 block">مصارف (+رسم):</span>
                    <strong className="text-indigo-700">{feed.commercialBankRate.toFixed(3)}</strong>
                  </div>
                </div>
              )}

              {/* Rate Inputs for Bureau (Pillar 4: Parallel Market Rate at Office) */}
              <div className="grid grid-cols-2 gap-3">
                
                {/* Buy Rate */}
                <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200 space-y-1">
                  <label className="text-[11px] font-bold text-emerald-800 block">
                    {t.buyRateLabel} (شراء بالمكتب)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.001"
                      value={editState.buy}
                      onChange={(e) => handleRateChange(curr.code, 'buy', e.target.value)}
                      disabled={currentUser.role !== 'ADMIN'}
                      className="w-full bg-white border border-emerald-300 rounded-lg px-2.5 py-1.5 font-mono text-base font-black text-slate-900 focus:outline-none focus:border-emerald-500 disabled:opacity-60"
                    />
                    <span className="absolute left-2 top-2 text-[10px] text-slate-400 font-bold">د.ل</span>
                  </div>
                </div>

                {/* Sell Rate */}
                <div className="bg-rose-50/60 p-3 rounded-xl border border-rose-200 space-y-1">
                  <label className="text-[11px] font-bold text-rose-800 block">
                    {t.sellRateLabel} (بيع بالمكتب)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.001"
                      value={editState.sell}
                      onChange={(e) => handleRateChange(curr.code, 'sell', e.target.value)}
                      disabled={currentUser.role !== 'ADMIN'}
                      className="w-full bg-white border border-rose-300 rounded-lg px-2.5 py-1.5 font-mono text-base font-black text-slate-900 focus:outline-none focus:border-rose-500 disabled:opacity-60"
                    />
                    <span className="absolute left-2 top-2 text-[10px] text-slate-400 font-bold">د.ل</span>
                  </div>
                </div>

              </div>

              {/* Note Input & Spread */}
              <div className="flex items-center justify-between text-xs text-slate-600 gap-2">
                <div className="flex items-center gap-1 font-mono text-[11px]">
                  <span>{t.spreadMargin}:</span>
                  <span className="font-bold text-slate-900">{spread.toFixed(3)} د.ل</span>
                </div>

                <div className="text-[10px] text-slate-400 font-medium">
                  تعديل بواسطة: {rateObj?.updatedBy || 'النظام'}
                </div>
              </div>

              <div className="space-y-1">
                <input
                  type="text"
                  value={editState.note}
                  onChange={(e) => handleNoteChange(curr.code, e.target.value)}
                  placeholder="ملاحظات حول مصدر السعر (مثلاً: سوق المشير، الصاغة، المدار)..."
                  disabled={currentUser.role !== 'ADMIN'}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-yellow-500 disabled:opacity-60"
                />
              </div>

              {/* Live Market Reference Quick Action */}
              {feed && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center justify-between text-[11px]">
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold">السعر الفعلي في السوق الموازي:</div>
                    <div className="font-mono font-black text-slate-800">
                      شراء {feed.defaultParallelBuy} / بيع {feed.defaultParallelSell} د.ل
                    </div>
                  </div>
                  {currentUser.role === 'ADMIN' && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingRates(prev => ({
                          ...prev,
                          [curr.code]: {
                            buy: feed.defaultParallelBuy,
                            sell: feed.defaultParallelSell,
                            note: feed.marketSource
                          }
                        }));
                        updateRate(curr.code, feed.defaultParallelBuy, feed.defaultParallelSell, feed.marketSource);
                        setSavedSuccessMsg(`تم تطبيق السعر الفعلي لعملة ${curr.code} بنجاح!`);
                        setTimeout(() => setSavedSuccessMsg(null), 3000);
                      }}
                      className="px-2.5 py-1 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black rounded-lg text-[10px] transition-colors shadow-xs"
                    >
                      تطبيق الفعلي
                    </button>
                  )}
                </div>
              )}

              {/* Card Actions: Calculator & Save */}
              <div className="flex items-center gap-2 pt-1">
                {/* Calculator Button */}
                <button
                  type="button"
                  onClick={() => setActiveCalculatorCode(curr.code)}
                  className={`py-2.5 px-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 ${
                    currentUser.role === 'ADMIN' ? 'flex-1' : 'w-full'
                  }`}
                  title={`فتح حاسبة الصرف لعملة ${curr.nameAr} (${curr.code})`}
                >
                  <Calculator className="w-4 h-4 text-slate-950" />
                  <span>حاسبة</span>
                </button>

                {/* Save Button for Admin */}
                {currentUser.role === 'ADMIN' && (
                  <button
                    type="button"
                    onClick={() => handleSaveRates(curr.code)}
                    className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                  >
                    <Save className="w-4 h-4 text-yellow-400" />
                    <span>{t.saveRates}</span>
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Dynamic Active Currency Calculator */}
      {(() => {
        const activeCalcCurr = currencies.find(c => c.code === activeCalculatorCode) || null;
        const activeCalcRate = activeCalcCurr 
          ? (editingRates[activeCalcCurr.code] || { buy: 0, sell: 0 }) 
          : { buy: 0, sell: 0 };

        return (
          <CurrencyCalculator
            currency={activeCalcCurr}
            buyRate={activeCalcRate.buy}
            sellRate={activeCalcRate.sell}
            isOpen={!!activeCalculatorCode}
            onClose={() => setActiveCalculatorCode(null)}
          />
        );
      })()}

      {/* Perplexity Feed Modal */}
      <PerplexityFeedModal
        isOpen={isPerplexityOpen}
        onClose={() => setIsPerplexityOpen(false)}
      />

    </div>
  );
};
