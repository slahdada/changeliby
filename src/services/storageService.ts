import { 
  User, Currency, ExchangeRate, Customer, Transaction, 
  CashDrawerBalance, DailyClosure, RateHistoryItem, CashAdjustment,
  CblRateAlert, NotificationSettings
} from '../types';
import { 
  INITIAL_USERS, INITIAL_CURRENCIES, INITIAL_RATES, 
  INITIAL_CUSTOMERS, INITIAL_TRANSACTIONS, INITIAL_DRAWER_BALANCES, 
  INITIAL_DAILY_CLOSURE 
} from '../data/initialData';
import { getUpdatedRealMarketRates } from '../data/marketRatesFeed';

const KEYS = {
  USERS: 'libya_exchange_users_v1',
  CURRENCIES: 'libya_exchange_currencies_v1',
  RATES: 'libya_exchange_rates_v1',
  RATE_HISTORY: 'libya_exchange_rate_history_v1',
  CUSTOMERS: 'libya_exchange_customers_v1',
  TRANSACTIONS: 'libya_exchange_transactions_v1',
  DRAWER_BALANCES: 'libya_exchange_drawer_balances_v1',
  CASH_ADJUSTMENTS: 'libya_exchange_cash_adjustments_v1',
  DAILY_CLOSURE: 'libya_exchange_daily_closure_v1',
  CURRENT_USER: 'libya_exchange_current_user_v1',
  LANGUAGE: 'libya_exchange_lang_v1',
  CBL_ALERTS: 'libya_exchange_cbl_alerts_v1',
  NOTIFICATION_SETTINGS: 'libya_exchange_notification_settings_v1',
};

