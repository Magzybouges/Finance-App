import React, { useState } from 'react';
import { Landmark, Plus, Upload, CreditCard, Wallet, ArrowUpRight, ArrowDownRight, MoreVertical, Trophy, Target, Sparkles } from 'lucide-react';
import { Account, IncomeItem, ExpenseItem } from '../types';

interface AccountsProps {
  accounts: Account[];
  income: IncomeItem[];
  expenses: ExpenseItem[];
  onAddAccount: (account: Omit<Account, 'id' | 'currentBalance'>) => void;
  onUpdateAccount: (id: string, updates: Partial<Account>) => void;
  onUploadStatement: (accountId: string) => void;
}

export const Accounts: React.FC<AccountsProps> = ({ accounts, income, expenses, onAddAccount, onUpdateAccount, onUploadStatement }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [newAcc, setNewAcc] = useState<Partial<Account>>({
    name: '', institution: '', type: 'Checking', openingBalance: 0, currency: 'USD'
  });

  const sortedAccounts = [...accounts].sort((a, b) => b.currentBalance - a.currentBalance);
  const topAccount = sortedAccounts[0];

  const currencyFmt = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Banking & Liquidity</h1>
          <p className="text-slate-500">Capital reserves management and savings targets.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-sm self-start"
        >
          <Plus size={18} />
          Connect New Account
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-indigo-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-indigo-500/30 rounded-lg">
                <Trophy size={20} className="text-indigo-200" />
              </div>
              <span className="text-indigo-100 font-medium uppercase tracking-wider text-xs">Primary Liquidity Source</span>
            </div>
            {topAccount && (
              <div>
                <h2 className="text-4xl font-bold mb-1">{currencyFmt(topAccount.currentBalance)}</h2>
                <p className="text-indigo-100 opacity-90">in {topAccount.institution} • {topAccount.name}</p>
              </div>
            )}
            <div className="mt-8 flex gap-4">
               <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/5">
                 <p className="text-[10px] text-indigo-200 uppercase font-bold">Total Accounts</p>
                 <p className="text-lg font-bold">{accounts.length}</p>
               </div>
               <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/5">
                 <p className="text-[10px] text-indigo-200 uppercase font-bold">Combined Cash</p>
                 <p className="text-lg font-bold">{currencyFmt(accounts.reduce((a,b) => a + b.currentBalance, 0))}</p>
               </div>
            </div>
          </div>
          <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Savings Progress</h3>
            <Sparkles size={16} className="text-indigo-500" />
          </div>
          <div className="space-y-6 flex-1">
            {accounts.filter(acc => acc.targetBalance).map(acc => {
              const progress = Math.min((acc.currentBalance / (acc.targetBalance || 1)) * 100, 100);
              return (
                <div key={acc.id} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs font-bold text-slate-800">{acc.name}</p>
                      <p className="text-[10px] text-slate-400">Target: {currencyFmt(acc.targetBalance || 0)}</p>
                    </div>
                    <span className={`text-xs font-black ${progress >= 100 ? 'text-emerald-500' : 'text-indigo-600'}`}>
                      {progress.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${progress >= 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {accounts.filter(acc => acc.targetBalance).length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <Target size={32} className="text-slate-200 mb-2" />
                <p className="text-xs text-slate-400">No savings targets set. Select an account to set a CFO goal.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {accounts.map(acc => {
          const Icon = acc.type === 'Credit Card' ? CreditCard : acc.type === 'Wallet' ? Wallet : Landmark;
          const isEditing = editingGoal === acc.id;
          
          return (
            <div key={acc.id} className="bg-white border border-slate-200 rounded-xl hover:border-indigo-200 transition-all hover:shadow-md overflow-hidden flex flex-col group">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-3 rounded-xl ${acc.type === 'Credit Card' ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'}`}>
                    <Icon size={24} />
                  </div>
                  <div className="relative">
                    <button onClick={() => setEditingGoal(isEditing ? null : acc.id)} className="text-slate-300 hover:text-slate-600">
                      <Target size={20} className={acc.targetBalance ? 'text-indigo-400' : ''} />
                    </button>
                    {isEditing && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-30 p-4">
                         <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Set Savings Goal</label>
                         <input 
                            type="number"
                            autoFocus
                            placeholder="Target amount..."
                            className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg mb-2"
                            defaultValue={acc.targetBalance}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                onUpdateAccount(acc.id, { targetBalance: parseFloat((e.target as HTMLInputElement).value) });
                                setEditingGoal(null);
                              }
                            }}
                         />
                         <p className="text-[8px] text-slate-400 leading-tight">Press Enter to save target valuation.</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mb-2">
                  <p className="text-xs font-semibold text-slate-400 uppercase">{acc.institution}</p>
                  <h4 className="text-lg font-bold text-slate-800">{acc.name}</h4>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-slate-900">{currencyFmt(acc.currentBalance)}</span>
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-emerald-600 font-medium">
                    <ArrowUpRight size={14} />
                    Active
                  </div>
                  <span className="text-slate-400">{acc.type} • {acc.currency}</span>
                </div>
              </div>

              <div className="bg-slate-50 p-3 flex gap-2">
                <button 
                  onClick={() => onUploadStatement(acc.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <Upload size={14} />
                  Upload Statement
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">Connect New Account</h3>
              <p className="text-sm text-slate-500">Add a bank or credit account to your system.</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Account Name</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="e.g. Daily Spending"
                  onChange={e => setNewAcc({...newAcc, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Financial Institution</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="e.g. Chase, Amex, PayPal"
                  onChange={e => setNewAcc({...newAcc, institution: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Type</label>
                  <select 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    onChange={e => setNewAcc({...newAcc, type: e.target.value as any})}
                  >
                    <option value="Checking">Checking</option>
                    <option value="Savings">Savings</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Wallet">Digital Wallet</option>
                    <option value="Cash">Petty Cash</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Opening Balance</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="0.00"
                    onChange={e => setNewAcc({...newAcc, openingBalance: Number(e.target.value)})}
                  />
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-50 flex gap-3">
              <button 
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  onAddAccount(newAcc as any);
                  setShowAddModal(false);
                }}
                className="flex-1 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl shadow-lg hover:bg-slate-800 transition-colors"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};