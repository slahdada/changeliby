import React, { useState, useEffect, useRef } from 'react';
import { 
  Calculator, X, RotateCcw, ArrowRightLeft, 
  CheckCircle2, AlertCircle, ArrowDown, ArrowUp,
  Coins, Info, ArrowLeftRight
} from 'lucide-react';
import { Currency } from '../../types';

export interface CurrencyCalculatorProps {
  currency: Currency | null;
  buyRate: number;
  sellRate: number;
  isOpen: boolean;
  onClose: () => void;
  initialOperation?: 'BUY' | 'SELL';
}

export const CurrencyCalculator: React.FC<CurrencyCalculatorProps> = ({
  currency,
  buyRate,
  sellRate,
  isOpen,
  onClose,
  initialOperation = 'BUY'
}) => {
  // Operation: BUY = Office buys foreign from customer (uses buyRate)
  //            SELL = Office sells foreign to customer (uses sellRate)
  const [operation, setOperation] = useState<'BUY' | 'SELL'>(initialOperation);
  
  // Direction: FOREIGN_TO_LYD = foreign currency -> LYD
  //            LYD_TO_FOREIGN = LYD -> foreign currency
  const [direction, setDirection] = useState<'FOREIGN_TO_LYD' | 'LYD_TO_FOREIGN'>('FOREIGN_TO_LYD');
  
  // Input amount string
  const [amountStr, setAmountStr] = useState<string>('100');
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync operation if initialOperation changes
  useEffect(() => {
    if (isOpen) {
      setOperation(initialOperation);
      // Auto-focus input when opened
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isOpen, initialOperation]);

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !currency) return null;

  // Active exchange rate based on operation
  const activeRate = operation === 'BUY' ? buyRate : sellRate;
  const activeRateLabel = operation === 'BUY' ? 'سعر الشراء بالمكتب' : 'سعر البيع بالمكتب';

  // Sanitize input: convert comma to dot, remove non-numeric chars
  const handleAmountChange = (val: string) => {
    // Replace Arabic/French comma with dot
    let sanitized = val.replace(/,/g, '.');
    // Allow empty string or numbers with optional single dot
    // Disallow negative sign or non-digit chars
    if (sanitized === '' || /^\d*\.?\d*$/.test(sanitized)) {
      setAmountStr(sanitized);
    }
  };

  // Quick preset amount handler
  const handleQuickAmount = (val: number) => {
    setAmountStr(val.toString());
    inputRef.current?.focus();
  };

  // Reverse conversion direction
  const handleToggleDirection = () => {
    setDirection(prev => prev === 'FOREIGN_TO_LYD' ? 'LYD_TO_FOREIGN' : 'FOREIGN_TO_LYD');
  };

  // Clear input
  const handleClear = () => {
    setAmountStr('');
    inputRef.current?.focus();
  };

  // Parse numerical amount
  const parsedAmount = parseFloat(amountStr);
  const isValidNumber = !isNaN(parsedAmount) && isFinite(parsedAmount);
  const isPositive = isValidNumber && parsedAmount > 0;
  const isRateAvailable = activeRate > 0;

  // Determine validation error message
  let validationError: string | null = null;
  if (amountStr.trim() !== '') {
    if (!isValidNumber) {
      validationError = 'يرجى إدخال مبلغ صحيح';
    } else if (!isPositive) {
      validationError = 'يجب أن يكون المبلغ أكبر من صفر';
    } else if (!isRateAvailable) {
      validationError = 'سعر الصرف غير متوفر لهذه العملة';
    }
  }

  // Calculate result
  let resultAmount = 0;
  if (isPositive && isRateAvailable) {
    if (direction === 'FOREIGN_TO_LYD') {
      // Foreign -> LYD: Foreign * Rate
      resultAmount = parsedAmount * activeRate;
    } else {
      // LYD -> Foreign: LYD / Rate
      resultAmount = parsedAmount / activeRate;
    }
  }

  // Formatting helpers
  const formatNum = (num: number, decimals = 3) => {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  const isForeignToLyd = direction === 'FOREIGN_TO_LYD';
  const inputCurrencyCode = isForeignToLyd ? currency.code : 'LYD';
  const inputCurrencyName = isForeignToLyd ? currency.nameAr : 'دينار ليبي';
  const resultCurrencyCode = isForeignToLyd ? 'LYD' : currency.code;
  const resultCurrencyName = isForeignToLyd ? 'دينار ليبي' : currency.nameAr;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b-2 border-yellow-500">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-2xl shadow-inner">
              {currency.flag}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white flex items-center gap-1.5">
                  <Calculator className="w-5 h-5 text-yellow-400" />
                  <span>حاسبة الصرف السريع</span>
                </h3>
                <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-yellow-400 text-slate-950 font-black">
                  {currency.code}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                {currency.nameAr} • {currency.nameFr}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            title="إغلاق (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          
          {/* Operation Selector: BUY vs SELL */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              نوع العملية مع العميل:
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
              
              {/* Buy Option */}
              <button
                type="button"
                onClick={() => setOperation('BUY')}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all ${
                  operation === 'BUY'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <ArrowDown className={`w-3.5 h-3.5 ${operation === 'BUY' ? 'text-white' : 'text-emerald-600'}`} />
                  <span className="font-black">شراء من العميل</span>
                </div>
                <div className={`text-[11px] font-mono ${operation === 'BUY' ? 'text-emerald-100' : 'text-slate-500'}`}>
                  سعر الشراء: <strong className={operation === 'BUY' ? 'text-white' : 'text-emerald-700'}>{buyRate.toFixed(3)}</strong> د.ل
                </div>
              </button>

              {/* Sell Option */}
              <button
                type="button"
                onClick={() => setOperation('SELL')}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all ${
                  operation === 'SELL'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <ArrowUp className={`w-3.5 h-3.5 ${operation === 'SELL' ? 'text-white' : 'text-rose-600'}`} />
                  <span className="font-black">بيع للعميل</span>
                </div>
                <div className={`text-[11px] font-mono ${operation === 'SELL' ? 'text-rose-100' : 'text-slate-500'}`}>
                  سعر البيع: <strong className={operation === 'SELL' ? 'text-white' : 'text-rose-700'}>{sellRate.toFixed(3)}</strong> د.ل
                </div>
              </button>

            </div>
          </div>

          {/* Current Applied Rate Indicator */}
          <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-600 font-bold flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-amber-500" />
              <span>السعر المعتمد في الحساب:</span>
            </span>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                operation === 'BUY' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {activeRateLabel}
              </span>
              <span className="font-mono font-black text-slate-900 text-sm">
                1 {currency.code} = {activeRate > 0 ? activeRate.toFixed(3) : 'غير محدد'} د.ل
              </span>
            </div>
          </div>

          {/* Direction Toggle & Input Section */}
          <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/90 space-y-3">
            
            {/* Top row: Label + Reverse Button */}
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span>اتجاه التحويل:</span>
                <span className="text-slate-900 font-black">
                  {isForeignToLyd 
                    ? `${currency.nameAr} (${currency.code}) ← دينار ليبي (LYD)` 
                    : `دينار ليبي (LYD) ← ${currency.nameAr} (${currency.code})`}
                </span>
              </label>

              <button
                type="button"
                onClick={handleToggleDirection}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
                title="تبديل اتجاه التحويل"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-yellow-600" />
                <span>عكس التحويل</span>
              </button>
            </div>

            {/* Input Field */}
            <div className="space-y-1">
              <div className="text-[11px] font-bold text-slate-500">
                المبلغ المراد تحويله ({inputCurrencyName} - {inputCurrencyCode}):
              </div>
              <div className="relative flex items-center">
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="decimal"
                  value={amountStr}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-white border-2 border-slate-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-400/20 rounded-xl px-4 py-2.5 font-mono text-xl font-black text-slate-900 placeholder-slate-300 focus:outline-none transition-all pl-20"
                />
                <div className="absolute left-2.5 flex items-center gap-1 text-xs font-mono font-black text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 pointer-events-none">
                  <span>{inputCurrencyCode}</span>
                </div>
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-slate-400 font-bold ml-1">مبالغ شائعة:</span>
              {(isForeignToLyd ? [50, 100, 200, 500, 1000] : [200, 500, 700, 1000, 5000]).map(preset => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleQuickAmount(preset)}
                  className="px-2 py-0.5 bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-md text-[11px] font-mono font-bold transition-colors"
                >
                  {preset}
                </button>
              ))}
            </div>

            {/* Validation Message */}
            {validationError && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-bold flex items-center gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

          </div>

          {/* Detailed Structured Result Box (Requirement 9) */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-4 sm:p-5 border border-slate-700 shadow-lg space-y-3">
            
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-2.5">
              <span className="text-xs text-yellow-400 font-black flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>تفاصيل النتيجة المعتمدة:</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {isForeignToLyd ? 'ضرب في السعر' : 'قسمة على السعر'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              
              {/* 1. المبلغ المدخل */}
              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 block font-medium">المبلغ المدخل:</span>
                <span className="font-mono font-black text-white text-sm">
                  {isPositive ? formatNum(parsedAmount, isForeignToLyd ? 2 : 3) : '0.00'}
                </span>
                <span className="text-[10px] text-yellow-400 font-bold block">{inputCurrencyCode}</span>
              </div>

              {/* 2. سعر الصرف المستخدم */}
              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 block font-medium">سعر الصرف المستخدم:</span>
                <span className="font-mono font-black text-amber-300 text-sm">
                  {activeRate.toFixed(3)}
                </span>
                <span className="text-[10px] text-slate-400 block font-medium">{activeRateLabel}</span>
              </div>

              {/* 3. اسم العملة ورمزها */}
              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 block font-medium">العملة والرمز:</span>
                <span className="font-bold text-white text-xs block truncate">
                  {currency.nameAr}
                </span>
                <span className="text-[10px] font-mono text-cyan-300 font-bold">{currency.code}</span>
              </div>

              {/* 4. المبلغ الناتج المصغر */}
              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 block font-medium">العملة المقابلة:</span>
                <span className="font-bold text-white text-xs block">
                  {resultCurrencyName}
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">{resultCurrencyCode}</span>
              </div>

            </div>

            {/* Main Highlighted Result */}
            <div className="bg-slate-950/90 rounded-xl p-3.5 border border-yellow-500/30 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-300 block font-medium">
                  المبلغ النهائي الناتج ({resultCurrencyName}):
                </span>
                <div className="text-2xl sm:text-3xl font-mono font-black text-emerald-400">
                  {isPositive && isRateAvailable ? formatNum(resultAmount, isForeignToLyd ? 3 : 2) : '0.00'}
                  <span className="text-xs font-sans text-slate-300 font-bold mr-2">
                    {resultCurrencyCode}
                  </span>
                </div>
              </div>

              {/* Equation preview */}
              <div className="text-left font-mono text-xs text-slate-400 hidden sm:block">
                {isPositive && isRateAvailable && (
                  <div>
                    {isForeignToLyd ? (
                      <span>{formatNum(parsedAmount, 2)} × {activeRate.toFixed(3)}</span>
                    ) : (
                      <span>{formatNum(parsedAmount, 3)} ÷ {activeRate.toFixed(3)}</span>
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* Modal Footer Controls (Requirement 5: مسح & إغلاق) */}
        <div className="bg-slate-100 p-3.5 sm:p-4 border-t border-slate-200 flex items-center justify-between gap-3">
          
          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-2.5 bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
            title="مسح الحقول"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>مسح</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleDirection}
              className="px-3.5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>عكس التحويل</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              إغلاق
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
