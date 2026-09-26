import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  User, Currency, ExchangeRate, Customer, Transaction, 
  CashDrawerBalance, DailyClosure, Language, NavTab, CashAdjustment, TransactionType,
  CblRateAlert, NotificationSettings
} from '../types';
import { storageService } from '../services/storageService';
import { translations } from '../i18n/translations';
import { notificationSoundService } from '../utils/notificationSound';
import { LIBYA_CURRENT_MARKET_FEED } from '../data/marketRatesFeed';

interface AppContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  dir: 'rtl' | 'ltr';
  t: typeof translations.ar;
  
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;

  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];

  currencies: Currency[];
  rates: ExchangeRate[];
  updateRate: (currencyCode: string, buyRate: number, sellRate: number, note?: string) => void;
  syncWithMarketFeed: () => void;
  setAllRates: (newRates: ExchangeRate[]) => void;

  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'totalExchangedLyd'>) => Customer;
  updateCustomer: (customer: Customer) => void;

  transactions: Transaction[];
  executeTransaction: (data: {
    type: TransactionType;
    currencyCode: string;
    foreignAmount: number;
    exchangeRate: number;
    lydAmount: number;
    commissionLyd: number;
    netLydAmount: number;
    customerId?: string;
    customerName: string;
    customerNationalId?: string;
    paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'SADAD' | 'MOBI_CASH';
    notes?: string;
  }) => { success: boolean; message?: string; transaction?: Transaction };

  drawerBalances: CashDrawerBalance[];
  cashAdjustments: CashAdjustment[];
  addCashAdjustment: (type: 'IN' | 'OUT', currencyCode: string, amount: number, reason: string) => void;

  dailyClosure: DailyClosure;
  closeDay: (actualBalances: CashDrawerBalance[], notes?: string) => void;
  reopenDay: () => void;

  activeReceiptTxn: Transaction | null;
  setActiveReceiptTxn: (txn: Transaction | null) => void;

  isCblModalOpen: boolean;
  setIsCblModalOpen: (open: boolean) => void;

  isGoogleGroundingOpen: boolean;
  setIsGoogleGroundingOpen: (open: boolean) => void;

  // CBL Push-Notification Alert System
  cblAlerts: CblRateAlert[];
  activeToasts: CblRateAlert[];
  unreadAlertsCount: number;
  dismissToast: (id: string) => void;
  dismissAllToasts: () => void;
  markAlertAsRead: (id: string) => void;
  clearAllAlerts: () => void;
  triggerCblRateAlert: (customAlert: Partial<CblRateAlert>) => CblRateAlert;
  simulateCblMarketEvent: () => CblRateAlert;
  applyAlertRateToBureau: (alert: CblRateAlert) => void;
  notificationSettings: NotificationSettings;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  checkCblRateUpdates: (silent?: boolean) => { updated: boolean; alert?: CblRateAlert };

  resetDataToDefault: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => storageService.getLanguage());
  const [activeTab, setActiveTab] = useState<NavTab>('POS');
  
  const [users] = useState<User[]>(() => storageService.getUsers());
  const [currentUser, setCurrentUserState] = useState<User>(() => storageService.getCurrentUser());

  const [currencies] = useState<Currency[]>(() => storageService.getCurrencies());
  const [rates, setRates] = useState<ExchangeRate[]>(() => storageService.getRates());
  
  const [customers, setCustomers] = useState<Customer[]>(() => storageService.getCustomers());
  const [transactions, setTransactions] = useState<Transaction[]>(() => storageService.getTransactions());
  const [drawerBalances, setDrawerBalances] = useState<CashDrawerBalance[]>(() => storageService.getDrawerBalances());
  const [cashAdjustments, setCashAdjustments] = useState<CashAdjustment[]>(() => storageService.getCashAdjustments());
  const [dailyClosure, setDailyClosure] = useState<DailyClosure>(() => storageService.getDailyClosure());
  
  const [activeReceiptTxn, setActiveReceiptTxn] = useState<Transaction | null>(null);
  const [isCblModalOpen, setIsCblModalOpen] = useState(false);
  const [isGoogleGroundingOpen, setIsGoogleGroundingOpen] = useState(false);

  // CBL Push Alert System State
  const [cblAlerts, setCblAlerts] = useState<CblRateAlert[]>(() => storageService.getCblAlerts());
  const [activeToasts, setActiveToasts] = useState<CblRateAlert[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() => storageService.getNotificationSettings());

  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const t = translations[lang];

  const unreadAlertsCount = cblAlerts.filter(a => !a.isRead).length;

  const dismissToast = useCallback((id: string) => {
    setActiveToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const dismissAllToasts = useCallback(() => {
    setActiveToasts([]);
  }, []);

  const markAlertAsRead = useCallback((id: string) => {
    setCblAlerts(prev => {
      const updated = prev.map(a => a.id === id ? { ...a, isRead: true } : a);
      storageService.saveCblAlerts(updated);
      return updated;
    });
  }, []);

  const clearAllAlerts = useCallback(() => {
    setCblAlerts([]);
    storageService.saveCblAlerts([]);
    setActiveToasts([]);
  }, []);

  const updateNotificationSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    setNotificationSettings(prev => {
      const updated = { ...prev, ...newSettings };
      storageService.saveNotificationSettings(updated);
      return updated;
    });
  }, []);

  const triggerCblRateAlert = useCallback((custom: Partial<CblRateAlert>): CblRateAlert => {
    const currency = LIBYA_CURRENT_MARKET_FEED.find(f => f.code === custom.currencyCode) || LIBYA_CURRENT_MARKET_FEED[0];
    const now = new Date();

    const oldBuy = custom.oldOfficialBuy ?? currency.officialBuy;
    const newBuy = custom.newOfficialBuy ?? (currency.officialBuy + (Math.random() > 0.5 ? 0.008 : -0.006));
    const oldSell = custom.oldOfficialSell ?? currency.officialSell;
    const newSell = custom.newOfficialSell ?? (currency.officialSell + (Math.random() > 0.5 ? 0.010 : -0.007));
    const delta = Number((newSell - oldSell).toFixed(3));
    const deltaPercent = Number(((delta / oldSell) * 100).toFixed(2));

    const newAlert: CblRateAlert = {
      id: `ALERT-CBL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      currencyCode: custom.currencyCode || currency.code,
      currencyNameAr: custom.currencyNameAr || currency.nameAr,
      currencyNameFr: custom.currencyNameFr || currency.nameFr,
      flag: custom.flag || currency.flag,
      symbol: custom.symbol || currency.symbol,
      oldOfficialBuy: Number(oldBuy.toFixed(3)),
      newOfficialBuy: Number(newBuy.toFixed(3)),
      oldOfficialSell: Number(oldSell.toFixed(3)),
      newOfficialSell: Number(newSell.toFixed(3)),
      commercialBankRate: custom.commercialBankRate ?? currency.commercialBankRate,
      parallelMarketRate: custom.parallelMarketRate ?? currency.defaultParallelSell,
      delta,
      deltaPercent,
      type: custom.type || (delta >= 0 ? 'RATE_INCREASE' : 'RATE_DECREASE'),
      bulletinNo: custom.bulletinNo || `نشرة CBL-FX-${now.getFullYear()}/${(now.getMonth() + 1).toString().padStart(2, '0')}-${Math.floor(10 + Math.random() * 90)}`,
      bulletinTitle: custom.bulletinTitle || 'تحديث فوري لأسعار الصرف والعمليات المصرفية الرسمية',
      timestamp: now.toISOString(),
      isRead: false,
      autoApplied: false,
      severity: custom.severity || (Math.abs(deltaPercent) > 0.5 ? 'warning' : 'info'),
      notes: custom.notes || `تعديل السعر المرجعي الرسمي الصادر عن مصرف ليبيا المركزي (${currency.nameAr})`
    };

    setCblAlerts(prev => {
      const updated = [newAlert, ...prev.slice(0, 49)];
      storageService.saveCblAlerts(updated);
      return updated;
    });

    if (notificationSettings.pushBannerEnabled) {
      setActiveToasts(prev => [newAlert, ...prev.slice(0, 2)]);
    }

    if (notificationSettings.soundEnabled) {
      notificationSoundService.playCblAlertChime(newAlert.severity);
    }

    return newAlert;
  }, [notificationSettings]);

  const applyAlertRateToBureau = useCallback((alert: CblRateAlert) => {
    const feed = LIBYA_CURRENT_MARKET_FEED.find(f => f.code === alert.currencyCode);
    if (feed) {
      updateRate(
        alert.currencyCode, 
        feed.defaultParallelBuy, 
        feed.defaultParallelSell, 
        `محدث آلياً وفق إشعار CBL: ${alert.bulletinNo || 'نشرة البنك المركزي'}`
      );
    }

    setCblAlerts(prev => {
      const updated = prev.map(a => a.id === alert.id ? { ...a, autoApplied: true, isRead: true } : a);
      storageService.saveCblAlerts(updated);
      return updated;
    });

    dismissToast(alert.id);
  }, [dismissToast]);

  const simulateCblMarketEvent = useCallback((): CblRateAlert => {
    const scenarios = [
      {
        currencyCode: 'USD',
        currencyNameAr: 'الدولار الأمريكي (كاش)',
        currencyNameFr: 'Dollar US (Espèces)',
        flag: '🇺🇸',
        symbol: '$',
        oldOfficialBuy: 4.815,
        newOfficialBuy: 4.832,
        oldOfficialSell: 4.839,
        newOfficialSell: 4.856,
        commercialBankRate: 6.140,
        parallelMarketRate: 7.280,
        type: 'RATE_INCREASE' as const,
        bulletinTitle: 'نشرة مبيعات النقد الأجنبي والأغراض الشخصية (4000$)',
        notes: 'إعلان مصرف ليبيا المركزي عن تعديل متوسط سعر الصرف المرجعي للدولار واستمرار شحن البطاقات الدولية.',
        severity: 'warning' as const
      },
      {
        currencyCode: 'EUR',
        currencyNameAr: 'اليورو الأوروبي',
        currencyNameFr: 'Euro',
        flag: '🇪🇺',
        symbol: '€',
        oldOfficialBuy: 5.250,
        newOfficialBuy: 5.268,
        oldOfficialSell: 5.276,
        newOfficialSell: 5.295,
        commercialBankRate: 6.715,
        parallelMarketRate: 7.890,
        type: 'RATE_INCREASE' as const,
        bulletinTitle: 'نشرة أسعار العملات الدولية المعتمدة لدى إدارة العمليات',
        notes: 'تحديث سعر بيع اليورو للمصارف التجارية وطلبات الاعتمادات المستندية وتوريدات السلع.',
        severity: 'info' as const
      },
      {
        currencyCode: 'USD_TR',
        currencyNameAr: 'دولار تحويلات وسداد (دبي / تركيا)',
        currencyNameFr: 'Dollar US (Virement / Dubaï)',
        flag: '🏦',
        symbol: '$',
        oldOfficialBuy: 4.815,
        newOfficialBuy: 4.815,
        oldOfficialSell: 4.839,
        newOfficialSell: 4.839,
        commercialBankRate: 6.120,
        parallelMarketRate: 7.420,
        type: 'CIRCULAR_UPDATE' as const,
        bulletinTitle: 'منشور دوري بشأن تسويات المقاصة للحوالات الخارجية المباشرة',
        notes: 'تسهيلات جديدة في تنفيذ الحوالات والاعتمادات التجارية عبر منظومة المقاصة الخارجية الموحدة.',
        severity: 'info' as const
      },
      {
        currencyCode: 'GBP',
        currencyNameAr: 'الجنيه الإسترليني',
        currencyNameFr: 'Livre Sterling',
        flag: '🇬🇧',
        symbol: '£',
        oldOfficialBuy: 6.140,
        newOfficialBuy: 6.185,
        oldOfficialSell: 6.170,
        newOfficialSell: 6.216,
        commercialBankRate: 7.860,
        parallelMarketRate: 9.250,
        type: 'RATE_INCREASE' as const,
        bulletinTitle: 'نشرة تداول العملات الأوروبية - المركز المالي',
        notes: 'ارتفاع مؤشر الجنيه الإسترليني بالنشرة الرسمية اليومية لمصرف ليبيا المركزي.',
        severity: 'info' as const
      },
      {
        currencyCode: 'TND',
        currencyNameAr: 'الدينار التونسي',
        currencyNameFr: 'Dinar Tunisien',
        flag: '🇹🇳',
        symbol: 'د.ت',
        oldOfficialBuy: 1.545,
        newOfficialBuy: 1.538,
        oldOfficialSell: 1.553,
        newOfficialSell: 1.546,
        commercialBankRate: 1.970,
        parallelMarketRate: 2.320,
        type: 'RATE_DECREASE' as const,
        bulletinTitle: 'نشرة التداول المغاربي - منفذ رأس جدير',
        notes: 'تعديل طفيف في سعر الصرف المرجعي للدينار التونسي مع انتظام التبادل التجاري والسياحي.',
        severity: 'info' as const
      }
    ];

    const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    return triggerCblRateAlert(randomScenario);
  }, [triggerCblRateAlert]);

  const checkCblRateUpdates = useCallback((silent: boolean = false) => {
    // Generate a live simulated check or confirm fresh rates
    const alert = simulateCblMarketEvent();
    return { updated: true, alert };
  }, [simulateCblMarketEvent]);

  useEffect(() => {
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', lang);
  }, [lang, dir]);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    storageService.saveLanguage(newLang);
  };

  const setCurrentUser = (user: User) => {
    setCurrentUserState(user);
    storageService.saveCurrentUser(user);
  };

  const updateRate = (currencyCode: string, buyRate: number, sellRate: number, note?: string) => {
    const updated = rates.map(r => {
      if (r.currencyCode === currencyCode) {
        return {
          ...r,
          buyRate,
          sellRate,
          note: note || r.note,
          updatedAt: new Date().toISOString(),
          updatedBy: currentUser.fullName
        };
      }
      return r;
    });
    setRates(updated);
    storageService.saveRates(updated);
  };

  const setAllRates = (newRates: ExchangeRate[]) => {
    setRates(newRates);
    storageService.saveRates(newRates);
  };

  const syncWithMarketFeed = () => {
    const updated = storageService.syncMarketRates();
    setRates(updated);
  };

  const addCustomer = (customerData: Omit<Customer, 'id' | 'totalExchangedLyd'>): Customer => {
    const newCust: Customer = {
      ...customerData,
      id: `CUST-${Date.now().toString().slice(-4)}`,
      totalExchangedLyd: 0,
      lastTransactionAt: new Date().toISOString()
    };
    const updated = [newCust, ...customers];
    setCustomers(updated);
    storageService.saveCustomers(updated);
    return newCust;
  };

  const updateCustomer = (updatedCust: Customer) => {
    const updated = customers.map(c => c.id === updatedCust.id ? updatedCust : c);
    setCustomers(updated);
    storageService.saveCustomers(updated);
  };

  const executeTransaction = ({
    type,
    currencyCode,
    foreignAmount,
    exchangeRate,
    lydAmount,
    commissionLyd,
    netLydAmount,
    customerId,
    customerName,
    customerNationalId,
    paymentMethod,
    notes
  }: {
    type: TransactionType;
    currencyCode: string;
    foreignAmount: number;
    exchangeRate: number;
    lydAmount: number;
    commissionLyd: number;
    netLydAmount: number;
    customerId?: string;
    customerName: string;
    customerNationalId?: string;
    paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'SADAD' | 'MOBI_CASH';
    notes?: string;
  }) => {
    // Check cash drawer availability
    if (type === 'BUY') {
      // Buying foreign currency -> We give LYD out from cash drawer
      const lydBal = drawerBalances.find(b => b.currencyCode === 'LYD')?.amount || 0;
      if (lydBal < netLydAmount) {
        return { 
          success: false, 
          message: `عذراً، السيولة غير كافية بالدينار الليبي في الصندوق! (المتوفر: ${lydBal.toLocaleString()} د.ل، المطلوب: ${netLydAmount.toLocaleString()} د.ل)` 
        };
      }
    } else {
      // Selling foreign currency -> We give Foreign currency out from drawer
      const fBal = drawerBalances.find(b => b.currencyCode === currencyCode)?.amount || 0;
      if (fBal < foreignAmount) {
        return { 
          success: false, 
          message: `عذراً، رصيد العملة الأجنبية غير كافٍ في الصندوق! (المتوفر: ${fBal.toLocaleString()} ${currencyCode}، المطلوب: ${foreignAmount.toLocaleString()} ${currencyCode})` 
        };
      }
    }

    const now = new Date();
    const dateCode = now.toISOString().split('T')[0].replace(/-/g, '');
    const randomSeq = Math.floor(100 + Math.random() * 900);
    
    const newTxn: Transaction = {
      id: `TXN-${dateCode}-${randomSeq}`,
      receiptNumber: `REC-${Math.floor(10000 + Math.random() * 90000)}`,
      type,
      currencyCode,
      foreignAmount,
      exchangeRate,
      lydAmount,
      commissionLyd,
      netLydAmount,
      customerId,
      customerName: customerName || 'زبون عابر',
      customerNationalId,
      tellerId: currentUser.id,
      tellerName: currentUser.fullName,
      branch: currentUser.branch,
      timestamp: now.toISOString(),
      status: 'COMPLETED',
      paymentMethod,
      notes
    };

    // 1. Save Transaction
    const updatedTxns = [newTxn, ...transactions];
    setTransactions(updatedTxns);
    storageService.saveTransactions(updatedTxns);

    // 2. Update Cash Drawer Balances
    const updatedDrawer = drawerBalances.map(b => {
      if (type === 'BUY') {
        // + Foreign Currency, - LYD
        if (b.currencyCode === currencyCode) {
          return { ...b, amount: b.amount + foreignAmount };
        }
        if (b.currencyCode === 'LYD') {
          return { ...b, amount: b.amount - netLydAmount };
        }
      } else {
        // - Foreign Currency, + LYD
        if (b.currencyCode === currencyCode) {
          return { ...b, amount: b.amount - foreignAmount };
        }
        if (b.currencyCode === 'LYD') {
          return { ...b, amount: b.amount + netLydAmount };
        }
      }
      return b;
    });

    setDrawerBalances(updatedDrawer);
    storageService.saveDrawerBalances(updatedDrawer);

    // 3. Update Customer History if linked
    if (customerId) {
      const cust = customers.find(c => c.id === customerId);
      if (cust) {
        const updatedCust: Customer = {
          ...cust,
          totalExchangedLyd: cust.totalExchangedLyd + netLydAmount,
          lastTransactionAt: now.toISOString()
        };
        updateCustomer(updatedCust);
      }
    }

    // 4. Update Daily Closure stats
    const updatedClosure: DailyClosure = {
      ...dailyClosure,
      totalBuyCount: dailyClosure.totalBuyCount + (type === 'BUY' ? 1 : 0),
      totalSellCount: dailyClosure.totalSellCount + (type === 'SELL' ? 1 : 0),
      totalBuyLyd: dailyClosure.totalBuyLyd + (type === 'BUY' ? netLydAmount : 0),
      totalSellLyd: dailyClosure.totalSellLyd + (type === 'SELL' ? netLydAmount : 0),
      estimatedProfitLyd: dailyClosure.estimatedProfitLyd + (commissionLyd || Math.round(netLydAmount * 0.005))
    };
    setDailyClosure(updatedClosure);
    storageService.saveDailyClosure(updatedClosure);

    // Set as active receipt for printing
    setActiveReceiptTxn(newTxn);

    return { success: true, transaction: newTxn };
  };

  const addCashAdjustment = (type: 'IN' | 'OUT', currencyCode: string, amount: number, reason: string) => {
    const newAdj: CashAdjustment = {
      id: `ADJ-${Date.now()}`,
      type,
      currencyCode,
      amount,
      reason,
      performedBy: currentUser.fullName,
      timestamp: new Date().toISOString()
    };

    const updatedAdj = [newAdj, ...cashAdjustments];
    setCashAdjustments(updatedAdj);
    storageService.saveCashAdjustments(updatedAdj);

    // Update drawer balance
    const updatedDrawer = drawerBalances.map(b => {
      if (b.currencyCode === currencyCode) {
        const newAmount = type === 'IN' ? b.amount + amount : b.amount - amount;
        return { ...b, amount: Math.max(0, newAmount) };
      }
      return b;
    });

    setDrawerBalances(updatedDrawer);
    storageService.saveDrawerBalances(updatedDrawer);
  };

  const closeDay = (actualBalances: CashDrawerBalance[], notes?: string) => {
    const variances = drawerBalances.map(exp => {
      const act = actualBalances.find(a => a.currencyCode === exp.currencyCode)?.amount || 0;
      return {
        currencyCode: exp.currencyCode,
        variance: act - exp.amount
      };
    });

    const updated: DailyClosure = {
      ...dailyClosure,
      closedAt: new Date().toISOString(),
      closedBy: currentUser.fullName,
      actualClosingBalances: actualBalances,
      expectedClosingBalances: drawerBalances,
      variances,
      status: 'CLOSED',
      notes: notes || dailyClosure.notes
    };

    setDailyClosure(updated);
    storageService.saveDailyClosure(updated);
  };

  const reopenDay = () => {
    const updated: DailyClosure = {
      ...dailyClosure,
      status: 'OPEN',
      closedAt: '',
      closedBy: ''
    };
    setDailyClosure(updated);
    storageService.saveDailyClosure(updated);
  };

  const resetDataToDefault = () => {
    storageService.resetAllData();
    window.location.reload();
  };

  return (
    <AppContext.Provider value={{
      lang,
      setLang,
      dir,
      t,
      activeTab,
      setActiveTab,
      currentUser,
      setCurrentUser,
      users,
      currencies,
      rates,
      updateRate,
      syncWithMarketFeed,
      setAllRates,
      customers,
      addCustomer,
      updateCustomer,
      transactions,
      executeTransaction,
      drawerBalances,
      cashAdjustments,
      addCashAdjustment,
      dailyClosure,
      closeDay,
      reopenDay,
      activeReceiptTxn,
      setActiveReceiptTxn,
      isCblModalOpen,
      setIsCblModalOpen,
      isGoogleGroundingOpen,
      setIsGoogleGroundingOpen,
      cblAlerts,
      activeToasts,
      unreadAlertsCount,
      dismissToast,
      dismissAllToasts,
      markAlertAsRead,
      clearAllAlerts,
      triggerCblRateAlert,
      simulateCblMarketEvent,
      applyAlertRateToBureau,
      notificationSettings,
      updateNotificationSettings,
      checkCblRateUpdates,
      resetDataToDefault
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
