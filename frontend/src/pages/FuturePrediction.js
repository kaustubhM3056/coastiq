import React, { useState } from 'react';

// ⚙️ Change this URL to your active Ngrok link if it ever updates
const API_BASE_URL = "https://stinking-bondless-worrier.ngrok-free.dev";

// 🔥 Helper function to turn "2026-06-19 15:00:00" into "3:00 PM"
const formatForecastTime = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// 🔥 Helper to format the date
const formatForecastDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

function FuturePrediction({ beachName }) {
  const [selectedDateTime, setSelectedDateTime] = useState("");
  const [predictionData, setPredictionData] = useState(null);
  const [predictionError, setPredictionError] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePrediction = () => {
    if (!selectedDateTime) return;
    setLoading(true);
    setPredictionError("");
    setPredictionData(null);

    const formatted = selectedDateTime.replace("T", " ");

    // ✅ FIXED: Using API_BASE_URL with ngrok bypass header
    fetch(`${API_BASE_URL}/predict?beach=${encodeURIComponent(beachName)}&datetime=${encodeURIComponent(formatted)}`, {
      method: 'GET',
      headers: {
        'ngrok-skip-browser-warning': 'true',
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setPredictionError(data.error);
        } else {
          setPredictionData(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setPredictionError("Network error. Please try again.");
        setLoading(false);
      });
  };

  return (
    <div style={styles.glassContainer}>
      <h2 style={styles.header}>🔮 Future Prediction</h2>
      <p style={{ color: '#cbd5e1', marginBottom: '20px' }}>
        Select a date and time to see forecasted beach conditions for <strong>{beachName}</strong>.
      </p>

      <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="datetime-local"
          value={selectedDateTime}
          onChange={(e) => setSelectedDateTime(e.target.value)}
          style={{
            padding: '14px',
            borderRadius: '12px',
            border: 'none',
            outline: 'none',
            fontSize: '16px',
            background: 'rgba(255, 255, 255, 0.9)',
            color: '#1e293b',
            fontFamily: 'inherit'
          }}
        />
        <button 
          onClick={handlePrediction} 
          disabled={loading} 
          style={styles.predictButton}
        >
          {loading ? "Predicting..." : "Predict"}
        </button>
      </div>

      {predictionError && <p style={{ color: '#ff6b6b', marginTop: '15px', fontWeight: 'bold' }}>{predictionError}</p>}

      {predictionData && (
        <div style={{ marginTop: '30px', paddingTop: '25px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '25px' }}>
            <div style={styles.conditionBadge}>
              Predicted Condition: {predictionData.rating}
            </div>
            <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '10px' }}>
              *Showing the closest available forecast interval.
            </p>
          </div>
          
          <div style={styles.grid}>
            <div style={styles.statBox}>
              <strong style={styles.label}>BSI Score</strong>
              <p style={styles.statValue}>{predictionData.bsi}</p>
            </div>

            <div style={styles.statBox}>
              <strong style={styles.label}>Forecast Time</strong>
              <p style={styles.statValue}>{formatForecastTime(predictionData.time)}</p>
              <p style={{ margin: 0, fontSize: '14px', color: '#cbd5e1' }}>{formatForecastDate(predictionData.time)}</p>
            </div>

            <div style={styles.statBox}>
              <strong style={styles.label}>Temp</strong>
              <p style={styles.statValue}>{predictionData.temp}°C</p>
            </div>
            <div style={styles.statBox}>
              <strong style={styles.label}>Wind</strong>
              <p style={styles.statValue}>{predictionData.wind} km/h</p>
            </div>
            <div style={styles.statBox}>
              <strong style={styles.label}>Rain</strong>
              <p style={styles.statValue}>{predictionData.rain} mm</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  glassContainer: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: '24px',
    padding: '40px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: 'white',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
  },
  header: {
    marginTop: 0, 
    marginBottom: '20px', 
    borderBottom: '1px solid rgba(255,255,255,0.2)', 
    paddingBottom: '10px',
    fontSize: '28px',
    fontWeight: '800'
  },
  predictButton: {
    padding: '14px 28px',
    borderRadius: '12px',
    border: 'none',
    backgroundColor: '#00a8ff',
    color: 'white',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    boxShadow: '0 4px 15px rgba(0, 168, 255, 0.3)'
  },
  conditionBadge: {
    display: 'inline-block',
    background: 'rgba(0, 0, 0, 0.4)',
    padding: '10px 20px',
    borderRadius: '30px',
    fontSize: '18px',
    fontWeight: 'bold',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '20px'
  },
  statBox: {
    background: 'rgba(255, 255, 255, 0.05)',
    padding: '20px 15px',
    borderRadius: '16px',
    textAlign: 'center',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    transition: 'transform 0.3s ease',
  },
  label: {
    display: 'block',
    color: '#cbd5e1',
    fontSize: '13px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '8px'
  },
  statValue: {
    fontSize: '28px',
    margin: '0 0 5px 0',
    fontWeight: '800'
  }
};

export default FuturePrediction;