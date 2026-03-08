import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import LedgerTable from './components/LedgerTable';
import SummaryCards from './components/SummaryCards';
import ChartView from './components/ChartView';
import AddEntryForm from './components/AddEntryForm';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import axios from 'axios';

function App() {
  const [ledger, setLedger] = useState([]);
  const [fullLedger, setFullLedger] = useState([]); // Store full data for min/max dates
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('table');
  
  // Date range states - default to 2025/09/01 - 2025/10/01
  const [startDate, setStartDate] = useState('2025-09-01');
  const [endDate, setEndDate] = useState('2025-10-01');

  // Cache for date range data: { 'start-end': { ledger: [], summary: {} } }
  const dataCache = useRef({});

  // Fetch full data first to get min/max dates
  const fetchFullData = useCallback(async () => {
    try {
      const fullLedgerRes = await axios.get('/api/ledger');
      setFullLedger(fullLedgerRes.data);
      
      // Auto-detect min/max dates if not set yet
      if (fullLedgerRes.data.length > 0) {
        const dates = fullLedgerRes.data
          .map(item => item.date)
          .filter(Boolean)
          .sort();
        
        if (dates.length > 0) {
          const minDate = dates[0].split('T')[0];
          const maxDate = dates[dates.length - 1].split('T')[0];
          
          // Only set defaults if they were never changed by user
          if (startDate === '2025-09-01' && endDate === '2025-10-01') {
            setStartDate(minDate);
            setEndDate(maxDate);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching full data:', err);
    }
  }, [startDate, endDate]);

  const fetchData = useCallback(async (forceRefresh = false) => {
    const cacheKey = `${startDate}-${endDate}`;
    
    // Check cache first
    if (!forceRefresh && dataCache.current[cacheKey]) {
      setLedger(dataCache.current[cacheKey].ledger);
      setSummary(dataCache.current[cacheKey].summary);
      setError(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [ledgerRes, summaryRes] = await Promise.all([
        axios.get('/api/ledger', { params: { start: startDate, end: endDate } }),
        axios.get('/api/summary', { params: { start: startDate, end: endDate } }),
      ]);
      
      const ledgerData = ledgerRes.data;
      const summaryData = summaryRes.data;
      
      // Cache the data
      dataCache.current[cacheKey] = {
        ledger: ledgerData,
        summary: summaryData
      };
      
      setLedger(ledgerData);
      setSummary(summaryData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch data. Please check your backend connection.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchFullData();
  }, [fetchFullData]);

  useEffect(() => {
    if (fullLedger.length > 0) {
      fetchData();
    }
    // Removed auto-refresh interval - data is now cached and only fetched when date range changes
  }, [startDate, endDate, fullLedger.length, fetchData]);

  const handleAddEntry = async (entryData) => {
    try {
      await axios.post('/api/ledger', entryData);
      // Clear cache and force refresh after adding entry
      dataCache.current = {};
      fetchData(true);
    } catch (err) {
      console.error('Error adding entry:', err);
      alert('Failed to add entry');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading ledger data...</p>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="app-header">
        <h1>Accounting Ledger</h1>
        <button onClick={() => fetchData(true)} className="refresh-btn">
          Refresh
        </button>
      </header>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <nav className="tab-nav">
        <button
          className={activeTab === 'table' ? 'active' : ''}
          onClick={() => setActiveTab('table')}
        >
          Table View
        </button>
        <button
          className={activeTab === 'chart' ? 'active' : ''}
          onClick={() => setActiveTab('chart')}
        >
          Breakdown
        </button>
        <button
          className={activeTab === 'analytics' ? 'active' : ''}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
        <button
          className={activeTab === 'add' ? 'active' : ''}
          onClick={() => setActiveTab('add')}
        >
          Add Entry
        </button>
        
        {/* Date range filter */}
        <div className="date-range-filter">
          <label>From:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="date-input"
          />
          <label>To:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="date-input"
          />
        </div>
      </nav>

      {activeTab === 'analytics' ? (
        <AnalyticsDashboard startDate={startDate} endDate={endDate} />
      ) : (
        <div className="container">
          <SummaryCards summary={summary} />
          
          {activeTab === 'table' && <LedgerTable ledger={ledger} />}
          {activeTab === 'chart' && <ChartView ledger={ledger} summary={summary} />}
          {activeTab === 'add' && <AddEntryForm onAdd={handleAddEntry} />}
        </div>
      )}
    </div>
  );
}

export default App;

