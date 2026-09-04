import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Settings, LogOut, Zap } from 'lucide-react';
import '.Pages.css';

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="navbar-container">
      <nav className="navbar-nav">
        
        {/* Brand Logo */}
        <Link to="/dashboard" className="navbar-brand">
          <div className="navbar-logo-icon">
            <Zap size={18} />
          </div>
          <div>
            <span className="navbar-title">
              Smart<span className="text-blue">Watch</span>
            </span>
            <span className="navbar-subtitle">
              CODE 2026 MVP
            </span>
          </div>
        </Link>

        {/* Action Controls */}
        <div className="navbar-actions">
          <Link 
            to="/settings" 
            className="navbar-icon-btn"
            title="Settings"
          >
            <Settings size={18} />
          </Link>
          
          <div className="navbar-divider"></div>

          <button 
            onClick={handleLogout} 
            className="navbar-logout-btn"
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>

      </nav>
    </div>
  );
}