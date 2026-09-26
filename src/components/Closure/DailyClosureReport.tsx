import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FileCheck, Lock, Unlock, Printer, TrendingUp, 
  AlertTriangle, CheckCircle2, ShieldCheck, Coins 
} from 'lucide-react';
import { CashDrawerBalance } from '../../types';

export const DailyClosureReport: React.FC = () => {
  const { dailyClosure, drawerBalances, closeDay, reopenDay, currentUser, t, lang } = useApp();

  const [countedBalances, setCountedBalances] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    drawerBalances.forEach(b => {
      initial[b.currencyCode] = b.amount;
    });
    return initial;
  });

  const [closureNotes, setClosureNotes] = useState('');
  const [closedSuccess, setClosedSuccess] = useState(false);

  const handleCountChange = (code: string, value: string) => {
    const val = parseFloat(value) || 0;
    setCountedBalances(prev => ({ ...prev, [code]: val }));
  };

  const handleExecuteCloseDay = () => {
    if (window.confirm('هل أنت متأكد من إغلاق الصندوق وإقفال حسابات اليوم نهائياً؟')) {
      const actualList: CashDrawerBalance[] = drawerBalances.map(b => ({
        currencyCode: b.currencyCode,
        amount: countedBalances[b.currencyCode] ?? b.amount
      }));

      closeDay(actualList, closureNotes);
      setClosedSuccess(true);
    }
  };

  const isClosed = dailyClosure.status === 'CLOSED';

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white border-b-4 border-yellow-500 p-4 sm:p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-md">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-yellow-400" />
            <span>{t.closureTitle}</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            جرد السيولة الفعلية وإقفال الصندوق اليومي وقيد الفوارق وتقرير الأرباح التقديرية.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4 text-yellow-400" />
            <span>{t.print} التقرير</span>
          </button>

          {isClosed && currentUser.role === 'ADMIN' && (
            <button
              onClick={reopenDay}
              className="px-3.5 py-2 bg-amber-500 text-slate-900 font-bold rounded-xl text-xs flex items-center gap-1.5 hover:bg-amber-400 transition-colors"
            >
              <Unlock className="w-4 h-4" />
              <span>{t.reopenDay}</span>
            </button>
          )}
        </div>
      </div>

      {isClosed && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <div className="font-bold text-sm">تم إغلاق الصندوق بنجاح لليوم!</div>
              <div className="text-[11px] text-emerald-700">
                أغلق بواسطة: {dailyClosure.closedBy} | التوقيت: {new Date(dailyClosure.closedAt).toLocaleString('ar-LY')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="text-xs font-bold text-slate-500">إجمالي عمليات الشراء (BUY)</div>
          <div className="text-2xl font-mono font-black text-emerald-700 mt-1">
            {dailyClosure.totalBuyLyd.toLocaleString()} <span className="text-xs font-bold text-slate-500">د.ل</span>
          </div>
          <div className="text-[10px] font-bold text-slate-400 mt-1">عدد المعاملات: {dailyClosure.totalBuyCount}</div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="text-xs font-bold text-slate-500">إجمالي عمليات البيع (SELL)</div>
          <div className="text-2xl font-mono font-black text-rose-700 mt-1">
            {dailyClosure.totalSellLyd.toLocaleString()} <span className="text-xs font-bold text-slate-500">د.ل</span>
          </div>
          <div className="text-[10px] font-bold text-slate-400 mt-1">عدد المعاملات: {dailyClosure.totalSellCount}</div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="text-xs font-bold text-slate-500">الأرباح التقديرية اليومية</div>
          <div className="text-2xl font-mono font-black text-slate-900 mt-1">
            {dailyClosure.estimatedProfitLyd.toLocaleString()} <span className="text-xs font-bold text-slate-500">د.ل</span>
          </div>
          <div className="text-[10px] font-bold text-slate-400 mt-1">هامش فروقات الصرف المجمعة</div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="text-xs font-bold text-slate-500">حالة الصندوق</div>
          <div className="text-lg font-bold text-slate-900 mt-1 flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${isClosed ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`}></span>
            <span>{isClosed ? 'مقفل (CLOSED)' : 'مفتوح (OPEN)'}</span>
          </div>
          <div className="text-[10px] font-bold text-slate-400 mt-1">الصراف المسؤول: {dailyClosure.tellerName}</div>
        </div>

      </div>

      {/* Cash Tally (Expected vs Actual Counted) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm w-full">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
          <Coins className="w-4 h-4 text-yellow-600" />
          <span>مطابقة السيولة النقدية الفعلية (Physical Cash Tally)</span>
        </h3>

        {/* Mobile View: Cards */}
        <div className="md:hidden space-y-2.5">
          {drawerBalances.map((b) => {
            const countedVal = countedBalances[b.currencyCode] ?? b.amount;
            const variance = countedVal - b.amount;

            return (
              <div key={b.currencyCode} className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-900 font-mono text-sm px-2 py-0.5 bg-white border border-slate-200 rounded-lg">
                    {b.currencyCode}
                  </span>
                  <div className="text-left font-mono">
                    <span className="text-[10px] text-slate-400 block">المتوقع دفترياً:</span>
                    <strong className="text-emerald-700 font-bold">{b.amount.toLocaleString()}</strong>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60">
                  <label className="text-[11px] font-bold text-slate-600">المبلغ المجزوم فعلياً:</label>
                  <input
                    type="number"
                    disabled={isClosed}
                    value={countedVal}
                    onChange={(e) => handleCountChange(b.currencyCode, e.target.value)}
                    className="w-28 bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-mono font-black text-slate-900 focus:outline-none focus:border-yellow-500 disabled:opacity-60 text-center"
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-500">الفارق:</span>
                  {variance === 0 ? (
                    <span className="text-slate-400 font-mono">متوازن (0.00)</span>
                  ) : variance > 0 ? (
                    <span className="text-emerald-700 font-mono">+{variance.toLocaleString()} (زيادة)</span>
                  ) : (
                    <span className="text-rose-700 font-mono">{variance.toLocaleString()} (عجز)</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-right text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-mono border-b border-slate-200 text-[11px] font-bold uppercase">
              <tr>
                <th className="p-3">العملة</th>
                <th className="p-3">الرصيد الدفتري المتوقع</th>
                <th className="p-3">المبلغ المقتطع / المجزوم فعلياً</th>
                <th className="p-3">الفارق / العجز / الزيادة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {drawerBalances.map((b) => {
                const countedVal = countedBalances[b.currencyCode] ?? b.amount;
                const variance = countedVal - b.amount;

                return (
                  <tr key={b.currencyCode} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-slate-900 font-mono">
                      {b.currencyCode}
                    </td>

                    <td className="p-3 font-mono font-bold text-emerald-700">
                      {b.amount.toLocaleString()}
                    </td>

                    <td className="p-3">
                      <input
                        type="number"
                        disabled={isClosed}
                        value={countedVal}
                        onChange={(e) => handleCountChange(b.currencyCode, e.target.value)}
                        className="w-32 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-black text-slate-900 focus:outline-none focus:border-yellow-500 disabled:opacity-60"
                      />
                    </td>

                    <td className="p-3 font-mono font-bold">
                      {variance === 0 ? (
                        <span className="text-slate-400">متوازن (0.00)</span>
                      ) : variance > 0 ? (
                        <span className="text-emerald-700">+{variance.toLocaleString()} (زيادة)</span>
                      ) : (
                        <span className="text-rose-700">{variance.toLocaleString()} (عجز)</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Notes */}
        <div className="pt-2 space-y-1">
          <label className="text-xs text-slate-700 font-bold block">ملاحظات الإغلاق النهائي اليومي:</label>
          <textarea
            disabled={isClosed}
            value={closureNotes}
            onChange={(e) => setClosureNotes(e.target.value)}
            placeholder="ملاحظات حول الفروقات إن وجدت أو أي توجيهات للشيفت القادم..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-yellow-500 disabled:opacity-60"
            rows={2}
          />
        </div>

        {!isClosed && (
          <button
            onClick={handleExecuteCloseDay}
            className="w-full py-3.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-sm shadow-sm transition flex items-center justify-center gap-2"
          >
            <Lock className="w-5 h-5" />
            <span>{t.closeDayButton}</span>
          </button>
        )}

      </div>

    </div>
  );
};
