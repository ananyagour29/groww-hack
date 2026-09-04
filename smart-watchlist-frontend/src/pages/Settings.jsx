import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { ArrowLeft, Save } from 'lucide-react';
import './Pages.css';

export default function Settings() {
  const navigate = useNavigate();
  const [threshold, setThreshold] = useState(2.0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    API.get('/preferences').then(res => {
      if (res.data?.threshold) setThreshold(res.data.threshold);
    }).catch(err => console.error(err));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await API.put('/preferences', { threshold: Number(threshold) });
      setMessage('Preferences saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to save preferences.');
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-wrapper">
        <button onClick={() => navigate('/dashboard')} className="settings-back-btn">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="settings-card">
          <h1 className="settings-title">Settings</h1>
          <p className="settings-subtitle">Customize how your smart watchlist behaves.</p>

          {message && <div className="settings-message">{message}</div>}

          <form onSubmit={handleSave} className="settings-form">
            <div className="input-group">
              <label>Meaningful Change Threshold (%)</label>
              <p className="input-hint">
                Your app considers a stock meaningful when its price changes by this amount since your last check.
              </p>
              <input 
                type="number" 
                step="0.1" 
                required
                value={threshold} 
                onChange={(e) => setThreshold(e.target.value)}
              />
            </div>

            <button type="submit" className="settings-save-btn">
              <Save size={16} /> Save Preferences
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}