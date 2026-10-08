import React, { useState } from 'react';

const EmergencySOS = ({ beachName, lat, lon }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleShareLocation = () => {
    const message = `EMERGENCY SOS: I need immediate assistance at ${beachName}. My exact map coordinates are: https://maps.google.com/?q=${lat},${lon}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  // 🔥 NEW: Smart Lifeguard Detection Logic
  const getLifeguardStatus = (name) => {
    if (!name) return { text: "Unknown Status", color: "#a0a0a0" };
    
    const lowerName = name.toLowerCase();
    
    // List of famous/commercial beaches that typically have lifeguards
    const commercialBeaches = ['baga', 'calangute', 'anjuna', 'candolim', 'juhu', 'marina', 'colva', 'palolem', 'kovalam'];
    
    const isCommercial = commercialBeaches.some(beach => lowerName.includes(beach));
    
    if (isCommercial) {
      return { text: "Drishti Marine (Active)", color: "#00a8ff" }; // Safe Blue
    } else {
      return { text: "Unmanned - No Lifeguard", color: "#ff3b30" }; // Warning Red
    }
  };

  const lifeguardStatus = getLifeguardStatus(beachName);

  return (
    <>
      {/* Floating SOS Button */}
      <button 
        style={styles.sosFloatingButton} 
        onClick={() => setIsOpen(true)}
        title="Emergency SOS"
      >
        SOS
      </button>

      {/* Emergency Modal Overlay */}
      {isOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2 style={styles.modalHeader}>Emergency Assistance</h2>
            <p style={styles.warningText}>Use only in case of a real emergency at {beachName}.</p>
            
            <div style={styles.contactList}>
              <div style={styles.contactItem}>
                <span style={styles.contactLabel}>Coastal Police Hotline:</span>
                <a href="tel:1093" style={styles.contactNumber}>1093</a>
              </div>
              <div style={styles.contactItem}>
                <span style={styles.contactLabel}>Ambulance / Medical:</span>
                <a href="tel:108" style={styles.contactNumber}>108</a>
              </div>
              
              {/* 🔥 NEW: Dynamic Lifeguard Display */}
              <div style={styles.contactItem}>
                <span style={styles.contactLabel}>Lifeguard Command:</span>
                <span style={{ ...styles.contactNumber, color: lifeguardStatus.color }}>
                  {lifeguardStatus.text}
                </span>
              </div>
              
            </div>

            <button style={styles.shareButton} onClick={handleShareLocation}>
              Share Live Location via WhatsApp
            </button>

            <button style={styles.closeButton} onClick={() => setIsOpen(false)}>
              Cancel / Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

const styles = {
  sosFloatingButton: {
    position: 'fixed',
    bottom: '40px',
    right: '40px',
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    backgroundColor: '#ff3b30',
    color: '#ffffff',
    fontSize: '20px',
    fontWeight: '900',
    border: '4px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 8px 25px rgba(255, 59, 48, 0.6)',
    cursor: 'pointer',
    zIndex: 9998,
    transition: 'transform 0.2s ease',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    zIndex: 9999,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: 'rgba(30, 30, 30, 0.9)',
    border: '1px solid rgba(255, 59, 48, 0.5)',
    borderRadius: '20px',
    padding: '40px',
    width: '90%',
    maxWidth: '450px',
    boxShadow: '0 15px 40px rgba(0, 0, 0, 0.4)',
    textAlign: 'center'
  },
  modalHeader: {
    color: '#ff3b30',
    marginTop: 0,
    marginBottom: '10px',
    fontSize: '26px',
    fontWeight: '800'
  },
  warningText: {
    color: '#a0a0a0',
    fontSize: '14px',
    marginBottom: '25px',
    fontWeight: '500'
  },
  contactList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginBottom: '30px'
  },
  contactItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(0, 0, 0, 0.4)',
    padding: '15px 20px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },
  contactLabel: {
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: '600'
  },
  contactNumber: {
    color: '#00a8ff',
    fontSize: '18px',
    fontWeight: 'bold',
    textDecoration: 'none'
  },
  shareButton: {
    width: '100%',
    padding: '16px',
    borderRadius: '12px',
    border: 'none',
    backgroundColor: '#25D366', // WhatsApp Green
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginBottom: '15px',
    boxShadow: '0 4px 15px rgba(37, 211, 102, 0.3)'
  },
  closeButton: {
    width: '100%',
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    backgroundColor: 'transparent',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer'
  }
};

export default EmergencySOS;