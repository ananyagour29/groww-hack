import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { ArrowLeft, Activity } from 'lucide-react';
import './Pages.css';

export default function StockDetails() {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchStockDetails();
  }, [symbol]);

  const fetchStockDetails = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/stocks/${symbol}`);
      setStock(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError(true);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="stock-loading-screen">Loading stock details...</div>;
  }

  if (error || !stock) {
    return (
      <div className="stock-error-screen">
        <div className="stock-error-card">
          <p className="stock-error-title">⚠️ Latest market data unavailable</p>
          <p className="stock-error-desc">Showing last available value or API failed to respond.</p>
          <button onClick={() => navigate(-1)} className="stock-back-btn-error">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="stock-details-container">
      <div className="stock-details-wrapper">
        <button onClick={() => navigate(-1)} className="stock-back-btn">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="stock-main-card">
          <div className="stock-header-row">
            <div>
              <h1 className="stock-symbol-title">{stock.symbol}</h1>
              <p className="stock-name-subtitle">{stock.name}</p>
            </div>
            <div className="stock-price-block">
              <span className="stock-current-price">₹{stock.currentPrice}</span>
              <p className={stock.todayChange >= 0 ? 'text-green' : 'text-red'}>
                {stock.todayChange >= 0 ? '+' : ''}{stock.todayChange}% today
              </p>
            </div>
          </div>

          <div className="stock-section-divider">
            <h3 className="stock-section-heading">Since You Last Checked</h3>
            <div className="stock-check-box">
              <div>
                <p className="stock-label-small">Last Checked Price</p>
                <p className="stock-value-large">₹{stock.lastCheckedPrice}</p>
              </div>
              <div className="text-right">
                <p className="stock-label-small">Change Since Visit</p>
                <p className={`stock-value-large ${stock.changeSinceLastCheck >= 0 ? 'text-blue' : 'text-amber'}`}>
                  {stock.changeSinceLastCheck >= 0 ? '+' : ''}{stock.changeSinceLastCheck}%
                </p>
              </div>
            </div>
            {stock.meaningful && (
              <div className="stock-meaningful-banner">
                <Activity size={16} /> ⚡ Meaningful Change: Crossed your threshold limit.
              </div>
            )}
          </div>

          <div className="stock-footer-row">
            <span>Volume: {stock.volume || '1.4M'}</span>
            <span className="stock-live-badge">
              🟢 Updated {stock.updatedAgo || '30 seconds ago'} (Fresh)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}