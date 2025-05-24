import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Token, TokenService } from '@/services/tokenService';
import { Transaction, transactionService } from '@/services/transactionService';
import { walletService } from '@/services/walletService';
import AvalancheStatus from '@/components/AvalancheStatus';
import TokenBalance from '@/components/TokenBalance';
import TransactionList from '@/components/TransactionList';
import NetworkStatus from '@/components/NetworkStatus';
import StatsDisplay from '@/components/StatsDisplay';
import { Wallet, TrendingUp, AlertCircle, Loader2, RefreshCw, Plus, Search, Filter, Grid3X3, List, History } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface PortfolioProps {
  isWalletConnected: boolean;
  walletAddress?: string; // Assurez-vous que cette ligne est présente et correcte
}

const Portfolio: React.FC<PortfolioProps> = ({ isWalletConnected, walletAddress }) => {
  const [myTokens, setMyTokens] = useState<Token[]>([]);
  const [allTokens, setAllTokens] = useState<Token[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('portfolio');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { toast } = useToast();
  const navigate = useNavigate();

  const tokenService = TokenService.getInstance();

  useEffect(() => {
    loadAllTokens();
    if (isWalletConnected) {
      loadMyTokens();
      loadTransactions();
    } else {
      setMyTokens([]);
      setTransactions([]);
    }
  }, [isWalletConnected]);

  const loadAllTokens = async () => {
    try {
      setIsLoading(true);
      const tokens = await tokenService.getAllTokens();
      setAllTokens(tokens);
      console.log(`${tokens.length} tokens chargés depuis la blockchain`);
    } catch (error) {
      console.error('Erreur lors du chargement des tokens:', error);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les tokens depuis la blockchain",
        variant: "destructive"
      });
      setAllTokens([]);
    } finally {
      setIsLoading(false);
    }
  };

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

  const loadTransactions = async () => {
    if (!isWalletConnected) return;
    
    try {
      setIsLoadingTransactions(true);
      const txHistory = await transactionService.getTransactionHistory();
      setTransactions(txHistory);
      console.log(`${txHistory.length} transactions chargées`);
    } catch (error) {
      console.error('Erreur lors du chargement des transactions:', error);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger l'historique des transactions",
        variant: "destructive"
      });
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const refreshMyTokens = async () => {
    try {
      setIsRefreshing(true);
      
      // Actualiser tous les tokens
      await tokenService.refreshTokens();
      const allTokensData = await tokenService.getAllTokens();
      setAllTokens(allTokensData);
      
      // Actualiser les tokens de l'utilisateur si connecté
      if (isWalletConnected) {
        const myTokensData = await tokenService.getMyTokens();
        setMyTokens(myTokensData);
        
        // Actualiser aussi les transactions
        await loadTransactions();
        
        toast({
          title: "Portfolio actualisé",
          description: `${myTokensData.length} de vos tokens et ${allTokensData.length} tokens au total`,
        });
      } else {
        toast({
          title: "Tokens actualisés",
          description: `${allTokensData.length} tokens chargés depuis la blockchain`,
        });
      }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with enhanced styling */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-avalanche-dark mb-2 bg-gradient-to-r from-avalanche-dark to-red-600 bg-clip-text text-transparent">
                Portefeuille Avalanche Token Forge
              </h1>
              <div className="flex items-center space-x-3 text-gray-600">
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                  isWalletConnected 
                    ? 'bg-green-100 text-green-700 border border-green-200' 
                    : 'bg-gray-100 text-gray-600 border border-gray-200'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    isWalletConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                  }`}></div>
                  <Wallet className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {isWalletConnected && currentAccount 
                      ? formatAddress(currentAccount)
                      : 'Wallet non connecté'
                    }
                  </span>
                </div>
                {!isWalletConnected && (
                  <span className="text-sm text-gray-500 italic">
                    (Vue publique active)
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                variant="outline"
                size="sm"
                className="transition-all duration-200 hover:scale-105"
              >
                {viewMode === 'grid' ? (
                  <List className="w-4 h-4" />
                ) : (
                  <Grid3X3 className="w-4 h-4" />
                )}
                <span className="ml-2 hidden sm:inline">
                  {viewMode === 'grid' ? 'Liste' : 'Grille'}
                </span>
              </Button>
            </div>
          </div>
        </div>

        {/* Avalanche Status */}
        {isWalletConnected && (
          <div className="mb-8">
            <AvalancheStatus 
              isConnected={isWalletConnected}
              isAvalancheNetwork={walletService.isAvalancheNetwork()}
              networkName={walletService.getNetworkName()}
              onSwitchNetwork={handleSwitchToAvalanche}
            />
          </div>
        )}

        {/* Global Stats Display - Always visible */}
        <StatsDisplay
          totalTokens={allTokens.length}
          totalValue={allTokens.reduce((total, token) => total + (token.currentPrice || 0) * parseFloat(token.totalSupply), 0)}
          userTokens={myTokens.length}
          isWalletConnected={isWalletConnected}
        />

        {/* Portfolio Summary - Only show when wallet connected */}
        {isWalletConnected && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="border-l-4 border-l-avalanche-red card-hover hover-scale glow-effect">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-avalanche-red" />
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

            <Card className="border-l-4 border-l-blue-500 card-hover hover-scale">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                  <Wallet className="w-4 h-4 mr-2 text-blue-500" />
                  Mes Tokens
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-avalanche-dark">
                  {myTokens.length}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Tokens créés
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
          <div className="flex gap-4 w-full sm:w-auto">
            <Button
              onClick={() => navigate('/create-token')}
              className="bg-avalanche-red hover:bg-red-600 text-white transition-all duration-200 hover:scale-105"
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer un Token
            </Button>
            
            {!isWalletConnected && (
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="border-avalanche-red text-avalanche-red hover:bg-avalanche-red hover:text-white"
              >
                <Wallet className="w-4 h-4 mr-2" />
                Connecter Wallet
              </Button>
            )}
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher des tokens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            <Button
              onClick={refreshMyTokens}
              disabled={isRefreshing}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Actualiser</span>
            </Button>
          </div>
        </div>

        {/* Tabs for different views */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="portfolio" className="flex items-center gap-2" disabled={!isWalletConnected}>
              <Wallet className="w-4 h-4" />
              Mes Tokens
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2" disabled={!isWalletConnected}>
              <History className="w-4 h-4" />
              Transactions
            </TabsTrigger>
          </TabsList>

          {/* Portfolio Tab - Vue principale avec tokens et transactions */}
          <TabsContent value="portfolio" className="space-y-6">
            {isWalletConnected ? (
              <TokenBalance 
                tokens={myTokens}
                userAddress={currentAccount || undefined}
                totalPortfolioValue={totalPortfolioValue}
              />
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Connectez votre wallet
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Connectez votre wallet pour voir vos tokens
                  </p>
                  <Button
                    onClick={() => window.location.reload()}
                    className="bg-avalanche-red hover:bg-red-600 text-white"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Connecter Wallet
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            {isWalletConnected ? (
              <TransactionList 
                transactions={transactions}
                isLoading={isLoadingTransactions}
                userAddress={currentAccount || undefined}
              />
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Connectez votre wallet
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Connectez votre wallet pour voir vos transactions
                  </p>
                  <Button
                    onClick={() => window.location.reload()}
                    className="bg-avalanche-red hover:bg-red-600 text-white"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Connecter Wallet
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
};

export default Portfolio;
