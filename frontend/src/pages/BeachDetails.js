import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Overview from "../components/Overview";
import BeachAI from "../BeachAI"; 
import FuturePrediction from "./FuturePrediction"; 
import MapView from "../MapView"; 
import AverageRatings from "../AverageRatings";
import ReviewList from "../ReviewList";
import ReviewForm from "../ReviewForm";
import NearbyPlaces from "../components/NearbyPlaces";
import Photos from '../components/Photos';

// Hackathon Feature Imports
import LiveWeatherWidget from "../components/LiveWeatherWidget";
import EmergencySOS from "../components/EmergencySOS";
import CrowdCleanlinessRadar from "../components/CrowdCleanlinessRadar";
import SmartPackingList from "../components/SmartPackingList";

function BeachDetails({ bsiData, onBackToHome }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [showReviews, setShowReviews] = useState(false);
  const [showWriteReview, setShowWriteReview] = useState(false);

  if (!bsiData) return null;

  return (
    <div style={{
      backgroundImage: 'url("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1920&auto=format&fit=crop")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      minHeight: '100vh',
      width: '100%',
      position: 'relative',
      display: 'flex',
      justifyContent: 'center'
    }}>
      
      {/* Background Overlay */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)', zIndex: 1
      }}></div>

      {/* Floating SOS Widget */}
      <EmergencySOS beachName={bsiData.city} lat={bsiData.lat} lon={bsiData.lon} />

      <div style={{ 
        display: 'flex', 
        width: '100%', 
        maxWidth: '1300px', 
        margin: '40px auto', 
        zIndex: 2, 
        gap: '40px', 
        padding: '0 20px',
        alignItems: 'flex-start'
      }}>
        
        {/* LEFT SIDE: Floating Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onBackToHome={onBackToHome}
        />

        {/* RIGHT SIDE: Dynamic Content */}
        <div style={{ flex: 1 }}>
          
          {/* 🔥 THE FIX: Grouping the widgets so they ONLY show on the Overview tab */}
          {activeTab === "overview" && (
            <>
              <LiveWeatherWidget lat={bsiData.lat} lon={bsiData.lon} />
              <CrowdCleanlinessRadar beachName={bsiData.city} />
              <SmartPackingList beachName={bsiData.city} />
              <Overview bsiData={bsiData} />
            </>
          )}
          
          {activeTab === "nearby" && <NearbyPlaces beachName={bsiData.city} />}
          
          {activeTab === "photos" && <Photos bsiData={bsiData} />}
          
          {activeTab === "ai" && (
            <div style={styles.glassContainer}>
              <h2 style={styles.header}>Beach AI Guide</h2>
              <BeachAI data={bsiData} />
            </div>
          )}

          {activeTab === "prediction" && <FuturePrediction beachName={bsiData.city} />}
          
          {activeTab === "map" && (
            <div style={styles.glassContainer}>
              <h2 style={styles.header}>Live Map Location</h2>
              <div style={{ borderRadius: '16px', overflow: 'hidden', zIndex: 0, position: 'relative' }}>
                <MapView lat={bsiData.lat} lon={bsiData.lon} name={bsiData.city} />
              </div>

              {/* Travel & Ticket Booking Options */}
              <div style={styles.bookingContainer}>
                <span style={styles.bookingTitle}>Book Travel to {bsiData.city}:</span>
                <div style={styles.buttonGroup}>
                  
                  <button 
                    style={styles.travelBtn}
                    onClick={() => window.open(`https://www.redbus.in/bus-tickets/${encodeURIComponent(bsiData.city)}`, '_blank')}
                  >
                    By Road
                  </button>

                  <button 
                    style={styles.travelBtn}
                    onClick={() => window.open('https://www.irctc.co.in', '_blank')}
                  >
                    By Train
                  </button>

                  <button 
                    style={styles.travelBtn}
                    onClick={() => window.open(`https://www.google.com/travel/flights?q=flights+to+${encodeURIComponent(bsiData.city)}`, '_blank')}
                  >
                    By Air
                  </button>
                  
                </div>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div style={styles.glassContainer}>
              <h2 style={styles.header}>Community Reviews</h2>
              
              <AverageRatings averages={bsiData.average_ratings} />
              
              <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '30px' }}>
                <button 
                  onClick={() => {
                    setShowWriteReview(!showWriteReview);
                    if (!showWriteReview) setShowReviews(false);
                  }}
                  style={showWriteReview ? styles.cancelButton : styles.actionButton}
                >
                  {showWriteReview ? "Cancel" : "Write a Review"}
                </button>

                <button 
                  onClick={() => {
                    setShowReviews(!showReviews);
                    if (!showReviews) setShowWriteReview(false);
                  }}
                  style={showReviews ? styles.activeToggleButton : styles.inactiveToggleButton}
                >
                  {showReviews ? "Hide Recent Reviews" : "Show Recent Reviews"}
                </button>
              </div>

              {showWriteReview && (
                <div style={styles.innerGlassPanel}>
                  <h3 style={{ marginTop: 0, color: 'white', marginBottom: '15px' }}>Submit Your Review</h3>
                  
                  <ReviewForm 
                    beachName={bsiData.city} 
                    lat={bsiData.lat}
                    lon={bsiData.lon}
                    onReviewSubmitted={() => {
                      setShowWriteReview(false);
                      setShowReviews(true);
                    }} 
                  />
                </div>
              )}

              {showReviews && (
                <div style={{ marginTop: '30px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '20px' }}>
                  <ReviewList beachName={bsiData.city} />
                </div>
              )}
              
            </div>
          )}

        </div>
      </div>
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
    marginBottom: '25px', 
    borderBottom: '1px solid rgba(255,255,255,0.2)', 
    paddingBottom: '15px',
    fontSize: '28px',
    fontWeight: '800'
  },
  innerGlassPanel: {
    marginTop: '25px', 
    padding: '25px', 
    background: 'rgba(0,0,0,0.3)', 
    borderRadius: '16px', 
    border: '1px solid rgba(255,255,255,0.1)'
  },
  actionButton: {
    padding: '14px 28px',
    borderRadius: '12px',
    border: 'none',
    backgroundColor: '#00a8ff',
    color: 'white',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(0, 168, 255, 0.3)'
  },
  cancelButton: {
    padding: '14px 28px',
    borderRadius: '12px',
    border: 'none',
    backgroundColor: '#ff6b6b',
    color: 'white',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)'
  },
  activeToggleButton: {
    padding: '14px 28px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.4)',
    background: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  inactiveToggleButton: {
    padding: '14px 28px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    background: 'rgba(0, 0, 0, 0.3)',
    color: 'white',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  bookingContainer: {
    background: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '16px',
    padding: '16px 20px',
    marginTop: '25px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '15px'
  },
  bookingTitle: {
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: '600',
    letterSpacing: '0.5px'
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap'
  },
  travelBtn: {
    padding: '10px 18px',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(0, 168, 255, 0.2)',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  }
};

export default BeachDetails;