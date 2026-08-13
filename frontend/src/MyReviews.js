 import React, { useState, useEffect } from 'react';
import { auth } from './firebase'; 
import './MyReviews.css'; 

// Helper function to show stars
const renderStars = (rating) => {
  if (!rating || rating === 0) {
    return <span className="stars-na">N/A</span>;
  }
  const simpleRating = Math.round(rating);
  const fullStars = '★'.repeat(simpleRating);
  const emptyStars = '☆'.repeat(5 - simpleRating);
  return <span className="stars">{fullStars}{emptyStars}</span>;
};

// 🔥 NEW: The Brains behind the Badge System
const getBadgeInfo = (reviewCount) => {
  if (reviewCount >= 20) {
    return { title: "Verified Local Guide", icon: "👑", color: "#ffd700", glow: "rgba(255, 215, 0, 0.4)", nextTier: null, required: 20 };
  }
  if (reviewCount >= 5) {
    return { title: "Bronze Surfer", icon: "🏄🏽", color: "#cd7f32", glow: "rgba(205, 127, 50, 0.4)", nextTier: "Verified Local Guide", required: 20 };
  }
  if (reviewCount >= 1) {
    return { title: "Sand Walker", icon: "👣", color: "#00a8ff", glow: "rgba(0, 168, 255, 0.4)", nextTier: "Bronze Surfer", required: 5 };
  }
  return { title: "Beach Observer", icon: "🏖️", color: "#cbd5e1", glow: "rgba(255, 255, 255, 0.2)", nextTier: "Sand Walker", required: 1 };
};

