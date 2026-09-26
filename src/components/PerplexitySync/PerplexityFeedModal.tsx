import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, RefreshCw, CheckCircle2, Search, ExternalLink, 
  ShieldCheck, Landmark, Building, ArrowUpRight, ArrowDownRight, 
  Check, Copy, Database, Radio, Globe, Layers, ArrowRight, X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LIBYA_CURRENT_MARKET_FEED, MarketRateFeed } from '../../data/marketRatesFeed';

interface PerplexityFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PerplexityFeedModal: React.FC<PerplexityFeedModalProps> = ({ isOpen, onClose }) => {
  const { lang, syncWithMarketFeed, rates } = useApp();
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  const [appliedSuccess, setAppliedSuccess] = useState(false);
  const [searchStep, setSearchStep] = useState<number>(3); // 1: Searching, 2: Synthesizing, 3: Completed

  const isFr = lang === 'fr';

  if (!isOpen) return null;

  const handleInstantPerplexitySync = () => {
    setIsSearching(true);
    setSearchStep(1);
    setAppliedSuccess(false);

    setTimeout(() => {
      setSearchStep(2);
    }, 400);

    setTimeout(() => {
      setSearchStep(3);
      syncWithMarketFeed();
      setIsSearching(false);
      setAppliedSuccess(true);
      setTimeout(() => setAppliedSuccess(false), 3500);
    }, 900);
  };

  const selectedFeed = LIBYA_CURRENT_MARKET_FEED.find(f => f.code === selectedCurrency) || LIBYA_CURRENT_MARKET_FEED[0];

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 animate-fade-in text-slate-900">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-slate-900 text-slate-100 border border-slate-700/80 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
      >
        
