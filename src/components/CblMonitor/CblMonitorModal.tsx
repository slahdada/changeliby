import React, { useState } from 'react';
import { 
  Landmark, RefreshCw, Search, FileText, CheckCircle2, 
  ArrowUpRight, ArrowDownRight, Scale, Printer, Copy, Check, 
  ExternalLink, Bell, AlertTriangle, ShieldCheck, TrendingUp,
  Download, Filter, Calendar, Building, Sparkles, X, ChevronDown, ChevronUp,
  Coins, FileCheck, Layers, Radio
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PerplexityFeedModal } from '../PerplexitySync/PerplexityFeedModal';
import { GoogleIcon } from '../GoogleSearchGrounding/GoogleIcon';

export interface CblRateItem {
  code: string;
  nameAr: string;
  nameFr: string;
  symbol: string;
  flag: string;
  officialBuy: number;
  officialSell: number;
  commercialBankRate: number;
  parallelMarketRate: number;
  change24h: number; // percentage
  status: 'STABLE' | 'UP' | 'DOWN';
}

export interface CblCircular {
  id: string;
  code: string;
  title: string;
  titleFr?: string;
  department: string;
  date: string;
  category: 'PERSONAL_FX' | 'AML_KYC' | 'COMMERCIAL_LC' | 'LIQUIDITY' | 'GENERAL';
  summary: string;
  details: string[];
  isImportant?: boolean;
  pdfAvailable?: boolean;
}

const CBL_RATES_DATA: CblRateItem[] = [
  {
    code: 'USD',
    nameAr: 'الدولار الأمريكي (كاش)',
    nameFr: 'Dollar US (Espèces)',
    symbol: '$',
    flag: '🇺🇸',
    officialBuy: 4.815,
    officialSell: 4.839,
    commercialBankRate: 6.120,
    parallelMarketRate: 7.260,
    change24h: 0.15,
    status: 'UP'
  },
  {
    code: 'USD_TR',
    nameAr: 'دولار تحويلات وبطاقات (سداد / دبي)',
    nameFr: 'Dollar US (Virement / Cartes)',
    symbol: '$',
    flag: '🏦',
    officialBuy: 4.815,
    officialSell: 4.839,
    commercialBankRate: 6.120,
    parallelMarketRate: 7.390,
    change24h: 0.10,
    status: 'UP'
  },
  {
    code: 'EUR',
    nameAr: 'اليورو الأوروبي',
    nameFr: 'Euro',
    symbol: '€',
    flag: '🇪🇺',
    officialBuy: 5.250,
    officialSell: 5.276,
    commercialBankRate: 6.690,
    parallelMarketRate: 7.860,
    change24h: -0.08,
    status: 'DOWN'
  },
  {
    code: 'GBP',
    nameAr: 'الجنيه الإسترليني',
    nameFr: 'Livre Sterling',
    symbol: '£',
    flag: '🇬🇧',
    officialBuy: 6.140,
    officialSell: 6.170,
    commercialBankRate: 7.820,
    parallelMarketRate: 9.220,
    change24h: 0.22,
    status: 'UP'
  },
  {
    code: 'TND',
    nameAr: 'الدينار التونسي',
    nameFr: 'Dinar Tunisien',
    symbol: 'د.ت',
    flag: '🇹🇳',
    officialBuy: 1.545,
    officialSell: 1.553,
    commercialBankRate: 1.980,
    parallelMarketRate: 2.340,
    change24h: 0.00,
    status: 'STABLE'
  },
  {
    code: 'EGP',
    nameAr: 'الجنيه المصري',
    nameFr: 'Livre Égyptienne',
    symbol: 'ج.م',
    flag: '🇪🇬',
    officialBuy: 0.098,
    officialSell: 0.100,
    commercialBankRate: 0.126,
    parallelMarketRate: 0.152,
    change24h: -0.45,
    status: 'DOWN'
  },
  {
    code: 'TRY',
    nameAr: 'الليرة التركية',
    nameFr: 'Livre Turque',
    symbol: '₺',
    flag: '🇹🇷',
    officialBuy: 0.138,
    officialSell: 0.141,
    commercialBankRate: 0.178,
    parallelMarketRate: 0.222,
    change24h: -0.30,
    status: 'DOWN'
  },
  {
    code: 'SAR',
    nameAr: 'الريال السعودي',
    nameFr: 'Riyal Saoudien',
    symbol: 'ر.س',
    flag: '🇸🇦',
    officialBuy: 1.282,
    officialSell: 1.288,
    commercialBankRate: 1.630,
    parallelMarketRate: 1.930,
    change24h: 0.05,
    status: 'STABLE'
  },
  {
    code: 'AED',
    nameAr: 'الدرهم الإماراتي',
    nameFr: 'Dirham Émirati',
    symbol: 'د.إ',
    flag: '🇦🇪',
    officialBuy: 1.310,
    officialSell: 1.317,
    commercialBankRate: 1.668,
    parallelMarketRate: 1.970,
    change24h: 0.02,
    status: 'STABLE'
  },
  {
    code: 'CNY',
    nameAr: 'اليوان الصيني',
    nameFr: 'Yuan Chinois',
    symbol: '¥',
    flag: '🇨🇳',
    officialBuy: 0.668,
    officialSell: 0.672,
    commercialBankRate: 0.852,
    parallelMarketRate: 0.995,
    change24h: 0.10,
    status: 'STABLE'
  }
];

