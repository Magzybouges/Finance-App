import React, { useState, useMemo } from 'react';
import { Calendar, Filter, TrendingUp, TrendingDown, Minus, ArrowRight, Search, Tag, Inbox, RefreshCw, Loader2 } from 'lucide-react';
import { TimeFilterRange } from '../types';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
  format?: (value: any) => string;
}

interface RegisterTableProps<T> {
  title: string;
  data: T[];
  columns: Column<T>[];
  onAdd?: () => void;
  onSync?: () => Promise<void>;
  dateField?: keyof T;
  type?: 'Income' | 'Expense' | 'Loan' | 'Investment' | 'Generic';
  categories?: string[];
}

export function RegisterTable<T extends { id: string }>({ 
  title, 
  data, 
  columns, 
  onAdd,
  onSync,
  dateField = 'date' as keyof T,
  type = 'Generic',
  categories = []
}: RegisterTableProps<T>) {
  const [timeFilter, setTimeFilter] = useState<TimeFilterRange>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isSyncing, setIsSyncing] = useState(false);

  const getAmount = (item: any): number => {
    return item.amount || item.netAmount || item.principal || item.currentValue || 0;
  };

  const filteredData = useMemo(() => {
    let result = [...data];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => {
        const str = JSON.stringify(item).toLowerCase();
        return str.includes(query);
      });
    }

    if (selectedCategory !== 'All') {
      result = result.filter((item: any) => {
        if (type === 'Investment') {
          return item.type === selectedCategory;
        }
        return item.category === selectedCategory;
      });
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const oneDay = 24 * 60 * 60 * 1000;

    if (timeFilter !== 'All') {
      result = result.filter(item => {
        const d = new Date(item[dateField] as unknown as string).getTime();
        const diffDays = (todayStart - d) / oneDay;
        
        switch (timeFilter) {
          case 'Today': return diffDays >= 0 && diffDays < 1;
          case 'Week': return diffDays >= 0 && diffDays < 7;
          case 'Month': return diffDays >= 0 && diffDays < 30;
          case 'Year': return diffDays >= 0 && diffDays < 365;
          default: return true;
        }
      });
    }

    return result;
  }, [data, timeFilter, searchQuery, selectedCategory, dateField, type]);

  const analysis = useMemo(() => {
    const currentTotal = filteredData.reduce((sum, i) => sum + getAmount(i), 0);
    const totalDataAmount = data.reduce((sum, i) => sum + getAmount(i), 0);
    const growth = totalDataAmount > 0 ? (currentTotal / totalDataAmount) * 100 : 0;

    return { 
        currentTotal, 
        growth, 
        count: filteredData.length,
        isGood: type === 'Expense' ? currentTotal < totalDataAmount / 2 : currentTotal > totalDataAmount / 2
    };
  }, [data, filteredData, type]);

  const handleSync = async () => {
    if (!onSync) return;
    setIsSyncing(true);
    try {
      await onSync();
    } finally {
      setIsSyncing(false);
    }
  };

  const currency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-1">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title} Velocity</h2>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-slate-900">{currency(analysis.currentTotal)}</span>
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                analysis.isGood ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}>
                {analysis.isGood ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {analysis.growth.toFixed(0)}% Share
              </div>
            </div>
            <p className="text-xs text-slate-500">Period analysis for {timeFilter}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100 w-full lg:w-auto">
            {(['Today', 'Week', 'Month', 'Year', 'All'] as TimeFilterRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeFilter(range)}
                className={`flex-1 lg:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  timeFilter === range
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 pt-4 border-t border-slate-100">
           <div className="relative flex-1 group">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text"
                placeholder="Search records..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
           
           <div className="flex items-center gap-2">
              <Tag size={16} className="text-slate-400" />
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[160px]"
              >
                <option value="All">{type === 'Investment' ? 'All Asset Types' : 'All Categories'}</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
           </div>

           <div className="flex gap-2">
             {type === 'Investment' && onSync && (
               <button 
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="px-4 py-2 bg-indigo-50 text-indigo-700 text-sm font-bold rounded-lg hover:bg-indigo-100 transition-all border border-indigo-200 flex items-center gap-2 disabled:opacity-50"
               >
                  {isSyncing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                  Sync Prices
               </button>
             )}
             <button 
                onClick={onAdd}
                className="px-6 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-all shadow-lg active:scale-95"
             >
                Add New
             </button>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col flex-1 overflow-hidden min-h-[400px] relative">
        {isSyncing && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center gap-4">
             <div className="relative">
                <RefreshCw size={48} className="text-indigo-600 animate-spin" />
                <TrendingUp size={20} className="absolute -top-1 -right-1 text-emerald-500 animate-bounce" />
             </div>
             <div className="text-center">
               <h4 className="font-bold text-slate-900">Fetching Market Pulse</h4>
               <p className="text-xs text-slate-500">Gemini AI is querying real-time stock & crypto data...</p>
             </div>
          </div>
        )}

        {filteredData.length > 0 ? (
          <div className="overflow-auto flex-1 custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 sticky top-0 z-10">
                <tr>
                  {columns.map((col, idx) => (
                    <th key={idx} className={`px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 ${col.className || ''}`}>
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                    {columns.map((col, idx) => {
                      let content;
                      if (typeof col.accessor === 'function') {
                        content = col.accessor(item);
                      } else {
                        const value = item[col.accessor];
                        content = col.format ? col.format(value) : value;
                      }
                      return (
                        <td key={idx} className={`px-6 py-4 text-sm text-slate-600 ${col.className || ''}`}>
                          {content as React.ReactNode}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100">
               <Inbox size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Audit: No Data Found</h3>
            <p className="text-sm text-slate-500 max-w-xs mx-auto">No transactions matching your criteria.</p>
          </div>
        )}
        
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
           <span>Verified CFO Ledger</span>
           <div className="flex items-center gap-1 text-indigo-500">
              <ArrowRight size={10} />
              Reconciliation Active
           </div>
        </div>
      </div>
    </div>
  );
}