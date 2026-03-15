'use client';

import { motion } from 'framer-motion';
import { ArrowUpDown, TrendingUp, TrendingDown, Activity, Zap, ExternalLink, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

// Mock Serum DEX orderbook data
// Real data: fetch from self-hosted serum-rest-server at /api/orderbooks/<market_address>
const MOCK_ORDERBOOK = {
  bids: [
    { price: 0.0842, size: 12400, total: 1044.1 },
    { price: 0.0840, size: 8900, total: 747.6 },
    { price: 0.0838, size: 5200, total: 435.8 },
    { price: 0.0835, size: 19800, total: 1653.3 },
    { price: 0.0830, size: 32100, total: 2664.3 },
  ],
  asks: [
    { price: 0.0845, size: 7800, total: 659.1 },
    { price: 0.0848, size: 15200, total: 1288.9 },
    { price: 0.0850, size: 9600, total: 816.0 },
    { price: 0.0855, size: 22400, total: 1915.2 },
    { price: 0.0860, size: 38000, total: 3268.0 },
  ],
};

const MARKETS = [
  { symbol: 'CRAFTS/SOL', price: '0.0843', change: '+4.2%', up: true },
  { symbol: 'CRAFTS/USDC', price: '12.74', change: '+3.8%', up: true },
  { symbol: 'CRAFTS/BTC', price: '0.000142', change: '-0.4%', up: false },
  { symbol: 'SOL/USDC', price: '143.80', change: '+1.2%', up: true },
];

const RECENT_TRADES = [
  { time: '06:03:11', price: '0.0843', size: '1,200', side: 'buy' },
  { time: '06:02:58', price: '0.0842', size: '800', side: 'sell' },
  { time: '06:02:44', price: '0.0845', size: '5,400', side: 'buy' },
  { time: '06:02:30', price: '0.0840', size: '2,100', side: 'sell' },
  { time: '06:02:15', price: '0.0843', size: '300', side: 'buy' },
];

export default function TradingPage() {
  const [selectedMarket, setSelectedMarket] = useState('CRAFTS/SOL');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('0.0843');
  const [orderType, setOrderType] = useState<'limit' | 'market'>('limit');

  return (
    <main className="min-h-screen bg-zinc-950 font-mono text-zinc-100">

      {/* Header Bar */}
      <div className="border-b border-zinc-800 bg-zinc-900 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="text-comic-primary font-black uppercase tracking-wider text-lg">Comicraft Trading</span>
            <span className="text-zinc-500 text-xs">Powered by Serum DEX on Solana</span>
          </div>
          <a
            href="https://github.com/project-serum/serum-rest-server"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
          >
            <ExternalLink className="w-3 h-3" /> Serum REST Server
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* Market Ticker */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {MARKETS.map((m) => (
            <button
              key={m.symbol}
              onClick={() => setSelectedMarket(m.symbol)}
              className={`border p-3 text-left transition-all ${selectedMarket === m.symbol ? 'border-comic-primary bg-comic-primary/10' : 'border-zinc-800 bg-zinc-900 hover:border-zinc-600'}`}
            >
              <div className="text-xs text-zinc-400 mb-1">{m.symbol}</div>
              <div className="text-xl font-black">{m.price}</div>
              <div className={`text-sm font-bold flex items-center gap-1 ${m.up ? 'text-emerald-400' : 'text-red-400'}`}>
                {m.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {m.change}
              </div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Orderbook */}
          <div className="lg:col-span-1 border border-zinc-800 bg-zinc-900 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase text-zinc-400">Order Book — {selectedMarket}</h3>
              <RefreshCw className="w-3 h-3 text-zinc-600" />
            </div>

            {/* Asks */}
            <div className="space-y-1 mb-3">
              <div className="grid grid-cols-3 text-xs text-zinc-500 mb-1">
                <span>Price</span><span className="text-right">Size</span><span className="text-right">Total</span>
              </div>
              {MOCK_ORDERBOOK.asks.slice().reverse().map((a, i) => (
                <div key={i} className="grid grid-cols-3 text-xs relative">
                  <div className="absolute inset-0 right-0 bg-red-500/10" style={{ width: `${(a.total / 3500) * 100}%` }} />
                  <span className="text-red-400 font-bold relative z-10">{a.price.toFixed(4)}</span>
                  <span className="text-right text-zinc-300 relative z-10">{a.size.toLocaleString()}</span>
                  <span className="text-right text-zinc-500 relative z-10">{a.total.toFixed(1)}</span>
                </div>
              ))}
            </div>

            {/* Spread */}
            <div className="flex items-center gap-2 py-2 border-y border-zinc-800 my-2">
              <Activity className="w-3 h-3 text-comic-primary" />
              <span className="text-xs text-zinc-400">Spread: <span className="text-zinc-200 font-bold">0.0003 (0.36%)</span></span>
            </div>

            {/* Bids */}
            <div className="space-y-1">
              {MOCK_ORDERBOOK.bids.map((b, i) => (
                <div key={i} className="grid grid-cols-3 text-xs relative">
                  <div className="absolute inset-0 right-0 bg-emerald-500/10" style={{ width: `${(b.total / 3000) * 100}%` }} />
                  <span className="text-emerald-400 font-bold relative z-10">{b.price.toFixed(4)}</span>
                  <span className="text-right text-zinc-300 relative z-10">{b.size.toLocaleString()}</span>
                  <span className="text-right text-zinc-500 relative z-10">{b.total.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Order Form + Trades */}
          <div className="lg:col-span-2 space-y-4">

            {/* Order Form */}
            <div className="border border-zinc-800 bg-zinc-900 p-4">
              <h3 className="text-xs font-bold uppercase text-zinc-400 mb-3">Place Order — {selectedMarket}</h3>

              {/* Buy / Sell toggle */}
              <div className="flex border border-zinc-700 mb-4">
                <button
                  onClick={() => setSide('buy')}
                  className={`flex-1 py-2 text-sm font-black uppercase transition-colors ${side === 'buy' ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'}`}
                >Buy</button>
                <button
                  onClick={() => setSide('sell')}
                  className={`flex-1 py-2 text-sm font-black uppercase transition-colors ${side === 'sell' ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'}`}
                >Sell</button>
              </div>

              {/* Order type */}
              <div className="flex gap-2 mb-4">
                {(['limit', 'market'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setOrderType(t)}
                    className={`px-3 py-1 text-xs font-bold uppercase border transition-colors ${orderType === t ? 'border-comic-primary text-comic-primary' : 'border-zinc-700 text-zinc-500'}`}
                  >{t}</button>
                ))}
              </div>

              <div className="space-y-3">
                {orderType === 'limit' && (
                  <div>
                    <label className="text-xs text-zinc-500 uppercase mb-1 block">Price (SOL)</label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-zinc-100 focus:border-zinc-500 focus:outline-none"
                    />
                  </div>
                )}
                <div>
                  <label className="text-xs text-zinc-500 uppercase mb-1 block">Amount (CRAFTS)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-zinc-100 focus:border-zinc-500 focus:outline-none"
                  />
                </div>
                <div className="flex justify-between text-xs text-zinc-500 py-2 border-t border-zinc-800">
                  <span>Est. Total</span>
                  <span className="text-zinc-200 font-bold">
                    {amount && price ? (parseFloat(amount) * parseFloat(price)).toFixed(6) : '—'} SOL
                  </span>
                </div>
                <button className={`w-full py-3 font-black uppercase text-sm transition-all hover:opacity-90 ${side === 'buy' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                  {side === 'buy' ? 'Buy' : 'Sell'} CRAFTS
                </button>
              </div>

              <p className="text-xs text-zinc-600 mt-3">
                Orders execute on Serum DEX via self-hosted{' '}
                <a href="https://github.com/project-serum/serum-rest-server" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-zinc-200 underline">serum-rest-server</a>.
                Connect your Solana wallet to trade.
              </p>
            </div>

            {/* Recent Trades */}
            <div className="border border-zinc-800 bg-zinc-900 p-4">
              <h3 className="text-xs font-bold uppercase text-zinc-400 mb-3">Recent Trades</h3>
              <div className="space-y-1">
                <div className="grid grid-cols-3 text-xs text-zinc-500 mb-2">
                  <span>Time</span><span className="text-right">Price</span><span className="text-right">Size</span>
                </div>
                {RECENT_TRADES.map((t, i) => (
                  <div key={i} className="grid grid-cols-3 text-xs">
                    <span className="text-zinc-600">{t.time}</span>
                    <span className={`text-right font-bold ${t.side === 'buy' ? 'text-emerald-400' : 'text-red-400'}`}>{t.price}</span>
                    <span className="text-right text-zinc-300">{t.size}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Serum Info Banner */}
        <div className="mt-6 border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-comic-primary shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm mb-1">Serum DEX Integration</h4>
              <p className="text-xs text-zinc-400 max-w-3xl">
                Comicraft Trading connects to Project Serum&apos;s decentralized exchange on Solana via a self-hosted{' '}
                <strong className="text-zinc-300">serum-rest-server</strong>.
                Orderbook data, order placement, and trade execution are handled through its REST endpoints.
                To self-host: clone{' '}
                <a href="https://github.com/project-serum/serum-rest-server" target="_blank" rel="noopener noreferrer" className="text-comic-primary underline">
                  github.com/project-serum/serum-rest-server
                </a>
                , configure <code className="bg-zinc-800 px-1 py-0.5 rounded">.env</code> with your Solana RPC endpoint
                and base58-encoded keypair, then run <code className="bg-zinc-800 px-1 py-0.5 rounded">yarn start</code>.
                No external API key required — 100% decentralized.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
