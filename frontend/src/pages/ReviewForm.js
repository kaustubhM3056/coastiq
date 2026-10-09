import React, { useState, useEffect } from 'react';

// currentAvgCrowd and currentAvgClean represent the backend's rolling average of the last 10-15 reviews (Rule 4)
const ReviewForm = ({ beachName, lat, lon, onReviewSubmitted, currentAvgCrowd = 50, currentAvgClean = 50 }) => {
  const [distance, setDistance] = useState(null);
  const [geoStatus, setGeoStatus] = useState("loading"); // loading, blocked, approved
  
  const [crowd, setCrowd] = useState(50);
  const [cleanliness, setCleanliness] = useState(50);
  const [comment, setComment] = useState("");
  const [formError, setFormError] = useState("");

  // RULE 1: STRICT 5KM GEOFENCE CALCULATION
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; 
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
    if (!navigator.geolocation) {
      setGeoStatus("blocked");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const uLat = pos.coords.latitude;
        const uLon = pos.coords.longitude;
        const bLat = parseFloat(lat) || 15.5529;
        const bLon = parseFloat(lon) || 73.7517;

        const dist = calculateDistance(uLat, uLon, bLat, bLon);
        setDistance(dist.toFixed(1));

        // ⚠️ HACKATHON DEMO NOTE: 
        // Change '5' to '5000' right here if you need to show the form to judges while at home!
        if (dist > 5) {
          setGeoStatus("blocked"); // Physically locks out the user
        } else {
          setGeoStatus("approved"); // Unlocks form
        }
      },
      () => setGeoStatus("blocked"),
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }, [lat, lon]);

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevents default form submission
    setFormError("");

    // RULE 3: DATASET TOPIC RESTRICTION (NLP Content Filter)
    const validKeywords = ["beach", "water", "sand", "crowd", "clean", "dirty", "sea", "ocean", "waves", "plastic", "trash", "safe", "people", "tide"];
    const textLower = comment.toLowerCase();
    const isRelevant = validKeywords.some(word => textLower.includes(word));
    
    if (!isRelevant) {
      setFormError("⛔ Content Blocked: Review rejected. Comments must relate to beach conditions (e.g., mention water, sand, cleanliness, or crowds).");
      return; // Instantly kills the submission
    }

    // RULE 2 & 4: ANOMALY DETECTION AGAINST LAST 10-15 REVIEWS
    const crowdDiff = Math.abs(crowd - currentAvgCrowd);
    const cleanDiff = Math.abs(cleanliness - currentAvgClean);

    if (crowdDiff > 40 || cleanDiff > 40) {
      setFormError(`⚠️ Anomaly Detected: Your ratings deviate heavily from the last 15 verified reviews (Avg Crowd: ${currentAvgCrowd}%, Avg Cleanliness: ${currentAvgClean}%). False ratings are blocked.`);
      return; // Instantly kills the submission
    }

    // IF ALL CHECKS PASS: Send to backend
    onReviewSubmitted({ crowd, cleanliness, comment });
  };

  return (
    <div style={styles.container}>
      
      {/* STATE 1: LOADING GPS */}
      {geoStatus === "loading" && (
        <div style={styles.statusBox}>
          <span style={styles.statusText}>Verifying Live GPS Coordinates...</span>
        </div>
      )}

      {/* STATE 2: RULE 1 ENFORCEMENT - BLOCKED (Form does not exist in the DOM) */}
      {geoStatus === "blocked" && (
        <div style={styles.errorBox}>
          <h4 style={styles.errorTitle}>Geofence Verification Failed</h4>
          <p style={styles.errorText}>
            Security Protocol Active: You are approximately <strong style={{color: '#ff3b30'}}>{distance !== null ? `${distance} km` : 'outside the radius'}</strong> away from {beachName}. 
            <br/><br/>
            You must be physically present (within 5km) to submit a live report.
          </p>
        </div>
      )}

      {/* STATE 3: RULE 1 PASSED - FORM UNLOCKED */}
      {geoStatus === "approved" && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.successBox}>
            <span style={styles.successText}>GPS Verified: You are inside the 5km zone.</span>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              Live Crowd Level: <span style={styles.dynamicLabel}>{crowd}%</span>
            </label>
            <input 
              type="range" min="0" max="100" value={crowd} 
              onChange={(e) => setCrowd(e.target.value)} style={styles.slider}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              Live Cleanliness: <span style={styles.dynamicLabel}>{cleanliness}%</span>
            </label>
            <input 
              type="range" min="0" max="100" value={cleanliness} 
              onChange={(e) => setCleanliness(e.target.value)} style={styles.slider}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Review Comments (Required)</label>
            <textarea 
              value={comment} onChange={(e) => setComment(e.target.value)}
              placeholder="Report specific conditions (e.g., 'The water is very clean today')..." 
              style={styles.textarea} rows="3" required
            />
          </div>

          {formError && (
            <div style={styles.validationError}>{formError}</div>
          )}

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
  statusBox: { padding: '20px', backgroundColor: 'rgba(0, 168, 255, 0.1)', border: '1px solid rgba(0, 168, 255, 0.3)', borderRadius: '12px', textAlign: 'center' },
  statusText: { fontSize: '15px', fontWeight: '600', color: '#00a8ff' },
  errorBox: { padding: '20px', backgroundColor: 'rgba(255, 59, 48, 0.1)', border: '1px solid rgba(255, 59, 48, 0.4)', borderRadius: '12px', textAlign: 'center' },
  errorTitle: { color: '#ff3b30', marginTop: 0, marginBottom: '10px', fontSize: '18px' },
  errorText: { color: '#e0e0e0', fontSize: '14px', lineHeight: '1.5' },
  successBox: { padding: '12px', backgroundColor: 'rgba(46, 213, 115, 0.1)', border: '1px solid rgba(46, 213, 115, 0.4)', borderRadius: '8px', marginBottom: '15px', textAlign: 'center' },
  successText: { color: '#2ed573', fontWeight: 'bold', fontSize: '14px' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '10px' },
  label: { fontSize: '14px', fontWeight: '600', color: '#d0d0d0' },
  dynamicLabel: { color: '#00a8ff', fontWeight: 'bold' },
  slider: { width: '100%', cursor: 'pointer' },
  textarea: { width: '100%', padding: '12px', backgroundColor: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '8px', color: '#ffffff', fontSize: '14px', resize: 'vertical' },
  validationError: { padding: '12px', backgroundColor: 'rgba(255, 159, 10, 0.15)', border: '1px solid #ff9f0a', borderRadius: '8px', color: '#ff9f0a', fontSize: '13px', fontWeight: '600', lineHeight: '1.4' },
  submitBtn: { backgroundColor: '#00a8ff', color: '#ffffff', border: 'none', padding: '15px', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }
};

export default ReviewForm;