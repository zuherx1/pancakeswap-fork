import { useState, useCallback, useEffect } from 'react';

export type OrderSide = 'long' | 'short';
export type OrderType = 'market' | 'limit' | 'stop';

export interface Position {
  id:           string;
  symbol:       string;
  side:         OrderSide;
  size:         number;
  entryPrice:   number;
  markPrice:    number;
  liquidation:  number;
  margin:       number;
  leverage:     number;
  pnl:          number;
  pnlPct:       number;
  fundingFee:   number;
  timestamp:    number;
}

export interface OrderBook {
  asks: [number, number][]; // [price, size]
  bids: [number, number][];
}

export interface Candle {
  time:   number;
  open:   number;
  high:   number;
  low:    number;
  close:  number;
  volume: number;
}

export interface PerpMarket {
  symbol:       string;
  baseAsset:    string;
  quoteAsset:   string;
  markPrice:    number;
  indexPrice:   number;
  fundingRate:  number;
  nextFunding:  string;
  openInterest: number;
  volume24h:    number;
  change24h:    number;
  high24h:      number;
  low24h:       number;
  maxLeverage:  number;
}

// Simulated market data
const BASE_MARKETS: PerpMarket[] = [
  { symbol: 'BNBUSDT', baseAsset: 'BNB',  quoteAsset: 'USDT', markPrice: 582.40, indexPrice: 582.15, fundingRate: 0.0001, nextFunding: '04:23:11', openInterest: 142500000, volume24h: 890000000, change24h: 2.34,  high24h: 591.00, low24h: 568.50, maxLeverage: 50  },
  { symbol: 'BTCUSDT', baseAsset: 'BTC',  quoteAsset: 'USDT', markPrice: 67420.0, indexPrice: 67385.0, fundingRate: 0.0002, nextFunding: '04:23:11', openInterest: 980000000, volume24h: 3200000000, change24h: 1.12, high24h: 68100.0, low24h: 66200.0, maxLeverage: 125 },
  { symbol: 'ETHUSDT', baseAsset: 'ETH',  quoteAsset: 'USDT', markPrice: 3218.50, indexPrice: 3215.80, fundingRate: 0.0001, nextFunding: '04:23:11', openInterest: 520000000, volume24h: 1800000000, change24h: -0.85, high24h: 3280.0, low24h: 3180.0, maxLeverage: 100 },
  { symbol: 'CAKEUSDT',baseAsset: 'CAKE', quoteAsset: 'USDT', markPrice: 2.42,   indexPrice: 2.41,   fundingRate: 0.00015, nextFunding: '04:23:11', openInterest: 12000000,  volume24h: 45000000,   change24h: 5.60,  high24h: 2.55,   low24h: 2.28,   maxLeverage: 20  },
  { symbol: 'SOLUSDT', baseAsset: 'SOL',  quoteAsset: 'USDT', markPrice: 168.30, indexPrice: 167.95, fundingRate: 0.00008, nextFunding: '04:23:11', openInterest: 280000000, volume24h: 920000000,  change24h: 3.21,  high24h: 172.0,  low24h: 162.0,  maxLeverage: 75  },
  { symbol: 'ADAUSDT', baseAsset: 'ADA',  quoteAsset: 'USDT', markPrice: 0.452,  indexPrice: 0.451,  fundingRate: 0.00005, nextFunding: '04:23:11', openInterest: 95000000,  volume24h: 310000000,  change24h: -1.20, high24h: 0.465,  low24h: 0.438,  maxLeverage: 50  },
];

function generateCandles(basePrice: number, count = 60): Candle[] {
  const candles: Candle[] = [];
  let price = basePrice * 0.92;
  const now = Date.now();
  for (let i = count; i >= 0; i--) {
    const change = (Math.random() - 0.48) * price * 0.018;
    const open   = price;
    const close  = price + change;
    const high   = Math.max(open, close) * (1 + Math.random() * 0.008);
    const low    = Math.min(open, close) * (1 - Math.random() * 0.008);
    candles.push({ time: now - i * 15 * 60 * 1000, open, high, low, close, volume: Math.random() * 5000000 + 500000 });
    price = close;
  }
  return candles;
}

function generateOrderBook(midPrice: number): OrderBook {
  const asks: [number, number][] = [];
  const bids: [number, number][] = [];
  for (let i = 0; i < 12; i++) {
    asks.push([midPrice * (1 + (i + 1) * 0.0002), +(Math.random() * 8 + 0.5).toFixed(3)]);
    bids.push([midPrice * (1 - (i + 1) * 0.0002), +(Math.random() * 8 + 0.5).toFixed(3)]);
  }
  return { asks, bids };
}

