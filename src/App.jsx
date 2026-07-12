import { useState, useEffect } from 'react'
import { BrowserRouter, Route, Routes } from "react-router"
import { 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import Sidebar from './components/Sidebar';
import DashboardView from './pages/DashboardView';
import DayDetailView from './pages/DayDetailView';
import './App.css'

function App() {
  const [weatherData, setWeatherData] = useState([])
  const [loading, setLoading] = useState(false)
  const [rawApiHourlyPayload, setRawApiHourlyPayload] = useState(null);
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')

  useEffect(() => {
    async function fetchAdvancedData() {
      try {
        setLoading(true);
        
        // This URL contains exactly the variables checked in your screenshot image
        const response = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&daily=rain_sum,showers_sum,precipitation_sum,precipitation_hours,precipitation_probability_max&hourly=dew_point_2m,relative_humidity_2m,precipitation&timezone=America%2FLos_Angeles&forecast_days=14'
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
        setRawApiHourlyPayload(data.hourly);
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


  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', overflowX: 'hidden' }}>
        
        {/* Persistent Sidebar stays on screen everywhere */}
        <Sidebar weatherData={weatherData} />

        {/* View Switcher Window */}
        <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#fff' }}>
          <Routes>
            <Route 
              path="/" 
              element={
                <DashboardView 
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  categoryFilter={categoryFilter}
                  setCategoryFilter={setCategoryFilter}
                  filteredData={filteredData}
                  totalCount={totalCount}
                  averageRainChance={averageRainChance}
                  maxContinuousRain={maxContinuousRain}
                  totalRainHours={totalRainHours}
                />
              } 
            />
            <Route 
              path="/day/:dayId" 
              element={<DayDetailView weatherData={weatherData} rawApiHourlyPayload={rawApiHourlyPayload} />} 
            />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
