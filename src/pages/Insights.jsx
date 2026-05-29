import { useState, useEffect } from 'react';
import api from '../api/client';
import '../styles/Insights.css';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const CHART_COLORS = [
  '#1a1a2e', '#e2b04a', '#3b82f6', '#10b981',
  '#ef4444', '#8b5cf6', '#f59e0b', '#6366f1',
];

export default function Insights() {
  const [categories, setCategories] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const catRes = await api.get('/categories/');
        setCategories(catRes.data.categories || []);

        // Fetch monthly data for the current year
        const monthPromises = [];
        const currentMonth = new Date().getMonth() + 1;
        for (let m = 1; m <= currentMonth; m++) {
          monthPromises.push(
            api.get(`/spends/month/${m}/`).then((r) => ({
              month: m,
              total: r.data.total_amount || 0,
              count: r.data.count || 0,
            })).catch(() => ({ month: m, total: 0, count: 0 }))
          );
        }
        const results = await Promise.all(monthPromises);
        setMonthlyData(results);
      } catch (err) {
        console.error('Failed to fetch insights:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const categoryTotal = categories.reduce((sum, c) => sum + (c.total_amount || 0), 0);
  const maxMonthly = Math.max(...monthlyData.map((d) => d.total), 1);

  // Donut chart segments
  let cumulativePercent = 0;
  const donutSegments = categories.map((cat, i) => {
    const pct = categoryTotal > 0 ? (cat.total_amount / categoryTotal) * 100 : 0;
    const segment = {
      offset: cumulativePercent,
      pct,
      color: CHART_COLORS[i % CHART_COLORS.length],
      name: cat.name,
    };
    cumulativePercent += pct;
    return segment;
  });

  // Average monthly spend
  const avgMonthly = monthlyData.length > 0
    ? monthlyData.reduce((s, d) => s + d.total, 0) / monthlyData.length
    : 0;

  return (
    <div className="insights-page">
      <div className="insights-header">
        <div>
          <span className="section-label">Performance Overview</span>
          <h2 className="page-title">Financial Intelligence</h2>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Loading insights...</div>
      ) : (
        <div className="insights-grid">
          {/* Category Breakdown */}
          <div className="card breakdown-card">
            <h3 className="card-title">Category Breakdown</h3>
            <div className="donut-container">
              <svg viewBox="0 0 120 120" className="donut-chart">
                {donutSegments.map((seg, i) => (
                  <circle
                    key={i}
                    cx="60" cy="60" r="45"
                    fill="none"
                    stroke={seg.color}
                    strokeWidth="14"
                    strokeDasharray={`${seg.pct * 2.827} ${283 - seg.pct * 2.827}`}
                    strokeDashoffset={`${-seg.offset * 2.827}`}
                    transform="rotate(-90 60 60)"
                  />
                ))}
                <text x="60" y="55" textAnchor="middle" fontSize="16" fontWeight="700" fill="#1a1a2e">
                  ${(categoryTotal / 1000).toFixed(1)}k
                </text>
                <text x="60" y="70" textAnchor="middle" fontSize="9" fill="#6b7280">
                  TOTAL
                </text>
              </svg>
            </div>
            <div className="donut-legend">
              {categories.slice(0, 5).map((cat, i) => (
                <div key={cat.id} className="legend-item">
                  <span
                    className="legend-dot"
                    style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                  />
                  <span className="legend-name">{cat.name}</span>
                  <span className="legend-pct">
                    {categoryTotal > 0 ? ((cat.total_amount / categoryTotal) * 100).toFixed(0) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Score Card */}
          <div className="card score-card">
            <h3 className="card-title">Spending Summary</h3>
            <div className="score-display">
              <div className="score-number">
                <span className="score-value">{monthlyData.length}</span>
                <span className="score-max">/12</span>
              </div>
              <p className="score-text">
                Months tracked this year with {categories.length} active categories.
              </p>
            </div>
            <div className="score-stats">
              <div className="score-stat">
                <span className="score-stat-label">Avg Monthly</span>
                <span className="score-stat-value">
                  ${avgMonthly.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="score-stat">
                <span className="score-stat-label">Year Total</span>
                <span className="score-stat-value">
                  ${categoryTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Largest Outflows */}
          <div className="card outflows-card">
            <div className="card-header-row">
              <h3 className="card-title">Largest Outflows</h3>
            </div>
            <div className="outflows-list">
              {categories.slice(0, 5).map((cat) => (
                <div key={cat.id} className="outflow-item">
                  <div className="outflow-icon">
                    {cat.name.charAt(0)}
                  </div>
                  <span className="outflow-name">{cat.name}</span>
                  <span className="outflow-amount">
                    -${Number(cat.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Trajectory */}
          <div className="card trajectory-card">
            <h3 className="card-title">Monthly Trajectory</h3>
            <p className="trajectory-subtitle">Comparison of each month's cash flow</p>
            <div className="trajectory-chart">
              {monthlyData.map((d) => (
                <div key={d.month} className="trajectory-col">
                  <div className="trajectory-bar-wrapper">
                    <div
                      className="trajectory-bar"
                      style={{ height: `${(d.total / maxMonthly) * 100}%` }}
                      title={`$${d.total.toFixed(2)}`}
                    />
                  </div>
                  <span className="trajectory-label">{MONTHS[d.month - 1]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Active Categories */}
          <div className="card budgets-card">
            <h3 className="card-title">Active Categories</h3>
            <div className="budgets-list">
              {categories.map((cat, i) => {
                const pct = categoryTotal > 0 ? (cat.total_amount / categoryTotal) * 100 : 0;
                return (
                  <div key={cat.id} className="budget-item">
                    <div className="budget-header">
                      <span className="budget-name">{cat.name}</span>
                      <span className="budget-pct">{pct.toFixed(0)}% of total</span>
                    </div>
                    <div className="budget-bar-bg">
                      <div
                        className="budget-bar-fill"
                        style={{
                          width: `${Math.min(pct, 100)}%`,
                          background: CHART_COLORS[i % CHART_COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
