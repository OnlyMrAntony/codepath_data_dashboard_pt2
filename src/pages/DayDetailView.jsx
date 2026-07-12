import React from 'react';
import { useParams, Link } from 'react-router';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function DayDetailView({ weatherData, rawApiHourlyPayload }) {
  const { dayId } = useParams();
  
  const selectedDay = weatherData.find((item) => item.id === dayId);

  if (!selectedDay) {
    return <div className="error-screen" style={{ padding: '24px' }}>Error: Day reference parameter mismatch. <Link to="/">Return to Dashboard</Link></div>;
  }

  const chartData = [];
  let matchingHoursCount = 0;

  if (rawApiHourlyPayload && rawApiHourlyPayload.time) {
    rawApiHourlyPayload.time.forEach((timestamp, idx) => {
      if (timestamp.startsWith(dayId)) {
        matchingHoursCount++;
        chartData.push({
          time: new Date(timestamp).toLocaleTimeString('en-US', { hour: 'numeric' }),
          "Precipitation (in)": rawApiHourlyPayload.precipitation ? rawApiHourlyPayload.precipitation[idx] : 0,
          "Humidity (%)": rawApiHourlyPayload.relative_humidity_2m ? rawApiHourlyPayload.relative_humidity_2m[idx] : 0,
          "Dewpoint (°F)": rawApiHourlyPayload.dew_point_2m ? rawApiHourlyPayload.dew_point_2m[idx] : 0
        });
      }
    });
  }

  let confidenceScore = "Medium Forecast Reliability";
  if (selectedDay.rainChance > 80 && selectedDay.precipSum > 0.3) confidenceScore = "High Storm Confidence Pattern Match";
  if (selectedDay.rainChance < 15 && selectedDay.precipSum === 0) confidenceScore = "High Absolute Clear Sky Pattern Match";

  return (
    <div className="detail-view-container" style={{ padding: '24px' }}>
      <Link to="/" style={{ color: '#3182ce', textDecoration: 'none', fontWeight: '600' }}>← Return to Grid Overview</Link>
      
      <h2 style={{ marginTop: '15px', color: '#000' }}>🔍 Detailed Meteorological Breakdown: {selectedDay.dayName}</h2>
      <p style={{ color: '#718096' }}>Historical Record Date Identification String: <code>{dayId}</code></p>

      <div className="stats-container" style={{ display: 'flex', gap: '15px', margin: '20px 0' }}>
        <div className="stat-card" style={{ flex: 1 }}>
          <h3>Model Confidence Matrix</h3>
          <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#2b6cb0', margin: '10px 0 0 0' }}>{confidenceScore}</p>
        </div>
        <div className="stat-card" style={{ flex: 1 }}>
          <h3>Captured Chrono-Logs</h3>
          <p className="stat-value">{matchingHoursCount} <span style={{ fontSize: '14px', color: '#718096' }}>intervals</span></p>
        </div>
      </div>

      <h3 className="filter-label" style={{ marginTop: '30px' }}>24-Hour Atmospheric Moisture vs Intensity Profile</h3>
      <div style={{ width: '100%', height: 320, backgroundColor: '#f7fafc', padding: '15px', borderRadius: '10px', marginTop: '10px' }}>
        <ResponsiveContainer>
          <ComposedChart data={chartData}>
            <CartesianGrid stroke="#eee" />
            <XAxis dataKey="time" style={{ fontSize: '11px' }} />
            <YAxis yAxisId="left" label={{ value: 'Precip (in)', angle: -90, position: 'insideLeft' }} style={{ fontSize: '11px' }} />
            <YAxis yAxisId="right" orientation="right" label={{ value: 'Humidity / Temp', angle: 90, position: 'insideRight' }} style={{ fontSize: '11px' }} />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="Precipitation (in)" fill="#3182ce" />
            <Line yAxisId="right" type="monotone" dataKey="Humidity (%)" stroke="#319795" dot={false} />
            <Line yAxisId="right" type="monotone" dataKey="Dewpoint (°F)" stroke="#dd6b20" strokeDasharray="3 3" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
export default DayDetailView;