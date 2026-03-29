import React, { useState, useMemo } from 'react';
import './LedgerTable.css';

const LedgerTable = ({ ledger }) => {
  const [sortField, setSortField] = useState('amount');
  const [sortDirection, setSortDirection] = useState('desc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Just use ledger directly for category grouping
  const filteredLedger = useMemo(() => {
    return ledger;
  }, [ledger]);

  // Group by category to show totals instead of individual items
  const categoryTotals = useMemo(() => {
    const grouped = {};
    
    filteredLedger.forEach(item => {
      const category = item.category || 'Uncategorized';
      if (!grouped[category]) {
        grouped[category] = {
          category,
          totalAmount: 0,
          totalExpense: 0,
          totalIncome: 0,
          expenseCount: 0,
          incomeCount: 0,
          accounts: new Set(),
          types: new Set()
        };
      }
      
      grouped[category].totalAmount += item.amount || 0;
      if (item.type === 'Expense') {
        grouped[category].totalExpense += item.amount || 0;
        grouped[category].expenseCount += 1;
      } else if (item.type === 'Income') {
        grouped[category].totalIncome += item.amount || 0;
        grouped[category].incomeCount += 1;
      }
      
      if (item.account) grouped[category].accounts.add(item.account);
      if (item.type) grouped[category].types.add(item.type);
    });
    
    // Convert to array and format
    return Object.values(grouped).map(item => ({
      ...item,
      accounts: Array.from(item.accounts),
      accountDisplay: Array.from(item.accounts).join(', '),
      types: Array.from(item.types),
      typeDisplay: Array.from(item.types).join(', '),
      // Determine primary type based on which is larger
      primaryType: item.totalIncome >= item.totalExpense ? 'Income' : 'Expense'
    }));
  }, [filteredLedger]);

  const totalPayment = categoryTotals.reduce(
    (sum, item) => sum + item.totalAmount,
    0
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return '⇅';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  // Sort category totals with Type-first priority, then by selected field
  const sortedCategoryTotals = useMemo(() => {
    const sorted = [...categoryTotals];
    sorted.sort((a, b) => {
      // Always sort by Type first (Expense before Income)
      const aType = a.primaryType?.toLowerCase() || '';
      const bType = b.primaryType?.toLowerCase() || '';
      
      if (aType !== bType) {
        // 'expense' comes before 'income'
        if (aType === 'expense' && bType === 'income') return -1;
        if (aType === 'income' && bType === 'expense') return 1;
      }

      // Within the same type, sort by the selected field
      let aVal, bVal;
      switch (sortField) {
        case 'amount':
          aVal = a.totalAmount;
          bVal = b.totalAmount;
          break;
        case 'category':
          aVal = a.category;
          bVal = b.category;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [categoryTotals, sortField, sortDirection]);

  return (
    <div className="ledger-table-container">
      <div className="table-filters">
        <div className="total-display">
          <strong>Total: {formatCurrency(totalPayment)}</strong>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="ledger-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('type')} className="sortable">
                Type {getSortIcon('type')}
              </th>
              <th onClick={() => handleSort('category')} className="sortable">
                Category {getSortIcon('category')}
              </th>
              <th onClick={() => handleSort('amount')} className="sortable">
                Amount {getSortIcon('amount')}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedCategoryTotals.length === 0 ? (
              <tr>
                <td colSpan="3" className="no-data">
                  No entries found
                </td>
              </tr>
            ) : (
              sortedCategoryTotals.map((item, index) => (
                <tr key={item.category || index}>
                  <td>
                    <span className={`type-badge ${item.primaryType?.toLowerCase()}`}>
                      {item.primaryType}
                    </span>
                  </td>
                  <td>
                    <span className="category-badge">{item.category}</span>
                  </td>
                  <td className="payment-cell">
                    {formatCurrency(item.totalAmount)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LedgerTable;