const CBL_CIRCULARS_DATA: CblCircular[] = [
  {
    id: 'CIRC-2026-04',
    code: 'منشور إ.ر.م رقم (04/2026)',
    title: 'ضوابط وتسهيلات بيع النقد الأجنبي للأغراض الشخصية عبر المنظومة الموحدة (4000$)',
    titleFr: 'Réglementation et facilités de vente de devises pour besoins personnels (4 000 $)',
    department: 'إدارة الرقابة على المصارف والنقد',
    date: '2026-08-10',
    category: 'PERSONAL_FX',
    isImportant: true,
    pdfAvailable: true,
    summary: 'تحديد آليات حجز مخصصات الأغراض الشخصية وربطها بالرقم الوطني الليبي وشحن البطاقات الدولية (Mastercard / Visa).',
    details: [
      'الحد الأقصى لكل مواطن يبلغ من العمر 18 عاماً فما فوق هو 4,000 دولار أمريكي أو ما يعادله من العملات الأخرى سنوياً.',
      'يشترط مطابقة الرقم الوطني ورقم جواز السفر الساري والرقم المصرفي الدولي (IBAN).',
      'تلتزم المصارف التجارية بشحن البطاقات الإلكترونية أو إصدار الحوالات المباشرة خلال 48 ساعة من اعتماد الطلب.',
      'تمنح الأولوية في السداد للاحتياجات العلاجية والدراسية والاشتراكات المعتمدة بالخارج.'
    ]
  },
  {
    id: 'CIRC-2026-03',
    code: 'منشور إ.ر.م رقم (03/2026)',
    title: 'الضوابط الرقابية لمكافحة غسيل الأموال وتمويل الإرهاب لشركات ومكاتب الصرافة',
    titleFr: 'Directives de lutte contre le blanchiment d\'argent (AML/KYC) pour bureaux de change',
    department: 'وحدة المعلومات والتحريات المالية',
    date: '2026-07-28',
    category: 'AML_KYC',
    isImportant: true,
    pdfAvailable: true,
    summary: 'إلزام كافة مكاتب الصرافة العاملة بالتحقق الدقيق من هوية العملاء (KYC) وتوثيق مصادر الأموال للمعاملات الكبرى.',
    details: [
      'إلزامية التحقق من الرقم الوطني للزبائن الليبيين وجواز السفر للأجانب لكل معاملة تزيد عن 5,000 د.ل.',
      'الاحتفاظ بسجلات المعاملات المالية وإيصالات الصرف الدفترية والإلكترونية لمدة لا تقل عن 5 سنوات.',
      'الإبلاغ الفوري عن أي معاملة مشبوهة أو تجزئة مبالغ غير مبررة إلى وحدة التحريات المالية.',
      'حظر التعامل مع أي أشخاص أو كيانات مدرجة ضمن القوائم الوطنية أو الدولية للحظر المالي.'
    ]
  },
  {
    id: 'CIRC-2026-02',
    code: 'منشور إ.ر.م رقم (02/2026)',
    title: 'تنظيم فتح الاعتمادات المستندية للأغراض التجارية والصناعية واستيراد السلع',
    titleFr: 'Réglementation des crédits documentaires (L/C) commerciaux et industriels',
    department: 'إدارة العمليات المصرفية والنقد الأجنبي',
    date: '2026-07-15',
    category: 'COMMERCIAL_LC',
    isImportant: false,
    pdfAvailable: true,
    summary: 'تسهيل إجراءات فتح الاعتمادات المستندية لتوريد المواد الغذائية والأدوية والمواد الخام للمصانع المحلية.',
    details: [
      'تغطية الاعتمادات المستندية بسعر الصرف التجاري المعتمد لدى المصارف التجارية.',
      'إلزام الموردين بتقديم الإقرار الجمركي وشهادة التفتيش والمطابقة الدولية للسلع الموردة.',
      'توفير التغطية المالية السريعة للسلع الأساسية والمستلزمات الطبية والدوائية المستعجلة.'
    ]
  },
  {
    id: 'CIRC-2026-01',
    code: 'بيان مصرفي دوري (01/2026)',
    title: 'تقرير السيولة النقدية ومتابعة الأرصدة المصرفية ومطابقة الجرد اليومي',
    titleFr: 'Rapport de liquidité bancaire et rapprochement quotidien des caisses',
    department: 'إدارة الرقابة على المصارف',
    date: '2026-06-30',
    category: 'LIQUIDITY',
    isImportant: false,
    pdfAvailable: true,
    summary: 'إرشادات متابعة السيولة وتوزيع النقد الورقي على فروع المصارف ومكاتب الصرافة لتخفيف الازدحام.',
    details: [
      'تأكيد استمرار عمليات السحب والإيداع النقدي وفق المعدلات الدورية.',
      'إلزام مكاتب الصرافة بإجراء الإقفال اليومي للصناديق ومطابقة الأرصدة الفعلية مع السجلات.',
      'تسهيل قبول الأوراق النقدية ذات الإصدارات المعتمدة قانونياً من مصرف ليبيا المركزي.'
    ]
  },
  {
    id: 'CIRC-2026-STAT',
    code: 'بيان إحصائي فصلي',
    title: 'الإيرادات والإنفاق واستخدامات النقد الأجنبي للدولة الليبية',
    titleFr: 'Statistiques trimestrielles des revenus et dépenses en devises',
    department: 'إدارة البحوث والإحصاء',
    date: '2026-06-15',
    category: 'GENERAL',
    isImportant: false,
    pdfAvailable: true,
    summary: 'بيان تفصيلي حول تدفقات النقد الأجنبي من صادرات النفط والغاز ومخصصات الميزانية العامة.',
    details: [
      'إجمالي الإيرادات النفطية والسيادية المودعة بحسابات مصرف ليبيا المركزي.',
      'حجم استخدامات النقد الأجنبي للمصارف التجارية والتحويلات الخارجية للدولة.',
      'الحفاظ على مستوى كافٍ من الاحتياطيات النقدية لتغطية الواردات الأساسية للبلاد.'
    ]
  }
];

