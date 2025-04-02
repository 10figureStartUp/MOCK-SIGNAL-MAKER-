export interface CMEFuture {
    symbol: string;
    name: string;
    pointValue: number; // Dollar value per point per contract
    tickValue: number;  // Dollar value per tick per contract
    ticksPerPoint: number; // Number of ticks per point
  }
  
  export interface Signal {
    symbol: string;
    assetName: string;
    currentPrice: number;
    mode: 'price' | 'points' | 'ticks'; // Input mode
    description: string;
    orderType: 'MARKET' | 'LIMIT' | 'STOP';
    entry: number;
    stopLoss: number;
    takeProfit: number;
    type: 'buy' | 'sell';
  }