import React, { useState } from 'react';
import { X, Plus, Save, Tag, TrendingUp, DollarSign, Briefcase, AlertCircle } from 'lucide-react';
import { Category, Account } from '../types';

interface AddTransactionModalProps {
  type: 'Income' | 'Expense' | 'Investment';
  categories: Category[];
  accounts: Account[];
  onClose: () => void;
  onSave: (data: any) => void;
  onAddCategory: (name: string) => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ 
  type, categories, accounts, onClose, onSave, onAddCategory 
}) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    source: '',
    vendor: '',
    description: '',
    category: '',
    amount: '',
    paymentMethod: accounts[0]?.name || '',
    // Investment specific
    symbol: '',
    name: '',
    quantity: '',
    unitPrice: '',
    commission: '0',
    platform: 'Robinhood',
    assetType: 'Stock'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  const filteredCategories = categories.filter(c => c.type.toLowerCase() === (type === 'Investment' ? 'asset' : type.toLowerCase()));

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (type === 'Investment') {
      if (!formData.name.trim()) newErrors.name = "Asset Name is required";
      
      const qty = parseFloat(formData.quantity);
      if (isNaN(qty) || qty <= 0) {
        newErrors.quantity = "Quantity must be a positive number";
      }

      const price = parseFloat(formData.unitPrice);
      if (isNaN(price) || price <= 0) {
        newErrors.unitPrice = "Purchase price must be a positive number";
      }

      const comm = parseFloat(formData.commission || '0');
      if (isNaN(comm) || comm < 0) {
        newErrors.commission = "Commission cannot be negative";
      }
    } else {
      if (!formData.amount || isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
        newErrors.amount = "Valid positive amount is required";
      }
      if (!formData.category) newErrors.category = "Category is required";
      if (type === 'Income' && !formData.source.trim()) newErrors.source = "Source is required";
      if (type === 'Expense' && !formData.vendor.trim()) newErrors.vendor = "Vendor is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    if (type === 'Investment') {
      const qty = parseFloat(formData.quantity);
      const price = parseFloat(formData.unitPrice);
      const comm = parseFloat(formData.commission || '0');
      const cost = (qty * price) + comm;

      onSave({
        ...formData,
        id: `INV-${Date.now()}`,
        quantity: qty,
        unitPrice: price,
        commission: comm,
        totalCost: cost,
        currentValue: cost, // Default to cost on entry
        type: formData.assetType
      });
      return;
    }

    onSave({
      ...formData,
      amount: parseFloat(formData.amount),
      netAmount: parseFloat(formData.amount), // for income
      id: `TRX-${Date.now()}`
    });
  };

  const handleAddCat = () => {
    if (newCatName) {
      onAddCategory(newCatName);
      setFormData({ ...formData, category: newCatName });
      setNewCatName('');
      setShowNewCatInput(false);
      setErrors({ ...errors, category: '' });
    }
  };

  const inputClass = (fieldName: string) => 
    `w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all ${
      errors[fieldName] ? 'border-rose-500 bg-rose-50' : 'border-slate-200'
    }`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${type === 'Investment' ? 'bg-indigo-100 text-indigo-600' : type === 'Income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
              {type === 'Investment' ? <TrendingUp size={20} /> : type === 'Income' ? <DollarSign size={20} /> : <Briefcase size={20} />}
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">New {type} Entry</h3>
              <p className="text-xs text-slate-500">Record {type.toLowerCase()} details for the CFO ledger.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
          {type === 'Investment' ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Name</label>
                  <input 
                    type="text"
                    placeholder="e.g. Apple Inc, Bitcoin"
                    value={formData.name}
                    onChange={e => {
                      setFormData({...formData, name: e.target.value});
                      if (errors.name) setErrors({...errors, name: ''});
                    }}
                    className={inputClass('name')} 
                  />
                  {errors.name && <p className="text-[10px] text-rose-500 flex items-center gap-1 font-bold uppercase tracking-tight"><AlertCircle size={10}/> {errors.name}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ticker / Symbol</label>
                  <input 
                    type="text"
                    placeholder="e.g. AAPL, BTC"
                    value={formData.symbol}
                    onChange={e => setFormData({...formData, symbol: e.target.value.toUpperCase()})}
                    className={inputClass('symbol')} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quantity</label>
                  <input 
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={formData.quantity}
                    onChange={e => {
                      setFormData({...formData, quantity: e.target.value});
                      if (errors.quantity) setErrors({...errors, quantity: ''});
                    }}
                    className={inputClass('quantity')} 
                  />
                  {errors.quantity && <p className="text-[10px] text-rose-500 flex items-center gap-1 font-bold uppercase tracking-tight"><AlertCircle size={10}/> {errors.quantity}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Buy Price (USD)</label>
                  <input 
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={formData.unitPrice}
                    onChange={e => {
                      setFormData({...formData, unitPrice: e.target.value});
                      if (errors.unitPrice) setErrors({...errors, unitPrice: ''});
                    }}
                    className={inputClass('unitPrice')} 
                  />
                  {errors.unitPrice && <p className="text-[10px] text-rose-500 flex items-center gap-1 font-bold uppercase tracking-tight"><AlertCircle size={10}/> {errors.unitPrice}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Type</label>
                  <select 
                    value={formData.assetType}
                    onChange={e => setFormData({...formData, assetType: e.target.value})}
                    className={inputClass('assetType')}
                  >
                    <option value="Stock">Stock</option>
                    <option value="Crypto">Crypto</option>
                    <option value="ETF">ETF</option>
                    <option value="Real Estate">Real Estate</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Platform / Custodian</label>
                <input 
                  type="text"
                  placeholder="e.g. Fidelity, Coinbase, Binance"
                  value={formData.platform}
                  onChange={e => setFormData({...formData, platform: e.target.value})}
                  className={inputClass('platform')} 
                />
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction Date</label>
                  <input 
                      type="date"
                      value={formData.date}
                      onChange={e => setFormData({...formData, date: e.target.value})}
                      className={inputClass('date')} 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount (USD)</label>
                  <input 
                      type="number"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={e => {
                        setFormData({...formData, amount: e.target.value});
                        if (errors.amount) setErrors({...errors, amount: ''});
                      }}
                      className={inputClass('amount')} 
                  />
                  {errors.amount && <p className="text-[10px] text-rose-500 flex items-center gap-1 font-bold uppercase tracking-tight"><AlertCircle size={10}/> {errors.amount}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {type === 'Income' ? 'Income Source' : 'Vendor / Payee'}
                </label>
                <input 
                  type="text"
                  placeholder={type === 'Income' ? "e.g. Client X, Poker Win" : "e.g. Whole Foods"}
                  value={type === 'Income' ? formData.source : formData.vendor}
                  onChange={e => {
                    const val = e.target.value;
                    setFormData(type === 'Income' ? {...formData, source: val} : {...formData, vendor: val});
                    const field = type === 'Income' ? 'source' : 'vendor';
                    if (errors[field]) setErrors({...errors, [field]: ''});
                  }}
                  className={inputClass(type === 'Income' ? 'source' : 'vendor')} 
                />
                {errors[type === 'Income' ? 'source' : 'vendor'] && <p className="text-[10px] text-rose-500 flex items-center gap-1 font-bold uppercase tracking-tight"><AlertCircle size={10}/> {errors[type === 'Income' ? 'source' : 'vendor']}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex justify-between">
                    Category
                    <button 
                      type="button"
                      onClick={() => setShowNewCatInput(!showNewCatInput)}
                      className="text-indigo-600 hover:text-indigo-800 lowercase tracking-normal font-bold"
                    >
                      + new
                    </button>
                  </label>
                  {showNewCatInput ? (
                    <div className="flex gap-2">
                      <input 
                          type="text" 
                          autoFocus
                          placeholder="Category name..."
                          className="flex-1 px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-lg text-sm focus:outline-none"
                          value={newCatName}
                          onChange={e => setNewCatName(e.target.value)}
                      />
                      <button type="button" onClick={handleAddCat} className="p-2 bg-indigo-600 text-white rounded-lg"><Plus size={16}/></button>
                    </div>
                  ) : (
                    <select 
                        value={formData.category}
                        onChange={e => {
                          setFormData({...formData, category: e.target.value});
                          if (errors.category) setErrors({...errors, category: ''});
                        }}
                        className={inputClass('category')}
                    >
                        <option value="">Select Category</option>
                        {filteredCategories.map(c => <option key={c.code} value={c.name}>{c.name}</option>)}
                    </select>
                  )}
                  {errors.category && !showNewCatInput && <p className="text-[10px] text-rose-500 flex items-center gap-1 font-bold uppercase tracking-tight"><AlertCircle size={10}/> {errors.category}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Account</label>
                  <select 
                      value={formData.paymentMethod}
                      onChange={e => setFormData({...formData, paymentMethod: e.target.value})}
                      className={inputClass('paymentMethod')}
                  >
                      {accounts.map(acc => <option key={acc.id} value={acc.name}>{acc.name}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-4">
           <button 
            type="button"
            onClick={onClose}
            className="flex-1 py-3 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
           >
             Cancel
           </button>
           <button 
            type="button"
            onClick={handleSave}
            className="flex-1 py-3 bg-slate-900 text-white rounded-xl shadow-lg hover:bg-slate-800 transition-all font-bold flex items-center justify-center gap-2"
           >
             <Save size={18} />
             Commit to Portfolio
           </button>
        </div>
      </div>
    </div>
  );
};