export const storageService = {
  getUsers(): User[] {
    const data = localStorage.getItem(KEYS.USERS);
    if (!data) {
      localStorage.setItem(KEYS.USERS, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    return JSON.parse(data);
  },

  saveUsers(users: User[]): void {
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  },

  getCurrencies(): Currency[] {
    const data = localStorage.getItem(KEYS.CURRENCIES);
    if (!data) {
      localStorage.setItem(KEYS.CURRENCIES, JSON.stringify(INITIAL_CURRENCIES));
      return INITIAL_CURRENCIES;
    }
    return JSON.parse(data);
  },

  getRates(): ExchangeRate[] {
    const data = localStorage.getItem(KEYS.RATES);
    if (!data) {
      localStorage.setItem(KEYS.RATES, JSON.stringify(INITIAL_RATES));
      return INITIAL_RATES;
    }
    const parsed: ExchangeRate[] = JSON.parse(data);
    // If stored rates contain outdated USD rates below 7.00, automatically migrate to live actual market
    const usdRate = parsed.find(r => r.currencyCode === 'USD');
    if (usdRate && usdRate.buyRate < 7.00) {
      const refreshed = getUpdatedRealMarketRates(parsed);
      localStorage.setItem(KEYS.RATES, JSON.stringify(refreshed));
      return refreshed;
    }
    return parsed;
  },

  saveRates(rates: ExchangeRate[]): void {
    localStorage.setItem(KEYS.RATES, JSON.stringify(rates));
  },

  syncMarketRates(): ExchangeRate[] {
    const current = this.getRates();
    const synced = getUpdatedRealMarketRates(current);
    this.saveRates(synced);
    return synced;
  },

  getCustomers(): Customer[] {
    const data = localStorage.getItem(KEYS.CUSTOMERS);
    if (!data) {
      localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
      return INITIAL_CUSTOMERS;
    }
    return JSON.parse(data);
  },

  saveCustomers(customers: Customer[]): void {
    localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(customers));
  },

  getTransactions(): Transaction[] {
    const data = localStorage.getItem(KEYS.TRANSACTIONS);
    if (!data) {
      localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
      return INITIAL_TRANSACTIONS;
    }
    return JSON.parse(data);
  },

  saveTransactions(txns: Transaction[]): void {
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(txns));
  },

  getDrawerBalances(): CashDrawerBalance[] {
    const data = localStorage.getItem(KEYS.DRAWER_BALANCES);
    if (!data) {
      localStorage.setItem(KEYS.DRAWER_BALANCES, JSON.stringify(INITIAL_DRAWER_BALANCES));
      return INITIAL_DRAWER_BALANCES;
    }
    return JSON.parse(data);
  },

  saveDrawerBalances(balances: CashDrawerBalance[]): void {
    localStorage.setItem(KEYS.DRAWER_BALANCES, JSON.stringify(balances));
  },

  getCashAdjustments(): CashAdjustment[] {
    const data = localStorage.getItem(KEYS.CASH_ADJUSTMENTS);
    return data ? JSON.parse(data) : [];
  },

  saveCashAdjustments(adjustments: CashAdjustment[]): void {
    localStorage.setItem(KEYS.CASH_ADJUSTMENTS, JSON.stringify(adjustments));
  },

  getDailyClosure(): DailyClosure {
    const data = localStorage.getItem(KEYS.DAILY_CLOSURE);
    if (!data) {
      localStorage.setItem(KEYS.DAILY_CLOSURE, JSON.stringify(INITIAL_DAILY_CLOSURE));
      return INITIAL_DAILY_CLOSURE;
    }
    return JSON.parse(data);
  },

  saveDailyClosure(closure: DailyClosure): void {
    localStorage.setItem(KEYS.DAILY_CLOSURE, JSON.stringify(closure));
  },

  getCurrentUser(): User {
    const data = localStorage.getItem(KEYS.CURRENT_USER);
    if (!data) {
      const defaultUser = INITIAL_USERS[1]; // Teller as default interactive
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(defaultUser));
      return defaultUser;
    }
    return JSON.parse(data);
  },

  saveCurrentUser(user: User): void {
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
  },

  getLanguage(): 'ar' | 'fr' {
    const lang = localStorage.getItem(KEYS.LANGUAGE);
    return (lang === 'fr' || lang === 'ar') ? lang : 'ar';
  },

  saveLanguage(lang: 'ar' | 'fr'): void {
    localStorage.setItem(KEYS.LANGUAGE, lang);
  },

  getCblAlerts(): CblRateAlert[] {
    const data = localStorage.getItem(KEYS.CBL_ALERTS);
    if (!data) {
      const initialAlerts: CblRateAlert[] = [
        {
          id: 'ALERT-CBL-001',
          currencyCode: 'USD',
          currencyNameAr: 'الدولار الأمريكي (كاش)',
          currencyNameFr: 'Dollar US (Espèces)',
          flag: '🇺🇸',
          symbol: '$',
          oldOfficialBuy: 4.810,
          newOfficialBuy: 4.815,
          oldOfficialSell: 4.834,
          newOfficialSell: 4.839,
          commercialBankRate: 6.120,
          parallelMarketRate: 7.260,
          delta: 0.005,
          deltaPercent: 0.10,
          type: 'RATE_INCREASE',
          bulletinNo: 'نشرة CBL-FX-2026/89',
          bulletinTitle: 'نشرة أسعار الصرف الرسمية لإدارة العمليات المصرفية',
          timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
          isRead: false,
          severity: 'info',
          notes: 'تعديل السعر المرجعي الرسمي للدولار لدى المصرف المركزي وتحديث مخصصات الأغراض الشخصية 4000$'
        },
        {
          id: 'ALERT-CBL-002',
          currencyCode: 'EUR',
          currencyNameAr: 'اليورو الأوروبي',
          currencyNameFr: 'Euro',
          flag: '🇪🇺',
          symbol: '€',
          oldOfficialBuy: 5.255,
          newOfficialBuy: 5.250,
          oldOfficialSell: 5.281,
          newOfficialSell: 5.276,
          commercialBankRate: 6.690,
          parallelMarketRate: 7.860,
          delta: -0.005,
          deltaPercent: -0.09,
          type: 'RATE_DECREASE',
          bulletinNo: 'نشرة CBL-FX-2026/88',
          bulletinTitle: 'نشرة التداول اليومية الموحدة',
          timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
          isRead: true,
          severity: 'info',
          notes: 'استقرار نسبي في مبيعات اليورو بالاعتمادات المستندية وبطاقات الأغراض الشخصية'
        }
      ];
      localStorage.setItem(KEYS.CBL_ALERTS, JSON.stringify(initialAlerts));
      return initialAlerts;
    }
    return JSON.parse(data);
  },

  saveCblAlerts(alerts: CblRateAlert[]): void {
    localStorage.setItem(KEYS.CBL_ALERTS, JSON.stringify(alerts));
  },

  getNotificationSettings(): NotificationSettings {
    const data = localStorage.getItem(KEYS.NOTIFICATION_SETTINGS);
    if (!data) {
      const initial: NotificationSettings = {
        soundEnabled: true,
        autoCheckIntervalSec: 60,
        pushBannerEnabled: true
      };
      localStorage.setItem(KEYS.NOTIFICATION_SETTINGS, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  },

  saveNotificationSettings(settings: NotificationSettings): void {
    localStorage.setItem(KEYS.NOTIFICATION_SETTINGS, JSON.stringify(settings));
  },

  resetAllData(): void {
    localStorage.setItem(KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(KEYS.CURRENCIES, JSON.stringify(INITIAL_CURRENCIES));
    localStorage.setItem(KEYS.RATES, JSON.stringify(INITIAL_RATES));
    localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
    localStorage.setItem(KEYS.DRAWER_BALANCES, JSON.stringify(INITIAL_DRAWER_BALANCES));
    localStorage.setItem(KEYS.DAILY_CLOSURE, JSON.stringify(INITIAL_DAILY_CLOSURE));
    localStorage.removeItem(KEYS.CASH_ADJUSTMENTS);
    localStorage.removeItem(KEYS.CBL_ALERTS);
  }
};
