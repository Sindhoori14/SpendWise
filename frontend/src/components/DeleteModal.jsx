import React, { useEffect } from 'react';
import { AlertTriangle, X, Trash2 } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function DeleteModal({
  isOpen,
  transaction,
  onClose,
  onConfirm,
  isDeleting,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !transaction) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-window modal-delete-window" onClick={(e) => e.stopPropagation()}>
        <div className="delete-modal-top">
          <div className="delete-icon-badge">
            <AlertTriangle size={24} />
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close dialog">
            <X size={20} />
          </button>
        </div>

        <div className="delete-modal-body">
          <h3 className="delete-modal-title">Delete Transaction?</h3>
          <p className="delete-modal-desc">
            Are you sure you want to permanently remove this transaction from your records? This action cannot be undone.
          </p>

          <div className="delete-transaction-preview">
            <div className="delete-tx-row">
              <span className="delete-tx-label">Title:</span>
              <span className="delete-tx-value">{transaction.title}</span>
            </div>
            <div className="delete-tx-row">
              <span className="delete-tx-label">Amount:</span>
              <span className={`delete-tx-value ${transaction.type === 'income' ? 'income-color' : 'expense-color'}`}>
                {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
              </span>
            </div>
            <div className="delete-tx-row">
              <span className="delete-tx-label">Category:</span>
              <span className="delete-tx-value">{transaction.category}</span>
            </div>
            <div className="delete-tx-row">
              <span className="delete-tx-label">Date:</span>
              <span className="delete-tx-value">{formatDate(transaction.date)}</span>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-danger"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            <Trash2 size={16} />
            <span>{isDeleting ? 'Deleting...' : 'Delete Permanently'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
