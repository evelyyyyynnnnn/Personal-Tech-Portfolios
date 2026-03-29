import React from 'react';
import {
  LineChart,
  Line,
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import './TrendAnalysis.css';

const TrendAnalysis = ({ trendData }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (!trendData || trendData.length === 0) {
    return (
      <div className="trend-analysis">
        <h2>Spending Trends</h2>
        <p>No trend data available</p>
      </div>
    );
  }

  // Limit to last 30 days for better visualization
  const limitedData = trendData.slice(-30);

  return (
    <div className="trend-analysis">
      <h2>Spending Trends & Cumulative Analysis</h2>
      
      <div className="charts-grid">
        {/* Cumulative Spending Trend */}
        <div className="chart-container full-width">
          <h3>Cumulative Spending Over Time</h3>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={limitedData}>
              <defs>
                <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4caf50" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#4caf50" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date"
                tickFormatter={formatDate}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                yAxisId="cumulative"
                orientation="left"
              />
              <Tooltip 
                formatter={(value, name) => [
                  formatCurrency(value),
                  name === 'cumulative' ? 'Cumulative Total' : 'Daily Spending'
                ]}
                labelFormatter={formatDate}
              />
              <Legend />
              <Area
                yAxisId="cumulative"
                type="monotone"
                dataKey="cumulative"
                stroke="#4caf50"
                fillOpacity={1}
                fill="url(#colorCumulative)"
                name="Cumulative Spending"
              />
              <Line
                yAxisId="cumulative"
                type="monotone"
                dataKey="payment"
                stroke="#f5576c"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Daily Spending"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Stats */}
        <div className="summary-stats">
          <div className="stat-card">
            <div className="stat-label">Total Days</div>
            <div className="stat-value">{trendData.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Average Daily</div>
            <div className="stat-value">
              {formatCurrency(
                trendData.reduce((sum, d) => sum + d.payment, 0) / trendData.length
              )}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Highest Day</div>
            <div className="stat-value">
              {formatCurrency(Math.max(...trendData.map(d => d.payment)))}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Amount</div>
            <div className="stat-value">
              {formatCurrency(trendData[trendData.length - 1]?.cumulative || 0)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendAnalysis;

