import { useState, useEffect } from 'react';
import api from '../api/client';
import '../styles/Activity.css';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const RATE_COLORS = { 1: '#10b981', 2: '#ef4444', 3: '#f59e0b' };

export default function Activity() {
  const today = new Date();
  const [viewMode, setViewMode] = useState('monthly');
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [date, setDate] = useState(today.toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [spends, setSpends] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        let res;
        if (viewMode === 'monthly') {
          res = await api.get(`/spends/month/${month}/`);
        } else if (viewMode === 'daily') {
          res = await api.get(`/spends/date/${date}/`);
        } else if (viewMode === 'search' && searchQuery.trim()) {
          res = await api.get('/spends/search/', { params: { q: searchQuery } });
        } else {
          setSpends([]);
          setTotalAmount(0);
          setCount(0);
          setLoading(false);
          return;
        }
        setSpends(res.data.spends || []);
        setTotalAmount(res.data.total_amount || 0);
        setCount(res.data.count || 0);
        setPage(1);
      } catch (err) {
        console.error('Failed to fetch activity:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [viewMode, month, date, searchQuery]);

  const paginatedSpends = spends.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(spends.length / perPage);

  // Simple monthly spending bars
  const maxAmount = Math.max(...spends.map((s) => Number(s.amount)), 1);

  return (
    <div className="activity-page">
      <div className="activity-header">
        <div>
          <h2 className="page-title">Activity</h2>
          <p className="page-subtitle">Review and manage your curated financial history.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="activity-filters">
        <div className="filter-tabs">
          <button
            className={`filter-tab ${viewMode === 'monthly' ? 'filter-tab--active' : ''}`}
            onClick={() => setViewMode('monthly')}
          >
            Monthly
          </button>
          <button
            className={`filter-tab ${viewMode === 'daily' ? 'filter-tab--active' : ''}`}
            onClick={() => setViewMode('daily')}
          >
            Daily
          </button>
          <button
            className={`filter-tab ${viewMode === 'search' ? 'filter-tab--active' : ''}`}
            onClick={() => setViewMode('search')}
          >
            Search
          </button>
        </div>

        <div className="filter-controls">
          {viewMode === 'monthly' && (
            <select
              className="filter-select"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {MONTHS.map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
          )}
          {viewMode === 'daily' && (
            <input
              type="date"
              className="filter-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          )}
          {viewMode === 'search' && (
            <input
              type="text"
              className="filter-input"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          )}

          <div className="filter-summary">
            <span className="summary-count">{count} transactions</span>
            <span className="summary-amount">
              ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="card transactions-card">
        {loading ? (
          <div className="loading-state">Loading transactions...</div>
        ) : paginatedSpends.length === 0 ? (
          <div className="empty-state">No transactions found.</div>
        ) : (
          <>
            <div className="transactions-table">
              <div className="table-header">
                <span className="col-detail">Transaction Details</span>
                <span className="col-date">Date</span>
                <span className="col-category">Category</span>
                <span className="col-rate">Rating</span>
                <span className="col-amount">Amount</span>
              </div>
              {paginatedSpends.map((spend) => (
                <div key={spend.id} className="table-row">
                  <div className="col-detail">
                    <div className="tx-icon">
                      {spend.spend_type?.name?.charAt(0) || '?'}
                    </div>
                    <div className="tx-info">
                      <span className="tx-desc">{spend.description}</span>
                      <span className="tx-location">{spend.location || '-'}</span>
                    </div>
                  </div>
                  <span className="col-date">{spend.date}</span>
                  <span className="col-category">
                    <span className="category-tag">{spend.spend_type?.name || '-'}</span>
                  </span>
                  <span className="col-rate">
                    <span
                      className="rate-dot"
                      style={{ background: RATE_COLORS[spend.spend_rate] || '#6b7280' }}
                    />
                    {spend.spend_rate_display}
                  </span>
                  <span className="col-amount">
                    -${Number(spend.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <span className="page-info">
                  Showing {(page - 1) * perPage + 1}-{Math.min(page * perPage, spends.length)} of {spends.length} transactions
                </span>
                <div className="page-buttons">
                  <button
                    className="page-btn"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    &larr;
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      className={`page-btn ${page === i + 1 ? 'page-btn--active' : ''}`}
                      onClick={() => setPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    className="page-btn"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    &rarr;
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Spending Velocity */}
      <div className="card velocity-card">
        <h3 className="card-title">Spending Velocity</h3>
        <div className="velocity-chart">
          {spends.slice(-15).map((spend, i) => (
            <div key={spend.id} className="velocity-bar-wrapper">
              <div
                className="velocity-bar"
                style={{ height: `${(Number(spend.amount) / maxAmount) * 100}%` }}
                title={`$${spend.amount} - ${spend.description}`}
              />
              <span className="velocity-label">{spend.date.slice(8)}</span>
            </div>
          ))}
        </div>
        <div className="velocity-summary">
          <span className="velocity-stat">
            Net Cashflow: <strong>${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
