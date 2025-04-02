import React from 'react';
import { Signal } from '../types';

interface PreviewCardProps {
  signal: Signal;
}

const PreviewCard: React.FC<PreviewCardProps> = ({ signal }) => {
  // Calculate profit/loss metrics if we have valid data
  const hasPrices = signal.entry > 0 && signal.takeProfit > 0 && signal.stopLoss > 0;
  
  // For buy orders: TP > Entry > SL
  // For sell orders: SL > Entry > TP
  const isValidSetup = signal.type === 'buy' 
    ? signal.takeProfit > signal.entry && signal.entry > signal.stopLoss
    : signal.stopLoss > signal.entry && signal.entry > signal.takeProfit;

  // Calculate reward to risk ratio
  let rewardRiskRatio = 0;
  if (hasPrices && isValidSetup) {
    const priceDifference = Math.abs(signal.takeProfit - signal.entry);
    const riskDifference = Math.abs(signal.entry - signal.stopLoss);
    rewardRiskRatio = riskDifference !== 0 ? priceDifference / riskDifference : 0;
  }
  
  return (
    <div style={{ 
      padding: '20px', 
      border: '1px solid #ccc', 
      borderRadius: '8px', 
      maxWidth: '400px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
      backgroundColor: '#f9f9f9'
    }}>
      <h2 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px', marginTop: '0' }}>Signal Preview</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <strong>Symbol:</strong> {signal.symbol || '—'}
          {signal.assetName && <span style={{ color: '#666', marginLeft: '8px' }}>({signal.assetName})</span>}
        </div>
        
        <div>
          <strong>Current Price:</strong> {signal.currentPrice > 0 ? signal.currentPrice.toFixed(2) : '—'}
        </div>
        
        <div>
          <strong>Type:</strong>{' '}
          <span style={{ 
            color: signal.type === 'buy' ? '#28a745' : '#dc3545',
            fontWeight: 'bold',
            padding: '3px 8px',
            backgroundColor: signal.type === 'buy' ? 'rgba(40, 167, 69, 0.1)' : 'rgba(220, 53, 69, 0.1)',
            borderRadius: '4px'
          }}>
            {signal.type.toUpperCase()}
          </span>
        </div>
        
        <div>
          <strong>Order Type:</strong> <span style={{ fontWeight: 'bold' }}>{signal.orderType}</span>
        </div>
        
        <div>
          <strong>Entry:</strong> <span style={{ fontWeight: 'bold' }}>{signal.entry.toFixed(2)}</span>
        </div>
        
        <div>
          <strong>Stop Loss:</strong> <span style={{ 
            color: '#dc3545',
            fontWeight: 'bold' 
          }}>{signal.stopLoss.toFixed(2)}</span>
        </div>
        
        <div>
          <strong>Take Profit:</strong> <span style={{ 
            color: '#28a745',
            fontWeight: 'bold' 
          }}>{signal.takeProfit.toFixed(2)}</span>
        </div>
        
        {hasPrices && isValidSetup && (
          <div>
            <strong>Reward/Risk Ratio:</strong> <span style={{
              fontWeight: 'bold',
              color: rewardRiskRatio >= 2 ? '#28a745' : '#f39c12'
            }}>
              {rewardRiskRatio.toFixed(2)}
            </span>
          </div>
        )}
        
        {hasPrices && !isValidSetup && (
          <div style={{ 
            padding: '8px', 
            backgroundColor: '#fff3cd', 
            borderRadius: '4px',
            borderLeft: '4px solid #ffc107',
            marginTop: '10px'
          }}>
            <strong style={{ color: '#856404' }}>Warning:</strong> 
            <span style={{ color: '#856404' }}> Check your entry, stop loss, and take profit levels.</span>
          </div>
        )}
        
        <div style={{ marginTop: '10px' }}>
          <strong>Description:</strong>{' '}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '10px', 
            borderRadius: '4px',
            border: '1px solid #eee',
            marginTop: '5px'
          }}>
            {signal.description || 'Your signal description will appear here...'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewCard;