import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, User, ShieldCheck, Lock, Building2 } from 'lucide-react';
import { UserAvatar } from '../Common/UserAvatar';

export const UsersManager: React.FC = () => {
  const { users, currentUser, t } = useApp();

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white border-b-4 border-yellow-500 p-4 sm:p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-md">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-yellow-400" />
            <span>{t.usersTitle}</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            إدارة مستخدمين النظام، توزيع الصرافين على الفروع، والتحكم في صلاحيات الوصول للغلق وأسعار الصرف.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {users.map(u => (
          <div key={u.id} className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-sm hover:border-slate-300 transition-colors">
            <div className="flex items-center gap-3">
              <UserAvatar
                user={u}
                size="lg"
                ringColor={u.role === 'ADMIN' ? 'ring-yellow-500' : 'ring-slate-300'}
              />
              <div>
                <div className="font-bold text-slate-900 text-base">{u.fullName}</div>
                <div className="text-xs text-slate-500 font-medium">@{u.username}</div>
              </div>
            </div>

            <div className="space-y-2.5 text-xs border-t border-slate-100 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-bold">الدور:</span>
                <span className={`px-2.5 py-0.5 rounded-md font-mono text-[10px] font-bold ${
                  u.role === 'ADMIN' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-slate-100 text-slate-800'
                }`}>
                  {u.role === 'ADMIN' ? '⚙️ مدير (ADMIN)' : '💳 صراف (TELLER)'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-bold">الفرع المسجل:</span>
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-yellow-600" />
                  <span>{u.branch}</span>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-bold">الرمز السري (PIN):</span>
                <span className="font-mono text-slate-900 font-black bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                  {u.pinCode || '****'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-bold">الحالة:</span>
                <span className="text-emerald-700 font-bold">نشط (Active)</span>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
