export type UserRole = 'ADMIN' | 'TELLER';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  branch: string;
  pinCode?: string;
  avatar?: string;
  active: boolean;
}

export interface Currency {
  code: string; // e.g. USD, EUR, GBP, TND, EGP, TRY, LYD
  nameAr: string;
  nameFr: string;
  symbol: string;
  flag: string;
  isBaseCurrency?: boolean; // LYD is base
  isTransferType?: boolean; // e.g., USD Transfer vs USD Cash
}

export interface ExchangeRate {
  id: string;
  currencyCode: string;
  buyRate: number; // Rate in LYD to buy foreign currency from customer
  sellRate: number; // Rate in LYD to sell foreign currency to customer
  officialRate?: number; // Central Bank of Libya official rate
  updatedAt: string;
  updatedBy: string;
  note?: string;
}

export interface RateHistoryItem {
  id: string;
  currencyCode: string;
  buyRate: number;
  sellRate: number;
  updatedAt: string;
  updatedBy: string;
}

export type TransactionType = 'BUY' | 'SELL'; // BUY = Office buys foreign currency (pays LYD), SELL = Office sells foreign currency (receives LYD)

export type KYCStatus = 'VERIFIED' | 'PENDING' | 'EXPIRED' | 'REJECTED';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Customer {
  id: string;
  fullName: string;
  nationalId: string; // الرقم الوطني الليبي
  passportNumber?: string;
  phone: string;
  nationality: string;
  documentType: 'NATIONAL_ID' | 'PASSPORT' | 'DRIVERS_LICENSE';
  documentNumber: string;
  kycStatus: KYCStatus;
  riskLevel: RiskLevel;
  totalExchangedLyd: number;
  lastTransactionAt?: string;
  notes?: string;
}

export interface Transaction {
  id: string; // e.g. TXN-20260724-001
  receiptNumber: string; // e.g. REC-88321
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
  tellerId: string;
  tellerName: string;
  branch: string;
  timestamp: string;
  status: 'COMPLETED' | 'CANCELLED';
  notes?: string;
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'SADAD' | 'MOBI_CASH';
}

export interface CashDrawerBalance {
  currencyCode: string;
  amount: number;
}

export interface CashAdjustment {
  id: string;
  type: 'IN' | 'OUT';
  currencyCode: string;
  amount: number;
  reason: string;
  performedBy: string;
  timestamp: string;
}

export interface DailyClosure {
  id: string;
  date: string; // YYYY-MM-DD
  closedAt: string;
  closedBy: string;
  tellerName: string;
  branch: string;
  totalBuyCount: number;
  totalSellCount: number;
  totalBuyLyd: number;
  totalSellLyd: number;
  startingBalances: CashDrawerBalance[];
  expectedClosingBalances: CashDrawerBalance[];
  actualClosingBalances: CashDrawerBalance[];
  variances: { currencyCode: string; variance: number }[];
  estimatedProfitLyd: number;
  status: 'OPEN' | 'CLOSED';
  notes?: string;
}

export type Language = 'ar' | 'fr';

export type NavTab = 
  | 'POS'
  | 'RATES'
  | 'CUSTOMERS'
  | 'DRAWER'
  | 'CLOSURE'
  | 'USERS'
  | 'ANDROID_CODE'
  | 'SETTINGS';

export interface CblRateAlert {
  id: string;
  currencyCode: string;
  currencyNameAr: string;
  currencyNameFr: string;
  flag: string;
  symbol: string;
  oldOfficialBuy: number;
  newOfficialBuy: number;
  oldOfficialSell: number;
  newOfficialSell: number;
  commercialBankRate: number;
  parallelMarketRate: number;
  delta: number;
  deltaPercent: number;
  type: 'RATE_INCREASE' | 'RATE_DECREASE' | 'OFFICIAL_BULLETIN' | 'CIRCULAR_UPDATE';
  bulletinNo?: string;
  bulletinTitle?: string;
  timestamp: string;
  isRead: boolean;
  autoApplied?: boolean;
  severity: 'info' | 'warning' | 'critical' | 'success';
  notes?: string;
}

export interface NotificationSettings {
  soundEnabled: boolean;
  autoCheckIntervalSec: number;
  pushBannerEnabled: boolean;
}

export interface GroundingSource {
  title: string;
  url: string;
  domain?: string;
}

export interface GroundedRateItem {
  code: string;
  nameAr: string;
  nameFr: string;
  symbol: string;
  flag: string;
  officialBuy: number;
  officialSell: number;
  commercialBankRate: number;
  parallelMarketRate: number;
  parallelBuy?: number;
  parallelSell?: number;
  change24h?: number;
  status: 'UP' | 'DOWN' | 'STABLE';
  lastUpdatedFormatted?: string;
  sourceNote?: string;
}

export interface GoogleSearchGroundingResult {
  query: string;
  summary: string;
  summaryFr?: string;
  groundedRates: GroundedRateItem[];
  goldRates?: {
    gold18k: number;
    gold24k: number;
    silver925?: number;
    source?: string;
  };
  sources: GroundingSource[];
  webSearchQueries: string[];
  cblCirculars?: {
    title: string;
    date: string;
    summary: string;
    link?: string;
  }[];
  timestamp: string;
  model: string;
  isRealGrounding?: boolean;
}