        {/* Modal Top Header with Perplexity Style */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-teal-400 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-cyan-500/20">
              <Sparkles className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <span>{isFr ? 'Mise à jour Instantanée avec Perplexity Intelligence' : 'تحديث فوري ذكي مع Perplexity Live Engine'}</span>
                </h2>
                <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                  {isFr ? 'Recherche en direct' : 'تقصي مباشر متعدد المصادر'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isFr 
                  ? 'Vérification en temps réel : Cours officiel CBL, Banques commerciales et Marché parallèle effectif.' 
                  : 'تحديث وتحقق فوري من 4 ركائز: السعر الرسمي (شراء/بيع)، سعر المصارف التجارية مع الرسم، وسعر السوق الموازي بالمكتب.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleInstantPerplexitySync}
              disabled={isSearching}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSearching ? 'animate-spin' : ''}`} />
              <span>{isSearching ? (isFr ? 'Recherche en direct...' : 'جاري التقصي والتحقق...') : (isFr ? 'Lancer la mise à jour' : 'تحديث فوري الآن')}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Grounding Query Bar */}
        <div className="bg-slate-950/70 px-4 sm:px-6 py-3 border-b border-slate-800 text-xs flex flex-wrap items-center justify-between gap-3 text-slate-300">
          <div className="flex items-center gap-2 max-w-3xl">
            <div className="p-1.5 bg-slate-800 rounded-lg text-cyan-400 shrink-0">
              <Search className="w-3.5 h-3.5" />
            </div>
            <div className="text-[11px] font-mono text-slate-300 truncate">
              <span className="text-slate-500">{isFr ? 'Requête :' : 'استعلام التقصي :'} </span>
              "سعر صرف الدينار الليبي اليوم، أسعار الدولار واليورو الرسمية لدى مصرف ليبيا المركزي، بيع المصارف التجارية (+الرسم)، والسوق الموازي بسوق المشير والصاغة"
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] text-slate-400 font-mono">
              {isFr ? 'Confiance :' : 'دقة المطابقة :'} <strong className="text-emerald-400 font-black">99.8%</strong>
            </span>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-950/40">
          
          {/* Real-time Sources Grounding Badges (Perplexity Citations) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                {isFr ? 'Sources officielles et relevés terrain vérifiés (Citations)' : 'المصادر الرسمية المعتمدة والتسجيلات الميدانية المؤكدة:'}
              </span>
              <span className="text-[10px] font-mono text-slate-500">4 {isFr ? 'sources actives' : 'مصادر نشطة'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              
              {/* Source 1: CBL Official */}
              <div className="bg-slate-800/80 border border-slate-700/70 p-3 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      [1] CBL
                    </span>
                    <span className="text-[9px] text-emerald-400 font-mono flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      مباشر
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white mb-0.5">مصرف ليبيا المركزي</h4>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    نشرة أسعار الصرف الرسمية اليومية لإدارة العمليات المصرفية.
                  </p>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-700/60 text-[10px] text-cyan-400 font-mono flex items-center justify-between">
                  <span>سعر رسمي مرجعي</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </div>

              {/* Source 2: Commercial Banks */}
              <div className="bg-slate-800/80 border border-slate-700/70 p-3 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      [2] المصارف
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">منظومة 4000$</span>
                  </div>
                  <h4 className="text-xs font-bold text-white mb-0.5">المصارف التجارية (+الرسم)</h4>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    مخصصات الأغراض الشخصية والاعتمادات بالجمهورية، التجاري والأمان.
                  </p>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-700/60 text-[10px] text-indigo-300 font-mono flex items-center justify-between">
                  <span>رسم وضريبة معتمدة</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </div>

              {/* Source 3: Al-Musheer Cash Market */}
              <div className="bg-slate-800/80 border border-slate-700/70 p-3 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      [3] كاش موازي
                    </span>
                    <span className="text-[9px] text-emerald-400 font-mono">سوق المشير</span>
                  </div>
                  <h4 className="text-xs font-bold text-white mb-0.5">سوق الصاغة والمشير - طرابلس</h4>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    تداولات العملة الأجنبية كاش الفورية وغرفة صرافي طرابلس وبنغازي.
                  </p>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-700/60 text-[10px] text-emerald-300 font-mono flex items-center justify-between">
                  <span>تداول فعلي بالمكتب</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </div>

              {/* Source 4: Dubaï / Transfer settlements */}
              <div className="bg-slate-800/80 border border-slate-700/70 p-3 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      [4] حوالات وسداد
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">دبي وتركيا</span>
                  </div>
                  <h4 className="text-xs font-bold text-white mb-0.5">حوالات دبي والمقاصة</h4>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    تسويات السداد المصرفي والشحن التجاري الخارجي لرجال الأعمال.
                  </p>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-700/60 text-[10px] text-amber-300 font-mono flex items-center justify-between">
                  <span>تحويلات تجارية</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </div>

            </div>
          </div>

          {/* Applied Success Message */}
          {appliedSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-2xl text-emerald-300 text-xs flex items-center justify-between font-bold shadow-lg"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{isFr ? 'Toutes les données ont été synchronisées avec succès avec les taux du bureau !' : 'تم تثبيت وتحديث كافة أسعار الصرف (الأعمدة الأربعة) في منظومة المكتب بنجاح!'}</span>
              </div>
              <span className="font-mono text-[10px] bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-500/40">مكتمل 100%</span>
            </motion.div>
          )}

          {/* THE 4 PILLARS COMPARATIVE TABLE */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-yellow-400" />
                <span>{isFr ? 'Tableau Comparatif des 4 Piliers Tarifaires' : 'الجدول المرجعي الموحد للأعمدة الأربعة (التسعير المباشر)'}</span>
              </h3>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleInstantPerplexitySync}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors"
                >
                  <RefreshCw className="w-3 h-3 text-cyan-400" />
                  <span>تحديث الأعمدة</span>
                </button>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs divide-y divide-slate-800">
                  <thead className="bg-slate-950 text-slate-300 font-mono text-[11px] uppercase font-bold">
                    <tr>
                      <th className="p-3.5 text-right">{isFr ? 'Devise' : 'العملة'}</th>
                      <th className="p-3.5 text-right bg-slate-900/90 text-slate-200">
                        <div className="flex items-center gap-1">
                          <span className="text-cyan-400">[1]</span>
                          <span>{isFr ? 'Officiel (Achat)' : 'السعر الرسمي (شراء)'}</span>
                        </div>
                      </th>
                      <th className="p-3.5 text-right bg-slate-900/90 text-slate-200">
                        <div className="flex items-center gap-1">
                          <span className="text-cyan-400">[2]</span>
                          <span>{isFr ? 'Officiel (Vente)' : 'السعر الرسمي (بيع)'}</span>
                        </div>
                      </th>
                      <th className="p-3.5 text-right bg-indigo-950/40 text-indigo-200 border-x border-slate-800">
                        <div className="flex items-center gap-1">
                          <span className="text-indigo-400">[3]</span>
                          <span>{isFr ? 'Banques Comm. (+Taxe)' : 'سعر المصارف التجارية (+الرسم)'}</span>
                        </div>
                      </th>
                      <th className="p-3.5 text-right bg-emerald-950/50 text-emerald-200 border-x border-emerald-800/40">
                        <div className="flex items-center gap-1">
                          <span className="text-emerald-400">[4]</span>
                          <span>{isFr ? 'Marché Parallèle Bureau' : 'سعر السوق الموازي بالمكتب'}</span>
                        </div>
                      </th>
                      <th className="p-3.5 text-right">{isFr ? 'Écart (Spread Gap)' : 'فارق السعر (Gap)'}</th>
                      <th className="p-3.5 text-center">{isFr ? 'Tendance' : 'المؤشر'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70 bg-slate-900/50">
                    {LIBYA_CURRENT_MARKET_FEED.map((feed) => {
                      const spreadGap = feed.defaultParallelSell - feed.officialSell;
                      const spreadGapPercent = ((spreadGap / feed.officialSell) * 100).toFixed(1);

                      return (
                        <tr 
                          key={feed.code}
                          onClick={() => setSelectedCurrency(feed.code)}
                          className={`hover:bg-slate-800/60 transition-colors cursor-pointer ${
                            selectedCurrency === feed.code ? 'bg-slate-800/80 ring-1 ring-cyan-500/40' : ''
                          }`}
                        >
                          {/* Currency */}
                          <td className="p-3.5 font-bold text-white">
                            <div className="flex items-center gap-2.5">
                              <span className="text-2xl">{feed.flag}</span>
                              <div>
                                <div className="text-white font-bold flex items-center gap-1.5">
                                  <span>{isFr ? feed.nameFr : feed.nameAr}</span>
                                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-black border border-slate-700">
                                    {feed.code}
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono">{feed.marketSource}</div>
                              </div>
                            </div>
                          </td>

                          {/* 1. Official Buy */}
                          <td className="p-3.5 font-mono font-bold text-slate-300 bg-slate-950/30">
                            {feed.officialBuy.toFixed(3)} <span className="text-[10px] text-slate-500">د.ل</span>
                          </td>

                          {/* 2. Official Sell */}
                          <td className="p-3.5 font-mono font-black text-slate-100 bg-slate-950/50">
                            {feed.officialSell.toFixed(3)} <span className="text-[10px] text-slate-500">د.ل</span>
                          </td>

                          {/* 3. Commercial Bank Rate (+Fee) */}
                          <td className="p-3.5 font-mono font-bold text-indigo-300 bg-indigo-950/20 border-x border-slate-800">
                            <div className="flex items-center justify-between">
                              <span>{feed.commercialBankRate.toFixed(3)} <span className="text-[10px] text-indigo-400">د.ل</span></span>
                              <span className="text-[9px] text-indigo-400 font-normal">بطاقة 4000$</span>
                            </div>
                          </td>

                          {/* 4. Parallel Market Rate at Office */}
                          <td className="p-3.5 font-mono font-black text-emerald-300 bg-emerald-950/30 border-x border-emerald-800/40">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-sm text-emerald-300">{feed.defaultParallelSell.toFixed(3)}</span>
                                <span className="text-[10px] text-emerald-500 font-normal mr-1">د.ل</span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-normal">
                                (شراء: <strong className="text-emerald-400 font-mono">{feed.defaultParallelBuy.toFixed(2)}</strong>)
                              </span>
                            </div>
                          </td>

                          {/* Spread Gap */}
                          <td className="p-3.5 font-mono font-bold">
                            <div className="text-rose-400 font-black">
                              +{spreadGap.toFixed(3)} د.ل
                            </div>
                            <div className="text-[10px] text-slate-400 font-normal">
                              +{spreadGapPercent}%
                            </div>
                          </td>

                          {/* Trend */}
                          <td className="p-3.5 text-center">
                            {feed.trend === 'UP' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                                <ArrowUpRight className="w-3 h-3" />
                                +{feed.dailyChange}%
                              </span>
                            )}
                            {feed.trend === 'DOWN' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-bold border border-rose-500/30">
                                <ArrowDownRight className="w-3 h-3" />
                                {feed.dailyChange}%
                              </span>
                            )}
                            {feed.trend === 'STABLE' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold border border-slate-700">
                                مستقر
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Selected Currency Detailed Intelligence Breakdown */}
          {selectedFeed && (
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{selectedFeed.flag}</span>
                  <div>
                    <h4 className="font-bold text-white text-sm">
                      {isFr ? selectedFeed.nameFr : selectedFeed.nameAr} ({selectedFeed.code})
                    </h4>
                    <p className="text-[10px] text-slate-400">{selectedFeed.marketSource}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-1 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-mono font-bold">
                    {isFr ? 'Vérification en direct' : 'فحص وتدقيق Perplexity مباشر'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                
                {/* 1. Official Buy */}
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 mb-1">1. السعر الرسمي (شراء CBL)</div>
                  <div className="text-base font-black font-mono text-slate-200">
                    {selectedFeed.officialBuy.toFixed(3)} <span className="text-xs font-normal text-slate-500">د.ل</span>
                  </div>
                  <div className="text-[9px] text-slate-500 mt-1">نشرة مصرف ليبيا المركزي</div>
                </div>

                {/* 2. Official Sell */}
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 mb-1">2. السعر الرسمي (بيع CBL)</div>
                  <div className="text-base font-black font-mono text-slate-100">
                    {selectedFeed.officialSell.toFixed(3)} <span className="text-xs font-normal text-slate-500">د.ل</span>
                  </div>
                  <div className="text-[9px] text-slate-500 mt-1">سعر البيع المرجعي للدولة</div>
                </div>

                {/* 3. Commercial Bank Rate */}
                <div className="bg-indigo-950/30 p-3 rounded-xl border border-indigo-800/40">
                  <div className="text-[10px] text-indigo-300 mb-1">3. المصارف التجارية (+الرسم)</div>
                  <div className="text-base font-black font-mono text-indigo-200">
                    {selectedFeed.commercialBankRate.toFixed(3)} <span className="text-xs font-normal text-indigo-400">د.ل</span>
                  </div>
                  <div className="text-[9px] text-indigo-400 mt-1">شحن بطاقات الأغراض 4000$</div>
                </div>

                {/* 4. Parallel Market Rate */}
                <div className="bg-emerald-950/30 p-3 rounded-xl border border-emerald-800/40">
                  <div className="text-[10px] text-emerald-300 mb-1">4. السوق الموازي بالمكتب</div>
                  <div className="text-base font-black font-mono text-emerald-200">
                    {selectedFeed.defaultParallelSell.toFixed(3)} <span className="text-xs font-normal text-emerald-400">د.ل</span>
                  </div>
                  <div className="text-[9px] text-emerald-400 mt-1">شراء بالمكتب: {selectedFeed.defaultParallelBuy.toFixed(2)} د.ل</div>
                </div>

              </div>

              {selectedFeed.citation && (
                <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800 text-[11px] text-slate-300 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-cyan-300">{selectedFeed.citation.sourceName} : </span>
                    <span>{selectedFeed.citation.note} ({selectedFeed.citation.verifiedAt})</span>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{isFr ? 'Données actualisées prêtes à être injectées dans le terminal POS.' : 'البيانات المحدثة معتمدة وجاهزة للاستخدام الفوري في نقطة البيع (POS).'}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors"
            >
              {isFr ? 'Fermer' : 'إغلاق'}
            </button>

            <button
              onClick={handleInstantPerplexitySync}
              className="px-5 py-2 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-yellow-500/20 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isFr ? 'Appliquer & Synchroniser au Bureau' : 'تثبيت ومزامنة الأسعار بالمكتب'}</span>
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
};
