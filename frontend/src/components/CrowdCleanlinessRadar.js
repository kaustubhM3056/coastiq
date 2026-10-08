import React, { useState, useEffect } from 'react';

const CrowdCleanlinessRadar = ({ beachName }) => {
  const [crowdLevel, setCrowdLevel] = useState(0);
  const [cleanlinessLevel, setCleanlinessLevel] = useState(0);

  useEffect(() => {
    // Generates realistic simulated data for the hackathon demo
    const randomCrowd = Math.floor(Math.random() * (85 - 30 + 1)) + 30; 
    const randomCleanliness = Math.floor(Math.random() * (98 - 60 + 1)) + 60;
    
    // Slight delay for a cool loading animation effect
    setTimeout(() => {
      setCrowdLevel(randomCrowd);
      setCleanlinessLevel(randomCleanliness);
    }, 300);
  }, [beachName]);

  const getCrowdStatus = (level) => {
    if (level >= 75) return "High (Busy)";
    if (level >= 50) return "Moderate";
    return "Low (Quiet)";
  };

  const getCleanlinessStatus = (level) => {
    if (level >= 80) return "Pristine";
    if (level >= 60) return "Average";
    return "Needs Attention";
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Live Community Radar</h3>
      
      {/* Crowd Level Progress */}
      <div style={styles.metricWrapper}>
        <div style={styles.textRow}>
          <span style={styles.label}>Current Crowd: <span style={styles.status}>{getCrowdStatus(crowdLevel)}</span></span>
          <span style={styles.percentage}>{crowdLevel}%</span>
        </div>
        <div style={styles.track}>
          <div 
            style={{ 
              ...styles.fill, 
              width: `${crowdLevel}%`, 
              backgroundColor: crowdLevel > 75 ? '#ff4757' : crowdLevel > 50 ? '#ffa502' : '#2ed573' 
            }}
          />
        </div>
      </div>

      {/* Cleanliness Progress */}
      <div style={styles.metricWrapper}>
        <div style={styles.textRow}>
          <span style={styles.label}>Cleanliness Score: <span style={styles.status}>{getCleanlinessStatus(cleanlinessLevel)}</span></span>
          <span style={styles.percentage}>{cleanlinessLevel}%</span>
        </div>
        <div style={styles.track}>
          <div 
            style={{ 
              ...styles.fill, 
              width: `${cleanlinessLevel}%`, 
              backgroundColor: cleanlinessLevel >= 80 ? '#2ed573' : '#ffa502'
            }}
          />
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '16px',
    padding: '20px 25px',
    marginBottom: '25px',
    width: '100%',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
  },
  title: {
    color: '#ffffff',
    fontSize: '18px',
    fontWeight: '700',
    marginTop: 0,
    marginBottom: '20px',
    letterSpacing: '0.5px'
  },
  metricWrapper: {
    marginBottom: '15px'
  },
  textRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  label: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '13px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  status: {
    color: '#ffffff',
    fontWeight: 'bold'
  },
  percentage: {
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  track: {
    width: '100%',
    height: '8px',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: '10px',
    overflow: 'hidden'
  },
  fill: {
    height: '100%',
    borderRadius: '10px',
    transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s ease'
  }
};

export default CrowdCleanlinessRadar;