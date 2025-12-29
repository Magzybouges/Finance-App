import { Category, CategoryType, IncomeItem, ExpenseItem, SubscriptionItem, LoanItem, InvestmentItem, Account } from './types';

export const INITIAL_CATEGORIES: Category[] = [
  { code: 'INC01', name: 'Salary', type: CategoryType.INCOME, isDiscretionary: false },
  { code: 'INC02', name: 'Freelance', type: CategoryType.INCOME, isDiscretionary: true },
  { code: 'INC03', name: 'Game Wins', type: CategoryType.INCOME, isDiscretionary: true },
  { code: 'INC04', name: 'Investments', type: CategoryType.INCOME, isDiscretionary: true },
  { code: 'EXP01', name: 'Housing', type: CategoryType.EXPENSE, subCategory: 'Rent', isDiscretionary: false },
  { code: 'EXP02', name: 'Food', type: CategoryType.EXPENSE, subCategory: 'Groceries', isDiscretionary: false },
  { code: 'EXP03', name: 'Food', type: CategoryType.EXPENSE, subCategory: 'Dining Out', isDiscretionary: true },
  { code: 'EXP04', name: 'Transport', type: CategoryType.EXPENSE, subCategory: 'Fuel', isDiscretionary: false },
];

export const MOCK_ACCOUNTS: Account[] = [
  { id: 'ACC1', name: 'Chase Checking', institution: 'Chase', type: 'Checking', openingBalance: 5000, currentBalance: 11420, currency: 'USD' },
  { id: 'ACC2', name: 'Amex Gold', institution: 'American Express', type: 'Credit Card', openingBalance: -200, currentBalance: -1450, currency: 'USD' },
  { id: 'ACC3', name: 'Emergency Fund', institution: 'Ally', type: 'Savings', openingBalance: 20000, currentBalance: 30360, currency: 'USD' },
];

export const MOCK_INCOME: IncomeItem[] = [
  {
    id: 'TRX-IN-101', date: '2024-02-28', source: 'Tech Corp', category: 'Salary', means: 'Salary',
    paymentMethod: 'Chase Checking', grossAmount: 8000, tax: 2000, netAmount: 6000, frequency: 'Monthly', notes: 'Feb Salary'
  },
  {
    id: 'TRX-IN-102', date: '2024-02-25', source: 'Poker Night', category: 'Game Wins', means: 'Gift',
    paymentMethod: 'Chase Checking', grossAmount: 450, tax: 0, netAmount: 450, frequency: 'One-off', notes: 'Weekend winnings'
  }
];

export const MOCK_EXPENSES: ExpenseItem[] = [
  {
    id: 'TRX-EX-501', date: '2024-02-02', category: 'Housing', subCategory: 'Rent', description: 'Monthly Rent',
    vendor: 'Landlord LLC', paymentMethod: 'Chase Checking', isFixed: true, isEssential: true, amount: 2200
  }
];

export const MOCK_SUBSCRIPTIONS: SubscriptionItem[] = [];
export const MOCK_LOANS: LoanItem[] = [];

export const MOCK_INVESTMENTS: InvestmentItem[] = [
  {
    id: 'INV-001', date: '2023-10-15', type: 'Stock', symbol: 'AAPL', name: 'Apple Inc.', 
    platform: 'Robinhood', quantity: 10, unitPrice: 150, commission: 0, totalCost: 1500, currentValue: 1850,
    lastUpdated: '2024-03-01'
  },
  {
    id: 'INV-002', date: '2023-11-20', type: 'Crypto', symbol: 'BTC', name: 'Bitcoin', 
    platform: 'Coinbase', quantity: 0.05, unitPrice: 35000, commission: 20, totalCost: 1770, currentValue: 3200,
    lastUpdated: '2024-03-01'
  }
];
