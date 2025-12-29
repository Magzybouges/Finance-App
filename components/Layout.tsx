import React from 'react';
import { LayoutDashboard, Wallet, CreditCard, Repeat, Users, ArrowLeftRight, Settings, PlusCircle, TrendingUp, Download, Image as ImageIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  onExport?: () => void;
  onExportFigma?: () => void;
}

const NavItem = ({ to, icon: Icon, label, active }: { to: string; icon: any; label: string; active: boolean }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
      active
        ? 'bg-slate-900 text-white shadow-md'
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
    }`}
  >
    <Icon size={18} />
    {label}
  </Link>
);

export const Layout: React.FC<LayoutProps> = ({ children, onExport, onExportFigma }) => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <div>
              <h1 className="font-bold text-slate-900 leading-tight">CFO Tracker</h1>
              <p className="text-xs text-slate-500">Personal Finance</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-2 px-4">Overview</div>
          <NavItem to="/" icon={LayoutDashboard} label="Dashboard" active={path === '/'} />
          <NavItem to="/accounts" icon={Wallet} label="Accounts" active={path === '/accounts'} />

          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-6 px-4">Registers</div>
          <NavItem to="/income" icon={PlusCircle} label="Income" active={path === '/income'} />
          <NavItem to="/expenses" icon={CreditCard} label="Expenses" active={path === '/expenses'} />
          <NavItem to="/loans" icon={ArrowLeftRight} label="Loans & Debts" active={path === '/loans'} />
          <NavItem to="/investments" icon={TrendingUp} label="Investments" active={path === '/investments'} />

          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-6 px-4">Tracking</div>
          <NavItem to="/subscriptions" icon={Repeat} label="Subscriptions" active={path === '/subscriptions'} />
          <NavItem to="/family" icon={Users} label="Family & Gifts" active={path === '/family'} />

          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-6 px-4">System</div>
          <NavItem to="/categories" icon={Settings} label="Categories" active={path === '/categories'} />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-900 rounded-xl p-4 text-white">
            <p className="text-xs text-slate-400 mb-1">Total Net Worth</p>
            <p className="text-xl font-bold">$40,330.00</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 md:px-8">
            <h2 className="text-lg font-semibold text-slate-800 capitalize">
                {path === '/' ? 'Financial Overview' : path.replace('/', '').replace('-', ' ')}
            </h2>
            <div className="flex items-center gap-3">
                {onExportFigma && (
                  <button 
                    onClick={onExportFigma}
                    title="Download editable design file for Figma"
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-md transition-all"
                  >
                    <ImageIcon size={14} />
                    Export to Figma
                  </button>
                )}
                {onExport && (
                  <button 
                    onClick={onExport}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors"
                  >
                    <Download size={14} />
                    Download Excel
                  </button>
                )}
                <div className="h-6 w-px bg-slate-200 mx-2 hidden md:block"></div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-500 hidden md:inline">Last synced: Just now</span>
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs border border-indigo-200">
                      JD
                  </div>
                </div>
            </div>
        </header>
        {/* Added ID for capturing */}
        <div id="main-dashboard-content" className="flex-1 overflow-auto bg-slate-50 p-6 md:p-8 custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
};