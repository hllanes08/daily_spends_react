import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import '../styles/Dashboard.css';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const RATE_LABELS = { 1: 'Good', 2: 'Bad', 3: 'Unexpected' };
const RATE_COLORS = { 1: '#10b981', 2: '#ef4444', 3: '#f59e0b' };

export default function Dashboard() {
  const navigate = useNavigate();
  const currentMonth = new Date().getMonth() + 1;
  const [month, setMonth] = useState(currentMonth);
  const [spends, setSpends] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [count, setCount] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [monthRes, catRes] = await Promise.all([
          api.get(`/spends/month/${month}/`),
          api.get('/categories/'),
        ]);
        setSpends(monthRes.data.spends || []);
        setTotalAmount(monthRes.data.total_amount || 0);
        setCount(monthRes.data.count || 0);
        setCategories(catRes.data.categories || []);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [month]);

  const daysInMonth = new Date(new Date().getFullYear(), month, 0).getDate();
  const dailyAvg = count > 0 ? (totalAmount / daysInMonth) : 0;
  const recentSpends = spends.slice(-5).reverse();

  const categoryTotal = categories.reduce((sum, c) => sum + (c.total_amount || 0), 0);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <span className="section-label">Executive Overview</span>
          <h2 className="page-title">Portfolio Summary</h2>
        </div>
        <div className="header-right">
          <select
            className="month-select"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {MONTHS.map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>
          <div className="total-amount">
            <span className="total-label">Total Spent</span>
            <span className="total-value">${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Loading...</div>
      ) : (
        <div className="dashboard-grid">
          {/* Monthly Progress */}
          <div className="card progress-card">
            <h3 className="card-title">Monthly Progress</h3>
            <div className="progress-ring-container">
              <svg viewBox="0 0 120 120" className="progress-ring">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                <circle
                  cx="60" cy="60" r="50"
                  fill="none"
                  stroke="#1a1a2e"
                  strokeWidth="10"
                  strokeDasharray={`${Math.min(count / Math.max(daysInMonth, 1), 1) * 314} 314`}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                />
                <text x="60" y="55" textAnchor="middle" className="progress-text" fontSize="24" fontWeight="700" fill="#1a1a2e">
                  {count}
                </text>
                <text x="60" y="72" textAnchor="middle" fontSize="10" fill="#6b7280">
                  ENTRIES
                </text>
              </svg>
            </div>
            <div className="progress-stats">
              <div className="stat">
                <span className="stat-label">Total</span>
                <span className="stat-value">${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Daily Avg</span>
                <span className="stat-value">${dailyAvg.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card activity-card">
            <div className="card-header-row">
              <h3 className="card-title">Recent Activity</h3>
              <button className="view-all-btn" onClick={() => navigate('/activity')}>View All</button>
            </div>

            {/* Category pills */}
            <div className="category-pills">
              {categories.slice(0, 4).map((cat) => (
                <div key={cat.id} className="category-pill">
                  <div className="pill-icon">
                    {cat.name.charAt(0)}
                  </div>
                  <span className="pill-label">{cat.name}</span>
                </div>
              ))}
            </div>

            <div className="activity-list">
              {recentSpends.length === 0 ? (
                <p className="empty-state">No spends this month yet.</p>
              ) : (
                recentSpends.map((spend) => (
                  <div key={spend.id} className="activity-item">
                    <div className="activity-icon">
                      {spend.spend_type?.name?.charAt(0) || '?'}
                    </div>
                    <div className="activity-details">
                      <span className="activity-desc">{spend.description}</span>
                      <span className="activity-meta">{spend.location || spend.spend_type?.name} &middot; {spend.date}</span>
                    </div>
                    <div className="activity-amount">
                      -${Number(spend.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Insights Panel */}
          <div className="card insight-card">
            <h3 className="card-title">Spending Breakdown</h3>
            <div className="insight-content">
              {categories.length === 0 ? (
                <p className="empty-state">No category data yet.</p>
              ) : (
                <div className="category-list">
                  {categories.map((cat) => {
                    const pct = categoryTotal > 0
                      ? ((cat.total_amount / categoryTotal) * 100).toFixed(1)
                      : 0;
                    return (
                      <div key={cat.id} className="category-row">
                        <div className="category-info">
                          <span className="category-name">{cat.name}</span>
                          <span className="category-pct">{pct}%</span>
                        </div>
                        <div className="category-bar-bg">
                          <div
                            className="category-bar-fill"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="category-amount">
                          ${Number(cat.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="spend-rate-legend">
              {Object.entries(RATE_LABELS).map(([key, label]) => (
                <span key={key} className="rate-badge" style={{ '--rate-color': RATE_COLORS[key] }}>
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
