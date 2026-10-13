import React, { useState, useEffect } from 'react';
import { X, AlertCircle, ArrowUpRight, ArrowDownRight, Check, Plus } from 'lucide-react';

const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Investment',
  'Rental Income',
  'Bonus',
  'Gift',
  'Other Income',
];

const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Groceries',
  'Housing & Rent',
  'Utilities',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Healthcare',
  'Education',
  'Personal Care',
  'Travel',
  'Other Expense',
];

export default function TransactionModal({
  isOpen,
  onClose,
  onSubmit,
  editingTransaction,
  categories,
}) {
  const isEditing = Boolean(editingTransaction);

  const getTodayDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: 'expense',
    category: 'Food & Dining',
    date: getTodayDate(),
    description: '',
  });

  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingTransaction) {
      setFormData({
        title: editingTransaction.title || '',
        amount: editingTransaction.amount ? String(editingTransaction.amount) : '',
        type: editingTransaction.type || 'expense',
        category: editingTransaction.category || 'Other',
        date: editingTransaction.date || getTodayDate(),
        description: editingTransaction.description || '',
      });
      setIsCustomCategory(false);
      setCustomCategory('');
    } else {
      setFormData({
        title: '',
        amount: '',
        type: 'expense',
        category: 'Food & Dining',
        date: getTodayDate(),
        description: '',
      });
      setIsCustomCategory(false);
      setCustomCategory('');
    }
    setErrors({});
  }, [editingTransaction, isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleTypeChange = (newType) => {
    const defaultCat = newType === 'income' ? 'Salary' : 'Food & Dining';
    setFormData((prev) => ({
      ...prev,
      type: newType,
      category: defaultCat,
    }));
    setIsCustomCategory(false);
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length > 100) {
      newErrors.title = 'Title must be 100 characters or fewer';
    }

    const numAmount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(numAmount)) {
      newErrors.amount = 'Please enter a valid amount';
    } else if (numAmount <= 0) {
      newErrors.amount = 'Amount must be greater than ₹0';
    }

    const activeCat = isCustomCategory ? customCategory.trim() : formData.category;
    if (!activeCat) {
      newErrors.category = 'Please select or enter a category';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.date)) {
      newErrors.date = 'Date must be formatted as YYYY-MM-DD';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        amount: parseFloat(formData.amount),
        type: formData.type,
        category: isCustomCategory ? customCategory.trim() : formData.category,
        date: formData.date,
        description: formData.description.trim() || null,
      };

      await onSubmit(payload);
      onClose();
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        form: err.message || 'Failed to save transaction',
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Combine suggested categories with loaded categories
  const suggestedCategories = formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const combinedCategories = Array.from(new Set([...suggestedCategories, ...categories]));

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-window" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">
              {isEditing ? 'Edit Transaction' : 'Add New Transaction'}
            </h3>
            <p className="modal-subtitle">
              {isEditing
                ? 'Update your financial transaction details'
                : 'Track an income or expense in your ledger'}
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close dialog">
            <X size={20} />
          </button>
        </div>

        {errors.form && (
          <div className="form-error-banner">
            <AlertCircle size={16} />
            <span>{errors.form}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form" noValidate>
          {/* Type Toggle */}
          <div className="form-group">
            <label className="form-label">Transaction Type</label>
            <div className="type-selector-buttons">
              <button
                type="button"
                className={`type-btn type-btn-expense ${formData.type === 'expense' ? 'selected' : ''}`}
                onClick={() => handleTypeChange('expense')}
              >
                <ArrowDownRight size={16} />
                <span>Expense</span>
              </button>
              <button
                type="button"
                className={`type-btn type-btn-income ${formData.type === 'income' ? 'selected' : ''}`}
                onClick={() => handleTypeChange('income')}
              >
                <ArrowUpRight size={16} />
                <span>Income</span>
              </button>
            </div>
          </div>

          {/* Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="tx-title">
              Title <span className="required-mark">*</span>
            </label>
            <input
              id="tx-title"
              type="text"
              className={`form-input ${errors.title ? 'input-error' : ''}`}
              placeholder="e.g. Grocery Store, Consulting Fee, Electric Bill"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              autoFocus
            />
            {errors.title && <span className="field-error-text">{errors.title}</span>}
          </div>

          {/* Amount & Date side-by-side */}
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label" htmlFor="tx-amount">
                Amount (₹) <span className="required-mark">*</span>
              </label>
              <div className="input-currency-wrapper">
                <span className="currency-prefix">₹</span>
                <input
                  id="tx-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  className={`form-input pl-currency ${errors.amount ? 'input-error' : ''}`}
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
              {errors.amount && <span className="field-error-text">{errors.amount}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="tx-date">
                Date <span className="required-mark">*</span>
              </label>
              <input
                id="tx-date"
                type="date"
                className={`form-input ${errors.date ? 'input-error' : ''}`}
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
              {errors.date && <span className="field-error-text">{errors.date}</span>}
            </div>
          </div>

          {/* Category */}
          <div className="form-group">
            <div className="category-label-row">
              <label className="form-label">
                Category <span className="required-mark">*</span>
              </label>
              <button
                type="button"
                className="btn-text-link"
                onClick={() => setIsCustomCategory(!isCustomCategory)}
              >
                {isCustomCategory ? 'Choose from list' : '+ Custom category'}
              </button>
            </div>

            {isCustomCategory ? (
              <input
                type="text"
                className={`form-input ${errors.category ? 'input-error' : ''}`}
                placeholder="Enter custom category name"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
              />
            ) : (
              <select
                className={`form-select ${errors.category ? 'input-error' : ''}`}
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {combinedCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            )}
            {errors.category && <span className="field-error-text">{errors.category}</span>}
          </div>

          {/* Description (Optional) */}
          <div className="form-group">
            <label className="form-label" htmlFor="tx-desc">
              Description <span className="optional-tag">(Optional)</span>
            </label>
            <textarea
              id="tx-desc"
              rows="2"
              className="form-textarea"
              placeholder="Add memo, invoice number, or payment reference..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            ></textarea>
          </div>

          {/* Modal Actions */}
          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="btn-spinner">Saving...</span>
              ) : (
                <>
                  <Check size={18} />
                  <span>{isEditing ? 'Update Transaction' : 'Save Transaction'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
