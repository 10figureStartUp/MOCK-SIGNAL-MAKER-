// Define types used in the application
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
  currentPrice?: number;
  mode: 'price' | 'points' | 'ticks'; // Input mode
  description: string;
  orderType: 'MARKET' | 'LIMIT' | 'STOP';
  contractQuantity: number;
  entry: number;
  stopLoss: number;
  calculatedStopLoss?: number;
  takeProfit: number;
  calculatedTakeProfit?: number;
  takeProfits?: {value: number, percentage: number}[];
  type: 'buy' | 'sell';
  image?: string | null;
  potentialProfit?: number;
  potentialLoss?: number;
}