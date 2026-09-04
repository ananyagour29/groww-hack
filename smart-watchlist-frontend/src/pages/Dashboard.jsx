import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { Search, Settings, LogOut, Activity, Trash2, Plus } from 'lucide-react';
import SummaryHeader from '../components/SummaryHeader';
import './Pages.css';

export default function Dashboard() {
  const [watchlist, setWatchlist] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [threshold, setThreshold] = useState(2.0); // Default threshold limit
  const navigate = useNavigate();

  useEffect(() => {
    fetchWatchlist();
    fetchPreferences();
  }, []);

  const fetchWatchlist = async () => {
    try {
      const { data } = await API.get('/watchlist');
      setWatchlist(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchPreferences = async () => {
    try {
      const { data } = await API.get('/preferences');
      if (data && data.threshold) {
        setThreshold(data.threshold);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length > 0) {
      try {
        const { data } = await API.get(`/stocks/search?q=${query}`);
        setSearchResults(data);
      } catch (err) {
        console.error(err);
      }
    } else {
      setSearchResults([]);
    }
  };

  const addStock = async (symbol, name) => {
    try {
      await API.post('/watchlist', { symbol, name });
      setSearchQuery('');
      setSearchResults([]);
      fetchWatchlist();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not add stock');
    }
  };

  const removeStock = async (symbol) => {
    try {
      await API.delete(`/watchlist/${symbol}`);
      fetchWatchlist();
    } catch (err) {
      alert('Could not remove stock');
    }
  };

  const meaningfulCount = watchlist.filter(item => item.meaningful).length;

  return (
    <div className="dashboard-container">
      {/* Navbar */}
      <nav className="dashboard-navbar">
        <h1 className="dashboard-logo">📈 SmartWatch</h1>
        <div className="dashboard-nav-actions">
          <Link to="/settings" className="nav-icon-btn" title="Settings"><Settings size={18}/></Link>
          <button onClick={() => { localStorage.clear(); navigate('/'); }} className="nav-logout-btn" title="Logout"><LogOut size={18}/></button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="dashboard-welcome">
          <h2>Good morning 👋</h2>
          <p>Here's what changed since your last visit</p>
        </div>

        {/* --- SUMMARY HEADER COMPONENT INTEGRATED HERE --- */}
        <SummaryHeader watchlist={watchlist} threshold={threshold} />

        {/* Summary Boxes */}
        <div className="dashboard-stats-grid">
          <div className="stat-card highlight">
            <span className="stat-value">{meaningfulCount}</span>
            <p className="stat-label">Meaningful Changes</p>
          </div>
          <div className="stat-card">
            <span className="stat-value">{watchlist.length}</span>
            <p className="stat-label">Total Watchlist</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="search-wrapper">
          <div className="search-bar-container">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search stocks (e.g. Zomato, TCS, INFY)..."
              className="search-input"
              value={searchQuery} 
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          {searchResults.length > 0 && (
            <div className="search-dropdown">
              {searchResults.map((stock) => (
                <div key={stock.symbol} className="search-result-item">
                  <div>
                    <p className="stock-symbol">{stock.symbol}</p>
                    <p className="stock-name">{stock.name}</p>
                  </div>
                  <button onClick={() => addStock(stock.symbol, stock.name)} className="btn-add-stock">
                    <Plus size={14}/> Add
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Watchlist Section */}
        <h3 className="section-title">Your Watchlist</h3>
        {loading ? (
          <p className="loading-text">Loading market state...</p>
        ) : watchlist.length === 0 ? (
          <div className="empty-watchlist">
            No stocks added yet. Search above to track your first stock!
          </div>
        ) : (
          <div className="watchlist-list">
            {watchlist.map((item) => (
              <div key={item.symbol} className="watchlist-card">
                <div className="watchlist-card-header">
                  <div>
                    <h4>{item.symbol}</h4>
                    <p>{item.name}</p>
                  </div>
                  <div className="watchlist-price-box">
                    <span>₹{item.currentPrice}</span>
                    <p className={item.todayChange >= 0 ? 'text-green' : 'text-red'}>
                      {item.todayChange >= 0 ? '+' : ''}{item.todayChange}% today
                    </p>
                  </div>
                </div>

                <div className="watchlist-card-footer">
                  <div>
                    {item.meaningful ? (
                      <span className="badge-meaningful">
                        <Activity size={14} /> ⚡ Meaningful change: {item.changeSinceLastCheck >= 0 ? '+' : ''}{item.changeSinceLastCheck}% since last checked
                      </span>
                    ) : (
                      <span className="badge-normal">
                        ✓ No meaningful change ({item.changeSinceLastCheck >= 0 ? '+' : ''}{item.changeSinceLastCheck}% since last check)
                      </span>
                    )}
                  </div>
                  <button onClick={() => removeStock(item.symbol)} className="btn-remove-stock" title="Remove">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}