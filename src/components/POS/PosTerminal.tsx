import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ArrowDownLeft, ArrowUpRight, Calculator, UserCheck, 
  Search, Plus, Printer, AlertTriangle, CheckCircle2, 
  Coins, CreditCard, Banknote, ShieldAlert, Sparkles, Landmark 
} from 'lucide-react';
import { TransactionType, Customer } from '../../types';
import { ThermalReceiptModal } from './ThermalReceiptModal';
import { RateFreshnessIndicator } from '../Rates/RateFreshnessIndicator';
import { GoogleIcon } from '../GoogleSearchGrounding/GoogleIcon';

export const PosTerminal: React.FC = () => {
  const { 
    currencies, rates, customers, addCustomer, executeTransaction, 
    drawerBalances, t, activeReceiptTxn, setActiveReceiptTxn, setIsCblModalOpen,
    setIsGoogleGroundingOpen 
  } = useApp();

  const [type, setType] = useState<TransactionType>('BUY');
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState<string>('USD');
  const [foreignAmountInput, setForeignAmountInput] = useState<string>('1000');
  const [customRateInput, setCustomRateInput] = useState<string>('');
  const [commissionInput, setCommissionInput] = useState<string>('0');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'BANK_TRANSFER' | 'SADAD' | 'MOBI_CASH'>('CASH');
  const [notes, setNotes] = useState<string>('');

  // Customer KYC selection
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(customers[0] || null);
  const [customerSearch, setCustomerSearch] = useState<string>('');
  const [isQuickCustomer, setIsQuickCustomer] = useState<boolean>(false);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState<boolean>(false);

  // New Customer Form State
  const [newCustName, setNewCustName] = useState('');
  const [newCustNationalId, setNewCustNationalId] = useState('');
  const [newCustPassport, setNewCustPassport] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');

  // Notifications & Execution State
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Active Rate for selected currency
  const activeRateObj = useMemo(() => {
    return rates.find(r => r.currencyCode === selectedCurrencyCode) || rates[0];
  }, [rates, selectedCurrencyCode]);

  const activeCurrencyObj = useMemo(() => {
    return currencies.find(c => c.code === selectedCurrencyCode) || currencies[0];
  }, [currencies, selectedCurrencyCode]);

  // Rate in LYD
  const effectiveRate = useMemo(() => {
    if (customRateInput && !isNaN(parseFloat(customRateInput))) {
      return parseFloat(customRateInput);
    }
    return type === 'BUY' ? activeRateObj.buyRate : activeRateObj.sellRate;
  }, [customRateInput, type, activeRateObj]);

  // Amounts Calculation
  const foreignAmount = parseFloat(foreignAmountInput) || 0;
  const rawLydAmount = foreignAmount * effectiveRate;
  const commissionLyd = parseFloat(commissionInput) || 0;
  const netLydAmount = type === 'BUY' 
    ? Math.max(0, rawLydAmount - commissionLyd) // Bureau pays LYD minus commission
    : rawLydAmount + commissionLyd;            // Bureau receives LYD plus commission

  // Available Cash in Drawer
  const currentLydDrawer = drawerBalances.find(b => b.currencyCode === 'LYD')?.amount || 0;
  const currentForeignDrawer = drawerBalances.find(b => b.currencyCode === selectedCurrencyCode)?.amount || 0;

  // Filtered Customers
  const filteredCustomers = useMemo(() => {
    if (!customerSearch.trim()) return customers;
    const q = customerSearch.toLowerCase();
    return customers.filter(c => 
      c.fullName.toLowerCase().includes(q) ||
      c.nationalId.includes(q) ||
      (c.passportNumber && c.passportNumber.toLowerCase().includes(q))
    );
  }, [customers, customerSearch]);

  const handleExecute = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (foreignAmount <= 0) {
      setErrorMsg('الرجاء إدخال مبلغ أجنبي صحيح أكبر من الصفر');
      return;
    }

    // KYC Check threshold (> $2000 require customer registration)
    if (foreignAmount >= 2000 && isQuickCustomer) {
      setErrorMsg('تنبيه KYC: المعاملات بقيمة $2,000 أو أكثر تتطلب اختيار وتدقيق بيانات العميل برقم هويته أو جوازه.');
      return;
    }

    const custName = isQuickCustomer ? 'زبون عابر' : (selectedCustomer?.fullName || 'زبون عابر');
    const custNatId = isQuickCustomer ? undefined : selectedCustomer?.nationalId;

    const res = executeTransaction({
      type,
      currencyCode: selectedCurrencyCode,
      foreignAmount,
      exchangeRate: effectiveRate,
      lydAmount: rawLydAmount,
      commissionLyd,
      netLydAmount,
      customerId: isQuickCustomer ? undefined : selectedCustomer?.id,
      customerName: custName,
      customerNationalId: custNatId,
      paymentMethod,
      notes
    });

    if (!res.success) {
      setErrorMsg(res.message || 'فشلت العملية');
    } else {
      setSuccessMsg(`${t.transactionSuccess} (رقم الوصل: ${res.transaction?.receiptNumber})`);
      setForeignAmountInput('1000');
      setNotes('');
    }
  };

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustNationalId) {
      alert('يرجى كتابة اسم العميل والرقم الوطني على الأقل');
      return;
    }

    const created = addCustomer({
      fullName: newCustName,
      nationalId: newCustNationalId,
      passportNumber: newCustPassport || undefined,
      phone: newCustPhone || '+218 91 000 0000',
      nationality: 'ليبي',
      documentType: 'NATIONAL_ID',
      documentNumber: newCustNationalId,
      kycStatus: 'VERIFIED',
      riskLevel: 'LOW'
    });

    setSelectedCustomer(created);
    setIsQuickCustomer(false);
    setShowAddCustomerModal(false);
    setNewCustName('');
    setNewCustNationalId('');
    setNewCustPassport('');
    setNewCustPhone('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white border-b-4 border-yellow-500 p-4 sm:p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-md">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Calculator className="w-6 h-6 text-yellow-400" />
            <span>{t.posTitle}</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            شراء وبيع جميع العملات الأجنبية مقابل الدينار الليبي (LYD) بسرعة وكفاءة.
          </p>
        </div>

        {/* Drawer Live Ticker & CBL Button */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Rate Accuracy & Freshness Indicator */}
          <RateFreshnessIndicator 
            updatedAt={activeRateObj?.updatedAt} 
            currencyCode={selectedCurrencyCode}
            variant="badge"
          />

          <button
            onClick={() => setIsCblModalOpen(true)}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Landmark className="w-4 h-4" />
            <span className="hidden sm:inline">نشرة البنك المركزي الرسمية</span>
            <span className="sm:hidden">نشرة CBL</span>
          </button>

          <div className="flex items-center gap-3 bg-slate-800 px-4 py-2 rounded-xl border border-slate-700 text-xs">
            <div>
              <div className="text-[10px] text-slate-400">رصيد الصندوق بالدينار</div>
              <div className="font-mono font-bold text-yellow-400 text-sm">{currentLydDrawer.toLocaleString()} د.ل</div>
            </div>
            <div className="h-6 w-px bg-slate-700"></div>
            <div>
              <div className="text-[10px] text-slate-400">رصيد {selectedCurrencyCode}</div>
              <div className="font-mono font-bold text-teal-300 text-sm">{currentForeignDrawer.toLocaleString()} {activeCurrencyObj.symbol}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Operations Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleExecute} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-5 shadow-sm">
            
            {/* BUY / SELL Switcher Tabs */}
            <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => { setType('BUY'); setCustomRateInput(''); }}
                className={`py-3 px-4 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-colors ${
                  type === 'BUY'
                    ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-500 shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <ArrowDownLeft className="w-5 h-5" />
                <span>{t.buyCurrency}</span>
              </button>

              <button
                type="button"
                onClick={() => { setType('SELL'); setCustomRateInput(''); }}
                className={`py-3 px-4 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-colors ${
                  type === 'SELL'
                    ? 'bg-rose-100 text-rose-800 border-2 border-rose-500 shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <ArrowUpRight className="w-5 h-5" />
                <span>{t.sellCurrency}</span>
              </button>
            </div>

            <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${type === 'BUY' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
              <span className="font-medium">{type === 'BUY' ? t.buyFromCustomerDesc : t.sellToCustomerDesc}</span>
            </p>

            {/* Currency Selector Grid */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                {t.selectCurrency}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {currencies.filter(c => !c.isBaseCurrency).map(curr => {
                  const isSelected = selectedCurrencyCode === curr.code;
                  const rateObj = rates.find(r => r.currencyCode === curr.code);
                  const displayRate = type === 'BUY' ? rateObj?.buyRate : rateObj?.sellRate;

                  return (
                    <button
                      key={curr.code}
                      type="button"
                      onClick={() => {
                        setSelectedCurrencyCode(curr.code);
                        setCustomRateInput('');
                      }}
                      className={`p-3 rounded-xl border text-right transition-colors flex flex-col justify-between ${
                        isSelected
                          ? 'bg-amber-50 border-2 border-yellow-500 text-slate-900 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-2xl">{curr.flag}</span>
                        <span className="font-bold text-xs font-mono">{curr.code}</span>
                      </div>
                      <div className="mt-2">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] text-slate-500 truncate font-semibold">{curr.nameAr}</span>
                          <RateFreshnessIndicator 
                            updatedAt={rateObj?.updatedAt} 
                            currencyCode={curr.code}
                            variant="inline" 
                            showDetailsOnClick={false} 
                          />
                        </div>
                        <div className="text-xs font-mono font-bold text-slate-800 mt-0.5">
                          {displayRate ? `${displayRate} د.ل` : '-'}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Amounts & Rates Calculations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              
              {/* Foreign Amount Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>{t.foreignAmount} ({activeCurrencyObj.symbol})</span>
                  <span className="text-[10px] text-slate-500 font-mono">العملة الأجنبية</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={foreignAmountInput}
                    onChange={(e) => setForeignAmountInput(e.target.value)}
                    placeholder="1000"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-3 text-lg font-mono font-bold text-slate-900 focus:outline-none focus:border-yellow-500 focus:bg-white"
                  />
                  <span className="absolute left-3 top-3.5 text-xs text-slate-500 font-mono font-bold">
                    {activeCurrencyObj.code}
                  </span>
                </div>
              </div>

              {/* Rate Input with Freshness & Accuracy Status Indicator */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <span>{t.exchangeRate}</span>
                  </label>
                  
                  {/* Status Indicator showing data accuracy and freshness */}
                  <div className="flex items-center gap-1.5">
                    <RateFreshnessIndicator 
                      updatedAt={activeRateObj?.updatedAt} 
                      currencyCode={selectedCurrencyCode}
                      variant="compact"
                    />
                    <button
                      type="button"
                      onClick={() => setIsGoogleGroundingOpen(true)}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 flex items-center gap-1 shadow-2xs transition-colors"
                      title="تحقق وتقصي فوري بـ Google Search Grounding"
                    >
                      <GoogleIcon className="w-3 h-3" />
                      <span className="hidden sm:inline">تحقق بـ Google</span>
                    </button>
                  </div>
                </div>
                
                <div className="relative">
                  <input
                    type="number"
                    step="0.001"
                    value={effectiveRate}
                    onChange={(e) => setCustomRateInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-3 text-lg font-mono font-bold text-slate-900 focus:outline-none focus:border-yellow-500 focus:bg-white"
                  />
                  <span className="absolute left-3 top-3.5 text-xs text-slate-500 font-mono">
                    د.ل / {activeCurrencyObj.symbol}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                  <span>سوق المشير الموازي: <strong className="text-slate-800 font-mono">{type === 'BUY' ? activeRateObj.buyRate : activeRateObj.sellRate} د.ل</strong></span>
                  {activeRateObj?.officialRate && (
                    <span>رسمي CBL: <strong className="text-slate-700 font-mono">{activeRateObj.officialRate} د.ل</strong></span>
                  )}
                </div>
              </div>

            </div>

            {/* Total Summary Card */}
            <div className="bg-yellow-50/80 border border-yellow-200 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-600 font-bold">
                <span className="flex items-center gap-2">
                  <span>سعر الصرف المطبق:</span>
                  <RateFreshnessIndicator 
                    updatedAt={activeRateObj?.updatedAt} 
                    currencyCode={selectedCurrencyCode}
                    variant="badge"
                  />
                </span>
                <span className="font-mono text-slate-900 text-lg font-black">{effectiveRate} د.ل</span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 font-bold">
                <span>الهامش / العمولة المخصومة:</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={commissionInput}
                    onChange={(e) => setCommissionInput(e.target.value)}
                    className="w-20 bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-center font-mono font-bold text-slate-900"
                  />
                  <span>د.ل</span>
                </div>
              </div>

              <div className="h-px bg-yellow-200 my-2"></div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-700 font-bold">{t.netLydTotal}</div>
                  <div className="text-[11px] text-slate-500">
                    {type === 'BUY' ? 'المبلغ المستحق للتسليم للزبون' : 'المبلغ المطلوب استلامه من الزبون'}
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-mono font-black text-blue-900">
                  {netLydAmount.toLocaleString('ar-LY', { minimumFractionDigits: 2 })} <span className="text-sm font-normal text-slate-600">LYD</span>
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                {t.paymentMethod}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'CASH', label: t.cashPayment, icon: Banknote },
                  { id: 'BANK_TRANSFER', label: t.bankTransfer, icon: CreditCard },
                  { id: 'SADAD', label: t.sadadPay, icon: Coins },
                  { id: 'MOBI_CASH', label: t.mobiCashPay, icon: Coins },
                ].map(pm => {
                  const Icon = pm.icon;
                  const isSelected = paymentMethod === pm.id;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id as any)}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{pm.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="ملاحظات إضافية للمعاملة (اختياري)..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-yellow-500"
              />
            </div>

            {/* Errors / Feedback */}
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2 font-bold">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center justify-between font-bold">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
                {activeReceiptTxn && (
                  <button
                    type="button"
                    onClick={() => {}}
                    className="px-2.5 py-1 bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>طباعة الفاتورة</span>
                  </button>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-base shadow-lg transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5 text-yellow-400" />
              <span>{t.executeTransaction}</span>
            </button>

          </form>
        </div>

        {/* Right 1 Col: Customer KYC Selector & Receipt Quick View */}
        <div className="space-y-6">
          
          {/* Customer KYC Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <UserCheck className="w-4 h-4 text-yellow-600" />
                <span>{t.customerInfo}</span>
              </div>
              <button
                onClick={() => setShowAddCustomerModal(true)}
                className="text-xs text-slate-800 hover:text-slate-900 font-bold flex items-center gap-1 bg-yellow-100 px-2.5 py-1 rounded-lg border border-yellow-300"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>عميل جديد</span>
              </button>
            </div>

            {/* Quick Customer Toggle */}
            <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-700 font-bold">{t.quickCustomer}</span>
              <button
                type="button"
                onClick={() => setIsQuickCustomer(!isQuickCustomer)}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  isQuickCustomer ? 'bg-slate-900' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    isQuickCustomer ? 'translate-x-0' : '-translate-x-5'
                  }`}
                />
              </button>
            </div>

            {!isQuickCustomer ? (
              <div className="space-y-3">
                {/* Search Customer Input */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3" />
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    placeholder={t.searchCustomer}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-yellow-500"
                  />
                </div>

                {/* Customer List Select */}
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {filteredCustomers.map((cust) => {
                    const isSelected = selectedCustomer?.id === cust.id;
                    return (
                      <button
                        key={cust.id}
                        type="button"
                        onClick={() => setSelectedCustomer(cust)}
                        className={`w-full text-right p-2.5 rounded-xl border text-xs transition-colors flex items-center justify-between ${
                          isSelected
                            ? 'bg-amber-50 border-2 border-yellow-500 text-slate-900 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-slate-900">{cust.fullName}</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            الرقم الوطني: {cust.nationalId}
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          cust.kycStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {cust.kycStatus === 'VERIFIED' ? 'متحقق' : 'قيد المراجعة'}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {selectedCustomer && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="text-slate-500 text-[10px] font-bold">العميل المحدد:</div>
                    <div className="font-bold text-slate-900">{selectedCustomer.fullName}</div>
                    <div className="text-slate-600 text-[11px] font-mono">الهاتف: {selectedCustomer.phone}</div>
                    <div className="text-slate-600 text-[11px] font-mono">الجواز: {selectedCustomer.passportNumber || '-'}</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 font-medium">
                تم اختيار <strong className="text-slate-900">زبون عابر</strong>. متاح للمعاملات أقل من $2,000 فقط.
              </div>
            )}

          </div>

          {/* Quick Rates Ticker */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3 shadow-sm">
            <h3 className="font-bold text-slate-900 text-xs flex items-center justify-between border-b pb-2">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                <span>أسعار الموازية اليوم في طرابلس</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">تحديث مباشر</span>
            </h3>

            <div className="space-y-2 text-xs">
              {rates.slice(0, 4).map((r) => (
                <div key={r.currencyCode} className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{r.currencyCode}</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-xs">
                    <span className="text-emerald-700 font-bold">شراء: {r.buyRate}</span>
                    <span className="text-rose-700 font-bold">بيع: {r.sellRate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Add Customer Modal */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">إضافة بيانات عميل جديد (KYC)</h3>
            <form onSubmit={handleCreateCustomer} className="space-y-3">
              <div>
                <label className="text-xs text-slate-700 font-bold block mb-1">الاسم الكامل *</label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="مثال: عبدالسلام فرج الورفلي"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-700 font-bold block mb-1">الرقم الوطني الليبي *</label>
                <input
                  type="text"
                  required
                  value={newCustNationalId}
                  onChange={(e) => setNewCustNationalId(e.target.value)}
                  placeholder="119980123456"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-700 font-bold block mb-1">رقم جواز السفر (اختياري)</label>
                <input
                  type="text"
                  value={newCustPassport}
                  onChange={(e) => setNewCustPassport(e.target.value)}
                  placeholder="P998822"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-700 font-bold block mb-1">رقم الهاتف</label>
                <input
                  type="text"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  placeholder="+218 91 123 4567"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="w-1/3 py-2.5 bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 rounded-xl text-xs font-bold transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  حفظ وتسجيل العميل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Thermal Receipt Preview Modal */}
      {activeReceiptTxn && (
        <ThermalReceiptModal
          transaction={activeReceiptTxn}
          onClose={() => setActiveReceiptTxn(null)}
        />
      )}

    </div>
  );
};
