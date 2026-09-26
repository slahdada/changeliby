import { User, Currency, ExchangeRate, Customer, Transaction, CashDrawerBalance, DailyClosure } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'USR-001',
    username: 'admin',
    fullName: 'صلاح العياري',
    role: 'ADMIN',
    branch: 'تونس - شارع بورقيبة',
    pinCode: '1234',
    avatar: '/slah2.jpg',
    active: true,
  },
  {
    id: 'USR-002',
    username: 'teller1',
    fullName: 'علي المحمودي',
    role: 'TELLER',
    branch: 'طرابلس - شارع المدار',
    pinCode: '0000',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    active: true,
  },
  {
    id: 'USR-003',
    username: 'teller2',
    fullName: 'فاطمة الزروق',
    role: 'TELLER',
    branch: 'بنغازي - شارع دبي',
    pinCode: '1111',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    active: true,
  }
];

export const INITIAL_CURRENCIES: Currency[] = [
  {
    code: 'LYD',
    nameAr: 'دينار ليبي',
    nameFr: 'Dinar Libyen',
    symbol: 'د.ل',
    flag: '🇱🇾',
    isBaseCurrency: true,
  },
  {
    code: 'USD',
    nameAr: 'دولار أمريكي (كاش)',
    nameFr: 'Dollar US (Espèces)',
    symbol: '$',
    flag: '🇺🇸',
  },
  {
    code: 'USD_TR',
    nameAr: 'دولار أمريكي (تحويل / بطاقات)',
    nameFr: 'Dollar US (Virement)',
    symbol: '$',
    flag: '🏦',
    isTransferType: true,
  },
  {
    code: 'EUR',
    nameAr: 'يورو أوروبي',
    nameFr: 'Euro',
    symbol: '€',
    flag: '🇪🇺',
  },
  {
    code: 'GBP',
    nameAr: 'جنيه إسترليني',
    nameFr: 'Livre Sterling',
    symbol: '£',
    flag: '🇬🇧',
  },
  {
    code: 'TND',
    nameAr: 'دينار تونسي',
    nameFr: 'Dinar Tunisien',
    symbol: 'د.ت',
    flag: '🇹🇳',
  },
  {
    code: 'EGP',
    nameAr: 'جنيه مصري',
    nameFr: 'Livre Égyptienne',
    symbol: 'ج.م',
    flag: '🇪🇬',
  },
  {
    code: 'TRY',
    nameAr: 'ليرة تركية',
    nameFr: 'Livre Turque',
    symbol: '₺',
    flag: '🇹🇷',
  },
];

