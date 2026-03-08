import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import './AccountAnalysis.css';

const COLORS = ['#4caf50', '#66bb6a', '#81c784', '#a5d6a7', '#c8e6c9', '#e8f5e9'];

const AccountAnalysis = ({ accountData }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const preparePieData = () => {
    if (!accountData) return [];
    return Object.entries(accountData).map(([name, data]) => ({
      name,
      value: data.total,
      count: data.count,
    }));
  };

  const pieData = preparePieData();

  return (
    <div className="account-analysis">
      <h2>Account Analysis</h2>
      
      <div className="charts-grid">
        {/* Pie Chart */}
        <div className="chart-container">
          <h3>Account Distribution</h3>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
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

        {/* Bar Chart */}
        <div className="chart-container">
          <h3>Spending by Account</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={pieData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="value" fill="#4caf50" name="Total Spending" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Account Details */}
        <div className="chart-container full-width">
          <h3>Account Breakdown</h3>
          <div className="account-list">
            {pieData.map((account, index) => (
              <div key={account.name} className="account-item">
                <div className="account-header">
                  <div
                    className="account-color"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="account-name">{account.name}</span>
                </div>
                <div className="account-stats">
                  <span className="account-amount" style={{ color: '#4caf50' }}>
                    {formatCurrency(account.value)}
                  </span>
                  <span className="account-count">
                    {account.count} {account.count === 1 ? 'transaction' : 'transactions'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountAnalysis;

