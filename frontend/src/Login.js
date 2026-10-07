import React, { useState } from 'react';
import { auth } from './firebase'; // Import auth from your firebase.js
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from "firebase/auth";
import './Login.css'; // We will create this file next

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLogin, setIsLogin] = useState(true); // Toggle between Login and Sign Up

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    if (isLogin) {
      // --- LOGIN ---
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          // Signed in! (App.js will handle this)
        })
        .catch((error) => {
          setError(error.message); // Show error to user
        });
    } else {
      // --- SIGN UP ---
      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          // Signed up! (App.js will handle this)
        })
        .catch((error) => {
          setError(error.message); // Show error to user
        });
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        {/* 🌊 Rebranded Header */}
        <h1>🌊 CoastIQ</h1>
        <h2>{isLogin ? 'Log In' : 'Sign Up'}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="6"
            />
          </div>
          
          {error && <p className="error-message">{error}</p>}
          
          <button type="submit" className="login-button">
            {isLogin ? 'Log In' : 'Sign Up'}
          </button>
        </form>
        
        <button onClick={() => setIsLogin(!isLogin)} className="toggle-button">
          {isLogin ? 'Need an account? Sign Up' : 'Have an account? Log In'}
        </button>
      </div>
    </div>
  );
}

export default Login;