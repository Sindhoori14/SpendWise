import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { PieChart as PieIcon, BarChart3, Inbox } from 'lucide-react';
import { formatCurrency, getCategoryColor } from '../utils/formatters';

// Custom Tooltip for Charts
function CustomChartTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="custom-chart-tooltip">
        <p className="tooltip-title">{data.category}</p>
        <p className="tooltip-amount">{formatCurrency(data.amount)}</p>
        <p className="tooltip-meta">
          {data.percentage}% of total expenses • {data.count} transaction{data.count === 1 ? '' : 's'}
        </p>
      </div>
    );
  }
  return null;
}

export default function CategoryChart({ categoryBreakdown, totalExpenses }) {
  const [chartType, setChartType] = useState('pie'); // 'pie' or 'bar'

  const hasData = categoryBreakdown && categoryBreakdown.length > 0 && totalExpenses > 0;

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <div>
          <h3 className="chart-title">Spending by Category</h3>
          <p className="chart-subtitle">Breakdown of total expense distribution</p>
        </div>

        {hasData && (
          <div className="chart-type-toggle">
            <button
              className={`toggle-btn ${chartType === 'pie' ? 'active' : ''}`}
              onClick={() => setChartType('pie')}
              title="Donut view"
            >
              <PieIcon size={16} />
              <span>Donut</span>
            </button>
            <button
              className={`toggle-btn ${chartType === 'bar' ? 'active' : ''}`}
              onClick={() => setChartType('bar')}
              title="Bar chart view"
            >
              <BarChart3 size={16} />
              <span>Bar</span>
            </button>
          </div>
        )}
      </div>

      <div className="chart-card-content">
        {!hasData ? (
          <div className="chart-empty-state">
            <Inbox size={48} className="empty-icon" />
            <p className="empty-title">No expense data available</p>
            <p className="empty-desc">
              Add your first expense transaction to view category insights and visual breakdown.
            </p>
          </div>
        ) : (
          <div className="chart-layout">
            {/* Visual Chart Canvas */}
            <div className="chart-canvas-wrapper">
              <ResponsiveContainer width="100%" height={260}>
                {chartType === 'pie' ? (
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={3}
                      dataKey="amount"
                      nameKey="category"
                      stroke="#ffffff"
                      strokeWidth={2}
                    >
                      {categoryBreakdown.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={getCategoryColor(entry.category, index)}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomChartTooltip />} />
                  </PieChart>
                ) : (
                  <BarChart
                    data={categoryBreakdown}
                    margin={{ top: 15, right: 10, left: 0, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="category"
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      angle={-25}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      tickFormatter={(val) => `₹${val >= 1000 ? `${Math.round(val / 1000)}k` : val}`}
                    />
                    <Tooltip content={<CustomChartTooltip />} />
                    <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                      {categoryBreakdown.map((entry, index) => (
                        <Cell
                          key={`bar-cell-${index}`}
                          fill={getCategoryColor(entry.category, index)}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Category Breakdown Progress List */}
            <div className="category-legend-list">
              {categoryBreakdown.map((cat, idx) => {
                const color = getCategoryColor(cat.category, idx);
                return (
                  <div key={cat.category} className="category-legend-item">
                    <div className="legend-item-info">
                      <div className="legend-item-name">
                        <span
                          className="legend-color-dot"
                          style={{ backgroundColor: color }}
                        ></span>
                        <span className="legend-category-text">{cat.category}</span>
                      </div>
                      <div className="legend-item-amount">
                        <span className="legend-val">{formatCurrency(cat.amount)}</span>
                        <span className="legend-pct">{cat.percentage}%</span>
                      </div>
                    </div>
                    <div className="legend-progress-track">
                      <div
                        className="legend-progress-bar"
                        style={{
                          width: `${cat.percentage}%`,
                          backgroundColor: color,
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
