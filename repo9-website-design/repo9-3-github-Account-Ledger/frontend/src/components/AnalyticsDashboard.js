import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import './AnalyticsDashboard.css';

const AnalyticsDashboard = ({ startDate, endDate }) => {
  const [ledger, setLedger] = useState([]);
  const [balanceData, setBalanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Cache for analytics data
  const analyticsCache = useRef({});
  const balanceCache = useRef(null);

  const fetchAnalytics = useCallback(async (forceRefresh = false) => {
    const cacheKey = `${startDate}-${endDate}`;
    
    // Check cache first
    if (!forceRefresh && analyticsCache.current[cacheKey] && balanceCache.current) {
      setLedger(analyticsCache.current[cacheKey]);
      setBalanceData(balanceCache.current);
      setError(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [ledgerRes, balance] = await Promise.all([
        axios.get('/api/ledger', { params: { start: startDate, end: endDate } }),
        axios.get('/api/analysis/balance'),
      ]);

      const ledgerData = ledgerRes.data;
      const balanceDataValue = balance.data;
      
      // Cache the data
      analyticsCache.current[cacheKey] = ledgerData;
      balanceCache.current = balanceDataValue;

      setLedger(ledgerData);
      setBalanceData(balanceDataValue);
      setError(null);
    } catch (err) {
      setError('Failed to fetch analytics data');
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchAnalytics();
    // Removed auto-refresh - data is now cached and only fetched when date range changes
  }, [startDate, endDate, fetchAnalytics]);

  // Process data for Daily charts
  const dailyData = useMemo(() => {
    const dailyMap = new Map();
    
    ledger.forEach(item => {
      const date = item.date?.split('T')[0] || '';
      if (!date) return;
      
      if (!dailyMap.has(date)) {
        dailyMap.set(date, { date, income: 0, expense: 0 });
      }
      
      const dayData = dailyMap.get(date);
      if (item.type === 'Income') {
        dayData.income += item.amount || 0;
      } else if (item.type === 'Expense') {
        dayData.expense += item.amount || 0;
      }
    });
    
    return Array.from(dailyMap.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(item => ({
        ...item,
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }));
  }, [ledger]);

  // Process data for Monthly charts
  const monthlyData = useMemo(() => {
    const monthlyMap = new Map();
    
    ledger.forEach(item => {
      const date = item.date?.split('T')[0] || '';
      if (!date) return;
      
      const monthKey = date.substring(0, 7); // YYYY-MM
      
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { month: monthKey, income: 0, expense: 0 });
      }
      
      const monthData = monthlyMap.get(monthKey);
      if (item.type === 'Income') {
        monthData.income += item.amount || 0;
      } else if (item.type === 'Expense') {
        monthData.expense += item.amount || 0;
      }
    });
    
    return Array.from(monthlyMap.values())
      .sort((a, b) => a.month.localeCompare(b.month))
      .map(item => ({
        ...item,
        month: new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      }));
  }, [ledger]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-error">
        <p>⚠️ {error}</p>
        <button onClick={fetchAnalytics} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      <header className="dashboard-header">
        <h1>Analytics Dashboard</h1>
        <button onClick={() => fetchAnalytics(true)} className="refresh-btn">
          Refresh
        </button>
      </header>

      {/* Balance Overview Cards */}
      {balanceData && (
        <div className="balance-overview">
          <div className="balance-card income">
            <div className="balance-content">
              <h3>Income</h3>
              <p className="balance-value">{formatCurrency(balanceData.income)}</p>
            </div>
          </div>
          <div className="balance-card expense">
            <div className="balance-content">
              <h3>Expense</h3>
              <p className="balance-value">{formatCurrency(balanceData.expense)}</p>
            </div>
          </div>
          <div className="balance-card balance">
            <div className="balance-content">
              <h3>Balance</h3>
              <p className="balance-value" style={{
                color: balanceData.balance >= 0 ? '#4caf50' : '#ef5350'
              }}>
                {formatCurrency(balanceData.balance)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="charts-section">
        {/* Daily Spending */}
        {dailyData.length > 0 && (
          <div className="chart-container">
            <h2 className="chart-title">Daily Spending & Income</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="expense" stroke="#ef5350" strokeWidth={2} name="Daily Spending" />
                <Line type="monotone" dataKey="income" stroke="#4caf50" strokeWidth={2} name="Daily Income" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Monthly Spending */}
        {monthlyData.length > 0 && (
          <div className="chart-container">
            <h2 className="chart-title">Monthly Spending & Income</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="expense" stroke="#ef5350" strokeWidth={2} name="Monthly Spending" />
                <Line type="monotone" dataKey="income" stroke="#4caf50" strokeWidth={2} name="Monthly Income" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
