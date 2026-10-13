import React from 'react';
import { Search, X, Filter, RotateCcw } from 'lucide-react';

export default function FilterBar({
  search,
  setSearch,
  selectedType,
  setSelectedType,
  selectedCategory,
  setSelectedCategory,
  categories,
  onResetFilters,
  totalCount,
}) {
  const isFiltered = search.trim() !== '' || selectedType !== 'all' || selectedCategory !== 'all';

  return (
    <div className="filter-toolbar">
      {/* Search Input */}
      <div className="search-input-wrapper">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Search by title, category, notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            className="search-clear-btn"
            onClick={() => setSearch('')}
            aria-label="Clear search"
          >
            <X size={15} />
          </button>
        )}
      </div>

      <div className="filter-controls">
        {/* Type Filter Buttons */}
        <div className="type-toggle-group">
          <button
            type="button"
            className={`type-tab ${selectedType === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedType('all')}
          >
            All
          </button>
          <button
            type="button"
            className={`type-tab type-tab-income ${selectedType === 'income' ? 'active' : ''}`}
            onClick={() => setSelectedType('income')}
          >
            Income
          </button>
          <button
            type="button"
            className={`type-tab type-tab-expense ${selectedType === 'expense' ? 'active' : ''}`}
            onClick={() => setSelectedType('expense')}
          >
            Expenses
          </button>
        </div>

        {/* Category Dropdown */}
        <div className="category-select-wrapper">
          <Filter size={15} className="select-icon" />
          <select
            className="category-dropdown"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Filter Button */}
        {isFiltered && (
          <button
            type="button"
            className="btn-reset-filters"
            onClick={onResetFilters}
            title="Reset filters"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
}
