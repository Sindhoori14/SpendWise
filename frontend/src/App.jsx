import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import SummaryCards from './components/SummaryCards';
import CategoryChart from './components/CategoryChart';
import FilterBar from './components/FilterBar';
import TransactionList from './components/TransactionList';
import TransactionModal from './components/TransactionModal';
import DeleteModal from './components/DeleteModal';
import Toast from './components/Toast';
import {
  fetchSummary,
  fetchTransactions,
  fetchCategories,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from './api';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);

  // Filter states
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // UI state
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deletingTransaction, setDeletingTransaction] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast notifications
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Load summary and categories
  const loadDashboardData = useCallback(async () => {
    try {
      const [sumData, catData] = await Promise.all([
        fetchSummary(),
        fetchCategories(),
      ]);
      setSummary(sumData);
      setCategories(catData);
      setConnectionError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setConnectionError(
        'Unable to connect to SpendWise backend. Please ensure the FastAPI server is running on http://127.0.0.1:8000.'
      );
    }
  }, []);

  // Load transactions based on current filters
  const loadTransactions = useCallback(async () => {
    try {
      const data = await fetchTransactions({
        search,
        type: selectedType,
        category: selectedCategory,
      });
      setTransactions(data);
      setConnectionError(null);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setConnectionError(
        'Unable to fetch transactions from server. Please check your backend connection.'
      );
    }
  }, [search, selectedType, selectedCategory]);

  // Initial load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadDashboardData(), loadTransactions()]);
      setLoading(false);
    };
    init();
  }, [loadDashboardData, loadTransactions]);

  // Refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([loadDashboardData(), loadTransactions()]);
    setIsRefreshing(false);
    showToast('Dashboard refreshed successfully', 'success');
  };

  // Open Add modal
  const handleOpenAddModal = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  // Open Edit modal
  const handleOpenEditModal = (tx) => {
    setEditingTransaction(tx);
    setIsModalOpen(true);
  };

  // Submit Add or Edit
  const handleSaveTransaction = async (formData) => {
    try {
      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, formData);
        showToast('Transaction updated successfully', 'success');
      } else {
        await createTransaction(formData);
        showToast('Transaction added successfully', 'success');
      }
      // Refresh both summary and transactions list
      await Promise.all([loadDashboardData(), loadTransactions()]);
    } catch (err) {
      showToast(err.message || 'Operation failed', 'error');
      throw err;
    }
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!deletingTransaction) return;
    setIsDeleting(true);
    try {
      await deleteTransaction(deletingTransaction.id);
      showToast('Transaction deleted successfully', 'success');
      setDeletingTransaction(null);
      await Promise.all([loadDashboardData(), loadTransactions()]);
    } catch (err) {
      showToast(err.message || 'Failed to delete transaction', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearch('');
    setSelectedType('all');
    setSelectedCategory('all');
  };

  return (
    <div className="app-layout">
      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <Header
        onOpenAddModal={handleOpenAddModal}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      <main className="main-content">
        <div className="content-container">
          {/* Connection Error Banner */}
          {connectionError && (
            <div className="connection-error-banner">
              <div className="error-banner-content">
                <AlertCircle size={20} className="error-banner-icon" />
                <div>
                  <h4 className="error-banner-title">Backend Connection Issue</h4>
                  <p className="error-banner-message">{connectionError}</p>
                </div>
              </div>
              <button className="btn-secondary btn-sm" onClick={handleRefresh}>
                <RefreshCw size={14} />
                <span>Retry Connection</span>
              </button>
            </div>
          )}

          {/* Metric KPI Summary Cards */}
          <SummaryCards summary={summary} loading={loading} />

          {/* Analytics & Ledger Section */}
          <div className="dashboard-grid">
            {/* Left: Spending by Category Chart */}
            <div className="dashboard-chart-col">
              <CategoryChart
                categoryBreakdown={summary?.category_breakdown || []}
                totalExpenses={summary?.total_expenses || 0}
              />
            </div>

            {/* Right: Transactions Ledger & Filter Toolbar */}
            <div className="dashboard-ledger-col">
              <FilterBar
                search={search}
                setSearch={setSearch}
                selectedType={selectedType}
                setSelectedType={setSelectedType}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                categories={categories}
                onResetFilters={handleResetFilters}
                totalCount={transactions.length}
              />

              <TransactionList
                transactions={transactions}
                loading={loading}
                onEdit={handleOpenEditModal}
                onDelete={(tx) => setDeletingTransaction(tx)}
                onOpenAddModal={handleOpenAddModal}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Add / Edit Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveTransaction}
        editingTransaction={editingTransaction}
        categories={categories}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={Boolean(deletingTransaction)}
        transaction={deletingTransaction}
        onClose={() => setDeletingTransaction(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-container">
          <p className="footer-text">
            SpendWise • Full-stack Expense Tracker built with React, FastAPI, SQLite & Recharts
          </p>
          <p className="footer-currency-note">
            Amounts formatted in Indian Rupees (₹)
          </p>
        </div>
      </footer>
    </div>
  );
}
