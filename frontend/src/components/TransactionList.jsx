import React from 'react';
import { Edit2, Trash2, ArrowUpRight, ArrowDownRight, FileText, Inbox } from 'lucide-react';
import { formatCurrency, formatDate, getCategoryColor } from '../utils/formatters';

export default function TransactionList({
  transactions,
  loading,
  onEdit,
  onDelete,
  onOpenAddModal,
}) {
  if (loading && transactions.length === 0) {
    return (
      <div className="table-card">
        <div className="table-loading-skeleton">
          <div className="skeleton-row"></div>
          <div className="skeleton-row"></div>
          <div className="skeleton-row"></div>
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="table-card empty-card">
        <div className="empty-state">
          <Inbox size={48} className="empty-icon" />
          <h4 className="empty-title">No transactions found</h4>
          <p className="empty-desc">
            No records matched your search or filters. Try adjusting your criteria or create a new transaction.
          </p>
          <button className="btn-primary" onClick={onOpenAddModal}>
            Add Transaction
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="table-card">
      <div className="table-header-meta">
        <div>
          <h3 className="section-title">Transactions Ledger</h3>
          <p className="section-subtitle">
            Showing {transactions.length} record{transactions.length === 1 ? '' : 's'}
          </p>
        </div>
      </div>

      <div className="table-responsive">
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Transaction</th>
              <th>Category</th>
              <th>Date</th>
              <th className="text-right">Amount</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, idx) => {
              const isIncome = tx.type === 'income';
              const categoryColor = getCategoryColor(tx.category, idx);

              return (
                <tr key={tx.id} className="transaction-row">
                  {/* Title & Description */}
                  <td className="tx-col-title">
                    <div className="tx-item-flex">
                      <div className={`tx-type-icon ${isIncome ? 'icon-income-bg' : 'icon-expense-bg'}`}>
                        {isIncome ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                      </div>
                      <div className="tx-details">
                        <span className="tx-title">{tx.title}</span>
                        {tx.description && (
                          <span className="tx-description" title={tx.description}>
                            <FileText size={12} className="inline-icon" />
                            {tx.description}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Category Pill */}
                  <td className="tx-col-category">
                    <span
                      className="category-pill"
                      style={{
                        backgroundColor: `${categoryColor}18`,
                        color: categoryColor,
                        borderColor: `${categoryColor}35`,
                      }}
                    >
                      <span
                        className="cat-pill-dot"
                        style={{ backgroundColor: categoryColor }}
                      ></span>
                      {tx.category}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="tx-col-date">
                    <span className="tx-date">{formatDate(tx.date)}</span>
                  </td>

                  {/* Amount in Indian Rupees */}
                  <td className={`tx-col-amount text-right ${isIncome ? 'amount-income' : 'amount-expense'}`}>
                    <span className="amount-value">
                      {isIncome ? `+${formatCurrency(tx.amount)}` : `-${formatCurrency(tx.amount)}`}
                    </span>
                  </td>

                  {/* Actions: Edit & Delete */}
                  <td className="tx-col-actions text-center">
                    <div className="action-buttons-group">
                      <button
                        className="btn-action btn-action-edit"
                        onClick={() => onEdit(tx)}
                        title="Edit transaction"
                        aria-label={`Edit ${tx.title}`}
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        className="btn-action btn-action-delete"
                        onClick={() => onDelete(tx)}
                        title="Delete transaction"
                        aria-label={`Delete ${tx.title}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
