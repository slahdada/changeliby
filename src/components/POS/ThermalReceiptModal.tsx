import React from 'react';
import { Transaction } from '../../types';
import { useApp } from '../../context/AppContext';
import { X, Printer, Share2, CheckCircle2, ShieldCheck } from 'lucide-react';

interface ThermalReceiptModalProps {
  transaction: Transaction;
  onClose: () => void;
}

export const ThermalReceiptModal: React.FC<ThermalReceiptModalProps> = ({ transaction, onClose }) => {
  const { t, lang } = useApp();

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(transaction.timestamp).toLocaleString(lang === 'ar' ? 'ar-LY' : 'fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      
      {/* Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col my-8">
        
        {/* Modal Top Actions Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">{t.printThermalReceipt}</h3>
              <p className="text-[11px] text-slate-400">طباعة وصل حراري (80mm Thermal Receipt)</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-900/40 transition"
            >
              <Printer className="w-4 h-4" />
              <span>{t.print}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Thermal Receipt Paper Simulation */}
        <div className="p-6 bg-slate-950 flex justify-center overflow-x-auto">
          
          <div 
            id="thermal-receipt"
            className="w-[300px] bg-white text-black p-5 shadow-2xl font-mono text-xs rounded-lg select-text border border-slate-200"
            style={{ color: '#000000', backgroundColor: '#ffffff' }}
          >
            {/* Bureau Header */}
            <div className="text-center space-y-1 pb-3 border-b border-dashed border-black">
              <div className="font-bold text-sm tracking-tight">{t.receiptHeader}</div>
              <div className="text-[10px] text-gray-700">{t.libyaAddress}</div>
              <div className="text-[10px] text-gray-800 font-semibold pt-1">
                ترخيص مصرف ليبيا المركزي رقم: CBL-LY-2026/88
              </div>
            </div>

            {/* Receipt Metadata */}
            <div className="py-3 space-y-1 border-b border-dashed border-black text-[11px]">
              <div className="flex justify-between">
                <span className="font-semibold">{t.receiptNo}:</span>
                <span className="font-bold">{transaction.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>{t.date}:</span>
                <span>{formattedDate}</span>
              </div>
              <div className="flex justify-between">
                <span>{t.tellerName}:</span>
                <span>{transaction.tellerName}</span>
              </div>
              <div className="flex justify-between">
                <span>{t.customerNameLabel}:</span>
                <span className="font-semibold">{transaction.customerName}</span>
              </div>
              {transaction.customerNationalId && (
                <div className="flex justify-between">
                  <span>{t.nationalIdLabel}:</span>
                  <span>{transaction.customerNationalId}</span>
                </div>
              )}
            </div>

            {/* Transaction Details */}
            <div className="py-3 space-y-2 border-b border-dashed border-black">
              <div className="flex justify-between items-center">
                <span className="font-semibold">{t.transactionTypeLabel}:</span>
                <span className="font-bold text-xs px-1.5 py-0.5 rounded border border-black">
                  {transaction.type === 'BUY' ? t.buyCurrency : t.sellCurrency}
                </span>
              </div>

              <div className="flex justify-between">
                <span>العملة الأجنبية:</span>
                <span className="font-bold">{transaction.foreignAmount.toLocaleString()} {transaction.currencyCode}</span>
              </div>

              <div className="flex justify-between">
                <span>{t.unitRate}:</span>
                <span>{transaction.exchangeRate} د.ل</span>
              </div>

              {transaction.commissionLyd > 0 && (
                <div className="flex justify-between text-[10px]">
                  <span>العمولة / الهامش:</span>
                  <span>{transaction.commissionLyd} د.ل</span>
                </div>
              )}

              <div className="pt-2 border-t border-black flex justify-between items-center">
                <span className="font-bold text-xs">إجمالي الدينار (LYD):</span>
                <span className="font-black text-sm">
                  {transaction.netLydAmount.toLocaleString('ar-LY', { minimumFractionDigits: 2 })} د.ل
                </span>
              </div>
            </div>

            {/* Footer Notice & Fake Barcode */}
            <div className="pt-3 text-center space-y-2">
              <div className="text-[9px] text-gray-800 leading-tight">
                {t.thankYouMessage}
              </div>

              {/* Barcode SVG simulation */}
              <div className="flex flex-col items-center justify-center pt-2">
                <div className="flex items-center gap-[2px] h-9">
                  {[3,1,2,1,4,1,2,3,1,2,1,4,1,2,3,1,2,4,1,2,1,3,1,2,1,4].map((w, idx) => (
                    <div 
                      key={idx} 
                      className="bg-black h-full" 
                      style={{ width: `${w}px` }}
                    />
                  ))}
                </div>
                <div className="text-[9px] tracking-widest font-mono mt-1">{transaction.id}</div>
              </div>

              <div className="text-[8px] text-gray-600 pt-1">
                {t.taxNotice}
              </div>
            </div>

          </div>

        </div>

        {/* Modal Bottom Close */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition"
          >
            إغلاق النافذة
          </button>
        </div>

      </div>

      {/* Embedded CSS for Print Mode */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #thermal-receipt, #thermal-receipt * {
            visibility: visible;
          }
          #thermal-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm !important;
            margin: 0 !important;
            padding: 10px !important;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>

    </div>
  );
};
