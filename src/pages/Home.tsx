import React, { useState, useEffect } from 'react';
import TokenCard from '@/components/TokenCard';
import BuyTokenModal from '@/components/BuyTokenModal';
import AvalancheStatus from '@/components/AvalancheStatus';
import { Token, TokenService } from '@/services/tokenService';
import { walletService } from '@/services/walletService';
import { Search, TrendingUp, Loader2, RefreshCw, Rocket, Zap, Star, Flame } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface HomeProps {
  isWalletConnected: boolean;
}

const Home: React.FC<HomeProps> = ({ isWalletConnected }) => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [filteredTokens, setFilteredTokens] = useState<Token[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const tokenService = TokenService.getInstance();

  // Fonction pour formater les nombres avec des espaces comme séparateurs
  const formatNumberWithPowers = (value: string | number): string => {
    const num = Number(value);
    if (isNaN(num) || num === 0) return '0';
    
    // Divise par 1×10^18 pour réduire la magnitude
    const adjustedNum = num / Math.pow(10, 18);
    
    // Affichage avec espaces comme séparateurs (format français)
    return Math.round(adjustedNum).toLocaleString('fr-FR').replace(/,/g, ' ').replace(/\u00A0/g, ' ');
  };

  useEffect(() => {
    loadTokens();
  }, []);

  useEffect(() => {
    filterTokens();
  }, [tokens, searchQuery]);

  const loadTokens = async () => {
    try {
      setIsLoading(true);
      const allTokens = await tokenService.getAllTokens();
      setTokens(allTokens);
      console.log(`${allTokens.length} tokens loaded from blockchain`);
    } catch (error) {
      console.error('Error loading tokens:', error);
      toast({
        title: "Loading Error",
        description: "Unable to load tokens from blockchain. Check your connection.",
        variant: "destructive"
      });
      setTokens([]);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTokens = async () => {
    try {
      setIsRefreshing(true);
      await tokenService.refreshTokens();
      const allTokens = await tokenService.getAllTokens();
      setTokens(allTokens);
      toast({
        title: "Tokens Refreshed",
        description: `${allTokens.length} tokens loaded from blockchain`,
      });
    } catch (error) {
      console.error('Error refreshing:', error);
      toast({
        title: "Refresh Error",
        description: "Unable to refresh tokens",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const filterTokens = () => {
    if (!searchQuery) {
      setFilteredTokens(tokens);
      return;
    }

    const filtered = tokens.filter(token =>
      token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.creator.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredTokens(filtered);
  };

  const handleBuyToken = (tokenAddress: string) => {
    const token = tokens.find(t => t.address === tokenAddress);
    if (token) {
      setSelectedToken(token);
      setIsBuyModalOpen(true);
    }
  };

  const handleConfirmBuy = async (amount: number) => {
    if (!selectedToken) return;

    try {
      toast({
        title: "Coming Soon",
        description: `Token trading will be available soon`,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Purchase Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
      throw error;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-avalanche-red/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-avalanche-red/5 to-blue-500/5 rounded-full blur-3xl animate-spin [animation-duration:60s]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16 relative">
          <div className="mb-8">
            <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-avalanche-red to-white mb-6 tracking-tight animate-fade-in">
              AVALANCHE
              <br />
              <span className="text-avalanche-red glow-text">PUMP</span>
            </h1>
            <div className="flex items-center justify-center space-x-4 mb-6">
              <Rocket className="w-8 h-8 text-avalanche-red animate-bounce" />
              <p className="text-xl md:text-2xl text-gray-300 font-bold tracking-wide">
                LAUNCH YOUR TOKEN TO THE MOON
              </p>
              <Rocket className="w-8 h-8 text-avalanche-red animate-bounce delay-500" />
            </div>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Create, trade, and pump tokens on Avalanche's fastest blockchain. 
              Join the revolution of decentralized token launches with bonding curves.
            </p>
          </div>

          {/* Floating action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Button 
              size="lg" 
              className="pump-button bg-gradient-to-r from-avalanche-red to-red-600 hover:from-red-600 hover:to-avalanche-red text-white font-black text-lg px-8 py-4 rounded-2xl transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-avalanche-red/50"
            >
              <Flame className="mr-2 h-6 w-6" />
              START PUMPING
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="pump-button-outline border-2 border-white text-black hover:bg-white hover:text-black font-bold text-lg px-8 py-4 rounded-2xl transform hover:scale-105 transition-all duration-300"
            >
              <Star className="mr-2 h-6 w-6" />
              EXPLORE TOKENS
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="pump-card bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-10 h-10 text-avalanche-red glow-icon" />
              <div className="text-right">
                <p className="text-4xl font-black text-white glow-text">{tokens.length || 0}</p>
                <p className="text-gray-400 font-bold tracking-wide">ACTIVE TOKENS</p>
              </div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-avalanche-red to-red-400 h-2 rounded-full w-3/4 animate-pulse"></div>
            </div>
          </div>
          
          <div className="pump-card bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">

              <div className="text-right">
                <p className="text-4xl font-black text-white glow-text">
                  {formatNumberWithPowers(tokens.reduce((sum, token) => sum + (token.marketCap || 0), 0))}
                </p>
                <p className="text-gray-400 font-bold tracking-wide">TOTAL VOLUME</p>
              </div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full w-2/3 animate-pulse delay-300"></div>
            </div>
          </div>
          
          <div className="pump-card bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <Zap className="w-10 h-10 text-blue-400 glow-icon" />
              <div className="text-right">
                <p className="text-4xl font-black text-white glow-text">AVAX</p>
                <p className="text-gray-400 font-bold tracking-wide">NETWORK</p>
              </div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-400 to-cyan-400 h-2 rounded-full w-full animate-pulse delay-700"></div>
            </div>
          </div>
        </div>

        {/* Search and Refresh Bar */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search for the next moonshot..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pump-input pl-12 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 rounded-2xl h-14 text-lg font-medium backdrop-blur-xl"
            />
          </div>
            <Button
            onClick={refreshTokens}
            disabled={isRefreshing}
            className="pump-button bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-cyan-500 hover:to-blue-500 text-white font-bold px-6 py-3 rounded-2xl"
            >
            <RefreshCw className={`w-5 h-5 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            REFRESH
            </Button>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-avalanche-red mx-auto mb-4 glow-icon" />
              <span className="text-2xl font-bold text-white glow-text">Loading tokens...</span>
            </div>
            </div>
          ) : (
            <>
            {/* Tokens Grid */}
            {filteredTokens.length > 0 ? (
              <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {filteredTokens.slice(0, 9).map((token, index) => (
                <div 
                  key={token.address} 
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <TokenCard
                  token={token}
                  onBuy={handleBuyToken}
                  isWalletConnected={isWalletConnected}
                  />
                </div>
                ))}
              </div>
              {filteredTokens.length > 9 && (
                <div className="text-center mt-8">
                <p className="text-gray-400 font-bold">
                  Affichage de 9 tokens sur {filteredTokens.length} disponibles
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4 pump-button-outline border-2 border-avalanche-red text-avalanche-red hover:bg-avalanche-red hover:text-white font-bold px-6 py-3 rounded-2xl"
                >
                  Voir plus de tokens
                </Button>
                </div>
              )}
              </>
            ) : (
              <div className="text-center py-20">
              <div className="mb-8">
                <Rocket className="w-24 h-24 text-gray-600 mx-auto mb-6 animate-bounce" />
                <p className="text-3xl font-black text-white mb-4 glow-text">
                {searchQuery ? 'NO TOKENS FOUND' : 'CONNECT YOUR WALLET'}
                </p>
                <p className="text-xl text-gray-400 font-bold">
                Launch your token on AVALANCHE in just two clicks
                </p>
              </div>
              <Button 
                size="lg"
                className="pump-button bg-gradient-to-r from-avalanche-red to-red-600 hover:from-red-600 hover:to-avalanche-red text-white font-black text-xl px-12 py-6 rounded-2xl transform hover:scale-110 transition-all duration-300 shadow-2xl"
              >
                <Flame className="mr-3 h-8 w-8" />
                CREATE YOUR TOKEN NOW
              </Button>
              </div>
            )}
            </>
          )}

        {/* Buy Modal */}
        <BuyTokenModal
          isOpen={isBuyModalOpen}
          onClose={() => setIsBuyModalOpen(false)}
          token={selectedToken}
          onConfirm={handleConfirmBuy}
        />
      </div>
    </div>
  );
};

export default Home;
