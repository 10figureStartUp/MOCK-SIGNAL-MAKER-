import React, { useState, useEffect, useRef } from 'react';
import { Signal, CMEFuture } from './types';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  Container, 
  Divider, 
  FormControl, 
  IconButton, 
  InputAdornment, 
  InputLabel, 
  MenuItem, 
  Paper, 
  Select, 
  Stack, 
  TextField, 
  ToggleButton, 
  ToggleButtonGroup, 
  Typography, 
  useMediaQuery, 
  useTheme 
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

// Define CME Futures contracts with accurate values
const cmeFutures: CMEFuture[] = [
  { symbol: 'NQ', name: 'E-mini NASDAQ 100', pointValue: 20, tickValue: 5, ticksPerPoint: 4 },
  { symbol: 'ES', name: 'E-mini S&P 500', pointValue: 50, tickValue: 12.5, ticksPerPoint: 4 },
  { symbol: 'GC', name: 'Gold', pointValue: 100, tickValue: 10, ticksPerPoint: 10 },
  { symbol: 'MNQ', name: 'Micro E-mini NASDAQ 100', pointValue: 2, tickValue: 0.5, ticksPerPoint: 4 },
  { symbol: 'MGC', name: 'Micro Gold', pointValue: 10, tickValue: 1, ticksPerPoint: 10 },
];

// Styled components
const UploadArea = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(4),
  textAlign: 'center',
  marginBottom: theme.spacing(2),
  cursor: 'pointer',
  transition: 'border-color 0.2s',
  '&:hover': {
    borderColor: theme.palette.primary.main,
  }
}));

const PreviewLabel = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.9rem',
}));

