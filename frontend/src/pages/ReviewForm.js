import React, { useState, useEffect } from 'react';

const ReviewForm = ({ beachName, lat, lon, onReviewSubmitted }) => {
  const [locationStatus, setLocationStatus] = useState('checking'); // checking, failed, verified
  const [distanceKm, setDistanceKm] = useState(null);
  const [crowdLevel, setCrowdLevel] = useState(50);
  const [cleanlinessLevel, setCleanlinessLevel] = useState(50);
  const [comment, setComment] = useState("");

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    console.log("Beach Props received -> Name:", beachName, "Lat:", lat, "Lon:", lon);

    if (!lat || !lon) {
      // If coordinates are missing, fail safe and block
      setLocationStatus('failed');
      setDistanceKm(null);
      return;
    }

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLon = position.coords.longitude;
          console.log("User GPS Location -> Lat:", userLat, "Lon:", userLon);

          const beachLat = parseFloat(lat);
          const beachLon = parseFloat(lon);

          const dist = calculateDistance(userLat, userLon, beachLat, beachLon);
          const roundedDist = Math.round(dist);
          setDistanceKm(roundedDist);
          console.log("Calculated Distance:", roundedDist, "km");

          // STRICT CHECK: Must be within 5 km to pass geofence
          if (roundedDist > 5) {
            setLocationStatus('failed');
          } else {
            setLocationStatus('verified');
          }
        },
        (error) => {
          console.error("Geolocation permission denied or error:", error);
          // If GPS fails or is denied, block for security demo
          setLocationStatus('failed');
          setDistanceKm(null);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setLocationStatus('failed');
    }
  }, [lat, lon, beachName]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onReviewSubmitted();
  };

  return (
    <div style={styles.container}>
      
      {/* STATE 1: Checking GPS */}
      {locationStatus === 'checking' && (
        <div style={styles.statusBox}>
          <div style={styles.loadingPulse}></div>
          <span style={styles.statusText}>Requesting GPS & Verifying Geofence...</span>
        </div>
      )}

      {/* STATE 2: Geofence Blocked (Distance > 5km) */}
      {locationStatus === 'failed' && (
        <div style={styles.errorBox}>
          <h4 style={styles.errorTitle}>Geofence Verification Failed</h4>
          <p style={styles.errorText}>
            Security Protocol Active: You are approximately <strong style={{color: '#ff3b30'}}>{distanceKm !== null ? `${distanceKm} km` : 'a long distance'}</strong> away from {beachName}. You must be within 5 km of the coast to submit live reports.
          </p>
          <button 
            style={styles.bypassBtn} 
            onClick={() => setLocationStatus('verified')}
          >
            Override for Hackathon Demo
          </button>
        </div>
      )}

      {/* STATE 3: Verified & Form Unlocked */}
      {locationStatus === 'verified' && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.successBox}>
            <span style={styles.successText}>Location Verified: Within allowed range of {beachName}.</span>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              Live Crowd Level: <span style={styles.dynamicLabel}>{crowdLevel}%</span>
            </label>
            <input 
              type="range" min="0" max="100" value={crowdLevel} 
              onChange={(e) => setCrowdLevel(e.target.value)} style={styles.slider}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              Live Cleanliness: <span style={styles.dynamicLabel}>{cleanlinessLevel}%</span>
            </label>
            <input 
              type="range" min="0" max="100" value={cleanlinessLevel} 
              onChange={(e) => setCleanlinessLevel(e.target.value)} style={styles.slider}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Comments / Observations</label>
            <textarea 
              value={comment} onChange={(e) => setComment(e.target.value)}
              placeholder="Report specific conditions..." style={styles.textarea} rows="3" required
            />
          </div>

          <button type="submit" style={styles.submitBtn}>
            Broadcast Live Report
          </button>
        </form>
      )}
    </div>
  );
};

const styles = {
  container: { width: '100%', color: '#ffffff' },
  statusBox: {
    display: 'flex', alignItems: 'center', gap: '15px', padding: '20px',
    backgroundColor: 'rgba(0, 168, 255, 0.1)', border: '1px solid rgba(0, 168, 255, 0.3)', borderRadius: '12px'
  },
  loadingPulse: {
    width: '12px', height: '12px', backgroundColor: '#00a8ff', borderRadius: '50%', animation: 'pulse 1.5s infinite'
  },
  statusText: { fontSize: '15px', fontWeight: '600', color: '#00a8ff' },
  errorBox: {
    padding: '20px', backgroundColor: 'rgba(255, 59, 48, 0.1)', border: '1px solid rgba(255, 59, 48, 0.4)',
    borderRadius: '12px', textAlign: 'center'
  },
  errorTitle: { color: '#ff3b30', marginTop: 0, marginBottom: '10px', fontSize: '18px' },
  errorText: { color: '#e0e0e0', fontSize: '14px', lineHeight: '1.5', marginBottom: '20px' },
  bypassBtn: {
    backgroundColor: 'transparent', color: '#a0a0a0', border: '1px solid #a0a0a0',
    padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px'
  },
  successBox: {
    padding: '12px', backgroundColor: 'rgba(46, 213, 115, 0.1)', border: '1px solid rgba(46, 213, 115, 0.4)',
    borderRadius: '8px', marginBottom: '25px', textAlign: 'center'
  },
  successText: { color: '#2ed573', fontWeight: 'bold', fontSize: '14px' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '10px' },
  label: { fontSize: '14px', fontWeight: '600', color: '#d0d0d0' },
  dynamicLabel: { color: '#00a8ff', fontWeight: 'bold' },
  slider: { width: '100%', cursor: 'pointer' },
  textarea: {
    width: '100%', padding: '12px', backgroundColor: 'rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '8px', color: '#ffffff', fontSize: '14px', resize: 'vertical'
  },
  submitBtn: {
    backgroundColor: '#00a8ff', color: '#ffffff', border: 'none', padding: '15px',
    borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px',
    boxShadow: '0 4px 15px rgba(0, 168, 255, 0.3)'
  }
};

export default ReviewForm;