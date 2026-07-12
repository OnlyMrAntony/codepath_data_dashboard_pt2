import React from "react";
import { Link } from "react-router";
function Sidebar({ weatherData }) {
  return (
    <aside className="sidebar-navigation" style={{ width: '260px', backgroundColor: '#1a202c', color: '#fff', padding: '20px', minHeight: '100vh' }}>
      <h3 style={{ margin: '0 0 20px 0', color: '#63b3ed', fontSize: '18px' }}>🌧️ Weather Center</h3>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        <li style={{ marginBottom: '15px' }}>
          <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold', display: 'block' }}>
            🏠 Dashboard Overview
          </Link>
        </li>
        <hr style={{ borderColor: '#2d3748', margin: '15px 0' }} />
        <p style={{ fontSize: '12px', color: '#a0aec0', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>14-Day Shortcuts</p>
        
        {weatherData.map((day) => (
          <li key={day.id} style={{ marginBottom: '8px' }}>
            <Link to={`/day/${day.id}`} style={{ color: '#cbd5e0', textDecoration: 'none', fontSize: '14px', display: 'block' }}>
              📅 {day.dayName} ({day.date.substring(5)})
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default Sidebar;