const PreviewValue = styled(Typography)(({ theme }) => ({
  fontWeight: 500,
}));

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
  
  // Theme and media queries
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
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

  // Handle mode change
  const handleModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newMode: 'price' | 'points' | 'ticks' | null,
  ) => {
    if (newMode !== null) {
      setMode(newMode);
    }
  };

  // Handle type change
  const handleTypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newType: 'buy' | 'sell' | null,
  ) => {
    if (newType !== null) {
      setType(newType);
    }
  };

  // Signal Form Component
  const SignalFormComponent = (
    <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight={700}>Create New Signal</Typography>
        <IconButton>
          <CloseIcon />
        </IconButton>
      </Box>
      
      <Divider />
      
      <Box sx={{ p: 3 }}>
        <Stack spacing={4}>
          {/* Chart Upload Section */}
          <Box>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Chart Image (Optional)
            </Typography>
            
            <UploadArea
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={handleBrowseClick}
            >
              {image ? (
                <Box component="img" src={image} alt="Chart" sx={{ maxWidth: '100%', borderRadius: 1 }} />
              ) : (
                <>
                  <UploadFileIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                  <Typography variant="body1" fontWeight={500} mb={0.5}>
                    Drag & Drop Image
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={1.5}>
                    or
                  </Typography>
                  <Button 
                    variant="outlined" 
                    startIcon={<AddIcon />}
                    onClick={handleBrowseClick}
                  >
                    Browse Files
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                </>
              )}
            </UploadArea>
          </Box>
          
          {/* Asset Information Section */}
          <Box>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Asset Information
            </Typography>
            
            <Stack spacing={2}>
              <FormControl fullWidth>
                <InputLabel id="symbol-label">Select Symbol *</InputLabel>
                <Select
                  labelId="symbol-label"
                  value={symbol}
                  label="Select Symbol *"
                  onChange={(e) => setSymbol(e.target.value)}
                >
                  <MenuItem value="" disabled>Select Symbol *</MenuItem>
                  {cmeFutures.map(future => (
                    <MenuItem key={future.symbol} value={future.symbol}>
                      {future.symbol} - {future.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                label="Asset Name *"
                value={assetName}
                InputProps={{
                  readOnly: true,
                }}
                fullWidth
              />
            </Stack>
          </Box>
          
          {/* Signal Details Section */}
          <Box>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h6" fontWeight={600}>
                Signal Details
              </Typography>
              <InfoOutlinedIcon color="action" fontSize="small" />
            </Box>
            
            <Stack spacing={2}>
              {/* Pill Selector for Price/Points/Ticks */}
              <ToggleButtonGroup
                value={mode}
                exclusive
                onChange={handleModeChange}
                aria-label="calculation mode"
                size="small"
                sx={{ 
                  bgcolor: 'background.paper',
                  borderRadius: 4,
                  '& .MuiToggleButton-root': {
                    borderRadius: 4,
                    px: 3,
                    py: 1,
                    mx: 0.5,
                    textTransform: 'capitalize'
                  }
                }}
              >
                <ToggleButton value="price">Price</ToggleButton>
                <ToggleButton value="points">Points</ToggleButton>
                <ToggleButton value="ticks">Ticks</ToggleButton>
              </ToggleButtonGroup>
              
              <TextField
                label="Description *"
                multiline
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                fullWidth
                required
              />
              
              <FormControl fullWidth>
                <InputLabel id="order-type-label">Order Type</InputLabel>
                <Select
                  labelId="order-type-label"
                  value={orderType}
                  label="Order Type"
                  onChange={(e) => setOrderType(e.target.value as 'MARKET' | 'LIMIT' | 'STOP')}
                >
                  <MenuItem value="MARKET">MARKET</MenuItem>
                  <MenuItem value="LIMIT">LIMIT</MenuItem>
                  <MenuItem value="STOP">STOP</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                label="How Many Contracts *"
                type="number"
                value={contractQuantity || ''}
                onChange={(e) => setContractQuantity(parseInt(e.target.value) || 1)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {contractQuantity === 1 ? 'Contract' : 'Contracts'}
                    </InputAdornment>
                  ),
                }}
                fullWidth
                required
                inputProps={{ min: "1" }}
              />
              
              <TextField
                label="Entry Price ($) *"
                type="number"
                value={entry || ''}
                onChange={(e) => setEntry(parseFloat(e.target.value) || 0)}
                fullWidth
                required
              />
              
              <TextField
                label={`Stop Loss ${mode === 'price' ? 'Price' : mode.charAt(0).toUpperCase() + mode.slice(1)} *`}
                type="number"
                value={stopLossInput || ''}
                onChange={(e) => setStopLossInput(parseFloat(e.target.value) || 0)}
                fullWidth
                required
              />
            </Stack>
          </Box>
          
          {/* Take Profits Section */}
          <Box>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h6" fontWeight={600}>
                Take Profits
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                size="small"
                onClick={addTakeProfit}
              >
                Add Take Profit
              </Button>
            </Box>
            
            <Stack spacing={2}>
              {takeProfitsInput.map((tp, index) => (
                <Box key={index} sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: { xs: 'stretch', sm: 'flex-end' } }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="text.secondary" mb={0.5} display="block">
                      {entry > 0 ? 'Target value' : 'Enter entry first'}
                    </Typography>
                    <TextField
                      type="number"
                      placeholder={`Take Profit ${index + 1}`}
                      value={tp.value || ''}
                      onChange={(e) => updateTakeProfit(index, parseFloat(e.target.value) || 0)}
                      fullWidth
                      required
                      size="small"
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="text.secondary" mb={0.5} display="block">
                      Auto-calculated from target
                    </Typography>
                    <TextField
                      placeholder="Percentage"
                      value={tp.percentage > 0 ? `${tp.percentage}%` : ''}
                      disabled
                      fullWidth
                      size="small"
                    />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-end', sm: 'center' }, mt: { xs: 1, sm: 0 } }}>
                    <IconButton 
                      onClick={() => removeTakeProfit(index)}
                      disabled={takeProfitsInput.length <= 1}
                      size="small"
                    >
                      <RemoveIcon />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Box>
          
          {/* Type Section (Buy/Sell) */}
          <Box>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Type
            </Typography>
            
            <ToggleButtonGroup
              value={type}
              exclusive
              onChange={handleTypeChange}
              aria-label="trade type"
              fullWidth
            >
              <ToggleButton 
                value="buy"
                sx={{ 
                  py: 1.5,
                  '&.Mui-selected': {
                    backgroundColor: 'success.light',
                    color: 'success.dark',
                    borderColor: 'success.main'
                  }
                }}
              >
                Buy
              </ToggleButton>
              <ToggleButton 
                value="sell"
                sx={{ 
                  py: 1.5,
                  '&.Mui-selected': {
                    backgroundColor: 'error.light',
                    color: 'error.dark',
                    borderColor: 'error.main'
                  }
                }}
              >
                Sell
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
          
          {/* Warning Box */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              bgcolor: 'warning.light', 
              borderRadius: 1,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 2,
              mt: 2
            }}
          >
            <WarningAmberIcon color="warning" />
            <Box>
              <Typography variant="body2" fontWeight={600}>Important:</Typography>
              <Typography variant="body2" color="text.secondary">
                Signals cannot be deleted once sent. You can update them later, but they will remain visible to subscribers.
              </Typography>
            </Box>
          </Paper>
        </Stack>
      </Box>
    </Paper>
  );

  // Preview Card Component
  const PreviewCardComponent = (
    <Card sx={{ borderRadius: 2 }}>
      <CardHeader title="Signal Preview" />
      <Divider />
      <CardContent>
        <Stack spacing={2}>
          <Box display="flex" justifyContent="space-between">
            <PreviewLabel>Symbol:</PreviewLabel>
            <PreviewValue>{symbol || '—'}</PreviewValue>
          </Box>
          
          <Box display="flex" justifyContent="space-between">
            <PreviewLabel>Contracts:</PreviewLabel>
            <PreviewValue>{contractQuantity} {contractQuantity === 1 ? 'Contract' : 'Contracts'}</PreviewValue>
          </Box>
          
          <Box display="flex" justifyContent="space-between">
            <PreviewLabel>Order Type:</PreviewLabel>
            <PreviewValue>{orderType}</PreviewValue>
          </Box>
          
          <Box display="flex" justifyContent="space-between">
            <PreviewLabel>Type:</PreviewLabel>
            <Box 
              sx={{ 
                px: 1.5, 
                py: 0.5, 
                borderRadius: 1, 
                bgcolor: type === 'buy' ? 'success.light' : 'error.light',
                color: type === 'buy' ? 'success.dark' : 'error.dark',
                fontWeight: 600
              }}
            >
              {type.toUpperCase()}
            </Box>
          </Box>
          
          <Box display="flex" justifyContent="space-between">
            <PreviewLabel>Entry:</PreviewLabel>
            <PreviewValue>{entry > 0 ? entry.toFixed(2) : '—'}</PreviewValue>
          </Box>
          
          <Box display="flex" justifyContent="space-between">
            <PreviewLabel>Stop Loss:</PreviewLabel>
            <PreviewValue>
              {mode === 'price' 
                ? formatPreviewValue(stopLossInput, mode)
                : formatPreviewValue(stopLossInput, mode) + ` (${calculatedStopLoss.toFixed(2)})`}
            </PreviewValue>
          </Box>
          
          <Box display="flex" justifyContent="space-between">
            <PreviewLabel>Take Profit:</PreviewLabel>
            <PreviewValue>
              {mode === 'price'
                ? formatPreviewValue(takeProfitInput, mode)
                : formatPreviewValue(takeProfitInput, mode) + ` (${calculatedTakeProfit.toFixed(2)})`}
            </PreviewValue>
          </Box>
          
          <Box display="flex" justifyContent="space-between">
            <PreviewLabel>Potential Profit:</PreviewLabel>
            <Typography color="success.main" fontWeight={500}>
              ${potentialProfit.toFixed(2)}
            </Typography>
          </Box>
          
          <Box display="flex" justifyContent="space-between">
            <PreviewLabel>Potential Loss:</PreviewLabel>
            <Typography color="error.main" fontWeight={500}>
              ${potentialLoss.toFixed(2)}
            </Typography>
          </Box>
          
          <Divider />
          
          <Typography variant="body2" color="text.secondary">
            {description || 'Your signal description will appear here...'}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );

  // Layout: For desktop (md+) preview appears on the left; for mobile the form appears first then preview below.
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 4,
        }}
      >
        {/* On mobile (xs): SignalForm first (order 1), preview second (order 2);
            On desktop/tablet (md+): preview on the left (order 1), form on the right (order 2) */}
        <Box
          sx={{
            order: { xs: 2, md: 1 },
            width: { md: '300px' },
            flexShrink: 0,
          }}
        >
          {PreviewCardComponent}
        </Box>
        <Box
          sx={{
            order: { xs: 1, md: 2 },
            flex: 1,
          }}
        >
          {SignalFormComponent}
        </Box>
      </Box>
    </Container>
  );
};

export default App;
