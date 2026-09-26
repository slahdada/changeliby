import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, Search, Plus, ShieldCheck, FileText, 
  AlertTriangle, CheckCircle2, UserCheck, Phone, Download 
} from 'lucide-react';
import { Customer, KYCStatus, RiskLevel } from '../../types';

export const CustomerKycManager: React.FC = () => {
  const { customers, addCustomer, transactions, t } = useApp();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [kycFilter, setKycFilter] = useState<string>('ALL');
  const [selectedCustDetail, setSelectedCustDetail] = useState<Customer | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [fullName, setFullName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [passportNumber, setPassportNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [nationality, setNationality] = useState('ليبي');
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('LOW');

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchesSearch = 
        c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.nationalId.includes(searchQuery) ||
        (c.passportNumber && c.passportNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
        c.phone.includes(searchQuery);

      const matchesKyc = kycFilter === 'ALL' || c.kycStatus === kycFilter;

      return matchesSearch && matchesKyc;
    });
  }, [customers, searchQuery, kycFilter]);

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !nationalId) return;

    addCustomer({
      fullName,
      nationalId,
      passportNumber: passportNumber || undefined,
      phone: phone || '+218 91 000 0000',
      nationality,
      documentType: 'NATIONAL_ID',
      documentNumber: nationalId,
      kycStatus: 'VERIFIED',
      riskLevel
    });

    setShowAddModal(false);
    setFullName('');
    setNationalId('');
    setPassportNumber('');
    setPhone('');
  };

  const getCustomerTransactions = (customerId: string) => {
    return transactions.filter(t => t.customerId === customerId);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white border-b-4 border-yellow-500 p-4 sm:p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-md">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-yellow-400" />
            <span>{t.customersTitle}</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            سجل العملاء والتحقق من الهوية الليبية (KYC) لمنع غسيل الأموال وتنظيم حدود التحويلات.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة عميل جديد</span>
        </button>
      </div>

      {/* Search & Filter Header */}
      <div className="bg-white border border-slate-200 p-3 sm:p-4 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-sm w-full">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم، الرقم الوطني، أو رقم الهاتف..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-yellow-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs w-full sm:w-auto justify-between sm:justify-start">
          <span className="text-slate-600 font-bold shrink-0">حالة KYC:</span>
          <select
            value={kycFilter}
            onChange={(e) => setKycFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none flex-1 sm:flex-none"
          >
            <option value="ALL">جميع الحالات</option>
            <option value="VERIFIED">متحقق (Verified)</option>
            <option value="PENDING">قيد المراجعة (Pending)</option>
            <option value="EXPIRED">منتهي (Expired)</option>
          </select>
        </div>
      </div>

      {/* Customers Responsive Container */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm w-full">
        
        {/* Mobile View: Cards instead of Table */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredCustomers.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs font-medium">
              لا يوجد عملاء مطابقين للبحث.
            </div>
          ) : (
            filteredCustomers.map((cust) => {
              const custTxns = getCustomerTransactions(cust.id);
              return (
                <div key={cust.id} className="p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 font-bold text-slate-900 text-xs truncate">
                      <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="truncate">{cust.fullName}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                      cust.kycStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {cust.kycStatus === 'VERIFIED' ? '✅ متحقق' : '⏳ مراجعة'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                    <div>
                      <span className="text-slate-400 block text-[10px]">الرقم الوطني:</span>
                      <strong className="font-mono text-slate-700">{cust.nationalId}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">رقم الهاتف:</span>
                      <strong className="font-mono text-slate-700">{cust.phone}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">إجمالي الصرف:</span>
                      <strong className="font-mono text-emerald-700">{cust.totalExchangedLyd.toLocaleString()} د.ل</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">مستوى المخاطرة:</span>
                      <span className={`font-bold ${
                        cust.riskLevel === 'LOW' ? 'text-slate-600' : cust.riskLevel === 'MEDIUM' ? 'text-amber-700' : 'text-rose-700'
                      }`}>
                        {cust.riskLevel === 'LOW' ? 'منخفض' : cust.riskLevel === 'MEDIUM' ? 'متوسط' : 'مرتفع'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedCustDetail(cust)}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>سجل المعاملات ({custTxns.length})</span>
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop View: Full Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-right text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-mono text-[11px] uppercase font-bold">
              <tr>
                <th className="p-3.5">{t.fullName}</th>
                <th className="p-3.5">{t.nationalId}</th>
                <th className="p-3.5">{t.passportNumber}</th>
                <th className="p-3.5">{t.phone}</th>
                <th className="p-3.5">{t.kycStatus}</th>
                <th className="p-3.5">{t.riskLevel}</th>
                <th className="p-3.5">{t.totalExchanged}</th>
                <th className="p-3.5">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-400 font-medium">
                    لا يوجد عملاء مطابقين للبحث.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const custTxns = getCustomerTransactions(cust.id);
                  return (
                    <tr key={cust.id} className="hover:bg-slate-50 transition-colors">
                      
                      <td className="p-3.5 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-emerald-600" />
                          <span>{cust.fullName}</span>
                        </div>
                      </td>

                      <td className="p-3.5 font-mono text-slate-600 font-bold">
                        {cust.nationalId}
                      </td>

                      <td className="p-3.5 font-mono text-slate-500">
                        {cust.passportNumber || '-'}
                      </td>

                      <td className="p-3.5 font-mono text-slate-600">
                        {cust.phone}
                      </td>

                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                          cust.kycStatus === 'VERIFIED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {cust.kycStatus === 'VERIFIED' ? '✅ متحقق' : '⏳ قيد المراجعة'}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          cust.riskLevel === 'LOW'
                            ? 'bg-slate-100 text-slate-700'
                            : cust.riskLevel === 'MEDIUM'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {cust.riskLevel === 'LOW' ? t.lowRisk : cust.riskLevel === 'MEDIUM' ? t.medRisk : t.highRisk}
                        </span>
                      </td>

                      <td className="p-3.5 font-mono font-bold text-emerald-700">
                        {cust.totalExchangedLyd.toLocaleString()} د.ل
                      </td>

                      <td className="p-3.5">
                        <button
                          onClick={() => setSelectedCustDetail(cust)}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-bold transition-colors"
                        >
                          سجل المعاملات ({custTxns.length})
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail History Modal */}
      {selectedCustDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{selectedCustDetail.fullName}</h3>
                <p className="text-xs text-slate-500 font-mono">الرقم الوطني: {selectedCustDetail.nationalId}</p>
              </div>
              <button
                onClick={() => setSelectedCustDetail(null)}
                className="p-1 text-slate-400 hover:text-slate-900 font-bold text-base"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700">سجل المعاملات التاريخية للعميل:</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {getCustomerTransactions(selectedCustDetail.id).length === 0 ? (
                  <div className="text-xs text-slate-400 p-3 text-center">لا توجد معاملات مسجلة حتى الآن.</div>
                ) : (
                  getCustomerTransactions(selectedCustDetail.id).map(txn => (
                    <div key={txn.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
                      <div>
                        <div className="font-bold text-slate-900">
                          {txn.type === 'BUY' ? 'شراء عملة' : 'بيع عملة'} - {txn.foreignAmount} {txn.currencyCode}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {new Date(txn.timestamp).toLocaleString('ar-LY')} | الصراف: {txn.tellerName}
                        </div>
                      </div>
                      <div className="font-mono font-bold text-emerald-700">
                        {txn.netLydAmount.toLocaleString()} د.ل
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedCustDetail(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">تسجيل بيانات عميل جديد</h3>
            <form onSubmit={handleCreateCustomer} className="space-y-3">
              <div>
                <label className="text-xs text-slate-700 font-bold block mb-1">الاسم الكامل *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-700 font-bold block mb-1">الرقم الوطني الليبي *</label>
                <input
                  type="text"
                  required
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  placeholder="119980123456"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-700 font-bold block mb-1">رقم جواز السفر</label>
                <input
                  type="text"
                  value={passportNumber}
                  onChange={(e) => setPassportNumber(e.target.value)}
                  placeholder="P998811"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-700 font-bold block mb-1">رقم الهاتف</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+218 91 123 4567"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-700 font-bold block mb-1">مستوى المخاطر</label>
                <select
                  value={riskLevel}
                  onChange={(e) => setRiskLevel(e.target.value as RiskLevel)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none"
                >
                  <option value="LOW">{t.lowRisk}</option>
                  <option value="MEDIUM">{t.medRisk}</option>
                  <option value="HIGH">{t.highRisk}</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
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

    </div>
  );
};