function MyReviews({ onBackToHome }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const user = auth.currentUser;

  useEffect(() => {
    const fetchMyReviews = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (!user) throw new Error("No user logged in.");
        
        const token = await user.getIdToken();

        // 🚨 REPLACE THE URL BELOW WITH YOUR LIVE RENDER URL! 🚨
         const response = await fetch('https://beachbuddy-api.onrender.com/get_my_reviews', {
          headers: {
            'Authorization': `Bearer ${token}` 
          }
        });

        const data = await response.json();

        if (response.status !== 200) {
          throw new Error(data.error || "Could not fetch reviews.");
        }
        
        setReviews(data);
      } catch (err) {
        console.error("Failed to fetch my reviews:", err);
        setError(err.message);
      }
      setLoading(false);
    };

    fetchMyReviews();
  }, [user]); 

  // Calculate Gamification Stats
  const reviewCount = reviews.length;
  const badge = getBadgeInfo(reviewCount);
  const progressPercentage = badge.nextTier ? (reviewCount / badge.required) * 100 : 100;

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.contentContainer}>
        
        {/* Navigation Header */}
        <div style={styles.navHeader}>
          <button onClick={onBackToHome} style={styles.backButton}>⬅ Back to Search</button>
          <h2 style={{ margin: 0, color: 'white' }}>My Profile</h2>
        </div>

        {/* 🔥 THE NEW GAMIFICATION PROFILE CARD */}
        {!loading && !error && (
          <div style={{...styles.profileCard, boxShadow: `0 8px 32px ${badge.glow}`}}>
            <div style={styles.profileHeader}>
              
              {/* User Avatar & Info */}
              <div style={styles.userInfo}>
                <div style={styles.avatar}>{user?.email?.charAt(0).toUpperCase() || "U"}</div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '24px', color: 'white' }}>{user?.email || "Beach Explorer"}</h3>
                  <p style={{ margin: '5px 0 0 0', color: '#cbd5e1' }}>Total Contributions: <strong>{reviewCount}</strong></p>
                </div>
              </div>

              {/* The Badge Display */}
              <div style={{...styles.badgeDisplay, border: `2px solid ${badge.color}`}}>
                <span style={{ fontSize: '32px' }}>{badge.icon}</span>
                <div>
                  <div style={{ fontSize: '12px', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '1px' }}>Current Rank</div>
                  <strong style={{ color: badge.color, fontSize: '18px' }}>{badge.title}</strong>
                </div>
              </div>
              
            </div>

            {/* The Progress Bar to Next Tier */}
            {badge.nextTier && (
              <div style={styles.progressSection}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                  <span style={{ color: '#cbd5e1' }}>Next Rank: <strong>{badge.nextTier}</strong></span>
                  <span style={{ color: 'white', fontWeight: 'bold' }}>{reviewCount} / {badge.required} Reviews</span>
                </div>
                <div style={styles.progressBarBackground}>
                  <div style={{
                    ...styles.progressBarFill, 
                    width: `${progressPercentage}%`,
                    backgroundColor: badge.color
                  }}></div>
                </div>
                <p style={{ margin: '10px 0 0 0', fontSize: '13px', color: '#94a3b8', textAlign: 'center' }}>
                  Only <strong>{badge.required - reviewCount} more reviews</strong> needed to level up!
                </p>
              </div>
            )}
            {!badge.nextTier && (
              <div style={{ marginTop: '20px', textAlign: 'center', color: '#ffd700', fontWeight: 'bold', fontSize: '16px' }}>
                🌟 You have reached the highest rank! You are a BeachBuddy legend. 🌟
              </div>
            )}
          </div>
        )}

        {/* The Original Review List */}
        <h3 style={{ color: 'white', marginTop: '40px', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '10px' }}>
          My Review History
        </h3>

        {loading && <p style={{color: 'white', textAlign: 'center', padding: '40px'}}>Loading your profile...</p>}
        {error && <p className="error-message">{error}</p>}
        
        {!loading && !error && reviewCount === 0 && (
          <div style={styles.emptyState}>
            <span style={{ fontSize: '40px' }}>✍️</span>
            <p>You haven't submitted any reviews yet.</p>
            <p style={{ fontSize: '14px', color: '#94a3b8' }}>Review a beach today to earn your <strong>Sand Walker</strong> badge!</p>
          </div>
        )}

        {!loading && !error && reviewCount > 0 && (
          <div className="review-list">
            {reviews.map((review, index) => (
              <div key={index} className="review-item" style={styles.glassReviewItem}>
                <div className="review-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', marginBottom: '15px' }}>
                  <strong style={{ fontSize: '20px', color: '#00a8ff' }}>{review.beachName}</strong>
                  <span className="review-date" style={{ color: '#cbd5e1' }}>{review.createdAt}</span>
                </div>
                
                <div className="amenities-grid">
                  <div className="amenity-item"><span style={{color:'white'}}>Cleanliness</span>{renderStars(review.cleanliness)}</div>
                  <div className="amenity-item"><span style={{color:'white'}}>Accessibility</span>{renderStars(review.accessibility)}</div>
                  <div className="amenity-item"><span style={{color:'white'}}>Washrooms</span>{renderStars(review.washrooms)}</div>
                  <div className="amenity-item"><span style={{color:'white'}}>Food Stalls</span>{renderStars(review.food)}</div>
                  <div className="amenity-item"><span style={{color:'white'}}>Transport</span>{renderStars(review.transport)}</div>
                  <div className="amenity-item"><span style={{color:'white'}}>Crowd Level</span>{renderStars(review.crowdLevel)}</div>
                  <div className="amenity-item"><span style={{color:'white'}}>Parking</span>{renderStars(review.parking)}</div>
                  <div className="amenity-item"><span style={{color:'white'}}>Family-Friendly</span>{renderStars(review.familyFriendly)}</div>
                  <div className="amenity-item"><span style={{color:'white'}}>Water Sports</span>{renderStars(review.waterSports)}</div>
                </div>
                
                {review.reviewText && (
                  <p className="review-text" style={{ marginTop: '15px', padding: '15px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', color: '#f8fafc', fontStyle: 'italic' }}>
                    "{review.reviewText}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

// 🔥 INLINE STYLES FOR THE GLASSMORPHISM PROFILE
const styles = {
  pageWrapper: {
    minHeight: '100vh',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    padding: '40px 20px',
    boxSizing: 'border-box'
  },
  contentContainer: {
    width: '100%',
    maxWidth: '900px',
  },
  navHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '30px'
  },
  backButton: {
    padding: '10px 20px',
    borderRadius: '12px',
    border: 'none',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: 'white',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
  },
  profileCard: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: '24px',
    padding: '30px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    transition: 'all 0.3s ease'
  },
  profileHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  avatar: {
    width: '70px',
    height: '70px',
    borderRadius: '35px',
    background: 'linear-gradient(135deg, #00a8ff 0%, #0097e6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    fontWeight: 'bold',
    color: 'white',
    boxShadow: '0 4px 15px rgba(0, 168, 255, 0.4)'
  },
  badgeDisplay: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    background: 'rgba(0, 0, 0, 0.4)',
    padding: '15px 25px',
    borderRadius: '16px',
  },
  progressSection: {
    marginTop: '30px',
    background: 'rgba(0, 0, 0, 0.2)',
    padding: '20px',
    borderRadius: '16px'
  },
  progressBarBackground: {
    width: '100%',
    height: '12px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    borderRadius: '6px',
    transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
  },
  glassReviewItem: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    padding: '25px',
    marginBottom: '20px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    color: 'white',
    border: '1px dashed rgba(255, 255, 255, 0.2)'
  }
};

export default MyReviews;