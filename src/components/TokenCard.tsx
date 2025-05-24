import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Token } from '@/services/tokenService';
import { ShoppingCart, TrendingUp, Copy, Zap, Star, Flame } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TokenCardProps {
  token: Token;
  onBuy: (tokenAddress: string) => void;
  isWalletConnected: boolean;
}

const TokenCard: React.FC<TokenCardProps> = ({ 
  token, 
  onBuy, 
  isWalletConnected 
}) => {
  const { toast } = useToast();

  const formatPrice = (price?: number) => {
    if (!price) return "Price TBA";
    return `${price.toFixed(6)} AVAX`;
  };

  const formatMarketCap = (marketCap?: number) => {
    if (!marketCap) return "N/A";
    if (marketCap >= 1000000) {
      return `${(marketCap / 1000000).toFixed(1)}M AVAX`;
    } else if (marketCap >= 1000) {
      return `${(marketCap / 1000).toFixed(1)}K AVAX`;
    }
    return `${marketCap.toFixed(2)} AVAX`;
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatSupply = (supply: string, decimals: number) => {
    const num = parseFloat(supply);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(token.address);
      toast({
        title: "Address Copied",
        description: "Contract address copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to copy address",
        variant: "destructive"
      });
    }
  };

  const getPumpLevel = () => {
    const pump = Math.floor(Math.random() * 5) + 1;
    return '🚀'.repeat(pump);
  };

  return (
    <Card className="pump-card group bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border-gray-700/50 hover:border-avalanche-red/50 transition-all duration-500 transform hover:scale-105 hover:rotate-1 overflow-hidden relative">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-avalanche-red/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Floating pump indicator */}
      <div className="absolute top-4 right-4 text-2xl animate-bounce">
        {getPumpLevel()}
      </div>

      <CardHeader className="relative z-10 pb-3">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img 
              src={token.imageUrl || `https://via.placeholder.com/56/E84142/FFFFFF?text=${token.symbol.charAt(0)}`} 
              alt={token.name}
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-gray-600 group-hover:ring-avalanche-red transition-all duration-300"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://via.placeholder.com/56/E84142/FFFFFF?text=${token.symbol.charAt(0)}`;
              }}
            />
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-gray-800 animate-pulse"></div>
          </div>
          <div className="flex-1">
            <h3 className="font-black text-xl text-white glow-text group-hover:text-avalanche-red transition-colors duration-300">
              {token.name}
            </h3>
            <p className="text-lg font-bold text-gray-300 font-mono">
              ${token.symbol}
            </p>
          </div>
          <button
            onClick={copyAddress}
            className="p-2 hover:bg-gray-700 rounded-xl transition-colors group"
            title="Copy contract address"
          >
            <Copy className="w-4 h-4 text-gray-400 group-hover:text-avalanche-red transition-colors" />
          </button>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded-2xl p-4 backdrop-blur-sm">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">
              🔥 PRICE
            </p>
            <p className="font-black text-lg text-white">
              {formatPrice(token.currentPrice)}
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-2xl p-4 backdrop-blur-sm">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1 text-green-400" />
              MCAP
            </p>
            <p className="font-black text-lg text-green-400">
              {formatMarketCap(token.marketCap)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded-2xl p-4 backdrop-blur-sm">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">
              💎 SUPPLY
            </p>
            <p className="font-black text-lg text-white">
              {formatSupply(token.totalSupply, token.decimals)}
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-2xl p-4 backdrop-blur-sm">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">
              🏦 YOUR BAG
            </p>
            <p className="font-black text-lg text-cyan-400">
              {token.userBalance ? `${parseFloat(token.userBalance).toFixed(2)}` : '0'}
            </p>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-2xl p-4 backdrop-blur-sm">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-2">
            👤 CREATOR
          </p>
          <p className="text-sm font-mono text-cyan-300 flex items-center">
            <Star className="w-3 h-3 mr-1" />
            {formatAddress(token.creator)}
          </p>
        </div>

        <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-2xl p-4 backdrop-blur-sm border border-gray-600/50">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-2">
            📝 CONTRACT
          </p>
          <p className="text-sm font-mono text-white flex items-center">
            <Zap className="w-3 h-3 mr-1 text-avalanche-red" />
            {formatAddress(token.address)}
          </p>
        </div>
      </CardContent>

      <CardFooter className="relative z-10">
        <Button 
          onClick={() => onBuy(token.address)}
          disabled={!isWalletConnected}
          className="w-full neon-button font-black text-lg py-6 rounded-2xl text-white transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:transform-none"
        >
          {isWalletConnected ? (
            <>
              <Flame className="w-5 h-5 mr-2 animate-pulse" />
              PUMP IT! 🚀
            </>
          ) : (
            <>
              <ShoppingCart className="w-5 h-5 mr-2" />
              CONNECT WALLET
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TokenCard;
