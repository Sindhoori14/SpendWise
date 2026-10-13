import React from 'react';
import { TrendingUp, TrendingDown, Scale, PiggyBank, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export default function SummaryCards({ summary, loading }) {
  const totalIncome = summary?.total_income || 0;
  const totalExpenses = summary?.total_expenses || 0;
  const balance = summary?.balance || 0;
  const incomeCount = summary?.income_count || 0;
  const expenseCount = summary?.expense_count || 0;
  const txCount = summary?.transaction_count || 0;

  const savingsRate = totalIncome > 0
    ? Math.max(-100, Math.min(100, Math.round(((totalIncome - totalExpenses) / totalIncome) * 100)))
    : 0;

  return (
    <section className="summary-section">
      <div className="cards-grid">
        {/* Net Balance Card */}
        <div className={`summary-card card-balance ${balance < 0 ? 'card-negative' : ''}`}>
          <div className="card-top">
            <span className="card-label">Net Balance</span>
            <div className="card-icon-wrapper icon-balance">
              <Scale size={20} />
            </div>
          </div>
          <div className="card-body">
            <h2 className="card-value">
              {loading ? <span className="skeleton-text">₹...,...</span> : formatCurrency(balance)}
            </h2>
          </div>
          <div className="card-footer">
            <span className={`status-badge ${balance >= 0 ? 'badge-positive' : 'badge-negative'}`}>
              {balance >= 0 ? 'Healthy Balance' : 'Budget Deficit'}
            </span>
            <span className="card-meta">
              {txCount} total record{txCount === 1 ? '' : 's'}
            </span>
          </div>
        </div>

        {/* Total Income Card */}
        <div className="summary-card card-income">
          <div className="card-top">
            <span className="card-label">Total Income</span>
            <div className="card-icon-wrapper icon-income">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="card-body">
            <h2 className="card-value income-color">
              {loading ? <span className="skeleton-text">₹...,...</span> : formatCurrency(totalIncome)}
            </h2>
          </div>
          <div className="card-footer">
            <div className="trend-badge trend-up">
              <ArrowUpRight size={14} />
              <span>{incomeCount} credits</span>
            </div>
            <span className="card-meta">All-time inflow</span>
          </div>
        </div>

        {/* Total Expenses Card */}
        <div className="summary-card card-expenses">
          <div className="card-top">
            <span className="card-label">Total Expenses</span>
            <div className="card-icon-wrapper icon-expenses">
              <TrendingDown size={20} />
            </div>
          </div>
          <div className="card-body">
            <h2 className="card-value expense-color">
              {loading ? <span className="skeleton-text">₹...,...</span> : formatCurrency(totalExpenses)}
            </h2>
          </div>
          <div className="card-footer">
            <div className="trend-badge trend-down">
              <ArrowDownRight size={14} />
              <span>{expenseCount} debits</span>
            </div>
            <span className="card-meta">All-time outflow</span>
          </div>
        </div>

        {/* Savings Rate Card */}
        <div className="summary-card card-savings">
          <div className="card-top">
            <span className="card-label">Savings Rate</span>
            <div className="card-icon-wrapper icon-savings">
              <PiggyBank size={20} />
            </div>
          </div>
          <div className="card-body">
            <h2 className="card-value">
              {loading ? <span className="skeleton-text">--%</span> : `${savingsRate}%`}
            </h2>
          </div>
          <div className="card-footer">
            <div className="progress-bar-container">
              <div
                className="progress-bar-fill"
                style={{ width: `${Math.max(0, Math.min(100, savingsRate))}%` }}
              ></div>
            </div>
            <span className="card-meta">
              {savingsRate >= 20 ? 'Target achieved (>20%)' : 'Watch your spending'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
