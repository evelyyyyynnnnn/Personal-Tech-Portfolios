import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import './TimeAnalysis.css';

const TimeAnalysis = ({ timeData }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateStr, type = 'daily') => {
    const date = new Date(dateStr);
    if (type === 'daily') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else if (type === 'weekly') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }
  };

  const prepareDailyData = () => {
    if (!timeData?.daily) return [];
    return Object.entries(timeData.daily)
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-30); // Last 30 days
  };

  const prepareMonthlyData = () => {
    if (!timeData?.monthly) return [];
    return Object.entries(timeData.monthly)
      .map(([date, value]) => ({ month: date, value }))
      .sort((a, b) => a.month.localeCompare(b.month));
  };

  const dailyData = prepareDailyData();
  const monthlyData = prepareMonthlyData();

  return (
    <div className="time-analysis">
      <h2>Time-Based Analysis</h2>
      
      <div className="charts-grid">
        {/* Daily Trend Line Chart */}
        <div className="chart-container">
          <h3>Daily Spending Trend (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => formatDate(date, 'daily')}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis />
              <Tooltip 
                formatter={(value) => formatCurrency(value)}
                labelFormatter={(date) => formatDate(date, 'daily')}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#4caf50" 
                strokeWidth={2}
                name="Daily Spending"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Bar Chart */}
        <div className="chart-container">
          <h3>Monthly Spending Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="value" fill="#66bb6a" name="Monthly Total" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Area Chart for Visual Impact */}
        <div className="chart-container full-width">
          <h3>Spending Over Time (Area Chart)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dailyData}>
              <defs>
                <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4caf50" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#4caf50" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date"
                tickFormatter={(date) => formatDate(date, 'daily')}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis />
              <Tooltip 
                formatter={(value) => formatCurrency(value)}
                labelFormatter={(date) => formatDate(date, 'daily')}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#4caf50"
                fillOpacity={1}
                fill="url(#colorSpending)"
                name="Daily Spending"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default TimeAnalysis;