export function usePerps() {
  const [markets,       setMarkets]       = useState<PerpMarket[]>(BASE_MARKETS);
  const [activeMarket,  setActiveMarket]  = useState<PerpMarket>(BASE_MARKETS[0]);
  const [orderSide,     setOrderSide]     = useState<OrderSide>('long');
  const [orderType,     setOrderType]     = useState<OrderType>('market');
  const [leverage,      setLeverage]      = useState(10);
  const [margin,        setMargin]        = useState('');
  const [limitPrice,    setLimitPrice]    = useState('');
  const [stopPrice,     setStopPrice]     = useState('');
  const [positions,     setPositions]     = useState<Position[]>([]);
  const [orderBook,     setOrderBook]     = useState<OrderBook>(generateOrderBook(BASE_MARKETS[0].markPrice));
  const [candles,       setCandles]       = useState<Candle[]>(generateCandles(BASE_MARKETS[0].markPrice));
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState('');
  const [activeTab,     setActiveTab]     = useState<'positions'|'orders'|'history'>('positions');

  // Simulate live price ticks
  useEffect(() => {
    const interval = setInterval(() => {
      setMarkets(prev => prev.map(m => {
        const tick   = (Math.random() - 0.498) * m.markPrice * 0.0008;
        const newPrice = +(m.markPrice + tick).toFixed(m.markPrice > 100 ? 2 : 4);
        return { ...m, markPrice: newPrice, indexPrice: +(newPrice * (1 - 0.0003)).toFixed(m.markPrice > 100 ? 2 : 4) };
      }));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Sync active market price
  useEffect(() => {
    const updated = markets.find(m => m.symbol === activeMarket.symbol);
    if (updated) setActiveMarket(updated);
  }, [markets, activeMarket.symbol]);

  // Update positions PnL
  useEffect(() => {
    if (positions.length === 0) return;
    setPositions(prev => prev.map(p => {
      const market = markets.find(m => m.symbol === p.symbol);
      if (!market) return p;
      const priceDiff = market.markPrice - p.entryPrice;
      const pnl       = (p.side === 'long' ? priceDiff : -priceDiff) * p.size;
      const pnlPct    = (pnl / p.margin) * 100;
      return { ...p, markPrice: market.markPrice, pnl: +pnl.toFixed(4), pnlPct: +pnlPct.toFixed(2) };
    }));
  }, [markets]);

  // Regenerate order book on market change
  useEffect(() => {
    setOrderBook(generateOrderBook(activeMarket.markPrice));
    setCandles(generateCandles(activeMarket.markPrice));
  }, [activeMarket.symbol]);

  const selectMarket = useCallback((m: PerpMarket) => {
    setActiveMarket(m);
    setMargin('');
    setLimitPrice('');
  }, []);

  const placeOrder = useCallback(async () => {
    if (!margin || Number(margin) <= 0) { setError('Enter margin amount'); return; }
    if (orderType === 'limit' && !limitPrice) { setError('Enter limit price'); return; }
    setLoading(true); setError('');
    try {
      await new Promise(r => setTimeout(r, 900));
      const entryPrice  = orderType === 'limit' ? Number(limitPrice) : activeMarket.markPrice;
      const size        = (Number(margin) * leverage) / entryPrice;
      const liqOffset   = orderSide === 'long' ? -0.9 / leverage : 0.9 / leverage;
      const newPosition: Position = {
        id:          Date.now().toString(),
        symbol:      activeMarket.symbol,
        side:        orderSide,
        size:        +size.toFixed(6),
        entryPrice,
        markPrice:   activeMarket.markPrice,
        liquidation: +(entryPrice * (1 + liqOffset)).toFixed(2),
        margin:      Number(margin),
        leverage,
        pnl:         0,
        pnlPct:      0,
        fundingFee:  0,
        timestamp:   Date.now(),
      };
      setPositions(prev => [...prev, newPosition]);
      setMargin('');
    } catch (e: any) {
      setError(e.message || 'Order failed');
    } finally { setLoading(false); }
  }, [margin, orderType, limitPrice, activeMarket, orderSide, leverage]);

  const closePosition = useCallback((id: string) => {
    setPositions(prev => prev.filter(p => p.id !== id));
  }, []);

  const positionSize = margin && leverage
    ? ((Number(margin) * leverage) / (orderType === 'limit' && limitPrice ? Number(limitPrice) : activeMarket.markPrice)).toFixed(4)
    : '0';

  return {
    markets, activeMarket, selectMarket,
    orderSide, setOrderSide, orderType, setOrderType,
    leverage, setLeverage, margin, setMargin,
    limitPrice, setLimitPrice, stopPrice, setStopPrice,
    positions, orderBook, candles, loading, error,
    activeTab, setActiveTab, placeOrder, closePosition,
    positionSize,
  };
}
