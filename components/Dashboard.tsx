import React, { useMemo, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { ArrowUpRight, ArrowDownRight, DollarSign, Wallet, TrendingUp, Sparkles, AlertCircle } from 'lucide-react';
import { IncomeItem, ExpenseItem, SubscriptionItem, LoanItem, InvestmentItem } from '../types';

interface DashboardProps {
  income: IncomeItem[];
  expenses: ExpenseItem[];
  subscriptions: SubscriptionItem[];
  loans: LoanItem[];
  investments?: InvestmentItem[];
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
type TimeRange = 'Days' | 'Weeks' | 'Months' | 'Years';

export const Dashboard: React.FC<DashboardProps> = ({ income, expenses, subscriptions, loans, investments = [] }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('Months');

  const metrics = useMemo(() => {
    const totalIncome = income.reduce((acc, item) => acc + item.netAmount, 0);
    const totalExpense = expenses.reduce((acc, item) => acc + item.amount, 0);
    const netSavings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;
    const outstandingLoans = loans.filter(l => l.type === 'Lent').reduce((acc, l) => acc + l.outstanding, 0);
    const totalInvested = investments.reduce((acc, i) => acc + i.currentValue, 0);
    
    // Wealth Ratio Calculation
    const totalAssets = totalInvested + totalIncome; // Simple proxy
    const liquidityRatio = totalAssets > 0 ? (totalIncome / totalAssets) * 100 : 0;

    return { totalIncome, totalExpense, netSavings, savingsRate, outstandingLoans, totalInvested, liquidityRatio };
  }, [income, expenses, loans, investments]);

  const cashFlowData = useMemo(() => {
    const refDate = new Date('2024-02-29'); 
    let iterations = 0;
    let step: (d: Date, i: number) => void;
    let formatLabel: (d: Date) => string;
    let getBucketKey: (d: Date) => string;

    if (timeRange === 'Days') {
      iterations = 30;
      step = (d, i) => d.setDate(d.getDate() - i);
      formatLabel = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      getBucketKey = (d) => d.toISOString().split('T')[0];
    } else if (timeRange === 'Weeks') {
      iterations = 12;
      step = (d, i) => d.setDate(d.getDate() - (i * 7));
      formatLabel = (d) => {
         const startOfWeek = new Date(d);
         const day = startOfWeek.getDay();
         const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
         startOfWeek.setDate(diff);
         return `W${Math.ceil(startOfWeek.getDate()/7)} ${startOfWeek.toLocaleDateString('en-US', { month: 'short' })}`;
      };
      getBucketKey = (d) => {
         const startOfWeek = new Date(d);
         const day = startOfWeek.getDay();
         const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
         startOfWeek.setDate(diff);
         return startOfWeek.toISOString().split('T')[0];
      };
    } else if (timeRange === 'Months') {
      iterations = 12;
      step = (d, i) => d.setMonth(d.getMonth() - i);
      formatLabel = (d) => d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      getBucketKey = (d) => `${d.getFullYear()}-${d.getMonth()}`;
    } else {
      iterations = 5;
      step = (d, i) => d.setFullYear(d.getFullYear() - i);
      formatLabel = (d) => d.getFullYear().toString();
      getBucketKey = (d) => d.getFullYear().toString();
    }

    const buckets: Record<string, { label: string; income: number; expense: number; sortDate: number }> = {};
    for (let i = iterations - 1; i >= 0; i--) {
        const d = new Date(refDate);
        step(d, i);
        const key = getBucketKey(d);
        buckets[key] = { label: formatLabel(d), income: 0, expense: 0, sortDate: d.getTime() };
    }

    income.forEach(item => {
        const d = new Date(item.date);
        if (d > refDate) return;
        const key = getBucketKey(d);
        if (buckets[key]) buckets[key].income += item.netAmount;
    });
    expenses.forEach(item => {
        const d = new Date(item.date);
        if (d > refDate) return;
        const key = getBucketKey(d);
        if (buckets[key]) buckets[key].expense += item.amount;
    });

    return Object.values(buckets).sort((a, b) => a.sortDate - b.sortDate).map(b => ({
        name: b.label, Income: b.income, Expenses: b.expense, Net: b.income - b.expense
    }));
  }, [income, expenses, timeRange]);

  const wealthAllocationData = useMemo(() => [
    { name: 'Savings & Cash', value: metrics.totalIncome },
    { name: 'Investments', value: metrics.totalInvested },
    { name: 'Receivables', value: metrics.outstandingLoans }
  ], [metrics]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <MetricCard title="Total Net Income" value={metrics.totalIncome} icon={ArrowUpRight} trend="+12.5%" color="text-emerald-600" bg="bg-emerald-50" />
        <MetricCard title="Total Expenses" value={metrics.totalExpense} icon={ArrowDownRight} trend="-2.4%" color="text-rose-600" bg="bg-rose-50" />
        <MetricCard title="Net Savings" value={metrics.netSavings} icon={Wallet} trend={`${metrics.savingsRate.toFixed(1)}% Rate`} color="text-indigo-600" bg="bg-indigo-50" />
        <MetricCard title="Investments" value={metrics.totalInvested} icon={TrendingUp} trend="Market Value" color="text-blue-600" bg="bg-blue-50" />
        <MetricCard title="Receivables" value={metrics.outstandingLoans} icon={DollarSign} trend="Outstanding" color="text-amber-600" bg="bg-amber-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <h3 className="font-semibold text-slate-800">Cash Flow & Savings</h3>
              <div className="flex bg-slate-100 p-1 rounded-lg self-start sm:self-auto">
                {(['Days', 'Weeks', 'Months', 'Years'] as TimeRange[]).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                      timeRange === range ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cashFlowData}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                    <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} minTickGap={20} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(v) => `$${v}`} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(v: number) => [`$${new Intl.NumberFormat('en-US').format(v)}`, '']} />
                  <Legend iconType="circle" />
                  <Area type="monotone" dataKey="Income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={2} />
                  <Area type="monotone" dataKey="Expenses" stroke="#ef4444" fillOpacity={0} fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
                  <Area type="monotone" dataKey="Net" stroke="#6366f1" fillOpacity={1} fill="url(#colorNet)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-indigo-900 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl">
             <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={18} className="text-indigo-400" />
                  <h3 className="text-xs font-black uppercase tracking-[0.2em]">CFO Strategic Briefing</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-4">
                      <p className="text-sm text-indigo-100 leading-relaxed">
                        Your wealth is currently <strong>{metrics.liquidityRatio.toFixed(1)}% liquid</strong>. 
                        A healthy CFO strategy typically aims for 20-30% liquidity for emergencies, with the rest diversified in market assets.
                      </p>
                      <div className="flex items-center gap-3">
                         <div className={`p-2 rounded-full ${metrics.liquidityRatio > 50 ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                            {metrics.liquidityRatio > 50 ? <AlertCircle size={16} /> : <TrendingUp size={16} />}
                         </div>
                         <span className="text-xs font-bold">
                            {metrics.liquidityRatio > 50 ? 'High Liquidity: Consider Market Deployment' : 'Optimized Allocation Detected'}
                         </span>
                      </div>
                   </div>
                   <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <h4 className="text-[10px] font-black uppercase text-indigo-300 mb-2">Investment Velocity</h4>
                      <div className="flex items-end gap-2">
                        <span className="text-2xl font-black">${new Intl.NumberFormat().format(metrics.totalInvested)}</span>
                        <span className="text-xs text-emerald-400 font-bold pb-1">Total Exposure</span>
                      </div>
                   </div>
                </div>
             </div>
             <div className="absolute right-0 bottom-0 opacity-10">
                <TrendingUp size={200} />
             </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-semibold text-slate-800 mb-6">Wealth Allocation</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={wealthAllocationData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {wealthAllocationData.map((e, i) => <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => `$${v}`} />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Investment Snap</h3>
             <div className="space-y-4">
                {investments.slice(0, 3).map((inv, idx) => (
                   <div key={idx} className="flex justify-between items-center group">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{inv.symbol || inv.name}</p>
                        <p className="text-[10px] text-slate-400 uppercase">{inv.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-indigo-600">${new Intl.NumberFormat().format(inv.currentValue)}</p>
                        <p className={`text-[10px] font-bold ${inv.currentValue >= inv.totalCost ? 'text-emerald-500' : 'text-rose-500'}`}>
                           {(((inv.currentValue - inv.totalCost) / inv.totalCost) * 100).toFixed(1)}% ROI
                        </p>
                      </div>
                   </div>
                ))}
                {investments.length === 0 && <p className="text-xs text-slate-400 text-center py-4 italic">No market assets recorded.</p>}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, icon: Icon, trend, color, bg }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)}</h3>
      </div>
      <div className={`p-3 rounded-lg ${bg} ${color}`}><Icon size={20} /></div>
    </div>
    <div className="mt-4 flex items-center text-sm">
      <span className={`font-medium ${color}`}>{trend}</span>
      <span className="text-slate-400 ml-2">vs last month</span>
    </div>
  </div>
);