
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Token } from '@/services/tokenService';
import { ShoppingCart, TrendingUp, Copy } from 'lucide-react';
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
    if (!price) return "Prix non disponible";
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
        title: "Adresse copiée",
        description: "L'adresse du contrat a été copiée dans le presse-papier"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier l'adresse",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 border border-gray-200">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <img 
            src={token.imageUrl || `https://via.placeholder.com/48/E84142/FFFFFF?text=${token.symbol.charAt(0)}`} 
            alt={token.name}
            className="w-12 h-12 rounded-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://via.placeholder.com/48/E84142/FFFFFF?text=${token.symbol.charAt(0)}`;
            }}
          />
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-avalanche-dark">
              {token.name}
            </h3>
            <p className="text-sm text-gray-600 font-mono">
              ${token.symbol}
            </p>
          </div>
          <button
            onClick={copyAddress}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="Copier l'adresse du contrat"
          >
            <Copy className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Prix estimé
            </p>
            <p className="font-semibold text-avalanche-dark">
              {formatPrice(token.currentPrice)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Market Cap
            </p>
            <p className="font-semibold text-avalanche-dark flex items-center">
              <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
              {formatMarketCap(token.marketCap)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Offre totale
            </p>
            <p className="font-semibold text-avalanche-dark">
              {formatSupply(token.totalSupply, token.decimals)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Votre balance
            </p>
            <p className="font-semibold text-avalanche-dark">
              {token.userBalance ? `${parseFloat(token.userBalance).toFixed(2)}` : '0'}
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            Créateur
          </p>
          <p className="text-sm font-mono text-avalanche-dark">
            {formatAddress(token.creator)}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            Adresse du contrat
          </p>
          <p className="text-sm font-mono text-avalanche-dark">
            {formatAddress(token.address)}
          </p>
        </div>
      </CardContent>

      <CardFooter>
        <Button 
          onClick={() => onBuy(token.address)}
          disabled={!isWalletConnected}
          className="w-full bg-avalanche-red hover:bg-red-600 text-white"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {isWalletConnected ? 'Acheter' : 'Connecter wallet'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TokenCard;
