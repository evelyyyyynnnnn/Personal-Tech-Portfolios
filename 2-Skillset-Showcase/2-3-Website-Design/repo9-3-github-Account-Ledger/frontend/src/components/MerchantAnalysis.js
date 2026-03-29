import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import './MerchantAnalysis.css';

const MerchantAnalysis = ({ merchantData }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (!merchantData || merchantData.length === 0) {
    return (
      <div className="merchant-analysis">
        <h2>Merchant Analysis</h2>
        <p>No merchant data available</p>
      </div>
    );
  }

  return (
    <div className="merchant-analysis">
      <h2>Merchant / Transaction Analysis</h2>
      
      <div className="charts-grid">
        {/* Top Merchants Bar Chart */}
        <div className="chart-container full-width">
          <h3>Top 20 Merchants by Spending</h3>
          <ResponsiveContainer width="100%" height={500}>
            <BarChart data={merchantData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={200}
                tick={{ fontSize: 12 }}
              />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="total" fill="#4caf50" name="Total Spending" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Merchant Details List */}
        <div className="chart-container full-width">
          <h3>Merchant Details</h3>
          <div className="merchant-list">
            {merchantData.slice(0, 10).map((merchant, index) => (
              <div key={merchant.name} className="merchant-item">
                <div className="merchant-rank">#{index + 1}</div>
                <div className="merchant-info">
                  <div className="merchant-name">{merchant.name}</div>
                  <div className="merchant-stats">
                    <span className="merchant-amount">
                      {formatCurrency(merchant.total)}
                    </span>
                    <span className="merchant-count">
                      {merchant.count} {merchant.count === 1 ? 'time' : 'times'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchantAnalysis;

