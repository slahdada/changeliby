import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Wallet, ArrowDownLeft, ArrowUpRight, PlusCircle, 
  MinusCircle, History, AlertCircle, CheckCircle2 
} from 'lucide-react';

export const DailyCashDrawer: React.FC = () => {
  const { drawerBalances, currencies, cashAdjustments, addCashAdjustment, t, currentUser } = useApp();

  const [showAdjModal, setShowAdjModal] = useState(false);
  const [adjType, setAdjType] = useState<'IN' | 'OUT'>('IN');
  const [adjCurrency, setAdjCurrency] = useState('LYD');
  const [adjAmount, setAdjAmount] = useState('');
  const [adjReason, setAdjReason] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleAdjustmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(adjAmount) || 0;
    if (amount <= 0 || !adjReason) return;

    addCashAdjustment(adjType, adjCurrency, amount, adjReason);
    setSuccessMsg(`تمت إضافة حركة السيولة (${adjType === 'IN' ? 'إيداع' : 'سحب'}) بنجاح!`);
    setShowAdjModal(false);
    setAdjAmount('');
    setAdjReason('');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white border-b-4 border-yellow-500 p-4 sm:p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-md">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Wallet className="w-6 h-6 text-yellow-400" />
            <span>{t.drawerTitle}</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            متابعة السيولة النقدية المتوفرة في الصندوق لكل عملة والقيام بحركات الإيداع والسحب.
          </p>
        </div>

        <button
          onClick={() => setShowAdjModal(true)}
          className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>تعديل سيولة (إيداع / سحب)</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 font-bold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Cash Balances Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {drawerBalances.map((item) => {
          const currObj = currencies.find(c => c.code === item.currencyCode) || {
            code: item.currencyCode,
            nameAr: item.currencyCode,
            symbol: item.currencyCode,
            flag: '💵'
          };

          const isLyd = item.currencyCode === 'LYD';

          return (
            <div
              key={item.currencyCode}
              className={`p-5 rounded-2xl border transition shadow-sm ${
                isLyd
                  ? 'bg-yellow-500 border-yellow-600 text-slate-900'
                  : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{currObj.flag}</span>
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                  isLyd ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-800 border border-slate-200'
                }`}>
                  {currObj.code}
                </span>
              </div>

              <div className="mt-3">
                <div className={`text-[11px] font-bold ${isLyd ? 'text-slate-900/80' : 'text-slate-500'}`}>{currObj.nameAr}</div>
                <div className={`text-2xl font-mono font-black mt-1 ${isLyd ? 'text-slate-900' : 'text-slate-900'}`}>
                  {item.amount.toLocaleString()} <span className={`text-xs font-bold ${isLyd ? 'text-slate-800' : 'text-slate-500'}`}>{currObj.symbol}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Adjustment Log History */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
          <History className="w-4 h-4 text-yellow-600" />
          <span>سجل تعديلات السيولة اليدوية (Cash In / Cash Out)</span>
        </h3>

        {cashAdjustments.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center font-medium">لا توجد حركات سحب أو إيداع يدوي اليوم.</p>
        ) : (
          <div className="space-y-2">
            {cashAdjustments.map(adj => (
              <div key={adj.id} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${adj.type === 'IN' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                    {adj.type === 'IN' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">
                      {adj.type === 'IN' ? 'إيداع سيولة' : 'سحب سيولة'} - {adj.amount.toLocaleString()} {adj.currencyCode}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      السبب: {adj.reason} | بواسطة: {adj.performedBy}
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 font-mono font-bold">
                  {new Date(adj.timestamp).toLocaleTimeString('ar-LY')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Manual Cash Adjustment Modal */}
      {showAdjModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">تعديل سيولة الصندوق</h3>
            <form onSubmit={handleAdjustmentSubmit} className="space-y-3">
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjType('IN')}
                  className={`py-2 rounded-xl text-xs font-bold transition-colors ${
                    adjType === 'IN' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  إيداع سيولة (Cash In)
                </button>
                <button
                  type="button"
                  onClick={() => setAdjType('OUT')}
                  className={`py-2 rounded-xl text-xs font-bold transition-colors ${
                    adjType === 'OUT' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  سحب سيولة (Cash Out)
                </button>
              </div>

              <div>
                <label className="text-xs text-slate-700 font-bold block mb-1">العملة</label>
                <select
                  value={adjCurrency}
                  onChange={(e) => setAdjCurrency(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none"
                >
                  {currencies.map(c => (
                    <option key={c.code} value={c.code}>{c.nameAr} ({c.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-700 font-bold block mb-1">المبلغ *</label>
                <input
                  type="number"
                  required
                  step="any"
                  value={adjAmount}
                  onChange={(e) => setAdjAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-700 font-bold block mb-1">السبب / البيان *</label>
                <input
                  type="text"
                  required
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                  placeholder="مثال: تغذية الصندوق من الخزينة الرئيسية..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAdjModal(false)}
                  className="w-1/3 py-2.5 bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 rounded-xl text-xs font-bold transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  تأكيد الحفظ
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
