/**
 * Formats a number to Indian Rupee (₹) currency format.
 * E.g., 85000 -> ₹85,000.00
 */
export function formatCurrency(amount) {
  const numeric = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numeric);
}

/**
 * Formats a raw date string (YYYY-MM-DD) into a human readable format.
 * E.g., "2026-10-12" -> "12 Oct, 2026"
 */
export function formatDate(dateString) {
  if (!dateString) return '-';
  try {
    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Palette of vibrant, coordinated colors for expense categories.
 */
export const CATEGORY_COLORS = {
  'Housing & Rent': '#6366f1',
  'Groceries': '#10b981',
  'Food & Dining': '#f59e0b',
  'Utilities': '#06b6d4',
  'Transportation': '#8b5cf6',
  'Shopping': '#ec4899',
  'Entertainment': '#f43f5e',
  'Healthcare': '#14b8a6',
  'Salary': '#22c55e',
  'Freelance': '#3b82f6',
  'Investment': '#84cc16',
  'Education': '#a855f7',
  'Personal Care': '#d946ef',
  'Travel': '#0284c7',
  'Other': '#64748b',
};

export const DEFAULT_COLOR = '#64748b';

export function getCategoryColor(category, index = 0) {
  if (category && CATEGORY_COLORS[category]) {
    return CATEGORY_COLORS[category];
  }
  const fallbackColors = [
    '#6366f1', '#10b981', '#f59e0b', '#06b6d4', '#8b5cf6',
    '#ec4899', '#f43f5e', '#14b8a6', '#22c55e', '#3b82f6'
  ];
  return fallbackColors[index % fallbackColors.length];
}
