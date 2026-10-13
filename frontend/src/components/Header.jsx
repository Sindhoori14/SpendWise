import React from 'react';
import { Wallet, Plus, RefreshCw } from 'lucide-react';

export default function Header({ onOpenAddModal, onRefresh, isRefreshing }) {
  return (
    <header className="app-header">
      <div className="header-container">
        <div className="brand-group">
          <div className="logo-badge">
            <Wallet className="logo-icon" size={24} />
          </div>
          <div>
            <h1 className="brand-title">SpendWise</h1>
            <p className="brand-subtitle">Smart Personal Expense & Income Tracker</p>
          </div>
        </div>

        <div className="header-actions">
          <div className="currency-pill">
            <span className="currency-dot"></span>
            <span className="currency-label">Currency: Indian Rupee (₹)</span>
          </div>

          <button
            className="btn-icon"
            onClick={onRefresh}
            title="Refresh data"
            disabled={isRefreshing}
          >
            <RefreshCw size={18} className={isRefreshing ? 'spin' : ''} />
          </button>

          <button
            className="btn-primary"
            onClick={onOpenAddModal}
          >
            <Plus size={18} />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>
    </header>
  );
}
