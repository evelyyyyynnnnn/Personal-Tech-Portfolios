import React, { useState } from 'react';
import axios from 'axios';
import './AddEntryForm.css';

const AddEntryForm = ({ onAdd }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    payment: '',
    account: '',
    category: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestedCategory, setSuggestedCategory] = useState('');
  const [autoClassified, setAutoClassified] = useState(false);

  const accounts = [
    'Chase Checking',
    'Chase Savings',
    'Credit Card',
    'Cash',
    'PayPal',
    'Venmo',
  ];

  const categories = [
    'Income1',
    'Income2',
    'Income3',
    'Income4',
    'Income5',
    'Food & Dining',
    'Shopping',
    'Transportation',
    'Utilities & Bills',
    'Entertainment',
    'Health & Wellness',
    'Travel',
    'Services',
    'Other',
  ];

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }

    // Auto-classify when description changes
    if (name === 'description' && value.trim()) {
      try {
        const response = await axios.post('/api/classify', { description: value });
        setSuggestedCategory(response.data.category);
        setAutoClassified(true);
      } catch (error) {
        console.error('Error classifying:', error);
      }
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.payment || parseFloat(formData.payment) <= 0) {
      newErrors.payment = 'Payment must be greater than 0';
    }

    if (!formData.account) {
      newErrors.account = 'Account is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Use suggested category if no category is manually selected
      const finalData = {
        ...formData,
        payment: parseFloat(formData.payment),
        category: formData.category || suggestedCategory || '',
      };
      
      await onAdd(finalData);
      
      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        description: '',
        payment: '',
        account: '',
        category: '',
      });
      setSuggestedCategory('');
      setAutoClassified(false);
      
      alert('Entry added successfully!');
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-entry-form-container">
      <h2>Add New Entry</h2>
      <form onSubmit={handleSubmit} className="entry-form">
        <div className="form-group">
          <label htmlFor="date">
            Date <span className="required">*</span>
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className={errors.date ? 'error' : ''}
          />
          {errors.date && <span className="error-message">{errors.date}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="description">
            Description <span className="required">*</span>
          </label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter transaction description"
            className={errors.description ? 'error' : ''}
          />
          {errors.description && (
            <span className="error-message">{errors.description}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="payment">
            Payment Amount <span className="required">*</span>
          </label>
          <input
            type="number"
            id="payment"
            name="payment"
            value={formData.payment}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            min="0"
            className={errors.payment ? 'error' : ''}
          />
          {errors.payment && (
            <span className="error-message">{errors.payment}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="account">
            Account <span className="required">*</span>
          </label>
          <select
            id="account"
            name="account"
            value={formData.account}
            onChange={handleChange}
            className={errors.account ? 'error' : ''}
          >
            <option value="">Select an account</option>
            {accounts.map(account => (
              <option key={account} value={account}>
                {account}
              </option>
            ))}
          </select>
          {errors.account && (
            <span className="error-message">{errors.account}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            <option value="">Select a category (optional)</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {suggestedCategory && autoClassified && !formData.category && (
            <div className="category-suggestion">
              Suggested: <strong>{suggestedCategory}</strong>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="submit-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Adding...' : 'Add Entry'}
        </button>
      </form>
    </div>
  );
};

export default AddEntryForm;

