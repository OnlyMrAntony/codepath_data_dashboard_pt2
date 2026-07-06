import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [weatherData, setWeatherData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')

  useEffect(() => {
    async function fetchAdvancedData() {
      try {
        setLoading(true);
        
        // This URL contains exactly the variables checked in your screenshot image
        const response = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&daily=precipitation_sum,precipitation_hours,precipitation_probability_max,rain_sum,showers_sum&timezone=America%2FLos_Angeles&forecast_days=14&wind_speed_unit=mph&temperature_unit=fahrenheit&precipitation_unit=inch'
        );
        
        if (!response.ok) throw new Error('Could not connect to Open-Meteo API');
        const data = await response.json();
        
        // Mapping through all the parallel arrays checked in your screenshot
        const formattedDays = data.daily.time.map((timeString, index) => {
          const dateObj = new Date(timeString + 'T00:00:00');
          const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
          
          const precipSum = data.daily.precipitation_sum[index]; // Overall Total
          const rainSum = data.daily.rain_sum[index];             // Continuous rain
          const showersSum = data.daily.showers_sum[index];       // Sudden showers
          const precipHours = data.daily.precipitation_hours[index]; // Duration
          const rainChance = data.daily.precipitation_probability_max[index]; // Probability

          // Category filter uses a separate attribute than text search (Precipitation Hours)
          let durationCategory = 'No Rain';
          if (precipHours > 0 && precipHours <= 3) durationCategory = 'Brief Showers';
          if (precipHours > 3) durationCategory = 'Rainy Day';

          return {
            id: timeString,
            date: timeString,
            dayName,
            precipSum,     // Row Feature 1
            rainSum,
            showersSum,
            precipHours,   // Row Feature 2
            rainChance,
            category: durationCategory 
          };
        });

        setWeatherData(formattedDays);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }
    fetchAdvancedData();
  }, []);

  // --- Dynamic Live Filtering ---
  const filteredData = weatherData.filter((item) => {
    // Search bar filters by day name text string
    const matchesSearch = item.dayName.toLowerCase().includes(searchQuery.toLowerCase());
    // Dropdown filters by the separate condition attribute (Rain Duration Category)
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // --- 3 Unique Summary Statistics ---
  const totalCount = filteredData.length;

  // 1. Mean/Average: Average precipitation probability across filtered days
  const averageRainChance = totalCount > 0 
    ? (filteredData.reduce((sum, item) => sum + item.rainChance, 0) / totalCount).toFixed(1) 
    : 0;

  // 2. Range/Max: The maximum amount of continuous rain expected in a single day
  const maxContinuousRain = totalCount > 0 
    ? Math.max(...filteredData.map(item => item.rainSum)).toFixed(2) 
    : 0;

  // 3. Cumulative Total: Total sum of hours it will rain across all visible days
  const totalRainHours = totalCount > 0
    ? filteredData.reduce((sum, item) => sum + item.precipHours, 0).toFixed(1)
    : 0;


  if (loading) return <div className="loading-screen">Reading Your Custom Open-Meteo Variables...</div>;
  if (error) return <div className="error-screen">Error: {error}</div>;

  const getBadgeClass = (category) => {
    if (category === 'Rainy Day') return 'badge-heavy';
    if (category === 'Brief Showers') return 'badge-light';
    return 'badge-dry';
  };

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">📊 Advanced Rain Analytics Dashboard</h2>

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
          <label className="filter-label">Filter by Storm Duration Category:</label>
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

      {/* Summary Statistics Display (3 Unique Items) */}
      <div className="stats-container">
        <div className="stat-card">
          <h3>Filtered Days Count</h3>
          <p className="stat-value">{totalCount}</p>
        </div>
        <div className="stat-card">
          <h3>Avg Rain Probability</h3>
          <p className="stat-value">{averageRainChance}%</p>
        </div>
        <div className="stat-card">
          <h3>Peak Continuous Rain</h3>
          <p className="stat-value">{maxContinuousRain} in</p>
        </div>
        <div className="stat-card">
          <h3>Total Rain Hours</h3>
          <p className="stat-value">{totalRainHours} hrs</p>
        </div>
      </div>

      {/* Main Dashboard Grid */}
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
                <td className="table-data">{row.date}</td>
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
            <tr>
              <td colSpan="8" className="no-results">No weather records match your combined filters.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App