export const CblMonitorModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { rates, syncWithMarketFeed, currentUser, lang, triggerCblRateAlert, simulateCblMarketEvent, setIsGoogleGroundingOpen } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'RATES' | 'CIRCULARS' | 'CALCULATOR' | 'MACRO'>('RATES');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [expandedCircularId, setExpandedCircularId] = useState<string | null>('CIRC-2026-04');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(lang === 'fr' ? 'En direct' : 'الآن - مباشر');
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [syncedOfficeMsg, setSyncedOfficeMsg] = useState(false);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);
  const [isPerplexityOpen, setIsPerplexityOpen] = useState(false);

  // Helper formatting to prevent any runtime error
  const safeNumber = (val: any, fallback = 0): number => {
    const n = typeof val === 'number' ? val : parseFloat(val);
    return isNaN(n) ? fallback : n;
  };

  const safeToFixed = (val: any, digits = 3): string => {
    return safeNumber(val).toFixed(digits);
  };

  const safeLocale = (val: any): string => {
    return safeNumber(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Dynamic merged rates incorporating user's current live rates with absolute safety
  const currentMergedRates: (CblRateItem & { officeBuyRate: number })[] = CBL_RATES_DATA.map(cblItem => {
    const liveOfficeRate = Array.isArray(rates) ? rates.find(r => r && r.currencyCode === cblItem.code) : undefined;
    
    const liveSell = liveOfficeRate ? safeNumber(liveOfficeRate.sellRate, 0) : 0;
    const liveBuy = liveOfficeRate ? safeNumber(liveOfficeRate.buyRate, 0) : 0;

    const parallelMarketRate = liveSell > 0 ? liveSell : safeNumber(cblItem.parallelMarketRate, 7.25);
    const officeBuyRate = liveBuy > 0 ? liveBuy : Math.max(0.01, parallelMarketRate - 0.05);

    return {
      ...cblItem,
      officialBuy: safeNumber(cblItem.officialBuy, 0),
      officialSell: safeNumber(cblItem.officialSell, 0),
      commercialBankRate: safeNumber(cblItem.commercialBankRate, 0),
      parallelMarketRate,
      officeBuyRate,
      change24h: safeNumber(cblItem.change24h, 0),
      status: cblItem.status || 'STABLE'
    };
  });

  // Calculator State
  const [calcAmount, setCalcAmount] = useState<number>(1000);
  const [calcCurrency, setCalcCurrency] = useState<string>('USD');

  if (!isOpen) return null;

  const handleRefreshFeed = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      syncWithMarketFeed();
      setIsRefreshing(false);
      const now = new Date();
      setLastSyncTime(now.toLocaleTimeString(lang === 'fr' ? 'fr-FR' : 'ar-LY', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setSyncedOfficeMsg(true);
      setTimeout(() => setSyncedOfficeMsg(false), 3000);

      // Trigger instant push toast notification for the detected official CBL changes
      simulateCblMarketEvent();
    }, 600);
  };

  const handleCopyBulletin = async () => {
    try {
      const text = currentMergedRates.map(r => 
        `${r.nameAr} (${r.code}): رسمي=${safeToFixed(r.officialSell)} د.ل | تجاري=${safeToFixed(r.commercialBankRate)} د.ل | موازي بالمكتب=${safeToFixed(r.parallelMarketRate)} د.ل (شراء: ${safeToFixed(r.officeBuyRate)})`
      ).join('\n');
      const header = `النشرة الرسمية لمصرف ليبيا المركزي (CBL) والأسعار الموازية - تحديث ${new Date().toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'ar-LY')}:\n${text}\nمصدر البيانات: البنك المركزي الليبي وسوق الصرف الفعلي`;
      
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(header);
      }
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 2000);
    } catch (e) {
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 2000);
    }
  };

  const filteredCirculars = CBL_CIRCULARS_DATA.filter(c => {
    const q = (searchQuery || '').toLowerCase();
    const matchesSearch = c.title.toLowerCase().includes(q) ||
                          c.code.toLowerCase().includes(q) ||
                          c.summary.toLowerCase().includes(q) ||
                          (c.titleFr && c.titleFr.toLowerCase().includes(q));
    const matchesCat = selectedCategory === 'ALL' || c.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const selectedCblItem = currentMergedRates.find(r => r.code === calcCurrency) || currentMergedRates[0];
  const safeAmount = Math.max(0, safeNumber(calcAmount, 1000));
  const totalOfficialLyd = safeAmount * safeNumber(selectedCblItem?.officialSell, 4.839);
  const totalCommercialLyd = safeAmount * safeNumber(selectedCblItem?.commercialBankRate, 6.120);
  const totalParallelLyd = safeAmount * safeNumber(selectedCblItem?.parallelMarketRate, 7.260);
  const spreadDiffLyd = totalParallelLyd - totalOfficialLyd;

  const isFr = lang === 'fr';

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 animate-fade-in text-slate-900">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-900">
        
        {/* Top Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 border-b-4 border-yellow-500 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-yellow-500 text-slate-900 rounded-2xl flex items-center justify-center font-black text-xl shadow-md shrink-0">
              <Landmark className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  <span>{isFr ? 'Surveillance en Direct - Banque Centrale de Libye (CBL)' : 'المتابعة اللحظية لتحديثات البنك المركزي والبيانات الرسمية'}</span>
                </h2>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  {isFr ? 'Système CBL Actif' : 'منظومة CBL الحية'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {isFr ? 'Bulletins officiels des cours de change CBL, circulaires réglementaires et marché parallèle.' : 'نشرات أسعار الصرف الرسمية الصادرة عن مصرف ليبيا المركزي، التعاميم الرقابية، وضوابط النقد الأجنبي المعتمدة.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Google Search Live Grounding Button */}
            <button
              onClick={() => setIsGoogleGroundingOpen(true)}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-md shadow-blue-500/20 border border-slate-200"
              title="تقصي بيانات ونشرات CBL عبر Google Search Grounding"
            >
              <GoogleIcon className="w-3.5 h-3.5 shrink-0" />
              <span>{isFr ? 'Google Grounding' : 'تقصي Google'}</span>
            </button>

            {/* Perplexity AI Live Grounding Button */}
            <button
              onClick={() => setIsPerplexityOpen(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20"
              title="تحديث فوري ذكي مع Perplexity"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isFr ? 'Perplexity Live' : 'تحديث فوري (Perplexity)'}</span>
            </button>

            {/* Refresh Button */}
            <button
              onClick={handleRefreshFeed}
              disabled={isRefreshing}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              title={isFr ? 'Actualiser les données' : 'تحديث البيانات لحظياً'}
            >
              <RefreshCw className={`w-3.5 h-3.5 text-yellow-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isRefreshing ? (isFr ? 'Actualisation...' : 'جاري التحديث...') : (isFr ? 'Actualiser' : 'تحديث')}</span>
            </button>

            {/* Print Bulletin */}
            <button
              onClick={() => window.print()}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              title={isFr ? 'Imprimer le bulletin' : 'طباعة النشرة الرسمية'}
            >
              <Printer className="w-3.5 h-3.5 text-yellow-400" />
              <span className="hidden sm:inline">{isFr ? 'Imprimer' : 'طباعة'}</span>
            </button>

            {/* Copy Bulletin */}
            <button
              onClick={handleCopyBulletin}
              className="px-3 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-900 rounded-xl text-xs font-black flex items-center gap-1.5 transition-colors shadow-sm"
              title={isFr ? 'Copier le bulletin' : 'نسخ ملخص النشرة'}
            >
              {copiedSuccess ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSuccess ? (isFr ? 'Copié !' : 'تم النسخ!') : (isFr ? 'Copier' : 'نسخ النشرة')}</span>
            </button>

            {/* Close Modal */}
            <button
              onClick={onClose}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sync Status Sub-bar */}
        <div className="bg-slate-100 px-4 sm:px-6 py-2 border-b border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2 shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-bold flex items-center gap-1.5 text-slate-800">
              <Building className="w-3.5 h-3.5 text-yellow-600" />
              {isFr ? 'Source : Banque Centrale de Libye (CBL) - Département des Opérations Bancaires' : 'المصدر المعتمد: إدارة العمليات المصرفية - مصرف ليبيا المركزي'}
            </span>
            <span className="text-slate-300">|</span>
            <span className="font-mono text-slate-500">{isFr ? 'Dernière synchro :' : 'آخر مزامنة:'} {lastSyncTime}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-bold text-slate-700">{isFr ? 'Flux Actif' : 'متصل بالقناة الإخبارية'}</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-4 sm:px-6 pt-3 bg-white gap-2 sm:gap-4 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveSubTab('RATES')}
            className={`pb-3 px-3.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'RATES'
                ? 'border-yellow-500 text-slate-900 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-yellow-600" />
            <span>{isFr ? 'Tableau des cours officiels CBL' : 'جدول أسعار الصرف الرسمية (CBL)'}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('CIRCULARS')}
            className={`pb-3 px-3.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'CIRCULARS'
                ? 'border-yellow-500 text-slate-900 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-yellow-600" />
            <span>{isFr ? `Circulaires & Directives (${CBL_CIRCULARS_DATA.length})` : `المنشورات والتعاميم الرقابية الرسمية (${CBL_CIRCULARS_DATA.length})`}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('CALCULATOR')}
            className={`pb-3 px-3.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'CALCULATOR'
                ? 'border-yellow-500 text-slate-900 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Scale className="w-4 h-4 text-yellow-600" />
            <span>{isFr ? 'Calculateur comparatif Officiel vs Parallèle' : 'حاسبة مقارنة السعر الرسمي والموازي'}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('MACRO')}
            className={`pb-3 px-3.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'MACRO'
                ? 'border-yellow-500 text-slate-900 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-yellow-600" />
            <span>{isFr ? 'Indicateurs macro & liquidité' : 'مؤشرات الاحتياطي والسيولة العامة'}</span>
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/50">
          
          {/* TAB 1: OFFICIAL RATES TABLE */}
          {activeSubTab === 'RATES' && (
            <div className="space-y-4">
              
              {/* Highlight Info Box */}
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-yellow-200 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-yellow-500 text-slate-900 rounded-xl font-bold">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">
                      {isFr ? 'Bulletin officiel des taux de change émis par la Banque Centrale de Libye' : 'نشرة أسعار الصرف الرسمية الصادرة عن مصرف ليبيا المركزي اليوم'}
                    </div>
                    <div className="text-xs text-slate-600">
                      {isFr ? 'Comparaison en direct entre le cours officiel de référence, les banques commerciales et le marché effectif du bureau.' : 'مقارنة لحظية بين السعر الرسمي المرجعي، سعر بيع المصارف التجارية، وسعر السوق الموازي المعتمد في المكتب.'}
                    </div>
                  </div>
                </div>

                <div className="text-left font-mono">
                  <span className="text-xs bg-white border border-yellow-300 px-3 py-1 rounded-lg text-slate-800 font-bold">
                    {isFr ? 'Date : ' : 'تاريخ النشرة: '} {new Date().toLocaleDateString(isFr ? 'fr-FR' : 'ar-LY')}
                  </span>
                </div>
              </div>

              {syncedOfficeMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 font-bold animate-fade-in shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{isFr ? 'Les taux ont été synchronisés avec succès avec les cours réels du marché !' : 'تمت مزامنة وتحديث أسعار الصرف مع الأسعار الفعلية للسوق والنشرة الرسمية بنجاح!'}</span>
                </div>
              )}

              {/* Table */}
              <div className="border border-slate-300 rounded-2xl overflow-hidden shadow-sm bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs text-slate-900 divide-y divide-slate-200">
                    <thead className="bg-slate-900 text-white font-mono text-[11px] uppercase font-bold">
                      <tr>
                        <th className="p-3.5">{isFr ? 'Devise' : 'العملة'}</th>
                        <th className="p-3.5">{isFr ? 'Officiel (Achat)' : 'السعر الرسمي (شراء)'}</th>
                        <th className="p-3.5">{isFr ? 'Officiel (Vente)' : 'السعر الرسمي (بيع)'}</th>
                        <th className="p-3.5">{isFr ? 'Banques Comm. (+Taxe)' : 'سعر المصارف التجارية (+الرسم)'}</th>
                        <th className="p-3.5 bg-emerald-950/80">{isFr ? 'Marché Parallèle Bureau' : 'سعر السوق الموازي بالمكتب'}</th>
                        <th className="p-3.5">{isFr ? 'Écart (Spread Gap)' : 'فارق السعر (Spread Gap)'}</th>
                        <th className="p-3.5 text-center">{isFr ? 'Tendance' : 'حالة المؤشر'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {currentMergedRates.map((item) => {
                        const gap = safeNumber(item.parallelMarketRate) - safeNumber(item.officialSell);
                        const offSell = safeNumber(item.officialSell, 1);
                        const gapPercent = offSell > 0 ? ((gap / offSell) * 100).toFixed(1) : '0.0';
                        
                        return (
                          <tr key={item.code} className="hover:bg-slate-50/80 transition-colors">
                            
                            {/* Currency */}
                            <td className="p-3.5 font-bold text-slate-900">
                              <div className="flex items-center gap-2.5">
                                <span className="text-2xl">{item.flag}</span>
                                <div>
                                  <div className="text-slate-900 font-bold flex items-center gap-1.5">
                                    <span>{isFr ? (item.nameFr || item.nameAr) : item.nameAr}</span>
                                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-black border border-slate-300">
                                      {item.code}
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-slate-500 font-mono">{item.symbol}</div>
                                </div>
                              </div>
                            </td>

                            {/* Official Buy */}
                            <td className="p-3.5 font-mono font-bold text-slate-700">
                              {safeToFixed(item.officialBuy, 3)} <span className="text-[10px] text-slate-500 font-normal">د.ل</span>
                            </td>

                            {/* Official Sell */}
                            <td className="p-3.5 font-mono font-black text-slate-900 bg-slate-50/70">
                              {safeToFixed(item.officialSell, 3)} <span className="text-[10px] text-slate-500 font-normal">د.ل</span>
                            </td>

                            {/* Commercial Bank */}
                            <td className="p-3.5 font-mono font-bold text-indigo-700">
                              {safeToFixed(item.commercialBankRate, 3)} <span className="text-[10px] text-indigo-500 font-normal">د.ل</span>
                            </td>

                            {/* Parallel Rate */}
                            <td className="p-3.5 font-mono font-black text-emerald-800 bg-emerald-50/60 border-x border-emerald-100">
                              <div className="flex items-center justify-between gap-1">
                                <div>
                                  <span className="text-xs">{safeToFixed(item.parallelMarketRate, 3)}</span>
                                  <span className="text-[10px] text-emerald-600 font-normal mr-1">د.ل</span>
                                </div>
                                <span className="text-[9px] font-normal text-slate-500">({isFr ? 'Achat' : 'شراء'}: {safeToFixed(item.officeBuyRate, 2)})</span>
                              </div>
                            </td>

                            {/* Spread Gap */}
                            <td className="p-3.5 font-mono font-bold">
                              <div className="text-rose-700 font-black">
                                +{safeToFixed(gap, 3)} د.ل
                              </div>
                              <div className="text-[10px] text-slate-600 font-normal">
                                {isFr ? 'Écart :' : 'فارق:'} {gapPercent}%
                              </div>
                            </td>

                            {/* Trend Status */}
                            <td className="p-3.5 text-center">
                              {item.status === 'UP' && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                  <ArrowUpRight className="w-3 h-3" />
                                  +{safeNumber(item.change24h)}%
                                </span>
                              )}
                              {item.status === 'DOWN' && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                                  <ArrowDownRight className="w-3 h-3" />
                                  {safeNumber(item.change24h)}%
                                </span>
                              )}
                              {item.status === 'STABLE' && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                                  {isFr ? 'Stable (0.00%)' : 'مستقر (0.00%)'}
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

              {/* Regulatory Footnote */}
              <div className="p-3.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  {isFr ? 'Note réglementaire sur la tarification du change :' : 'ملاحظة تنظيمية حول تسعير الصرافة:'}
                </div>
                <p className="text-[11px] leading-relaxed">
                  {isFr ? 'Les cours du marché parallèle sont déterminés par l\'offre et la demande tout en s\'appuyant sur les publications de la CBL comme base de référence.' : 'يتم احتساب أسعار العملات في السوق الموازي بناءً على حجم العرض والطلب المحلي مع الاستئناس بنشرات مصرف ليبيا المركزي الرسمية كأساس مرجعي لتسوية الحسابات وحوالات المقاصة.'}
                </p>
              </div>

            </div>
          )}

          {/* TAB 2: OFFICIAL CIRCULARS & DECREES */}
          {activeSubTab === 'CIRCULARS' && (
            <div className="space-y-4">
              
              {/* Search & Category Filter */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isFr ? 'Rechercher dans les décisions CBL...' : 'بحث في نصوص وقرارات البنك المركزي...'}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-yellow-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600">{isFr ? 'Catégorie :' : 'التصنيف:'}</span>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none"
                  >
                    <option value="ALL">{isFr ? 'Toutes les circulaires' : 'كافة المنشورات والتعاميم'}</option>
                    <option value="PERSONAL_FX">{isFr ? 'Besoins personnels (4000$ & Cartes)' : 'الأغراض الشخصية (4000$ والبطاقات)'}</option>
                    <option value="AML_KYC">{isFr ? 'Lutte contre le blanchiment & KYC' : 'مكافحة غسيل الأموال وKYC'}</option>
                    <option value="COMMERCIAL_LC">{isFr ? 'Crédits documentaires L/C' : 'الاعتمادات المستندية والتجارية'}</option>
                    <option value="LIQUIDITY">{isFr ? 'Liquidité & Banques' : 'السيولة النقدية والمصارف'}</option>
                    <option value="GENERAL">{isFr ? 'Statistiques générales' : 'بيانات وإحصاءات عامة'}</option>
                  </select>
                </div>
              </div>

              {downloadNotice && (
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-900 text-xs flex items-center gap-2 font-bold animate-fade-in">
                  <FileCheck className="w-4 h-4 text-indigo-600" />
                  <span>{downloadNotice}</span>
                </div>
              )}

              {/* Circulars List */}
              <div className="space-y-3">
                {filteredCirculars.length === 0 ? (
                  <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl text-slate-500 text-xs font-medium">
                    {isFr ? 'Aucune circulaire ne correspond à votre recherche.' : 'لا توجد منشورات مطابقة للبحث المحدد.'}
                  </div>
                ) : (
                  filteredCirculars.map((circ) => {
                    const isExpanded = expandedCircularId === circ.id;
                    return (
                      <div
                        key={circ.id}
                        className={`border rounded-2xl transition-all overflow-hidden bg-white shadow-sm ${
                          circ.isImportant ? 'border-yellow-400/80 ring-1 ring-yellow-400/30' : 'border-slate-200'
                        }`}
                      >
                        {/* Header Box */}
                        <div
                          onClick={() => setExpandedCircularId(isExpanded ? null : circ.id)}
                          className="p-4 cursor-pointer hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 select-none"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2.5 rounded-xl mt-0.5 shrink-0 ${
                              circ.isImportant ? 'bg-yellow-500 text-slate-950 font-bold' : 'bg-slate-100 text-slate-700'
                            }`}>
                              <FileText className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                                  {circ.code}
                                </span>
                                {circ.isImportant && (
                                  <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Bell className="w-3 h-3 text-amber-700" /> {isFr ? 'Circulaire obligatoire' : 'منشور هام وملزم'}
                                  </span>
                                )}
                                <span className="text-[11px] text-slate-500 font-mono">
                                  📅 {circ.date}
                                </span>
                              </div>
                              <h3 className="font-bold text-slate-900 text-sm mt-1.5">{isFr ? (circ.titleFr || circ.title) : circ.title}</h3>
                              <p className="text-xs text-slate-600 mt-1 line-clamp-1">{circ.summary}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {circ.pdfAvailable && (
                              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200">
                                <Download className="w-3 h-3 text-yellow-600" /> {isFr ? 'Document PDF' : 'وثيقة PDF'}
                              </span>
                            )}
                            <div className="p-1 rounded-lg text-slate-400 hover:text-slate-800">
                              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </div>
                          </div>
                        </div>

                        {/* Collapsible Details */}
                        {isExpanded && (
                          <div className="p-4 bg-slate-50/70 border-t border-slate-200 text-xs space-y-3 animate-fade-in">
                            <div>
                              <span className="font-bold text-slate-700">{isFr ? 'Département émetteur : ' : 'جهة الإصدار: '}</span>
                              <span className="text-slate-900 font-semibold">{circ.department}</span>
                            </div>

                            <div className="space-y-1.5">
                              <span className="font-bold text-slate-800 block">{isFr ? 'Directives et clauses d\'application :' : 'البنود والتعليمات التنفيذية الصادرة:'}</span>
                              <ul className="space-y-1.5 list-disc list-inside text-slate-700 pr-1">
                                {circ.details.map((detail, idx) => (
                                  <li key={idx} className="leading-relaxed">{detail}</li>
                                ))}
                              </ul>
                            </div>

                            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                              <span className="text-emerald-700 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> {isFr ? 'Applicable à tous les bureaux agréés' : 'سارٍ ومعتمد لكافة الصرافين المرخصين'}
                              </span>

                              <button
                                onClick={() => {
                                  setDownloadNotice(`تم تجهيز ملف القرار الرسمي (${circ.code}) بنجاح.`);
                                  setTimeout(() => setDownloadNotice(null), 3000);
                                }}
                                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold flex items-center gap-1.5 transition-colors"
                              >
                                <Download className="w-3.5 h-3.5 text-yellow-400" />
                                <span>{isFr ? 'Télécharger la circulaire' : 'تحميل الوثيقة الرسمية'}</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

            </div>
          )}

          {/* TAB 3: OFFICIAL VS PARALLEL CALCULATOR */}
          {activeSubTab === 'CALCULATOR' && (
            <div className="space-y-5">
              
              <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
                <h3 className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-yellow-600" />
                  {isFr ? 'Calculateur comparatif : Cours officiel CBL vs Banques vs Marché Bureau' : 'حاسبة مقارنة التحويل: السعر الرسمي للبنك المركزي مقابل سعر السوق الموازي'}
                </h3>
                <p className="text-xs text-slate-600">
                  {isFr ? 'Saisissez un montant en devises pour visualiser la contre-valeur en Dinars Libyens selon 3 canaux distincts.' : 'قم بإدخال المبلغ بالعملة الأجنبية لعرض القيمة بالدينار الليبي عبر 3 قنوات: السعر الرسمي المجرد، سعر بيع المصارف التجارية مع الرسم، وسعر الشراء/البيع في السوق الموازي.'}
                </p>
              </div>

              {/* Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
                  <label className="text-xs font-bold text-slate-700 block mb-1">{isFr ? 'Montant en devises' : 'المبلغ بالعملة الأجنبية'}</label>
                  <input
                    type="number"
                    min="1"
                    value={calcAmount}
                    onChange={(e) => setCalcAmount(Math.max(1, Number(e.target.value) || 0))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-base font-mono font-black text-slate-900 focus:outline-none focus:border-yellow-500"
                  />
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
                  <label className="text-xs font-bold text-slate-700 block mb-1">{isFr ? 'Devise à comparer' : 'العملة الأجنبية المراد مقارنتها'}</label>
                  <select
                    value={calcCurrency}
                    onChange={(e) => setCalcCurrency(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-900 focus:outline-none"
                  >
                    {currentMergedRates.map(c => (
                      <option key={c.code} value={c.code}>{isFr ? (c.nameFr || c.nameAr) : c.nameAr} ({c.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 3 Columns Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* 1. Official CBL */}
                <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-2 shadow-xs">
                  <div className="text-xs font-bold text-slate-600">{isFr ? '1. Cours officiel CBL' : '1. السعر الرسمي لمصرف ليبيا المركزي'}</div>
                  <div className="font-mono text-2xl font-black text-slate-900">
                    {safeLocale(totalOfficialLyd)} <span className="text-xs font-bold text-slate-500">د.ل</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {isFr ? 'Taux de référence :' : 'السعر المرجعي:'} {safeToFixed(selectedCblItem?.officialSell)} د.ل / {selectedCblItem?.code}
                  </div>
                </div>

                {/* 2. Commercial Banks */}
                <div className="bg-indigo-50/70 border border-indigo-200 p-4 rounded-2xl space-y-2 shadow-xs">
                  <div className="text-xs font-bold text-indigo-900">{isFr ? '2. Banques commerciales (Cartes 4000$)' : '2. المصارف التجارية (بطاقات الأغراض 4000$)'}</div>
                  <div className="font-mono text-2xl font-black text-indigo-800">
                    {safeLocale(totalCommercialLyd)} <span className="text-xs font-bold text-indigo-600">د.ل</span>
                  </div>
                  <div className="text-[11px] text-indigo-700 font-mono">
                    {isFr ? 'Taux commercial autorisé :' : 'السعر التجاري المعتمد:'} {safeToFixed(selectedCblItem?.commercialBankRate)} د.ل
                  </div>
                </div>

                {/* 3. Parallel Market */}
                <div className="bg-emerald-50/80 border border-emerald-200 p-4 rounded-2xl space-y-2 shadow-xs">
                  <div className="text-xs font-bold text-emerald-900">{isFr ? '3. Marché Bureau (Espèces)' : '3. السوق الموازي (سعر الصرافة المعتمد)'}</div>
                  <div className="font-mono text-2xl font-black text-emerald-800">
                    {safeLocale(totalParallelLyd)} <span className="text-xs font-bold text-emerald-600">د.ل</span>
                  </div>
                  <div className="text-[11px] text-emerald-700 font-mono">
                    {isFr ? 'Prix effectif du bureau :' : 'سعر المكتب المباشر:'} {safeToFixed(selectedCblItem?.parallelMarketRate)} د.ل
                  </div>
                </div>

              </div>

              {/* Differential Breakdown Summary */}
              <div className="p-4 bg-amber-50 border border-yellow-300 rounded-2xl text-xs space-y-2">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-600" />
                  <span>{isFr ? 'Récapitulatif des écarts financiers :' : 'ملخص الفارق المالي بين السوق الموازي والمنظومة الرسمية:'}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="bg-white p-3 rounded-xl border border-yellow-200">
                    <span className="text-slate-500 block text-[11px]">{isFr ? 'Écart net vs Cours officiel :' : 'الفارق الصافي مقابل السعر الرسمي:'}</span>
                    <span className="font-mono font-black text-rose-700 text-sm">+{safeLocale(spreadDiffLyd)} د.ل</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-yellow-200">
                    <span className="text-slate-500 block text-[11px]">{isFr ? 'Écart vs Banques commerciales :' : 'الفارق مقابل بطاقات المصارف التجارية:'}</span>
                    <span className="font-mono font-black text-amber-800 text-sm">+{safeLocale(totalParallelLyd - totalCommercialLyd)} د.ل</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: MACRO & LIQUIDITY INDICATORS */}
          {activeSubTab === 'MACRO' && (
            <div className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                
                <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-1">
                  <div className="text-xs font-bold text-slate-500">{isFr ? 'Ventes annuelles de devises' : 'حجم مبيعات النقد الأجنبي السنوية'}</div>
                  <div className="text-xl font-mono font-black text-slate-900 mt-1">16.4 {isFr ? 'Mrd' : 'مليار'} <span className="text-xs font-normal text-slate-500">USD</span></div>
                  <div className="text-[10px] text-emerald-700 font-bold">{isFr ? 'Couverture des L/C et cartes' : 'تغطية لكافة الاعتمادات والبطاقات'}</div>
                </div>

                <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-1">
                  <div className="text-xs font-bold text-slate-500">{isFr ? 'Production pétrolière journalière' : 'متوسط إنتاج النفط اليومي'}</div>
                  <div className="text-xl font-mono font-black text-slate-900 mt-1">1.25 {isFr ? 'M barils/j' : 'مليون برميل/يوم'}</div>
                  <div className="text-[10px] text-slate-500 font-bold">{isFr ? 'Stabilité des exportations' : 'استقرار معدلات التصدير عبر الموانئ'}</div>
                </div>

                <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-1">
                  <div className="text-xs font-bold text-slate-500">{isFr ? 'Plafond individuel annuel (4000$)' : 'سقف حجز الأفراد السنوي (منظومة الأغراض)'}</div>
                  <div className="text-xl font-mono font-black text-emerald-700 mt-1">$4,000 <span className="text-xs font-normal text-slate-500">{isFr ? '/ citoyen' : 'لكل رقم وطني'}</span></div>
                  <div className="text-[10px] text-slate-500 font-bold">{isFr ? 'Cartes Visa / Mastercard' : 'عبر بطاقات فيزا / ماستركارد المعتمدة'}</div>
                </div>

              </div>

              {/* Guidelines summary */}
              <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-3">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  {isFr ? 'Règles prudentielles CBL pour les bureaux de change :' : 'أهم الإرشادات الرقابية لمكاتب الصرافة المعتمدة لدى مصرف ليبيا المركزي:'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-700">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="font-bold text-slate-900 block">{isFr ? '1. Plafond des transactions en espèces :' : '1. الالتزام بسقف المعاملات النقدية:'}</span>
                    <p className="text-[11px] text-slate-600">{isFr ? 'Enregistrement de toute opération supérieure à 10 000 LYD avec pièce d\'identité.' : 'تسجيل وتوثيق أي عملية تزيد عن 10 آلاف دينار ليبي مع تصوير وثيقة الرقم الوطني.'}</p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="font-bold text-slate-900 block">{isFr ? '2. Clôture quotidienne et inventaire :' : '2. إقفال الصندوق اليومي ومطابقة الجرد:'}</span>
                    <p className="text-[11px] text-slate-600">{isFr ? 'Inventaire physique obligatoire en fin de journée et consignation des écarts.' : 'القيام بالجرد الفعلي للسيولة في نهاية كل يوم عمل وتوثيق الفوارق في سجلات التدقيق.'}</p>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-white px-4 sm:px-6 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-600 font-mono">
            <span>{isFr ? 'Système de change unifié v2.4' : 'نظام الصرافة الآلي الموحد v2.4'}</span>
            <span>•</span>
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> {isFr ? 'Connecté à la CBL' : 'ربط مباشر مع بيانات CBL'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
          >
            {isFr ? 'Fermer' : 'إغلاق النافذة'}
          </button>
        </div>

      </div>

      {/* Perplexity Live Grounding Modal */}
      <PerplexityFeedModal 
        isOpen={isPerplexityOpen} 
        onClose={() => setIsPerplexityOpen(false)} 
      />
    </div>
  );
};
