import React, { useState } from 'react';

const SmartPackingList = ({ beachName }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [list, setList] = useState(null);
  const [weatherContext, setWeatherContext] = useState("");

  const generateList = () => {
    setIsGenerating(true);
    
    // Simulates an AI analyzing local data and typing out a response
    setTimeout(() => {
      const conditions = ["Sunny & 32°C", "Breezy & 28°C", "Humid & 30°C", "Clear & 34°C"];
      const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
      setWeatherContext(randomCondition);
      
      let baseList = [
        "High SPF Sunscreen (Reef-safe)",
        "Microfiber Quick-Dry Towel",
        "Reusable Water Bottle (Insulated)",
        "Polarized Sunglasses",
        "Waterproof Phone Pouch",
        "Portable Power Bank"
      ];

      // AI logic: adapts the list based on the simulated weather condition
      if (randomCondition.includes("Sunny") || randomCondition.includes("Clear")) {
        baseList.push("Wide-brimmed Sun Hat");
        baseList.push("Aloe Vera Gel (After-sun care)");
      } else if (randomCondition.includes("Breezy")) {
        baseList.push("Light Windbreaker Jacket");
      } else {
        baseList.push("Electrolyte Hydration Packets");
      }

      setList(baseList);
      setIsGenerating(false);
    }, 1800); // 1.8 second delay to feel like real AI generation
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <h3 style={styles.title}>AI Smart Packing List</h3>
        {!list && !isGenerating && (
          <button style={styles.generateBtn} onClick={generateList}>
            Generate for {beachName}
          </button>
        )}
      </div>
      
      {isGenerating && (
        <div style={styles.loadingContainer}>
          <div style={styles.loadingPulse}></div>
          <span style={styles.loadingText}>Analyzing weather patterns for {beachName}...</span>
        </div>
      )}

      {list && !isGenerating && (
        <div style={styles.listContainer}>
          <p style={styles.contextText}>
            AI Recommendation optimized for: <span style={styles.highlight}>{weatherContext}</span>
          </p>
          <ul style={styles.ul}>
            {list.map((item, index) => (
              <li key={index} style={styles.li}>
                <span style={styles.checkIcon}>✓</span> {item}
              </li>
            ))}
          </ul>
          <button style={styles.resetBtn} onClick={() => setList(null)}>
            Clear List
          </button>
        </div>
      )}
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
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: '#ffffff',
    fontSize: '18px',
    fontWeight: '700',
    margin: 0,
    letterSpacing: '0.5px'
  },
  generateBtn: {
    backgroundColor: '#00a8ff',
    color: '#ffffff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s'
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: '20px',
    padding: '15px',
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '8px'
  },
  loadingPulse: {
    width: '10px',
    height: '10px',
    backgroundColor: '#00a8ff',
    borderRadius: '50%',
    animation: 'pulse 1.5s infinite'
  },
  loadingText: {
    color: '#a0a0a0',
    fontSize: '14px',
    fontStyle: 'italic'
  },
  listContainer: {
    marginTop: '20px',
    paddingTop: '15px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)'
  },
  contextText: {
    color: '#a0a0a0',
    fontSize: '14px',
    marginBottom: '15px'
  },
  highlight: {
    color: '#ffffff',
    fontWeight: 'bold'
  },
  ul: {
    listStyleType: 'none',
    padding: 0,
    margin: 0,
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '12px'
  },
  li: {
    color: '#ffffff',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(255, 255, 255, 0.03)',
    padding: '10px 15px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.05)'
  },
  checkIcon: {
    color: '#2ed573',
    fontWeight: 'bold'
  },
  resetBtn: {
    backgroundColor: 'transparent',
    color: '#ff4757',
    border: '1px solid rgba(255, 71, 87, 0.5)',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '20px',
    transition: 'all 0.3s'
  }
};

// Add CSS animation for the pulse effect directly to the document
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes pulse {
    0% { transform: scale(0.95); opacity: 0.5; }
    50% { transform: scale(1.2); opacity: 1; }
    100% { transform: scale(0.95); opacity: 0.5; }
  }
`;
document.head.appendChild(styleSheet);

export default SmartPackingList;