import React, { useState, useMemo } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { toSvg } from 'html-to-image';
import { GoogleGenAI } from "@google/genai";
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { RegisterTable } from './components/RegisterTable';
import { Accounts } from './components/Accounts';
import { AddTransactionModal } from './components/AddTransactionModal';
import { MOCK_INCOME, MOCK_EXPENSES, MOCK_SUBSCRIPTIONS, MOCK_LOANS, MOCK_INVESTMENTS, MOCK_ACCOUNTS, INITIAL_CATEGORIES } from './constants';
import { IncomeItem, ExpenseItem, SubscriptionItem, LoanItem, InvestmentItem, Account, Category, CategoryType } from './types';

const currency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
const dateFmt = (val: string) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const App: React.FC = () => {
  const [income, setIncome] = useState<IncomeItem[]>(MOCK_INCOME);
  const [expenses, setExpenses] = useState<ExpenseItem[]>(MOCK_EXPENSES);
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>(MOCK_SUBSCRIPTIONS);
  const [loans, setLoans] = useState<LoanItem[]>(MOCK_LOANS);
  const [investments, setInvestments] = useState<InvestmentItem[]>(MOCK_INVESTMENTS);
  const [accounts, setAccounts] = useState<Account[]>(MOCK_ACCOUNTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  
  const [activeModal, setActiveModal] = useState<'Income' | 'Expense' | 'Investment' | null>(null);

  const computedAccounts = useMemo(() => {
    return accounts.map(acc => {
      const accountIncome = income.filter(i => i.paymentMethod === acc.name).reduce((sum, i) => sum + i.netAmount, 0);
      const accountExpenses = expenses.filter(e => e.paymentMethod === acc.name).reduce((sum, e) => sum + e.amount, 0);
      return { ...acc, currentBalance: acc.openingBalance + accountIncome - accountExpenses };
    });
  }, [accounts, income, expenses]);

  const handleSyncInvestments = async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const symbols = investments.map(i => i.symbol || i.name).join(', ');
    
    if (!symbols) return;

    try {
      const prompt = `Return a raw JSON array of current market prices for these assets: ${symbols}. 
      Format: [{"symbol": "AAPL", "price": 185.20}, ...]. 
      Only return the JSON array, no other text.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json"
        },
      });

      const rawJson = response.text?.trim() || "[]";
      const priceData: { symbol: string, price: number }[] = JSON.parse(rawJson);

      setInvestments(prev => prev.map(inv => {
        const found = priceData.find(p => 
          p.symbol.toLowerCase() === (inv.symbol || '').toLowerCase() || 
          p.symbol.toLowerCase() === inv.name.toLowerCase()
        );
        if (found) {
          return {
            ...inv,
            currentValue: inv.quantity * found.price,
            lastUpdated: new Date().toISOString().split('T')[0]
          };
        }
        return inv;
      }));
    } catch (error) {
      console.error("Market Sync Error:", error);
      alert("AI market data fetch failed.");
    }
  };

  const handleAddCategory = (name: string, type: CategoryType) => {
    const newCat: Category = { code: `CAT-${Date.now()}`, name, type, isDiscretionary: true };
    setCategories(prev => [...prev, newCat]);
  };

  const handleSaveTransaction = (data: any) => {
    if (activeModal === 'Income') {
      const item: IncomeItem = { ...data, grossAmount: data.amount, tax: 0, frequency: 'One-off' };
      setIncome(prev => [item, ...prev]);
    } else if (activeModal === 'Expense') {
      const item: ExpenseItem = { ...data, subCategory: data.category, isFixed: false, isEssential: true };
      setExpenses(prev => [item, ...prev]);
    } else if (activeModal === 'Investment') {
      const item: InvestmentItem = {
        ...data,
        date: new Date().toISOString().split('T')[0]
      };
      setInvestments(prev => [item, ...prev]);
    }
    setActiveModal(null);
  };

  const handleAddAccount = (accData: Omit<Account, 'id' | 'currentBalance'>) => {
    const newAcc: Account = { ...accData, id: `ACC-${Date.now()}`, currentBalance: accData.openingBalance };
    setAccounts([...accounts, newAcc]);
  };

  const handleUpdateAccount = (id: string, updates: Partial<Account>) => {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const handleUploadStatement = (accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    if (!account) return;
    if (window.confirm(`Simulate importing statement for ${account.name}?`)) {
      const newIncome: IncomeItem = {
        id: `TRX-IN-ST-${Date.now()}`, date: new Date().toISOString().split('T')[0],
        source: 'Statement Import Reconcile', category: 'Salary', means: 'Salary',
        paymentMethod: account.name, grossAmount: 500, tax: 0, netAmount: 500,
        frequency: 'One-off', notes: 'Simulated Import'
      };
      setIncome(prev => [newIncome, ...prev]);
    }
  };

  const investmentTypes = ['Stock', 'Bond', 'Mutual Fund', 'ETF', 'Crypto', 'Real Estate', 'Other'];

  return (
    <Router>
      <Layout 
        onExport={() => alert('Exporting...')} 
        onExportFigma={() => alert('Figma export complete.')}
      >
        <Routes>
          <Route
            path="/"
            element={
              <>
                <div>This is Margaret's Page Test</div>
              </>
            }
          />

          <Route path="/accounts" element={
            <Accounts accounts={computedAccounts} income={income} expenses={expenses} onAddAccount={handleAddAccount} onUpdateAccount={handleUpdateAccount} onUploadStatement={handleUploadStatement} />
          } />

          <Route path="/income" element={
            <RegisterTable<IncomeItem>
              title="Income" type="Income" data={income} dateField="date"
              onAdd={() => setActiveModal('Income')}
              categories={categories.filter(c => c.type === CategoryType.INCOME).map(c => c.name)}
              columns={[
                { header: 'Date', accessor: 'date', format: dateFmt },
                { header: 'Source', accessor: 'source', className: 'font-black text-slate-900' },
                { header: 'Category', accessor: 'category', className: 'text-[10px] font-bold uppercase' },
                { header: 'Method', accessor: 'paymentMethod', className: 'text-xs text-indigo-500 font-bold' },
                { header: 'Net', accessor: 'netAmount', format: currency, className: 'text-emerald-600 font-black text-right' },
              ]}
            />
          } />

          <Route path="/expenses" element={
            <RegisterTable<ExpenseItem>
              title="Expenses" type="Expense" data={expenses} dateField="date"
              onAdd={() => setActiveModal('Expense')}
              categories={categories.filter(c => c.type === CategoryType.EXPENSE).map(c => c.name)}
              columns={[
                { header: 'Date', accessor: 'date', format: dateFmt },
                { header: 'Payee', accessor: 'vendor', className: 'font-black text-slate-900' },
                { header: 'Category', accessor: 'category' },
                { header: 'Amount', accessor: 'amount', format: currency, className: 'text-rose-600 font-black text-right' },
              ]}
            />
          } />

          <Route path="/subscriptions" element={<RegisterTable<SubscriptionItem> data={subscriptions} title="Subscriptions" type="Expense" dateField="startDate" columns={[{header:'Service', accessor:'serviceName'}]} />} />
          <Route path="/loans" element={<RegisterTable<LoanItem> data={loans} title="Loans" type="Loan" dateField="dateIssued" columns={[{header:'Counterparty', accessor:'counterparty'}]} />} />
          
          <Route path="/investments" element={
            <RegisterTable<InvestmentItem> 
              data={investments} 
              title="Investments" 
              type="Investment"
              dateField="date"
              onAdd={() => setActiveModal('Investment')}
              onSync={handleSyncInvestments}
              categories={investmentTypes}
              columns={[
                { header: 'Asset', accessor: (i) => <div><div className="font-black">{i.name}</div><div className="text-[10px] text-slate-400">{i.symbol}</div></div> },
                { header: 'Platform', accessor: 'platform' },
                { header: 'Qty', accessor: 'quantity' },
                { header: 'Current Value', accessor: 'currentValue', format: currency, className: 'text-indigo-600 font-black' },
                { header: 'ROI', accessor: (i) => {
                  const gain = i.currentValue - i.totalCost;
                  const pct = i.totalCost > 0 ? (gain / i.totalCost) * 100 : 0;
                  return <span className={gain >= 0 ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>{pct.toFixed(2)}%</span>;
                }},
                { header: 'Last Sync', accessor: (i) => <span className="text-[10px] text-slate-400">{i.lastUpdated ? dateFmt(i.lastUpdated) : 'Never'}</span> }
              ]} 
            />
          } />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {activeModal && (
          <AddTransactionModal 
            type={activeModal}
            categories={categories}
            accounts={computedAccounts}
            onClose={() => setActiveModal(null)}
            onSave={handleSaveTransaction}
            onAddCategory={(name) => handleAddCategory(name, activeModal === 'Income' ? CategoryType.INCOME : CategoryType.EXPENSE)}
          />
        )}
      </Layout>
    </Router>
  );
};

export default App;