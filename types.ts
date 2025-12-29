export enum TransactionType {
  INCOME = 'Income',
  EXPENSE = 'Expense',
  SUBSCRIPTION = 'Subscription',
  LOAN = 'Loan',
  FAMILY = 'Family',
  INVESTMENT = 'Investment',
}

export type TimeFilterRange = 'Today' | 'Week' | 'Month' | 'Year' | 'All';

export enum CategoryType {
  INCOME = 'Income',
  EXPENSE = 'Expense',
  ASSET = 'Asset',
  LIABILITY = 'Liability',
}

export interface Category {
  code: string;
  name: string;
  type: CategoryType;
  subCategory?: string;
  isDiscretionary: boolean;
}

export interface IncomeItem {
  id: string;
  date: string;
  source: string;
  category: string;
  means: 'Salary' | 'Business' | 'Freelance' | 'Investment' | 'Gift';
  paymentMethod: string;
  grossAmount: number;
  tax: number;
  netAmount: number;
  frequency: 'One-off' | 'Weekly' | 'Monthly' | 'Annual';
  notes?: string;
}

export interface ExpenseItem {
  id: string;
  date: string;
  category: string;
  subCategory: string;
  description: string;
  vendor: string;
  paymentMethod: string;
  isFixed: boolean;
  isEssential: boolean;
  amount: number;
  subscriptionId?: string;
}

export interface SubscriptionItem {
  id: string;
  serviceName: string;
  category: string;
  startDate: string;
  billingFrequency: 'Monthly' | 'Annual';
  monthlyCost: number;
  paymentMethod: string;
  renewalDate: string;
  autoRenew: boolean;
  status: 'Active' | 'Cancelled' | 'Paused';
}

export interface LoanItem {
  id: string;
  counterparty: string;
  type: 'Lent' | 'Borrowed';
  principal: number;
  dateIssued: string;
  expectedReturn: string;
  recovered: number;
  outstanding: number; 
  status: 'Open' | 'Partially Repaid' | 'Closed';
}

export interface InvestmentItem {
  id: string;
  date: string;
  type: 'Stock' | 'Bond' | 'Mutual Fund' | 'ETF' | 'Crypto' | 'Real Estate' | 'Other';
  symbol?: string;
  name: string;
  platform: string;
  quantity: number;
  unitPrice: number;
  commission: number;
  totalCost: number;
  currentValue: number;
  lastUpdated?: string;
  notes?: string;
}

export interface Account {
  id: string;
  name: string;
  institution: string;
  type: 'Checking' | 'Savings' | 'Wallet' | 'Credit Card' | 'Cash';
  openingBalance: number;
  currentBalance: number;
  currency: string;
  targetBalance?: number; // CFO Savings Goal
}

export interface ChartDataPoint {
  name: string;
  value: number;
  fill?: string;
}