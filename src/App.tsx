import React, { useState, useEffect, useRef } from 'react';
import { Signal, CMEFuture } from './types';

// Define CME Futures contracts with accurate values
const cmeFutures: CMEFuture[] = [
  { symbol: 'NQ', name: 'E-mini NASDAQ 100', pointValue: 20, tickValue: 5, ticksPerPoint: 4 },
  { symbol: 'ES', name: 'E-mini S&P 500', pointValue: 50, tickValue: 12.5, ticksPerPoint: 4 },
  { symbol: 'GC', name: 'Gold', pointValue: 100, tickValue: 10, ticksPerPoint: 10 },
  { symbol: 'MNQ', name: 'Micro E-mini NASDAQ 100', pointValue: 2, tickValue: 0.5, ticksPerPoint: 4 },
  { symbol: 'MGC', name: 'Micro Gold', pointValue: 10, tickValue: 1, ticksPerPoint: 10 },
];

const App: React.FC = () => {
  // State for form inputs
  const [symbol, setSymbol] = useState<string>('');
  const [assetName, setAssetName] = useState<string>('');
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [mode, setMode] = useState<'price' | 'points' | 'ticks'>('points');
  const [description, setDescription] = useState<string>('');
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT' | 'STOP'>('MARKET');
  const [contractQuantity, setContractQuantity] = useState<number>(1);
  const [entry, setEntry] = useState<number>(0);
  const [stopLossInput, setStopLossInput] = useState<number>(0);
  const [takeProfitInput, setTakeProfitInput] = useState<number>(0);
  const [takeProfitsInput, setTakeProfitsInput] = useState<{value: number, percentage: number}[]>([{value: 0, percentage: 0}]);
  const [type, setType] = useState<'buy' | 'sell'>('buy');
  const [selectedFuture, setSelectedFuture] = useState<CMEFuture | null>(null);
  const [image, setImage] = useState<string | null>(null);
  
  // Derived calculated values
  const [calculatedStopLoss, setCalculatedStopLoss] = useState<number>(0);
  const [calculatedTakeProfit, setCalculatedTakeProfit] = useState<number>(0);
  const [potentialProfit, setPotentialProfit] = useState<number>(0);
  const [potentialLoss, setPotentialLoss] = useState<number>(0);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update selected future when symbol changes
  useEffect(() => {
    const future = cmeFutures.find(f => f.symbol === symbol);
    if (future) {
      setSelectedFuture(future);
      setAssetName(future.name);
    } else {
      setSelectedFuture(null);
    }
  }, [symbol]);

  // Convert from points/ticks to price difference
  const calculatePriceDifference = (value: number, mode: 'points' | 'ticks'): number => {
    if (!selectedFuture) return 0;
    
    if (mode === 'points') {
      // Convert points to price
      return value * (selectedFuture.pointValue / selectedFuture.ticksPerPoint);
    } else {
      // Convert ticks to price
      return value * selectedFuture.tickValue;
    }
  };

  // Calculate final stop loss and take profit values when inputs or mode changes
  useEffect(() => {
    if (mode === 'price') {
      // In price mode, just use the direct inputs
      setCalculatedStopLoss(stopLossInput);
      setCalculatedTakeProfit(takeProfitInput);
    } else {
      // In points or ticks mode, calculate based on entry and direction
      const stopLossDiff = calculatePriceDifference(stopLossInput, mode);
      const takeProfitDiff = calculatePriceDifference(takeProfitInput, mode);
      
      if (type === 'buy') {
        // For buy: entry - stopLoss (down), entry + takeProfit (up)
        setCalculatedStopLoss(entry - stopLossDiff);
        setCalculatedTakeProfit(entry + takeProfitDiff);
      } else {
        // For sell: entry + stopLoss (up), entry - takeProfit (down)
        setCalculatedStopLoss(entry + stopLossDiff);
        setCalculatedTakeProfit(entry - takeProfitDiff);
      }
    }

    // Calculate potential profit and loss in dollar terms
    if (selectedFuture && entry > 0) {
      if (mode === 'price') {
        // Calculate based on price differences
        const priceProfitDiff = Math.abs(takeProfitInput - entry);
        const priceLossDiff = Math.abs(stopLossInput - entry);

        if (priceProfitDiff > 0) {
          const pointsProfit = priceProfitDiff * selectedFuture.ticksPerPoint / selectedFuture.pointValue;
          setPotentialProfit(pointsProfit * selectedFuture.pointValue * contractQuantity);
        }

        if (priceLossDiff > 0) {
          const pointsLoss = priceLossDiff * selectedFuture.ticksPerPoint / selectedFuture.pointValue;
          setPotentialLoss(pointsLoss * selectedFuture.pointValue * contractQuantity);
        }
      } else {
        // For points/ticks, it's more direct
        if (mode === 'points') {
          setPotentialProfit(takeProfitInput * selectedFuture.pointValue * contractQuantity);
          setPotentialLoss(stopLossInput * selectedFuture.pointValue * contractQuantity);
        } else { // ticks
          setPotentialProfit(takeProfitInput * selectedFuture.tickValue * contractQuantity);
          setPotentialLoss(stopLossInput * selectedFuture.tickValue * contractQuantity);
        }
      }
    }
  }, [entry, stopLossInput, takeProfitInput, mode, type, selectedFuture, contractQuantity]);

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.match('image.*')) {
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Browse files button click
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  // Add new take profit
  const addTakeProfit = () => {
    setTakeProfitsInput([...takeProfitsInput, {value: 0, percentage: 0}]);
  };

  // Remove take profit
  const removeTakeProfit = (index: number) => {
    if (takeProfitsInput.length > 1) {
      const newTakeProfits = [...takeProfitsInput];
      newTakeProfits.splice(index, 1);
      setTakeProfitsInput(newTakeProfits);
    }
  };

  // Update take profit
  const updateTakeProfit = (index: number, value: number) => {
    const newTakeProfits = [...takeProfitsInput];
    newTakeProfits[index].value = value;
    
    // Calculate percentage if entry price is valid
    if (entry > 0) {
      let priceDiff = 0;
      
      if (mode === 'price') {
        priceDiff = Math.abs(value - entry);
      } else {
        // For points/ticks, calculate the price difference first
        const diffValue = calculatePriceDifference(value, mode);
        priceDiff = diffValue;
      }
      
      newTakeProfits[index].percentage = parseFloat(((priceDiff / entry) * 100).toFixed(2));
    }
    
    setTakeProfitsInput(newTakeProfits);
    
    // Update the main takeProfit state with the first TP value
    if (index === 0) {
      setTakeProfitInput(value);
    }
  };

  // Format value for display in preview
  const formatPreviewValue = (value: number, mode: 'price' | 'points' | 'ticks'): string => {
    if (value <= 0) return '—';
    
    if (mode === 'price') {
      return value.toFixed(2);
    } else if (mode === 'points') {
      return `${value} pts`;
    } else { // ticks
      return `${value} ticks`;
    }
  };

  return (
    <div className="app-container">
      {/* Preview Card */}
      <div className="preview-card">
        <div className="preview-header">
          <h3>Signal Preview</h3>
        </div>
        <div className="preview-body">
          <div className="preview-row">
            <span className="preview-label">Symbol:</span>
            <span className="preview-value">{symbol || '—'}</span>
          </div>
          <div className="preview-row">
            <span className="preview-label">Contracts:</span>
            <span className="preview-value">{contractQuantity} {contractQuantity === 1 ? 'Contract' : 'Contracts'}</span>
          </div>
          <div className="preview-row">
            <span className="preview-label">Order Type:</span>
            <span className="preview-value">{orderType}</span>
          </div>
          <div className="preview-row">
            <span className="preview-label">Type:</span>
            <span className={`preview-value preview-type ${type === 'sell' ? 'sell' : ''}`}>
              {type.toUpperCase()}
            </span>
          </div>
          <div className="preview-row">
            <span className="preview-label">Entry:</span>
            <span className="preview-value">{entry > 0 ? entry.toFixed(2) : '—'}</span>
          </div>
          <div className="preview-row">
            <span className="preview-label">Stop Loss:</span>
            <span className="preview-value">
              {mode === 'price' 
                ? formatPreviewValue(stopLossInput, mode)
                : formatPreviewValue(stopLossInput, mode) + ` (${calculatedStopLoss.toFixed(2)})`}
            </span>
          </div>
          <div className="preview-row">
            <span className="preview-label">Take Profit:</span>
            <span className="preview-value">
              {mode === 'price'
                ? formatPreviewValue(takeProfitInput, mode)
                : formatPreviewValue(takeProfitInput, mode) + ` (${calculatedTakeProfit.toFixed(2)})`}
            </span>
          </div>
          <div className="preview-row">
            <span className="preview-label">Potential Profit:</span>
            <span className="preview-value" style={{ color: 'var(--accent-color-buy)' }}>
              ${potentialProfit.toFixed(2)}
            </span>
          </div>
          <div className="preview-row">
            <span className="preview-label">Potential Loss:</span>
            <span className="preview-value" style={{ color: 'var(--accent-color-sell)' }}>
              ${potentialLoss.toFixed(2)}
            </span>
          </div>
          <div className="preview-desc">
            <p>{description || 'Your signal description will appear here...'}</p>
          </div>
        </div>
      </div>

      {/* Signal Form Modal */}
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Create New Signal</h2>
          <button className="close-button">&times;</button>
        </div>
        <div className="divider"></div>
        <div className="modal-body">
          <form>
            {/* Chart Upload Section */}
            <div className="form-section">
              <h3 className="section-title">Chart Image (Optional)</h3>
              <div 
                className="upload-area" 
                onDragOver={handleDragOver} 
                onDrop={handleDrop}
              >
                {image ? (
                  <img src={image} alt="Chart" className="uploaded-image" />
                ) : (
                  <>
                    <div className="upload-icon">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 15V3M12 3L7 8M12 3L17 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M3 15V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <p className="upload-text">Drag & Drop Image</p>
                    <p className="upload-subtext">or</p>
                    <button type="button" className="browse-button" onClick={handleBrowseClick}>
                      <span className="browse-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                      Browse Files
                    </button>
                    <input 
                      type="file" 
                      className="upload-input" 
                      ref={fileInputRef} 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                    />
                  </>
                )}
              </div>
            </div>

            {/* Asset Information Section */}
            <div className="form-section">
              <h3 className="section-title">Asset Information</h3>
              <div className="form-group">
                <div className="select-container">
                  <select 
                    className="form-input select"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                  >
                    <option value="">Select Symbol *</option>
                    {cmeFutures.map(future => (
                      <option key={future.symbol} value={future.symbol}>
                        {future.symbol} - {future.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Asset Name *" 
                  value={assetName}
                  readOnly
                  required 
                />
              </div>
            </div>

            {/* Signal Details Section */}
            <div className="form-section">
              <h3 className="section-title">
                Signal Details
                <span className="info-icon">ⓘ</span>
              </h3>
              
              {/* Pill Selector for Price/Points/Ticks */}
              <div className="form-group">
                <div className="pill-selector">
                  <button 
                    type="button" 
                    className={`pill-button ${mode === 'price' ? 'active' : ''}`} 
                    onClick={() => setMode('price')}
                  >
                    Price
                  </button>
                  <button 
                    type="button" 
                    className={`pill-button ${mode === 'points' ? 'active' : ''}`} 
                    onClick={() => setMode('points')}
                  >
                    Points
                  </button>
                  <button 
                    type="button" 
                    className={`pill-button ${mode === 'ticks' ? 'active' : ''}`} 
                    onClick={() => setMode('ticks')}
                  >
                    Ticks
                  </button>
                </div>
              </div>
              
              <div className="form-group">
                <textarea 
                  className="form-input textarea" 
                  placeholder="Description *" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                ></textarea>
              </div>
              
              <div className="form-group">
                <div className="select-container">
                  <select 
                    className="form-input select"
                    value={orderType}
                    onChange={(e) => setOrderType(e.target.value as 'MARKET' | 'LIMIT' | 'STOP')}
                  >
                    <option value="MARKET">MARKET</option>
                    <option value="LIMIT">LIMIT</option>
                    <option value="STOP">STOP</option>
                  </select>
                </div>
              </div>
              
              {/* Contract Quantity input field */}
              <div className="form-group">
                <div style={{ position: 'relative' }}>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="How Many Contracts *" 
                    value={contractQuantity || ''}
                    onChange={(e) => setContractQuantity(parseInt(e.target.value) || 1)}
                    min="1"
                    required 
                    style={{ paddingRight: '90px' }}
                  />
                  <span style={{ 
                    position: 'absolute', 
                    right: '12px', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    color: 'var(--text-secondary)',
                    pointerEvents: 'none'
                  }}>
                    {contractQuantity === 1 ? 'Contract' : 'Contracts'}
                  </span>
                </div>
              </div>
              
              {/* Entry is always a price */}
              <div className="form-group">
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="Entry Price ($) *" 
                  value={entry || ''}
                  onChange={(e) => setEntry(parseFloat(e.target.value) || 0)}
                  required 
                />
              </div>
              
              {/* Stop Loss can be price, points, or ticks */}
              <div className="form-group">
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder={`Stop Loss ${mode === 'price' ? 'Price' : mode.charAt(0).toUpperCase() + mode.slice(1)} *`} 
                  value={stopLossInput || ''}
                  onChange={(e) => setStopLossInput(parseFloat(e.target.value) || 0)}
                  required 
                />
              </div>
            </div>

            {/* Take Profits Section */}
            <div className="form-section">
              <h3 className="section-title">
                Take Profits
                <button type="button" className="add-button" onClick={addTakeProfit}>
                  <span className="add-icon">+</span>
                  Add Take Profit
                </button>
              </h3>
              
              {takeProfitsInput.map((tp, index) => (
                <div className="input-row" key={index}>
                  <div className="form-group">
                    <span className="entry-label">{entry > 0 ? 'Target value' : 'Enter entry first'}</span>
                    <input 
                      type="number" 
                      className="form-input" 
                      placeholder={`Take Profit ${index + 1} ${mode === 'price' ? 'Price' : mode.charAt(0).toUpperCase() + mode.slice(1)} *`} 
                      value={tp.value || ''}
                      onChange={(e) => updateTakeProfit(index, parseFloat(e.target.value) || 0)}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <span className="entry-label">Auto-calculated from target</span>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder={`Percentage ${index + 1} (%) *`} 
                      value={tp.percentage > 0 ? `${tp.percentage}%` : ''}
                      disabled
                    />
                  </div>
                  <button 
                    type="button" 
                    className="remove-button"
                    onClick={() => removeTakeProfit(index)}
                  >
                    −
                  </button>
                </div>
              ))}
            </div>

            {/* Type Section (Buy/Sell) */}
            <div className="form-section">
              <h3 className="section-title">Type</h3>
              
              <div className="option-buttons">
                <button 
                  type="button" 
                  className={`option-button buy ${type === 'buy' ? 'active' : ''}`}
                  onClick={() => setType('buy')}
                >
                  Buy
                </button>
                <button 
                  type="button" 
                  className={`option-button sell ${type === 'sell' ? 'active' : ''}`}
                  onClick={() => setType('sell')}
                >
                  Sell
                </button>
              </div>
            </div>

            {/* Warning Box */}
            <div className="warning-box">
              <div className="warning-icon">⚠️</div>
              <div className="warning-text">
                <strong>Important:</strong> Signals cannot be deleted once sent. You can update them later, but they will remain visible to subscribers.
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default App;