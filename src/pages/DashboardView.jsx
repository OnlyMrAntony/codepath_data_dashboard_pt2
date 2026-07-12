import React from 'react'
import { Link } from 'react-router'
import { ComposedChart, Bar, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function DashboardView({
  searchQuery, 
  setSearchQuery, 
  categoryFilter, 
  setCategoryFilter,
  filteredData,
  totalCount,
  averageRainChance,
  maxContinuousRain,
  totalRainHours
}) {
    const getBadgeClass = (category) => {
    if (category === 'Rainy Day') return 'badge-heavy';
    if (category === 'Brief Showers') return 'badge-light';
    return 'badge-dry';
  };

  return (
    <div className="dashboard-container" style={{ padding: '24px' }}>
      <h2 className="dashboard-title">📊 Advanced Rain Analytics Dashboard</h2>

      {/* Recharts Layout (2 Charts) */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <div style={{ flex: 1, backgroundColor: '#f7fafc', padding: '15px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#4a5568' }}>💧 Story 1: Rainfall Composition Breakdown</h4>
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer>
              <ComposedChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(str) => str.substring(5)} style={{ fontSize: '11px' }} />
                <YAxis style={{ fontSize: '11px' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="rainSum" name="Steady Rain (in)" fill="#3182ce" stackId="a" />
                <Bar dataKey="showersSum" name="Flash Showers (in)" fill="#319795" stackId="a" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ flex: 1, backgroundColor: '#f7fafc', padding: '15px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#4a5568' }}>⏱️ Story 2: Maximum Probability vs Storm Duration</h4>
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer>
              <AreaChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(str) => str.substring(5)} style={{ fontSize: '11px' }} />
                <YAxis style={{ fontSize: '11px' }} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="rainChance" name="Max Chance (%)" stroke="#dd6b20" fill="#feebc8" />
                <Line type="monotone" dataKey="precipHours" name="Duration (hrs)" stroke="#e53e3e" strokeWidth={2} dot={true} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Control Filters */}
      <div className="controls-row">
        <div className="input-group">
          <label className="filter-label">Search Day Name (Text Filter):</label>
          <input
            type="text"
            placeholder="e.g., Tuesday"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="input-group">
          <label className="filter-label">Filter by Storm Duration:</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="category-select"
          >
            <option value="All">All Durations</option>
            <option value="No Rain">No Rain (0 hrs)</option>
            <option value="Brief Showers">Brief Showers (1-3 hrs)</option>
            <option value="Rainy Day">Rainy Day (&gt;3 hrs)</option>
          </select>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-container">
        <div className="stat-card"><h3>Filtered Days Count</h3><p className="stat-value">{totalCount}</p></div>
        <div className="stat-card"><h3>Avg Rain Probability</h3><p className="stat-value">{averageRainChance}%</p></div>
        <div className="stat-card"><h3>Peak Continuous Rain</h3><p className="stat-value">{maxContinuousRain} in</p></div>
        <div className="stat-card"><h3>Total Rain Hours</h3><p className="stat-value">{totalRainHours} hrs</p></div>
      </div>

      {/* Main Table */}
      <table className="weather-table">
        <thead>
          <tr className="table-header-row">
            <th className="table-header">Date</th>
            <th className="table-header">Day</th>
            <th className="table-header">Total Precip (Sum)</th>
            <th className="table-header">Steady Rain</th>
            <th className="table-header">Sudden Showers</th>
            <th className="table-header">Rain Duration</th>
            <th className="table-header">Probability Max</th>
            <th className="table-header">Duration Classification</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.length > 0 ? (
            filteredData.map((row) => (
              <tr key={row.id} className="table-row">
                <td className="table-data">
                  <Link to={`/day/${row.id}`} style={{ color: '#3182ce', fontWeight: '600' }}>{row.date}</Link>
                </td>
                <td className="table-data"><strong>{row.dayName}</strong></td>
                <td className="table-data">{row.precipSum} in</td>
                <td className="table-data">{row.rainSum} in</td>
                <td className="table-data">{row.showersSum} in</td>
                <td className="table-data">{row.precipHours} hrs</td>
                <td className="table-data">{row.rainChance}%</td>
                <td className="table-data">
                  <span className={`condition-badge ${getBadgeClass(row.category)}`}>
                    {row.category}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="8" className="no-results">No weather records match your combined filters.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DashboardView;