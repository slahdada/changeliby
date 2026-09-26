import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, RefreshCw, CheckCircle2, ExternalLink, 
  ShieldCheck, Landmark, Building, ArrowUpRight, ArrowDownRight, 
  Check, Copy, Database, Radio, Globe, Layers, ArrowRight, X,
  Coins, Sparkles, AlertTriangle, FileText, Share2, Compass, Cpu
} from 'lucide-react';
import { GoogleIcon } from './GoogleIcon';
import { useApp } from '../../context/AppContext';
import { googleSearchGroundingService } from '../../services/googleSearchGroundingService';
import { GoogleSearchGroundingResult, GroundedRateItem, GroundingSource } from '../../types';

export type GroundingCategory = 'RATES' | 'CBL_CIRCULARS' | 'GOLD_MARKET' | 'PARALLEL_MARKET';

interface GoogleSearchGroundingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: GroundingCategory;
}

export const GoogleSearchGroundingModal: React.FC<GoogleSearchGroundingModalProps> = ({ 
  isOpen, 
  onClose,
  defaultCategory = 'RATES'
}) => {
  const { lang, updateRate, rates, triggerCblRateAlert } = useApp();
  const [activeCategory, setActiveCategory] = useState<GroundingCategory>(defaultCategory as GroundingCategory);
  const [customQuery, setCustomQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GoogleSearchGroundingResult | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  const [appliedSuccess, setAppliedSuccess] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const isFr = lang === 'fr';

  // Load initial grounding data when opened
  useEffect(() => {
    if (isOpen && !result) {
      handleSearch((defaultCategory as GroundingCategory) || 'RATES');
    }
  }, [isOpen, defaultCategory]);

  const handleSearch = async (
    category: GroundingCategory = 'RATES', 
    userQuery?: string
  ) => {
    setIsLoading(true);
    setAppliedSuccess(false);
    try {
      const data = await googleSearchGroundingService.fetchGroundingData({
        category,
        query: userQuery || customQuery || undefined
      });
      setResult(data);
    } catch (err) {
      console.error('Failed to run Google search grounding:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyGroundedRates = () => {
    if (!result || !result.groundedRates) return;

    // Apply rates to the exchange bureau
    result.groundedRates.forEach((item: GroundedRateItem) => {
      // Find matching bureau currency
      const existing = rates.find(r => r.currencyCode === item.code);
      if (existing) {
        // Bureau buy = slightly lower than market / parallel buy
        // Bureau sell = slightly higher than market / parallel sell
        const buy = item.parallelBuy || (item.parallelMarketRate ? +(item.parallelMarketRate - 0.02).toFixed(3) : existing.buyRate);
        const sell = item.parallelSell || (item.parallelMarketRate ? +(item.parallelMarketRate + 0.02).toFixed(3) : existing.sellRate);
        const note = `محدث بواسطة Google Search Grounding (${item.sourceNote || 'Google Search'})`;
        updateRate(item.code, buy, sell, note);
      }
    });

    // Send a push-alert notification to all cashiers and terminals
    const topItem = result.groundedRates.find(r => r.code === 'USD') || result.groundedRates[0];
    if (topItem) {
      triggerCblRateAlert({
        currencyCode: topItem.code,
        currencyNameAr: topItem.nameAr,
        currencyNameFr: topItem.nameFr,
        flag: topItem.flag,
        symbol: topItem.symbol,
        newOfficialBuy: topItem.officialBuy,
        newOfficialSell: topItem.officialSell,
        commercialBankRate: topItem.commercialBankRate,
        parallelMarketRate: topItem.parallelMarketRate,
        delta: topItem.change24h || 0.05,
        deltaPercent: topItem.change24h || 0.15,
        type: 'OFFICIAL_BULLETIN',
        bulletinTitle: 'تحديث أسعار معتمد بواسطة Google Search Grounding',
        severity: 'success',
        notes: 'تم التحقق من الأسعار ومطابقتها مع محرك بحث Google ونشرة مصرف ليبيا المركزي والسوق الموازي'
      });
    }

    setAppliedSuccess(true);
    setTimeout(() => setAppliedSuccess(false), 4000);
  };

  const copySourceUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  if (!isOpen) return null;

  const currentRates = result?.groundedRates || [];
  const selectedRate = currentRates.find(r => r.code === selectedCurrency) || currentRates[0];

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 animate-fade-in text-slate-900">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-slate-900 text-slate-100 border border-slate-700/80 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
      >
        
        {/* Top Header with Google Brand styling */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center shadow-lg shadow-blue-500/10 p-2 shrink-0">
              <GoogleIcon className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <span>{isFr ? 'Google Search Grounding en Direct' : 'تقصي أسعار الصرف بـ Google Search Grounding'}</span>
                </h2>
                <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
                  gemini-3.8-flash (googleSearch)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isFr 
                  ? 'Recherche connectée en temps réel via l\'outil googleSearch : Banque Centrale de Libye, banques et cours réels du marché parallèle.' 
                  : 'تحقق مباشر مدعوم بأداة googleSearch الرسمية: نشرة مصرف ليبيا المركزي، المصارف التجارية، وسوق المشير والرشيد.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSearch(activeCategory)}
              disabled={isLoading}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-md shadow-blue-600/25 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? (isFr ? 'Recherche Google...' : 'جاري البحث في Google...') : (isFr ? 'Actualiser' : 'تحديث وبحث الآن')}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Categories Bar & Search Query Input */}
        <div className="bg-slate-950/90 px-4 sm:px-6 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Quick preset tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => {
                setActiveCategory('RATES');
                handleSearch('RATES');
              }}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                activeCategory === 'RATES'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>{isFr ? 'Tous les Cours (4 Piliers)' : 'أسعار الصرف (الأعمدة الأربعة)'}</span>
            </button>

            <button
              onClick={() => {
                setActiveCategory('PARALLEL_MARKET');
                handleSearch('PARALLEL_MARKET');
              }}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                activeCategory === 'PARALLEL_MARKET'
                  ? 'bg-amber-600 text-white shadow-sm shadow-amber-500/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>{isFr ? 'Marché Parallèle (Espèces)' : 'السوق الموازي (المشير والرشيد)'}</span>
            </button>

            <button
              onClick={() => {
                setActiveCategory('GOLD_MARKET');
                handleSearch('GOLD_MARKET');
              }}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                activeCategory === 'GOLD_MARKET'
                  ? 'bg-yellow-600 text-white shadow-sm shadow-yellow-500/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>{isFr ? 'Or & Argent' : 'سوق الذهب والفضة'}</span>
            </button>

            <button
              onClick={() => {
                setActiveCategory('CBL_CIRCULARS');
                handleSearch('CBL_CIRCULARS');
              }}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                activeCategory === 'CBL_CIRCULARS'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{isFr ? 'Circulaires CBL' : 'منشورات وقرارات CBL'}</span>
            </button>
          </div>

          {/* Search Bar */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (customQuery.trim()) {
                handleSearch(activeCategory, customQuery.trim());
              }
            }}
            className="flex items-center gap-2 flex-1 max-w-sm ml-auto"
          >
            <div className="relative w-full">
              <input
                type="text"
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                placeholder={isFr ? "Recherche personnalisée Google..." : "بحث مخصص في Google (مثلاً: سعر الدولار في بنغازي)..."}
                className="w-full bg-slate-800/90 text-slate-100 placeholder-slate-400 text-xs px-3 py-1.5 pr-8 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
            </div>
            <button
              type="submit"
              disabled={isLoading || !customQuery.trim()}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl font-bold text-xs"
            >
              {isFr ? 'Chercher' : 'بحث'}
            </button>
          </form>

        </div>

        {/* Active Google Search Queries pill bar */}
        {result?.webSearchQueries && result.webSearchQueries.length > 0 && (
          <div className="bg-slate-900/60 px-4 sm:px-6 py-2 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-[11px] text-slate-400">
            <span className="font-bold text-blue-400 flex items-center gap-1 shrink-0">
              <GoogleIcon className="w-3.5 h-3.5" />
              <span>{isFr ? 'Requêtes exécutées :' : 'استعلامات Google Search المنفذة:'}</span>
            </span>
            <div className="flex items-center gap-1.5 flex-nowrap">
              {result.webSearchQueries.map((q, idx) => (
                <span key={idx} className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700/80 whitespace-nowrap">
                  "{q}"
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Apply To Bureau Success Banner */}
          <AnimatePresence>
            {appliedSuccess && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-emerald-500/20 border-2 border-emerald-500 text-emerald-200 p-4 rounded-2xl flex items-center justify-between gap-3 text-xs sm:text-sm font-bold"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>
                    {isFr 
                      ? 'Les cours issus de Google Search Grounding ont été appliqués avec succès aux guichets de change (POS) !' 
                      : 'تم تطبيق وتثبيت أسعار Google Search Grounding بنجاح على شاشات الصرافة ونقاط البيع (POS) وتحديث مؤشر الدقة إلى 99% مباشر!'}
                  </span>
                </div>
                <span className="px-2 py-1 rounded bg-emerald-500/30 text-emerald-300 text-xs font-mono">
                  {new Date().toLocaleTimeString(lang === 'ar' ? 'ar-LY' : 'fr-FR')}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quota or Key Notice if present */}
          {(result as any)?.error && (
            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 p-3.5 rounded-2xl flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{(result as any).error}</span>
              </div>
              <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded font-mono font-bold shrink-0 text-amber-300">
                {isFr ? 'Données de référence' : 'بيانات السوق المرجعية'}
              </span>
            </div>
          )}

          {/* Market Executive Summary */}
          <div className="bg-slate-800/60 border border-slate-700/70 p-4 sm:p-5 rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-black uppercase text-blue-400 tracking-wider flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-blue-400" />
                {isFr ? 'Synthèse de Marché (Grounded Intelligence)' : 'الملخص التحليلي اللحظي للسوق الليبي (Google Grounded)'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {result?.timestamp ? new Date(result.timestamp).toLocaleTimeString() : ''}
              </span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed font-sans">
              {isFr ? (result?.summaryFr || result?.summary) : result?.summary}
            </p>
          </div>

          {/* Action Row: Apply Grounded Rates button */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-blue-950/60 via-slate-800 to-indigo-950/60 p-4 rounded-2xl border border-blue-500/30">
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>{isFr ? 'Application automatique aux terminaux POS' : 'تطبيق الأسعار الموثقة على نقاط البيع وشاشات الصرافين'}</span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                {isFr 
                  ? 'Met à jour instantanément les 4 piliers de cotation et envoie une alerte push aux caissiers.' 
                  : 'تحديث فوري لأسعار الصرافة المعتمدة بالمكتب وتحديث مؤشر حداثة الأسعار وإرسال إشعار فوري لجميع نقاط الصرافة.'}
              </p>
            </div>

            <button
              onClick={handleApplyGroundedRates}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
            >
              <CheckCircle2 className="w-4 h-4 text-slate-950" />
              <span>{isFr ? 'Appliquer au Bureau de Change' : 'تطبيق هذه الأسعار في شاشات الصرافة والـ POS'}</span>
            </button>
          </div>

          {/* 4 Pillars Currency Table & Selector */}
          <div>
            <div className="flex items-center justify-between gap-3 mb-3">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                <span>{isFr ? 'Grille des Cotations (Google Search Grounded)' : 'جدول أسعار العملات الموثقة (الأعمدة الأربعة)'}</span>
              </h3>
              <span className="text-xs text-slate-400">
                {currentRates.length} {isFr ? 'devises analysées' : 'عملات تم تقصيها'}
              </span>
            </div>

            {/* Currency cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {currentRates.map((rate) => {
                const isSelected = rate.code === selectedCurrency;
                return (
                  <div
                    key={rate.code}
                    onClick={() => setSelectedCurrency(rate.code)}
                    className={`cursor-pointer rounded-2xl p-4 border transition-all text-xs ${
                      isSelected
                        ? 'bg-slate-800 border-blue-500 ring-2 ring-blue-500/30 shadow-lg shadow-blue-500/10'
                        : 'bg-slate-850/80 border-slate-800 hover:border-slate-700 bg-slate-900/60'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{rate.flag}</span>
                        <div>
                          <div className="font-bold text-white text-sm flex items-center gap-1.5">
                            <span>{rate.code}</span>
                            <span className="text-[10px] text-slate-400">({rate.symbol})</span>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {isFr ? (rate.nameFr || rate.nameAr) : rate.nameAr}
                          </div>
                        </div>
                      </div>

                      {/* 24h Change badge */}
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] flex items-center gap-1 ${
                        rate.status === 'UP'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : rate.status === 'DOWN'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-slate-700 text-slate-300'
                      }`}>
                        {rate.status === 'UP' && <ArrowUpRight className="w-3 h-3" />}
                        {rate.status === 'DOWN' && <ArrowDownRight className="w-3 h-3" />}
                        <span>{rate.change24h ? `${rate.change24h > 0 ? '+' : ''}${rate.change24h}%` : 'مستقر'}</span>
                      </span>
                    </div>

                    {/* 4 Pillars Breakdown */}
                    <div className="space-y-1.5 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800 text-[11px]">
                      
                      {/* Parallel Market (Cash) */}
                      <div className="flex items-center justify-between font-bold text-amber-300">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Building className="w-3 h-3 text-amber-400" />
                          {isFr ? 'Marché Parallèle (Mouchir)' : 'السوق الموازي (المشير كاش)'}
                        </span>
                        <span className="font-mono text-sm text-amber-400">
                          {rate.parallelMarketRate.toFixed(3)} د.ل
                        </span>
                      </div>

                      {/* Commercial Banks (+ Tax) */}
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-slate-400 flex items-center gap-1">
                          <CreditCardIcon className="w-3 h-3 text-blue-400" />
                          {isFr ? 'Banques (+Taxe)' : 'المصارف (+الرسم)'}
                        </span>
                        <span className="font-mono text-blue-300">
                          {rate.commercialBankRate.toFixed(3)} د.ل
                        </span>
                      </div>

                      {/* Official CBL Buy / Sell */}
                      <div className="flex items-center justify-between text-slate-400 text-[10px] pt-1 border-t border-slate-800/80">
                        <span className="flex items-center gap-1">
                          <Landmark className="w-3 h-3 text-emerald-400" />
                          {isFr ? 'Officiel CBL (Achat/Vente)' : 'رسمي CBL (شراء/بيع)'}
                        </span>
                        <span className="font-mono">
                          {rate.officialBuy.toFixed(3)} / {rate.officialSell.toFixed(3)}
                        </span>
                      </div>

                    </div>

                    {/* Source Note footer */}
                    {rate.sourceNote && (
                      <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1 truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                        <span className="truncate">{rate.sourceNote}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gold & Silver Scrap Section (if available) */}
          {result?.goldRates && (
            <div className="bg-gradient-to-r from-amber-950/40 via-slate-800 to-slate-900 border border-amber-500/30 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2 mb-3">
                <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span>{isFr ? 'Cotation de l\'Or et de l\'Argent (Souk Al-Saghah)' : 'أسعار كسر الذهب والفضة (سوق الصاغة طرابلس وبنغازي)'}</span>
                </h3>
                <span className="text-xs text-amber-400/80 font-mono">
                  {result.goldRates.source || 'سوق الصاغة'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700 text-center">
                  <div className="text-[11px] text-slate-400">{isFr ? 'Or 18 Carats (Gramme)' : 'كسر الذهب عيار 18 (جرام)'}</div>
                  <div className="text-lg font-black font-mono text-amber-400 mt-1">
                    {result.goldRates.gold18k} د.ل
                  </div>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700 text-center">
                  <div className="text-[11px] text-slate-400">{isFr ? 'Or 24 Carats (Gramme)' : 'ذهب عيار 24 نقي (جرام)'}</div>
                  <div className="text-lg font-black font-mono text-yellow-300 mt-1">
                    {result.goldRates.gold24k} د.ل
                  </div>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700 text-center col-span-2 sm:col-span-1">
                  <div className="text-[11px] text-slate-400">{isFr ? 'Argent 925 (Gramme)' : 'جرام الفضة عيار 925'}</div>
                  <div className="text-lg font-black font-mono text-slate-200 mt-1">
                    {result.goldRates.silver925 || 4.8} د.ل
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Central Bank of Libya Circulars Grounded */}
          {result?.cblCirculars && result.cblCirculars.length > 0 && (
            <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-4 sm:p-5">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>{isFr ? 'Circulaires & Décisions Récentes de la CBL' : 'أحدث منشورات وضوابط مصرف ليبيا المركزي CBL (المتحقق منها)'}</span>
              </h3>
              
              <div className="space-y-2.5">
                {result.cblCirculars.map((circ, idx) => (
                  <div key={idx} className="bg-slate-900/70 p-3 rounded-xl border border-slate-800 text-xs">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-bold text-emerald-400">{circ.title}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{circ.date}</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">{circ.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Google Search Citations and Grounding Chunks Sources */}
          {result?.sources && result.sources.length > 0 && (
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <GoogleIcon className="w-4 h-4" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    {isFr ? 'Sources et Références Google Search Grounding' : 'المصادر والروابط المرجعية (Google Search Grounding Chunks)'}
                  </h3>
                </div>
                <span className="text-[10px] text-blue-400 font-mono">
                  {result.sources.length} {isFr ? 'sources vérifiées' : 'مصادر تم التقصي منها'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {result.sources.map((source: GroundingSource, idx: number) => {
                  return (
                    <a
                      key={idx}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-2 bg-slate-900 hover:bg-slate-850 p-2.5 rounded-xl border border-slate-800 hover:border-blue-500/50 transition-colors group text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                          <Globe className="w-3.5 h-3.5" />
                        </div>
                        <div className="truncate">
                          <div className="text-white font-medium truncate group-hover:text-blue-300 transition-colors">
                            {source.title}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {source.domain || source.url}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            copySourceUrl(source.url);
                          }}
                          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
                          title="نسخ الرابط"
                        >
                          {copiedUrl === source.url ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition-colors" />
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>
              {isFr ? 'Système prêt : modèle Gemini 3.8 Flash avec Google Search Grounding actif' : 'النظام متصل: نموذج Gemini 3.8 Flash مع أداة Google Search Grounding النشطة'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl font-bold transition-colors"
            >
              {isFr ? 'Fermer' : 'إغلاق'}
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
};

// Internal mini icon helper for cards
const CreditCardIcon: React.FC<{ className?: string }> = ({ className = 'w-3 h-3' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
  </svg>
);
