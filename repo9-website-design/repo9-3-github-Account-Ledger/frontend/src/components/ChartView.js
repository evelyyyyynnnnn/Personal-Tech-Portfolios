import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import './ChartView.css';

const ChartView = ({ ledger, summary }) => {
const COLORS = [
  '#4caf50',
  '#66bb6a',
  '#81c784',
  '#a5d6a7',
  '#c8e6c9',
  '#e8f5e9',
  '#388e3c',
  '#2e7d32',
  '#1b5e20',
  '#c5e1a5',
];

  // Separate Income and Expense category data
  const incomeCategories = ledger
    .filter(entry => entry.type === 'Income')
    .reduce((acc, entry) => {
      const category = entry.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = { total: 0, count: 0 };
      }
      acc[category].total += entry.amount || 0;
      acc[category].count += 1;
      return acc;
    }, {});

  const incomeCategoriesArray = Object.entries(incomeCategories).map(([name, data]) => ({
    name,
    value: data.total,
    count: data.count,
  }));

  const expenseCategories = ledger
    .filter(entry => entry.type === 'Expense')
    .reduce((acc, entry) => {
      const category = entry.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = { total: 0, count: 0 };
      }
      acc[category].total += entry.amount || 0;
      acc[category].count += 1;
      return acc;
    }, {});

  const expenseCategoriesArray = Object.entries(expenseCategories).map(([name, data]) => ({
    name,
    value: data.total,
    count: data.count,
  }));

  // Separate Income and Expense account distribution
  const incomeAccounts = ledger
    .filter(entry => entry.type === 'Income')
    .reduce((acc, entry) => {
      const account = entry.account || 'Other';
      if (!acc[account]) {
        acc[account] = { total: 0, count: 0 };
      }
      acc[account].total += entry.amount || 0;
      acc[account].count += 1;
      return acc;
    }, {});

  const incomeAccountsArray = Object.entries(incomeAccounts).map(([name, data]) => ({
    name,
    value: data.total,
    count: data.count,
  }));

  const expenseAccounts = ledger
    .filter(entry => entry.type === 'Expense')
    .reduce((acc, entry) => {
      const account = entry.account || 'Other';
      if (!acc[account]) {
        acc[account] = { total: 0, count: 0 };
      }
      acc[account].total += entry.amount || 0;
      acc[account].count += 1;
      return acc;
    }, {});

  const expenseAccountsArray = Object.entries(expenseAccounts).map(([name, data]) => ({
    name,
    value: data.total,
    count: data.count,
  }));

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="chart-view">
      <h2 className="chart-section-title">Balance Analysis</h2>
      
      <div className="charts-grid">
        {incomeCategoriesArray.length > 0 && (
          <div className="chart-container">
            <h3>Income Categories</h3>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={incomeCategoriesArray}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {incomeCategoriesArray.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {expenseCategoriesArray.length > 0 && (
          <div className="chart-container">
            <h3>Expense Categories</h3>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={expenseCategoriesArray}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expenseCategoriesArray.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="category-details">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          {incomeCategoriesArray.length > 0 && (
            <div>
              <h3 style={{ marginBottom: '1rem', color: '#4caf50' }}>Income Categories</h3>
              <div className="category-list">
                {incomeCategoriesArray.map((item, index) => (
                  <div key={item.name} className="category-item">
                    <div className="category-header">
                      <div
                        className="category-color"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <span className="category-name">{item.name}</span>
                    </div>
                    <div className="category-stats">
                      <span className="category-amount">
                        {formatCurrency(item.value)}
                      </span>
                      <span className="category-count">
                        {item.count} {item.count === 1 ? 'entry' : 'entries'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {expenseCategoriesArray.length > 0 && (
            <div>
              <h3 style={{ marginBottom: '1rem', color: '#ff6b6b' }}>Expense Categories</h3>
              <div className="category-list">
                {expenseCategoriesArray.map((item, index) => (
                  <div key={item.name} className="category-item">
                    <div className="category-header">
                      <div
                        className="category-color"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <span className="category-name">{item.name}</span>
                    </div>
                    <div className="category-stats">
                      <span className="category-amount">
                        {formatCurrency(item.value)}
                      </span>
                      <span className="category-count">
                        {item.count} {item.count === 1 ? 'entry' : 'entries'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <h2 className="chart-section-title" style={{ marginTop: '3rem' }}>Account Management</h2>
      
      {/* Account Distribution Charts */}
      <div className="charts-grid">
        {incomeAccountsArray.length > 0 && (
          <div className="chart-container">
            <h3>Income Account Distribution</h3>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={incomeAccountsArray}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {incomeAccountsArray.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {expenseAccountsArray.length > 0 && (
          <div className="chart-container">
            <h3>Expense Account Distribution</h3>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={expenseAccountsArray}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expenseAccountsArray.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartView;

