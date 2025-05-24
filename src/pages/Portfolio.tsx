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
import StatsDisplay from '@/components/StatsDisplay';
import { Wallet, TrendingUp, Loader2, RefreshCw, Plus, Search, Grid3X3, List, History, Rocket, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface PortfolioProps {
  isWalletConnected: boolean;
  walletAddress?: string;
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
      console.log(`${tokens.length} tokens loaded from blockchain`);
    } catch (error) {
      console.error('Error loading tokens:', error);
      toast({
        title: "Loading Error",
        description: "Unable to load tokens from blockchain",
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
      console.log(`${tokens.length} user tokens loaded`);
    } catch (error) {
      console.error('Error loading tokens:', error);
      toast({
        title: "Loading Error",
        description: "Unable to load your tokens from blockchain",
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
      console.log(`${txHistory.length} transactions loaded`);
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast({
        title: "Loading Error",
        description: "Unable to load transaction history",
        variant: "destructive"
      });
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const refreshMyTokens = async () => {
    try {
      setIsRefreshing(true);
      
      await tokenService.refreshTokens();
      const allTokensData = await tokenService.getAllTokens();
      setAllTokens(allTokensData);
      
      if (isWalletConnected) {
        const myTokensData = await tokenService.getMyTokens();
        setMyTokens(myTokensData);
        
        await loadTransactions();
        
        toast({
          title: "Portfolio Refreshed",
          description: `${myTokensData.length} of your tokens and ${allTokensData.length} total tokens`,
        });
      } else {
        toast({
          title: "Tokens Refreshed",
          description: `${allTokensData.length} tokens loaded from blockchain`,
        });
      }
    } catch (error) {
      console.error('Error refreshing:', error);
      toast({
        title: "Refresh Error",
        description: "Unable to refresh your portfolio",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSwitchToAvalanche = async () => {
    try {
      await walletService.switchToAvalanche();
      toast({
        title: "Network Switched",
        description: "You are now connected to Avalanche network",
      });
    } catch (error) {
      toast({
        title: "Network Error",
        description: error instanceof Error ? error.message : "Unable to switch network",
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-avalanche-red/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-avalanche-red/5 to-blue-500/5 rounded-full blur-3xl animate-spin [animation-duration:60s]"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Header */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-avalanche-red to-white mb-4 tracking-tight glow-text">
                PORTFOLIO
              </h1>
              <div className="flex items-center space-x-4 text-gray-300">
                <div className={`flex items-center space-x-3 px-4 py-2 rounded-2xl backdrop-blur-xl ${
                  isWalletConnected 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/50 glow-icon' 
                    : 'bg-gray-800/50 text-gray-400 border border-gray-600/50'
                }`}>
                  <div className={`w-3 h-3 rounded-full ${
                    isWalletConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                  }`}></div>
                  <Wallet className="w-5 h-5" />
                  <span className="font-bold text-lg">
                    {isWalletConnected && currentAccount 
                      ? formatAddress(currentAccount)
                      : 'WALLET NOT CONNECTED'
                    }
                  </span>
                </div>
                {!isWalletConnected && (
                  <span className="text-gray-500 italic font-medium">
                    (Public view active)
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                variant="outline"
                size="sm"
                className="pump-button-outline border-2 border-white text-white hover:bg-white hover:text-black font-bold px-4 py-3 rounded-2xl transition-all duration-300"
              >
                {viewMode === 'grid' ? (
                  <List className="w-5 h-5" />
                ) : (
                  <Grid3X3 className="w-5 h-5" />
                )}
                <span className="ml-2 hidden sm:inline">
                  {viewMode === 'grid' ? 'LIST' : 'GRID'}
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

        {/* Global Stats Display */}
        <StatsDisplay
          totalTokens={allTokens.length}
          totalValue={allTokens.reduce((total, token) => total + (token.currentPrice || 0) * parseFloat(token.totalSupply), 0)}
          userTokens={myTokens.length}
          isWalletConnected={isWalletConnected}
        />

        {/* Portfolio Summary - Only show when wallet connected */}
        {isWalletConnected && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card className="pump-card group bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border-gray-700/50 hover:border-avalanche-red/50 transition-all duration-500 transform hover:scale-105">
              <CardHeader className="pb-3">
                <CardTitle className="text-gray-400 font-bold flex items-center text-lg">
                  <TrendingUp className="w-6 h-6 mr-3 text-avalanche-red glow-icon" />
                  TOTAL VALUE
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-black text-white glow-text mb-2">
                  {totalPortfolioValue.toFixed(4)} AVAX
                </div>
                <p className="text-gray-400 font-bold">
                  ≈ ${(totalPortfolioValue * 30).toFixed(2)} USD
                </p>
              </CardContent>
            </Card>

            <Card className="pump-card group bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border-gray-700/50 hover:border-blue-500/50 transition-all duration-500 transform hover:scale-105">
              <CardHeader className="pb-3">
                <CardTitle className="text-gray-400 font-bold flex items-center text-lg">
                  <Wallet className="w-6 h-6 mr-3 text-blue-500 glow-icon" />
                  MY TOKENS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-black text-white glow-text mb-2">
                  {myTokens.length}
                </div>
                <p className="text-gray-400 font-bold">
                  Created tokens
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row gap-6 items-center justify-between mb-12">
          <div className="flex gap-4 w-full sm:w-auto">
            <Button
              onClick={() => navigate('/create')}
              className="neon-button bg-gradient-to-r from-avalanche-red to-red-600 hover:from-red-600 hover:to-avalanche-red text-white font-black text-lg px-8 py-4 rounded-2xl transform hover:scale-105 transition-all duration-300 shadow-2xl"
            >
              <Plus className="w-5 h-5 mr-2" />
              CREATE TOKEN
            </Button>
            
            {!isWalletConnected && (
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="pump-button-outline border-2 border-avalanche-red text-avalanche-red hover:bg-avalanche-red hover:text-white font-bold px-6 py-4 rounded-2xl"
              >
                <Wallet className="w-5 h-5 mr-2" />
                CONNECT WALLET
              </Button>
            )}
          </div>
          
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search tokens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pump-input pl-12 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 rounded-2xl h-14 text-lg font-medium backdrop-blur-xl w-full sm:w-80"
              />
            </div>
            <Button
              onClick={refreshMyTokens}
              disabled={isRefreshing}
              variant="outline"
              className="pump-button-outline border-2 border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white font-bold px-6 py-4 rounded-2xl flex items-center space-x-2"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">REFRESH</span>
            </Button>
          </div>
        </div>

        {/* Tabs for different views */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-800/50 backdrop-blur-xl rounded-2xl p-2 border border-gray-700/50">
            <TabsTrigger 
              value="portfolio" 
              className="flex items-center gap-3 data-[state=active]:bg-avalanche-red data-[state=active]:text-white text-gray-400 font-bold text-lg py-4 rounded-xl transition-all duration-300" 
              disabled={!isWalletConnected}
            >
              <Wallet className="w-5 h-5" />
              MY TOKENS
            </TabsTrigger>
            <TabsTrigger 
              value="transactions" 
              className="flex items-center gap-3 data-[state=active]:bg-avalanche-red data-[state=active]:text-white text-gray-400 font-bold text-lg py-4 rounded-xl transition-all duration-300" 
              disabled={!isWalletConnected}
            >
              <History className="w-5 h-5" />
              TRANSACTIONS
            </TabsTrigger>
          </TabsList>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="space-y-8">
            {isWalletConnected ? (
              <TokenBalance 
                tokens={myTokens}
                userAddress={currentAccount || undefined}
                totalPortfolioValue={totalPortfolioValue}
              />
            ) : (
              <Card className="pump-card bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border-gray-700/50">
                <CardContent className="text-center py-20">
                  <Rocket className="w-24 h-24 text-gray-600 mx-auto mb-8 animate-bounce" />
                  <h3 className="text-4xl font-black text-white mb-4 glow-text">
                    CONNECT YOUR WALLET
                  </h3>
                  <p className="text-gray-400 mb-8 text-xl font-bold">
                    Connect your wallet to see your tokens and start pumping
                  </p>
                  <Button
                    onClick={() => window.location.reload()}
                    className="neon-button bg-gradient-to-r from-avalanche-red to-red-600 hover:from-red-600 hover:to-avalanche-red text-white font-black text-xl px-12 py-6 rounded-2xl transform hover:scale-105 transition-all duration-300 shadow-2xl"
                  >
                    <Wallet className="w-6 h-6 mr-3" />
                    CONNECT WALLET
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-8">
            {isWalletConnected ? (
              <TransactionList 
                transactions={transactions}
                isLoading={isLoadingTransactions}
                userAddress={currentAccount || undefined}
              />
            ) : (
              <Card className="pump-card bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border-gray-700/50">
                <CardContent className="text-center py-20">
                  <History className="w-24 h-24 text-gray-600 mx-auto mb-8 animate-bounce" />
                  <h3 className="text-4xl font-black text-white mb-4 glow-text">
                    CONNECT YOUR WALLET
                  </h3>
                  <p className="text-gray-400 mb-8 text-xl font-bold">
                    Connect your wallet to see your transaction history
                  </p>
                  <Button
                    onClick={() => window.location.reload()}
                    className="neon-button bg-gradient-to-r from-avalanche-red to-red-600 hover:from-red-600 hover:to-avalanche-red text-white font-black text-xl px-12 py-6 rounded-2xl transform hover:scale-105 transition-all duration-300 shadow-2xl"
                  >
                    <Wallet className="w-6 h-6 mr-3" />
                    CONNECT WALLET
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