export const INITIAL_RATES: ExchangeRate[] = [
  {
    id: 'RATE-USD',
    currencyCode: 'USD',
    buyRate: 7.22,  // Buying $1 for 7.22 LYD (actual Libyan market)
    sellRate: 7.26, // Selling $1 for 7.26 LYD
    officialRate: 4.835, // CBL official fixing
    updatedAt: new Date().toISOString(),
    updatedBy: 'صلاح العياري',
    note: 'سوق المشير وسوق الصاغة - طرابلس (كاش)'
  },
  {
    id: 'RATE-USD_TR',
    currencyCode: 'USD_TR',
    buyRate: 7.34,
    sellRate: 7.39,
    officialRate: 4.835,
    updatedAt: new Date().toISOString(),
    updatedBy: 'صلاح العياري',
    note: 'حوالات دبي وتركيا والمصارف (سداد / يسر)'
  },
  {
    id: 'RATE-EUR',
    currencyCode: 'EUR',
    buyRate: 7.81,
    sellRate: 7.86,
    officialRate: 5.265,
    updatedAt: new Date().toISOString(),
    updatedBy: 'صلاح العياري',
    note: 'سوق المشير وزليتن ومصراتة (كاش)'
  },
  {
    id: 'RATE-GBP',
    currencyCode: 'GBP',
    buyRate: 9.12,
    sellRate: 9.22,
    officialRate: 6.155,
    updatedAt: new Date().toISOString(),
    updatedBy: 'صلاح العياري',
    note: 'سوق طرابلس الموازي'
  },
  {
    id: 'RATE-TND',
    currencyCode: 'TND',
    buyRate: 2.30,
    sellRate: 2.34,
    officialRate: 1.548,
    updatedAt: new Date().toISOString(),
    updatedBy: 'صلاح العياري',
    note: 'منفذ رأس جدير وسوق الصاغة'
  },
  {
    id: 'RATE-EGP',
    currencyCode: 'EGP',
    buyRate: 0.147,
    sellRate: 0.152,
    officialRate: 0.099,
    updatedAt: new Date().toISOString(),
    updatedBy: 'صلاح العياري',
    note: 'منفذ إمساعد وسوق بنغازي'
  },
  {
    id: 'RATE-TRY',
    currencyCode: 'TRY',
    buyRate: 0.215,
    sellRate: 0.222,
    officialRate: 0.139,
    updatedAt: new Date().toISOString(),
    updatedBy: 'صلاح العياري',
    note: 'سوق الحوالات التجارية إسطنبول'
  },
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'CUST-101',
    fullName: 'طرارق المصراطي',
    nationalId: '119880123456',
    passportNumber: 'N8839201',
    phone: '+218 91 234 5678',
    nationality: 'ليبي',
    documentType: 'NATIONAL_ID',
    documentNumber: '119880123456',
    kycStatus: 'VERIFIED',
    riskLevel: 'LOW',
    totalExchangedLyd: 48500,
    lastTransactionAt: '2026-07-24T10:15:00Z',
    notes: 'عميل منتظم - شركة استيراد مواشي'
  },
  {
    id: 'CUST-102',
    fullName: 'سالم الهوني',
    nationalId: '119920987654',
    passportNumber: 'P7730192',
    phone: '+218 92 888 1122',
    nationality: 'ليبي',
    documentType: 'PASSPORT',
    documentNumber: 'P7730192',
    kycStatus: 'VERIFIED',
    riskLevel: 'LOW',
    totalExchangedLyd: 13800,
    lastTransactionAt: '2026-07-24T11:30:00Z',
    notes: 'سفر بغرض العلاج في تونس'
  },
  {
    id: 'CUST-103',
    fullName: 'Jean-Luc Dupont',
    nationalId: 'FR-9988102',
    passportNumber: '19FR882910',
    phone: '+33 6 12 34 56 78',
    nationality: 'فرنسي',
    documentType: 'PASSPORT',
    documentNumber: '19FR882910',
    kycStatus: 'VERIFIED',
    riskLevel: 'MEDIUM',
    totalExchangedLyd: 72000,
    lastTransactionAt: '2026-07-23T16:20:00Z',
    notes: 'مندوب شركة نفط فرنسية في البريقة'
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'TXN-20260724-001',
    receiptNumber: 'REC-10492',
    type: 'BUY', // Office bought $1000 from customer
    currencyCode: 'USD',
    foreignAmount: 1000,
    exchangeRate: 6.86,
    lydAmount: 6860,
    commissionLyd: 0,
    netLydAmount: 6860,
    customerId: 'CUST-101',
    customerName: 'طارق المصراطي',
    customerNationalId: '119880123456',
    tellerId: 'USR-002',
    tellerName: 'علي المحمودي',
    branch: 'طرابلس - شارع المدار',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    status: 'COMPLETED',
    paymentMethod: 'CASH',
    notes: 'شراء دولار كاش'
  },
  {
    id: 'TXN-20260724-002',
    receiptNumber: 'REC-10493',
    type: 'SELL', // Office sold €500 to customer
    currencyCode: 'EUR',
    foreignAmount: 500,
    exchangeRate: 7.49,
    lydAmount: 3745,
    commissionLyd: 10,
    netLydAmount: 3755,
    customerId: 'CUST-102',
    customerName: 'سالم الهوني',
    customerNationalId: '119920987654',
    tellerId: 'USR-002',
    tellerName: 'علي المحمودي',
    branch: 'طرابلس - شارع المدار',
    timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    status: 'COMPLETED',
    paymentMethod: 'CASH',
    notes: 'بيع يورو للزبون'
  }
];

export const INITIAL_DRAWER_BALANCES: CashDrawerBalance[] = [
  { currencyCode: 'LYD', amount: 185400 }, // 185,400 Libyan Dinars
  { currencyCode: 'USD', amount: 48500 },  // $48,500 Cash
  { currencyCode: 'USD_TR', amount: 120000 },
  { currencyCode: 'EUR', amount: 24200 },  // €24,200
  { currencyCode: 'GBP', amount: 8500 },   // £8,500
  { currencyCode: 'TND', amount: 18000 },  // 18,000 TND
  { currencyCode: 'EGP', amount: 50000 },
  { currencyCode: 'TRY', amount: 35000 },
];

export const INITIAL_DAILY_CLOSURE: DailyClosure = {
  id: 'EOD-20260724',
  date: new Date().toISOString().split('T')[0],
  closedAt: '',
  closedBy: '',
  tellerName: 'علي المحمودي',
  branch: 'طرابلس - شارع المدار',
  totalBuyCount: 1,
  totalSellCount: 1,
  totalBuyLyd: 6860,
  totalSellLyd: 3755,
  startingBalances: [
    { currencyCode: 'LYD', amount: 182295 },
    { currencyCode: 'USD', amount: 47500 },
    { currencyCode: 'EUR', amount: 24700 },
    { currencyCode: 'GBP', amount: 8500 },
    { currencyCode: 'TND', amount: 18000 },
  ],
  expectedClosingBalances: [
    { currencyCode: 'LYD', amount: 185400 },
    { currencyCode: 'USD', amount: 48500 },
    { currencyCode: 'EUR', amount: 24200 },
    { currencyCode: 'GBP', amount: 8500 },
    { currencyCode: 'TND', amount: 18000 },
  ],
  actualClosingBalances: [
    { currencyCode: 'LYD', amount: 185400 },
    { currencyCode: 'USD', amount: 48500 },
    { currencyCode: 'EUR', amount: 24200 },
    { currencyCode: 'GBP', amount: 8500 },
    { currencyCode: 'TND', amount: 18000 },
  ],
  variances: [],
  estimatedProfitLyd: 85,
  status: 'OPEN',
  notes: 'الصندوق مفتوح ومتوازن مع البداية'
};
