import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Token } from '@/services/tokenService';
import { 
  Coins, 
  TrendingUp, 
  Wallet,
  Copy,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { walletService } from '@/services/walletService';

interface TokenBalanceProps {
  tokens: Token[];
  userAddress?: string;
  totalPortfolioValue?: number;
}

const TokenBalance: React.FC<TokenBalanceProps> = ({ 
  tokens, 
  userAddress,
  totalPortfolioValue = 0 
}) => {
  const { toast } = useToast();

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié !",
      description: `${type} copié dans le presse-papiers`,
    });
  };

  const openInExplorer = (address: string) => {
    const chainId = walletService.getConnection().chainId;
    let explorerUrl = '';
    
    if (chainId === 43114) {
      explorerUrl = `https://snowtrace.io/address/${address}`;
    } else if (chainId === 43113) {
      explorerUrl = `https://testnet.snowtrace.io/address/${address}`;
    }
    
    if (explorerUrl) {
      window.open(explorerUrl, '_blank');
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    if (num === 0) return '0';
    
    // Divise par 1×10^18 pour réduire la magnitude
    const adjustedNum = num / Math.pow(10, 18);
    
    if (adjustedNum < 0.0001) return '< 0.0001';
    if (adjustedNum < 1) return adjustedNum.toFixed(6);
    
    // Affichage avec espaces comme séparateurs (format français) sans virgules
    return Math.round(adjustedNum).toLocaleString('fr-FR').replace(/,/g, ' ').replace(/\u00A0/g, ' ');
  };

  const formatSupply = (supply: string) => {
    const num = parseFloat(supply);
    if (num === 0) return '0';
    
    // Divise par 1×10^18 pour réduire la magnitude
    const adjustedNum = num / Math.pow(10, 18);
    
    // Affichage avec espaces comme séparateurs (format français) sans virgules
    return Math.round(adjustedNum).toLocaleString('fr-FR').replace(/,/g, ' ').replace(/\u00A0/g, ' ');
  };

  const tokensWithBalance = tokens.filter(token => 
    token.userBalance && parseFloat(token.userBalance) > 0
  );

  if (tokens.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wallet className="w-5 h-5 mr-2" />
            Mes Tokens
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Coins className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun token trouvé
            </h3>
            <p className="text-gray-500">
              Vos tokens apparaîtront ici une fois que vous en posséderez
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Résumé du portefeuille */}
      <Card className="bg-gradient-to-r from-avalanche-red to-avalanche-light">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Wallet className="w-5 h-5 mr-2" />
            Mon Portefeuille
          </CardTitle>
        </CardHeader>
        <CardContent className="text-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {tokens.length}
              </div>
              <div className="text-sm opacity-90">
                Token(s) total
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold">
                {tokensWithBalance.length}
              </div>
              <div className="text-sm opacity-90">
                Avec balance
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold">
                ${totalPortfolioValue.toFixed(2)}
              </div>
              <div className="text-sm opacity-90">
                Valeur estimée
              </div>
            </div>
          </div>
          
          {userAddress && (
            <div className="mt-4 p-3 bg-white/10 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm opacity-90">Adresse:</span>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-sm">
                    {formatAddress(userAddress)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-white hover:bg-white/20"
                    onClick={() => copyToClipboard(userAddress, "Adresse")}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-white hover:bg-white/20"
                    onClick={() => openInExplorer(userAddress)}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Liste des tokens */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Coins className="w-5 h-5 mr-2" />
              Mes Tokens
            </div>
            <Badge variant="secondary">{tokens.length} token(s)</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tokens.map((token) => {
              const balance = parseFloat(token.userBalance || '0');
              const hasBalance = balance > 0;
              const isCreator = token.creator.toLowerCase() === userAddress?.toLowerCase();
              
              return (
                <div 
                  key={token.address} 
                  className={`p-4 border rounded-lg transition-colors ${
                    hasBalance ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Image du token */}
                      <div className="w-10 h-10 bg-gradient-to-br from-avalanche-red to-avalanche-light rounded-full flex items-center justify-center text-white font-bold">
                        {token.symbol.charAt(0)}
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900">
                            {token.name}
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            {token.symbol}
                          </Badge>
                          {isCreator && (
                            <Badge variant="default" className="text-xs bg-purple-100 text-purple-800">
                              Créateur
                            </Badge>
                          )}
                        </div>
                        
                        <div className="text-xs text-gray-500 space-y-1">
                          <div className="flex items-center space-x-2">
                            <span>Adresse:</span>
                            <span className="font-mono">
                              {formatAddress(token.address)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0"
                              onClick={() => copyToClipboard(token.address, "Adresse du token")}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0"
                              onClick={() => openInExplorer(token.address)}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <div>
                            Supply total: {formatSupply(token.totalSupply)} {token.symbol}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-lg font-semibold ${
                        hasBalance ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {formatBalance(token.userBalance || '0')} {token.symbol}
                      </div>
                      
                      {token.currentPrice && hasBalance && (
                        <div className="text-sm text-gray-500">
                          ≈ ${(balance * token.currentPrice).toFixed(2)}
                        </div>
                      )}
                      
                      {!hasBalance && (
                        <div className="text-xs text-gray-400">
                          Aucune balance
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TokenBalance;
