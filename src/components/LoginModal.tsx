import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Lock, ShieldCheck, User as UserIcon, Check } from 'lucide-react';
import { User } from '../types';

interface LoginModalProps {
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onClose }) => {
  const { users, currentUser, setCurrentUser, t } = useApp();
  const [selectedUser, setSelectedUser] = useState<User>(currentUser);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // PIN check
    if (selectedUser.pinCode && pin !== selectedUser.pinCode) {
      setError(t.invalidPin);
      return;
    }

    setCurrentUser(selectedUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">{t.selectUserRole}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleLogin} className="p-5 space-y-4">
          
          <div className="space-y-2">
            <label className="text-xs text-slate-400 font-medium block">
              اختر الموظف / Caissier ou Admin
            </label>
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {users.map((u) => {
                const isSelected = selectedUser.id === u.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setSelectedUser(u);
                      setPin('');
                      setError('');
                    }}
                    className={`w-full text-right flex items-center justify-between p-3 rounded-xl border text-xs transition ${
                      isSelected
                        ? 'bg-emerald-600/15 border-emerald-500 text-white font-medium'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatar}
                        alt={u.fullName}
                        className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-700"
                      />
                      <div>
                        <div className="font-semibold text-slate-100">{u.fullName}</div>
                        <div className="text-[10px] text-slate-400">{u.branch}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono ${
                        u.role === 'ADMIN' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-700 text-slate-300'
                      }`}>
                        {u.role === 'ADMIN' ? t.admin : t.teller}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <label className="text-xs text-slate-300 font-medium flex items-center justify-between">
              <span>{t.enterPin}</span>
              <span className="text-[10px] text-slate-400">
                (رمز التجربة لـ {selectedUser.fullName}: <code className="text-emerald-400 font-mono">{selectedUser.pinCode || '0000'}</code>)
              </span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder={t.pinPlaceholder}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pr-9 pl-3 py-2.5 text-center font-mono text-lg tracking-widest text-white focus:outline-none focus:border-emerald-500"
                autoFocus
              />
            </div>
            {error && <p className="text-xs text-rose-400 pt-1">{error}</p>}
          </div>

          <div className="pt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="w-2/3 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-900/40"
            >
              {t.login}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
