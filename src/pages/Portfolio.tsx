import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Token, TokenService } from '@/services/tokenService';
import { walletService } from '@/services/walletService';
import AvalancheStatus from '@/components/AvalancheStatus';
import TokenCard from '@/components/TokenCard';
import { Wallet, TrendingUp, AlertCircle, Loader2, RefreshCw, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface PortfolioProps {
  isWalletConnected: boolean;
  walletAddress?: string; // Assurez-vous que cette ligne est présente et correcte
}

const Portfolio: React.FC<PortfolioProps> = ({ isWalletConnected, walletAddress }) => {
  const [myTokens, setMyTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const tokenService = TokenService.getInstance();

  useEffect(() => {
    if (isWalletConnected) {
      loadMyTokens();
    } else {
      setMyTokens([]);
      setIsLoading(false);
    }
  }, [isWalletConnected]);

  const loadMyTokens = async () => {
    try {
      setIsLoading(true);
      const tokens = await tokenService.getMyTokens();
      setMyTokens(tokens);
      console.log(`${tokens.length} tokens de l'utilisateur chargés`);
    } catch (error) {
      console.error('Erreur lors du chargement des tokens:', error);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger vos tokens depuis la blockchain",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshMyTokens = async () => {
    try {
      setIsRefreshing(true);
      const tokens = await tokenService.getMyTokens();
      setMyTokens(tokens);
      toast({
        title: "Portfolio actualisé",
        description: `${tokens.length} tokens trouvés dans votre portefeuille`,
      });
    } catch (error) {
      console.error('Erreur lors de l\'actualisation:', error);
      toast({
        title: "Erreur d'actualisation",
        description: "Impossible d'actualiser votre portfolio",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleViewToken = (tokenAddress: string) => {
    // Pour l'instant, on peut juste copier l'adresse ou afficher plus de détails
    toast({
      title: "Token sélectionné",
      description: `Adresse: ${tokenAddress}`,
    });
  };

  const handleSwitchToAvalanche = async () => {
    try {
      await walletService.switchToAvalanche();
      toast({
        title: "Réseau changé",
        description: "Vous êtes maintenant connecté au réseau Avalanche",
      });
    } catch (error) {
      toast({
        title: "Erreur de réseau",
        description: error instanceof Error ? error.message : "Impossible de changer de réseau",
        variant: "destructive",
      });
    }
  };

  const totalPortfolioValue = myTokens.reduce((total, token) => {
    const balance = parseFloat(token.userBalance || '0');
    const price = token.currentPrice || 0;
    return total + (balance * price);
  }, 0);

  const currentAccount = walletService.getCurrentAccount();
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!isWalletConnected) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-avalanche-dark mb-8">
              Mon Portefeuille
            </h1>
            
            <Card className="max-w-md mx-auto">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto" />
                  <h3 className="text-lg font-medium text-gray-900">
                    Wallet non connecté
                  </h3>
                  <p className="text-gray-600">
                    Connectez votre wallet pour voir votre portefeuille et vos positions.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-avalanche-dark mb-4">
            Mon Portefeuille
          </h1>
          <div className="flex items-center space-x-2 text-gray-600">
            <Wallet className="w-4 h-4" />
            <span>{currentAccount ? formatAddress(currentAccount) : 'Non connecté'}</span>
          </div>
        </div>

        {/* Avalanche Status */}
        <div className="mb-8">
          <AvalancheStatus 
            isConnected={isWalletConnected}
            isAvalancheNetwork={walletService.isAvalancheNetwork()}
            networkName={walletService.getNetworkName()}
            onSwitchNetwork={handleSwitchToAvalanche}
          />
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Valeur Totale
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-avalanche-dark">
                {totalPortfolioValue.toFixed(4)} AVAX
              </div>
              <p className="text-xs text-gray-500 mt-1">
                ≈ ${(totalPortfolioValue * 30).toFixed(2)} USD
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Tokens Créés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-avalanche-dark">
                {myTokens.length}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Types différents
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
          <div className="flex gap-4">
            <Button
              onClick={() => navigate('/create-token')}
              className="bg-avalanche-red hover:bg-red-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer un Token
            </Button>
          </div>
          
          <Button
            onClick={refreshMyTokens}
            disabled={isRefreshing}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Actualiser</span>
          </Button>
        </div>

        {/* Holdings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-avalanche-red" />
              <span>Mes Positions ({myTokens.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-avalanche-red" />
                <span className="ml-2 text-gray-600">Chargement de votre portfolio...</span>
              </div>
            ) : myTokens.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myTokens.map((token) => (
                  <TokenCard
                    key={token.address}
                    token={token}
                    onBuy={handleViewToken}
                    isWalletConnected={isWalletConnected}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun token trouvé
                </h3>
                <p className="text-gray-600 mb-4">
                  Vous n'avez pas encore créé de tokens
                </p>
                <Button
                  onClick={() => navigate('/create-token')}
                  className="bg-avalanche-red hover:bg-red-600 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Créer votre premier token
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transaction History Placeholder */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Historique des Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-gray-600">
                L'historique des transactions sera disponible après l'intégration des smart contracts.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Portfolio;
