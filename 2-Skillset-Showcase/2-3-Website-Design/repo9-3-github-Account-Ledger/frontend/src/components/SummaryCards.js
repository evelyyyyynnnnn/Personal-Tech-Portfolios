import React from 'react';
import './SummaryCards.css';

const SummaryCards = ({ summary }) => {
  const totalAmount = Object.values(summary).reduce(
    (sum, cat) => sum + (cat.total || 0),
    0
  );

  const totalCount = Object.values(summary).reduce(
    (sum, cat) => sum + (cat.count || 0),
    0
  );

  const categoryCount = Object.keys(summary).length;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const topCategory = Object.entries(summary).reduce(
    (max, [category, data]) => {
      return data.total > (max?.total || 0) ? { category, ...data } : max;
    },
    null
  );

  return (
    <div className="summary-cards">
      <div className="summary-card primary">
        <div className="card-content">
          <h3>Total Spending</h3>
          <p className="card-value">{formatCurrency(totalAmount)}</p>
        </div>
      </div>

      <div className="summary-card">
        <div className="card-content">
          <h3>Categories</h3>
          <p className="card-value">{categoryCount}</p>
        </div>
      </div>

      <div className="summary-card">
        <div className="card-content">
          <h3>Total Entries</h3>
          <p className="card-value">{totalCount}</p>
        </div>
      </div>

      <div className="summary-card highlight">
        <div className="card-content">
          <h3>Top Category</h3>
          <p className="card-value">
            {topCategory?.category || 'N/A'}
          </p>
          <p className="card-subvalue">
            {topCategory ? formatCurrency(topCategory.total) : ''}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;

