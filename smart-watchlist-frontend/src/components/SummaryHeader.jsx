import React from 'react';
import { Zap, CheckCircle2 } from 'lucide-react';

export default function SummaryHeader({ watchlist, threshold }) {
  const meaningfulCount = watchlist.filter(item => Math.abs(item.changeSinceLastCheck) >= threshold).length;

  return (
    <div style={{ 
      background: meaningfulCount > 0 ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' : '#1e293b', 
      border: '1px solid',
      borderColor: meaningfulCount > 0 ? '#f97316' : '#334155',
      borderRadius: '12px', 
      padding: '18px 24px', 
      marginBottom: '24px', 
      color: '#fff', 
      display: 'flex', 
      alignItems: 'center', 
      gap: '16px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ 
        background: meaningfulCount > 0 ? 'rgba(249, 115, 22, 0.2)' : 'rgba(16, 185, 129, 0.2)', 
        padding: '12px', 
        borderRadius: '10px',
        color: meaningfulCount > 0 ? '#f97316' : '#10b981',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {meaningfulCount > 0 ? <Zap size={24} /> : <CheckCircle2 size={24} />}
      </div>
      <div>
        <h3 style={{ margin: '0 0 4px 0', fontSize: '17px', fontWeight: '600' }}>Market Attention Center</h3>
        <p style={{ margin: 0, color: '#94a3b8', fontSize: '13.5px' }}>
          {meaningfulCount > 0 
            ? `⚡ ${meaningfulCount} stock(s) in your watchlist have crossed your threshold since your last check.`
            : `✅ All stocks are stable within your threshold limits. No urgent actions needed.`}
        </p>
      </div>
    </div>
  );
}