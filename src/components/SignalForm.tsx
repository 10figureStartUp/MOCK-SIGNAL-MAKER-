import React, { useState, useEffect } from 'react';
import { CMEFuture, Signal } from '../types';

interface SignalFormProps {
  onUpdate: (signal: Signal) => void;
}

// Define CME Futures contracts with accurate values
const cmeFutures: CMEFuture[] = [
  { symbol: 'NQ', name: 'E-mini NASDAQ 100', pointValue: 20, tickValue: 5, ticksPerPoint: 4 },
  { symbol: 'ES', name: 'E-mini S&P 500', pointValue: 50, tickValue: 12.5, ticksPerPoint: 4 },
  { symbol: 'GC', name: 'Gold', pointValue: 100, tickValue: 10, ticksPerPoint: 10 },
  { symbol: 'MNQ', name: 'Micro E-mini NASDAQ 100', pointValue: 2, tickValue: 0.5, ticksPerPoint: 4 },
  { symbol: 'MGC', name: 'Micro Gold', pointValue: 10, tickValue: 1, ticksPerPoint: 10 },
];

const SignalForm: React.FC<SignalFormProps> = ({ onUpdate }) => {
  const [symbol, setSymbol] = useState('');
  const [assetName, setAssetName] = useState('');
  const [currentPrice, setCurrentPrice] = useState(0);
  const [mode, setMode] = useState<'price' | 'points' | 'ticks'>('price');
  const [description, setDescription] = useState('');
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT' | 'STOP'>('MARKET');
  const [entry, setEntry] = useState(0);
  const [stopLoss, setStopLoss] = useState(0);
  const [takeProfit, setTakeProfit] = useState(0);
  const [type, setType] = useState<'buy' | 'sell'>('buy');
  const [selectedFuture, setSelectedFuture] = useState<CMEFuture | null>(null);

  // Update selected future when symbol changes
  useEffect(() => {
    const future = cmeFutures.find(f => f.symbol === symbol);
    if (future) {
      setSelectedFuture(future);
      setAssetName(future.name);
    } else {
      setSelectedFuture(null);
      setAssetName('');
    }
  }, [symbol]);

  // Calculate values based on mode (price, points, or ticks)
  const calculateValue = (value: number): number => {
    if (!selectedFuture || mode === 'price') {
      return value; // Direct price input
    }
    
    let adjustedValue = 0;
    
    if (mode === 'points') {
      // Convert points to price difference
      adjustedValue = value * (selectedFuture.pointValue / selectedFuture.ticksPerPoint);
    } else if (mode === 'ticks') {
      // Convert ticks to price difference
      adjustedValue = value * selectedFuture.tickValue;
    }
    
    // For sell orders, we invert the direction of adjustment
    return type === 'buy' 
      ? currentPrice + adjustedValue 
      : currentPrice - adjustedValue;
  };

  // Update signal preview whenever inputs change
  useEffect(() => {
    const adjustedSignal: Signal = {
      symbol,
      assetName,
      currentPrice,
      mode,
      description,
      orderType,
      entry: calculateValue(entry),
      stopLoss: calculateValue(stopLoss),
      takeProfit: calculateValue(takeProfit),
      type,
    };
    onUpdate(adjustedSignal);
  }, [symbol, assetName, currentPrice, mode, description, orderType, entry, stopLoss, takeProfit, type]);

  return (
    <div style={{ padding: '20px', maxWidth: '500px' }}>
      <h2>Create New Signal</h2>
      <form>
        <div>
          <h3>Asset Information</h3>
          <select 
            value={symbol} 
            onChange={e => setSymbol(e.target.value)} 
            required
            style={{ width: '100%', padding: '8px', margin: '10px 0' }}
          >
            <option value="">Select Symbol *</option>
            {cmeFutures.map(future => (
              <option key={future.symbol} value={future.symbol}>
                {future.symbol} - {future.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={assetName}
            placeholder="Asset Name *"
            readOnly
            style={{ width: '100%', padding: '8px', margin: '10px 0' }}
          />
          <input
            type="number"
            value={currentPrice}
            onChange={e => setCurrentPrice(parseFloat(e.target.value) || 0)}
            placeholder="Current Price ($)"
            step="0.01"
            style={{ width: '100%', padding: '8px', margin: '10px 0' }}
          />
        </div>

        <div>
          <h3>Signal Details</h3>
          <div style={{ display: 'flex', gap: '10px', margin: '10px 0' }}>
            <button
              type="button"
              style={{ 
                background: mode === 'price' ? '#007bff' : '#ccc', 
                color: 'white', 
                padding: '8px 15px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
              onClick={() => setMode('price')}
            >
              Price
            </button>
            <button
              type="button"
              style={{ 
                background: mode === 'points' ? '#007bff' : '#ccc', 
                color: 'white', 
                padding: '8px 15px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
              onClick={() => setMode('points')}
            >
              Points
            </button>
            <button
              type="button"
              style={{ 
                background: mode === 'ticks' ? '#007bff' : '#ccc', 
                color: 'white', 
                padding: '8px 15px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
              onClick={() => setMode('ticks')}
            >
              Ticks
            </button>
          </div>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Description *"
            required
            style={{ width: '100%', height: '80px', padding: '8px', margin: '10px 0' }}
          />
          <select
            value={orderType}
            onChange={e => setOrderType(e.target.value as 'MARKET' | 'LIMIT' | 'STOP')}
            style={{ width: '100%', padding: '8px', margin: '10px 0' }}
          >
            <option value="MARKET">MARKET</option>
            <option value="LIMIT">LIMIT</option>
            <option value="STOP">STOP</option>
          </select>
          <input
            type="number"
            value={entry}
            onChange={e => setEntry(parseFloat(e.target.value) || 0)}
            placeholder={`Entry ${mode.charAt(0).toUpperCase() + mode.slice(1)} *`}
            step="0.01"
            required
            style={{ width: '100%', padding: '8px', margin: '10px 0' }}
          />
          <input
            type="number"
            value={stopLoss}
            onChange={e => setStopLoss(parseFloat(e.target.value) || 0)}
            placeholder={`Stop Loss ${mode.charAt(0).toUpperCase() + mode.slice(1)} *`}
            step="0.01"
            required
            style={{ width: '100%', padding: '8px', margin: '10px 0' }}
          />
          <input
            type="number"
            value={takeProfit}
            onChange={e => setTakeProfit(parseFloat(e.target.value) || 0)}
            placeholder={`Take Profit ${mode.charAt(0).toUpperCase() + mode.slice(1)} *`}
            step="0.01"
            required
            style={{ width: '100%', padding: '8px', margin: '10px 0' }}
          />
        </div>

        <div>
          <h3>Type</h3>
          <div style={{ display: 'flex', gap: '10px', margin: '10px 0' }}>
            <button
              type="button"
              style={{ 
                background: type === 'buy' ? '#28a745' : '#ccc', 
                color: 'white', 
                padding: '8px 15px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
              onClick={() => setType('buy')}
            >
              Buy
            </button>
            <button
              type="button"
              style={{ 
                background: type === 'sell' ? '#dc3545' : '#ccc', 
                color: 'white', 
                padding: '8px 15px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
              onClick={() => setType('sell')}
            >
              Sell
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SignalForm;