import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import '../styles/AddSpend.css';

export default function AddSpend() {
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];

  const [spendTypes, setSpendTypes] = useState([]);
  const [form, setForm] = useState({
    amount: '',
    spend_type: '',
    date: today,
    description: '',
    location: '',
    spend_rate: 1,
  });
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.get('/spend-types/')
      .then((res) => setSpendTypes(res.data || []))
      .catch((err) => console.error('Failed to fetch spend types:', err));
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setLoading(true);

    try {
      await api.post('/spends/new/', {
        date: form.date,
        description: form.description,
        amount: parseFloat(form.amount),
        spend_type: parseInt(form.spend_type, 10),
        spend_rate: parseInt(form.spend_rate, 10),
        location: form.location,
      });
      setSuccess(true);
      setTimeout(() => navigate('/activity'), 1500);
    } catch (err) {
      if (err.response?.status === 400 && err.response.data) {
        const data = err.response.data;
        if (typeof data === 'object') {
          setFieldErrors(data);
        }
      } else {
        setError('Failed to save transaction. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    navigate(-1);
  }

  if (success) {
    return (
      <div className="add-spend-page">
        <div className="success-card card">
          <div className="success-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 12l2.5 2.5L16 9" />
            </svg>
          </div>
          <h3>Transaction Saved</h3>
          <p>Redirecting to activity...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="add-spend-page">
      <div className="add-spend-card card">
        <div className="add-spend-header">
          <h2 className="add-spend-title">Add Transaction</h2>
          <p className="add-spend-subtitle">Record a new financial movement into your ledger.</p>
        </div>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit} className="add-spend-form">
          {/* Amount */}
          <div className="form-section">
            <label className="form-label">Transaction Amount</label>
            <div className="amount-input-wrapper">
              <span className="amount-prefix">$</span>
              <input
                type="number"
                name="amount"
                className="amount-input"
                placeholder="0.00"
                value={form.amount}
                onChange={handleChange}
                step="0.01"
                min="0"
                required
              />
            </div>
            {fieldErrors.amount && (
              <span className="field-error">{fieldErrors.amount[0]}</span>
            )}
          </div>

          {/* Category & Date row */}
          <div className="form-row">
            <div className="form-section">
              <label className="form-label">Category</label>
              <select
                name="spend_type"
                className="form-select"
                value={form.spend_type}
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>
                {spendTypes.map((st) => (
                  <option key={st.id} value={st.id}>{st.name}</option>
                ))}
              </select>
              {fieldErrors.spend_type && (
                <span className="field-error">{fieldErrors.spend_type[0]}</span>
              )}
            </div>

            <div className="form-section">
              <label className="form-label">Date</label>
              <input
                type="date"
                name="date"
                className="form-date"
                value={form.date}
                onChange={handleChange}
                required
              />
              {fieldErrors.date && (
                <span className="field-error">{fieldErrors.date[0]}</span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="form-section">
            <label className="form-label">Description</label>
            <input
              type="text"
              name="description"
              className="form-text"
              placeholder="e.g. Quarterly audit fee - Q3"
              value={form.description}
              onChange={handleChange}
              maxLength={200}
              required
            />
            {fieldErrors.description && (
              <span className="field-error">{fieldErrors.description[0]}</span>
            )}
          </div>

          {/* Location */}
          <div className="form-section">
            <label className="form-label">Location</label>
            <input
              type="text"
              name="location"
              className="form-text"
              placeholder="e.g. Downtown Store"
              value={form.location}
              onChange={handleChange}
              maxLength={200}
            />
          </div>

          {/* Spend Rate */}
          <div className="form-section">
            <label className="form-label">Rating</label>
            <div className="rate-options">
              {[
                { value: 1, label: 'Good', color: '#10b981' },
                { value: 2, label: 'Bad', color: '#ef4444' },
                { value: 3, label: 'Unexpected', color: '#f59e0b' },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`rate-option ${parseInt(form.spend_rate) === opt.value ? 'rate-option--selected' : ''}`}
                  style={{ '--rate-color': opt.color }}
                >
                  <input
                    type="radio"
                    name="spend_rate"
                    value={opt.value}
                    checked={parseInt(form.spend_rate) === opt.value}
                    onChange={handleChange}
                  />
                  <span className="rate-dot-input" />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={handleCancel}>
              Cancel
            </button>
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? 'Saving...' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
