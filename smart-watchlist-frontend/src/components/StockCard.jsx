import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Trash2 } from 'lucide-react';
import '.Pages.css';

export default function StockCard({ item, onRemove }) {
  const navigate = useNavigate();

  return (
    <div className="stock-card-container">
      <div className="stock-card-header">
        <div onClick={() => navigate(`/stock/${item.symbol}`)} className="stock-card-info">
          <h4>{item.symbol}</h4>
          <p>{item.name}</p>
        </div>
        <div className="stock-card-price-box">
          <span>₹{item.currentPrice}</span>
          <p className={item.todayChange >= 0 ? 'text-green' : 'text-red'}>
            {item.todayChange >= 0 ? '+' : ''}{item.todayChange}% today
          </p>
        </div>
      </div>

      <div className="stock-card-footer">
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
        <button onClick={() => onRemove(item.symbol)} className="btn-remove-stock" title="Remove stock">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}