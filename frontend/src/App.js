import React, { useState, useEffect } from 'react';
import './App.css';
import Leaderboard from './Leaderboard.js';
import Login from './Login.js'; 
import MyReviews from './MyReviews.js'; 
import { auth } from './firebase'; 
import { onAuthStateChanged, signOut } from "firebase/auth"; 
import 'leaflet/dist/leaflet.css';
import BeachDetails from "./pages/BeachDetails";

function LoadingSpinner() {
  return (
    <div className="spinner-container">
      <div className="spinner"></div>
    </div>
  );
}

function App() {
  const [beachSearch, setBeachSearch] = useState("Baga Beach");
  const [bsiData, setBsiData] = useState(null);
  const [loading, setLoading] = useState(false);

  // We only use setForecast, so ignore the first variable
  const [, setForecast] = useState([]);

  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);

  const [user, setUser] = useState(null);

  // We only use setShowReviewForm, so ignore the first variable
  const [, setShowReviewForm] = useState(false);

  const [viewMode, setViewMode] = useState('home');
  const [currentPage, setCurrentPage] = useState("home");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); 
      setViewMode('home'); 
      setCurrentPage('home');
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchLeaderboard = () => {
      fetch('https://beachbuddy-api.onrender.com/leaderboard')
        .then(res => res.json())
        .then(data => {
          setLeaderboard(data); 
          setLeaderboardLoading(false);
        })
        .catch(err => {
          console.error("Error fetching leaderboard:", err);
          setLeaderboardLoading(false);
        });
    };
    fetchLeaderboard(); 
    const intervalId = setInterval(fetchLeaderboard, 300000);
    return () => clearInterval(intervalId);
  }, []); 

  const handleLogout = () => {
    signOut(auth).catch((error) => console.error("Logout Error:", error));
  };

  const fetchBSI = () => {
    setLoading(true);
    setBsiData(null);
    setForecast([]);
    setShowReviewForm(false); 
    
    fetch(`https://beachbuddy-api.onrender.com/bsi?beach=${encodeURIComponent(beachSearch)}`)
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          setBsiData({ rating: `Error: Sorry, we don't have data for '${beachSearch}'` });
        } else {
          setBsiData(data);
          setCurrentPage("beach");

          // ✅ FORECAST
          fetch(`https://beachbuddy-api.onrender.com/forecast/${encodeURIComponent(beachSearch)}`)
            .then(res => res.json())
            .then(data => {
              console.log("FORECAST:", data);
              setForecast(data);
            })
            .catch(err => console.error("Forecast error:", err)); 

          if (data.rain_mm > 1) {
            alert(`🌧️ RAIN ALERT for ${data.city}!\n\nIt is currently raining.`);
          }
          if (data.wind_speed > 35) {
            alert(`💨 HIGH WIND ALERT for ${data.city}!\n\nUnsafe for swimming!`);
          }
        }
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching data:", error);
        setBsiData({ rating: `Error: Could not fetch data.` });
        setLoading(false);
      });
  };

  const handleLeaderboardClick = (beachName) => {
    setBeachSearch(beachName);
    setTimeout(() => { fetchBSI(); }, 100); 
    window.scrollTo(0, 0); 
  };
  
  if (!user) {
    return <Login />;
  }

  return (
    <div className="App">
      
      {/* Navbar sitting above the hero */}
      <div className="header-top-row" style={{ padding: '20px 40px', background: '#2c3e50', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        {/* 🌊 Rebranded Header to CoastIQ */}
        <h1 style={{ cursor: 'pointer', margin: 0, color: 'white', fontSize: '24px', fontWeight: '800' }} onClick={() => setCurrentPage('home')}>
          🌊 CoastIQ
        </h1>
        <div className="header-buttons">
          <button onClick={() => setViewMode('profile')} className="profile-button" style={{ marginRight: '10px' }}>
            My Profile
          </button>
          <button onClick={handleLogout} className="logout-button">
            Log Out
          </button>
        </div>
      </div>
      
      {currentPage === 'home' && viewMode === 'home' && (
        <div style={{
          position: 'relative',
          backgroundImage: 'url("https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1920&auto=format&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          padding: '120px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          marginBottom: '40px'
        }}>
          {/* Dark Overlay so text is readable */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1
          }}></div>

          <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: '800px' }}>
            <h1 style={{ color: 'white', fontSize: '3.5rem', marginBottom: '15px', textShadow: '2px 4px 8px rgba(0,0,0,0.5)', fontWeight: '800' }}>
              Discover India's Best Beaches
            </h1>
            <p style={{ color: '#f0f0f0', fontSize: '1.4rem', marginBottom: '40px', textShadow: '1px 2px 4px rgba(0,0,0,0.5)' }}>
              Live conditions, AI predictions, and community reviews with CoastIQ.
            </p>

            {/* Glassmorphism Search Console */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(15px)',
              padding: '25px',
              borderRadius: '20px',
              display: 'inline-flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '15px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
            }}>
              <input
                type="text"
                value={beachSearch}
                onChange={(e) => setBeachSearch(e.target.value)}
                placeholder="e.g. Baga Beach, Palolem"
                style={{
                  padding: '16px 24px',
                  borderRadius: '12px',
                  border: 'none',
                  width: '350px',
                  fontSize: '18px',
                  outline: 'none',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                }}
              />
              <button 
                onClick={fetchBSI} 
                disabled={loading}
                style={{
                  padding: '16px 32px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: '#00a8ff',
                  color: 'white',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 15px rgba(0, 168, 255, 0.4)',
                  transition: 'transform 0.2s ease'
                }}
                onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
              >
                {loading ? "Checking..." : "Check Suitability"}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {viewMode === 'home' ? (
        <>
          {currentPage === "home" ? (
            <>
              {leaderboardLoading ? (
                <LoadingSpinner />
              ) : (
                <Leaderboard
                  beaches={leaderboard}
                  onBeachClick={handleLeaderboardClick}
                />
              )}

              {loading && <LoadingSpinner />}
            </>
          ) : (
            <BeachDetails
              bsiData={bsiData}
              onBackToHome={() => setCurrentPage("home")}
            />
          )}
        </>
      ) : (
        <MyReviews onBackToHome={() => setViewMode('home')} />
      )}
    </div>
  );
}

export default App;