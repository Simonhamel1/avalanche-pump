import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dice1, Coins, TrendingUp, Wallet, Loader2, Trophy, AlertTriangle, Rocket, Flame, Star, Check, X } from 'lucide-react';
import { Token, TokenService } from '@/services/tokenService';
import { walletService } from '@/services/walletService';
import DiceGame from '@/components/DiceGame';
import { useToast } from '@/hooks/use-toast';

const Gambling: React.FC = () => {
  const [myTokens, setMyTokens] = useState<Token[]>([]);
  const [gamblingCompatibility, setGamblingCompatibility] = useState<Map<string, boolean>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingCompatibility, setIsCheckingCompatibility] = useState(false);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const { toast } = useToast();

  const tokenService = TokenService.getInstance();

  useEffect(() => {
    checkWalletConnection();
    if (walletService.getCurrentAccount()) {
      loadMyTokens();
    }
  }, []);

  const checkWalletConnection = () => {
    const connection = walletService.getConnection();
    setIsWalletConnected(connection.isConnected);
  };

  const checkIfTokenSupportsGambling = async (token: Token): Promise<boolean> => {
    try {
      // Vérifier si le token a été créé par notre factory
      const isFactoryToken = await tokenService.isFactoryToken(token.address);
      return isFactoryToken;
    } catch (error) {
      console.error('Erreur lors de la vérification du gambling:', error);
      return false;
    }
  };

  const loadMyTokens = async () => {
    try {
      setIsLoading(true);
      const tokens = await tokenService.getMyTokens();
      setMyTokens(tokens);
      
      // Check gambling compatibility for each token
      setIsCheckingCompatibility(true);
      const compatibilityMap = new Map<string, boolean>();
      
      await Promise.all(tokens.map(async (token) => {
        try {
          const isCompatible = await checkIfTokenSupportsGambling(token);
          compatibilityMap.set(token.address, isCompatible);
        } catch (error) {
          console.error(`Error checking gambling compatibility for ${token.address}:`, error);
          compatibilityMap.set(token.address, false);
        }
      }));
      
      setGamblingCompatibility(compatibilityMap);
      setIsCheckingCompatibility(false);
      
      console.log(`${tokens.length} tokens loaded for gambling`);
    } catch (error) {
      console.error('Error loading user tokens:', error);
      toast({
        title: "Loading Error",
        description: "Unable to load your tokens",
        variant: "destructive"
      });
      setMyTokens([]);
    } finally {
      setIsLoading(false);
      setIsCheckingCompatibility(false);
    }
  };

  const handleConnectWallet = async () => {
    try {
      await walletService.connectWallet();
      setIsWalletConnected(true);
      await loadMyTokens();
      toast({
        title: "Wallet Connected",
        description: "Your wallet has been connected successfully",
      });
    } catch (error) {
      toast({
        title: "Connection Error",
        description: error instanceof Error ? error.message : "Unable to connect wallet",
        variant: "destructive"
      });
    }
  };

  const handleSelectToken = async (token: Token) => {
    // Vérifier si le token supporte le gambling depuis le cache
    const supportsGambling = gamblingCompatibility.get(token.address);
    
    if (supportsGambling === false) {
      toast({
        title: "Incompatible Token",
        description: "This token doesn't support gambling. Only tokens created via our factory can be used for gaming.",
        variant: "destructive"
      });
      return;
    }
    
    // If we haven't checked yet, check now
    if (supportsGambling === undefined) {
      const isCompatible = await checkIfTokenSupportsGambling(token);
      setGamblingCompatibility(prev => new Map(prev).set(token.address, isCompatible));
      
      if (!isCompatible) {
        toast({
          title: "Incompatible Token",
          description: "This token doesn't support gambling. Only tokens created via our factory can be used for gaming.",
          variant: "destructive"
        });
        return;
      }
    }
    
    setSelectedToken(token);
  };

  const handleBackToTokens = () => {
    setSelectedToken(null);
    loadMyTokens(); // Refresh balances
  };

  const formatBalance = (balance: string | undefined): string => {
    if (!balance) return '0';
    const num = parseFloat(balance);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toFixed(2);
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
        <div className="text-center mb-12 relative">
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-avalanche-red to-white mb-6 tracking-tight">
            GAMBLING
            <br />
            <span className="text-avalanche-red glow-text">ARENA</span>
          </h1>                  <div className="flex items-center space-x-4 mb-6">
                    <Dice1 className="w-8 h-8 text-avalanche-red animate-bounce" />
                    <div className="text-center flex-1">
                      <p className="text-xl md:text-2xl text-gray-300 font-bold tracking-wide">
                        ROLL THE DICE & WIN BIG
                      </p>
                      {isCheckingCompatibility && (
                        <p className="text-sm text-gray-500 mt-1 animate-pulse">
                          Checking compatibility...
                        </p>
                      )}
                    </div>
                    <Dice1 className="w-8 h-8 text-avalanche-red animate-bounce delay-500" />
                  </div>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Use your tokens to play dice and multiply your winnings. 
            Every roll is verified by Chainlink VRF for fair and transparent gaming.
          </p>
        </div>

        {/* Affichage conditionnel : sélection de token ou jeu */}
        {selectedToken ? (
          <div className="space-y-6">
            {/* Back button */}
            <Button 
              onClick={handleBackToTokens}
              variant="outline"
              className="mb-6 border-avalanche-red text-avalanche-red hover:bg-avalanche-red hover:text-white"
            >
              ← Back to tokens
            </Button>
            
            {/* Selected token */}
            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border-avalanche-red/50 mb-6">
              <CardHeader>
                <CardTitle className="text-center text-2xl font-black text-white">
                  🎯 Selected Token: {selectedToken.name} ({selectedToken.symbol})
                </CardTitle>
                <p className="text-center text-gray-400">
                  Balance: {selectedToken.userBalance} {selectedToken.symbol}
                </p>
              </CardHeader>
            </Card>
            
            {/* Dice game */}
            <DiceGame 
              token={selectedToken} 
              onBetPlaced={handleBackToTokens}
            />
          </div>
        ) : (
          <>
            {/* Wallet Connection Check */}
            {!isWalletConnected ? (
              <div className="text-center py-20">
                <Wallet className="w-24 h-24 text-gray-600 mx-auto mb-6 animate-bounce" />
                <p className="text-3xl font-black text-white mb-4 glow-text">
                  CONNECT YOUR WALLET
                </p>
                <p className="text-xl text-gray-400 font-bold mb-8">
                  Connect your wallet to see your tokens and start playing
                </p>
                <Button 
                  onClick={handleConnectWallet}
                  size="lg"
                  className="pump-button bg-gradient-to-r from-avalanche-red to-red-600 hover:from-red-600 hover:to-avalanche-red text-white font-black text-xl px-12 py-6 rounded-2xl transform hover:scale-110 transition-all duration-300 shadow-2xl"
                >
                  <Wallet className="mr-3 h-8 w-8" />
                  CONNECT WALLET
                </Button>
              </div>
            ) : (
              <>
                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                  <div className="pump-card bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 transform hover:scale-105 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <Coins className="w-10 h-10 text-avalanche-red glow-icon" />
                      <div className="text-right">
                        <p className="text-4xl font-black text-white glow-text">{myTokens.length}</p>
                        <p className="text-gray-400 font-bold tracking-wide">MES TOKENS</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-gradient-to-r from-avalanche-red to-red-400 h-2 rounded-full w-3/4 animate-pulse"></div>
                    </div>
                  </div>
                  
                  <div className="pump-card bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 transform hover:scale-105 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <TrendingUp className="w-10 h-10 text-green-400 glow-icon" />
                      <div className="text-right">
                        <p className="text-4xl font-black text-white glow-text">VRF</p>
                        <p className="text-gray-400 font-bold tracking-wide">PROVABLY FAIR</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full w-full animate-pulse delay-300"></div>
                    </div>
                  </div>
                  
                  <div className="pump-card bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 transform hover:scale-105 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <Trophy className="w-10 h-10 text-yellow-400 glow-icon" />
                      <div className="text-right">
                        <p className="text-4xl font-black text-white glow-text">50X</p>
                        <p className="text-gray-400 font-bold tracking-wide">MAX WIN</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2 rounded-full w-4/5 animate-pulse delay-700"></div>
                    </div>
                  </div>
                </div>

                {/* Loading State */}
                {isLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                      <Loader2 className="w-12 h-12 animate-spin text-avalanche-red mx-auto mb-4 glow-icon" />
                      <span className="text-2xl font-bold text-white glow-text">Chargement de vos tokens...</span>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Tokens Grid */}
                    {myTokens.length > 0 ? (
                      <>
                        <div className="mb-8">
                          <h2 className="text-3xl font-black text-white mb-4 text-center glow-text">
                            🎲 VOS TOKENS POUR LE JEU DE DÉ
                          </h2>
                          <div className="text-center space-y-2">
                            <p className="text-gray-400 font-bold">
                              Sélectionnez un token compatible pour commencer à jouer
                            </p>
                            <div className="flex items-center justify-center space-x-6 text-sm">
                              <div className="flex items-center space-x-2">
                                <Check className="w-4 h-4 text-green-400" />
                                <span className="text-green-400">Compatible Gambling</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <X className="w-4 h-4 text-red-400" />
                                <span className="text-red-400">Non Compatible</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                          {myTokens.map((token, index) => {
                            const isGamblingCompatible = gamblingCompatibility.get(token.address);
                            const isCheckingThisToken = isCheckingCompatibility && isGamblingCompatible === undefined;
                            
                            return (
                              <div 
                                key={token.address} 
                                className="animate-fade-in"
                                style={{ animationDelay: `${index * 100}ms` }}
                              >
                                <Card className={`pump-card bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border-gray-700/50 transform hover:scale-105 transition-all duration-300 overflow-hidden ${
                                  isGamblingCompatible === true 
                                    ? 'hover:border-avalanche-red/50' 
                                    : isGamblingCompatible === false 
                                      ? 'border-red-500/30' 
                                      : 'border-gray-700/50'
                                }`}>
                                  <CardHeader className="pb-4">
                                    <div className="flex items-start justify-between">
                                      <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-avalanche-red to-red-600 flex items-center justify-center font-black text-white text-lg">
                                          {token.symbol.charAt(0)}
                                        </div>
                                        <div>
                                          <CardTitle className="text-lg font-black text-white glow-text">
                                            {token.name}
                                          </CardTitle>
                                          <div className="flex items-center space-x-2">
                                            <Badge variant="outline" className="text-xs border-avalanche-red text-avalanche-red">
                                              {token.symbol}
                                            </Badge>
                                            {isCheckingThisToken ? (
                                              <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                                            ) : isGamblingCompatible === true ? (
                                              <Badge className="text-xs bg-green-500/20 text-green-400 border-green-500/50">
                                                <Check className="w-3 h-3 mr-1" />
                                                GAMBLING
                                              </Badge>
                                            ) : isGamblingCompatible === false ? (
                                              <Badge className="text-xs bg-red-500/20 text-red-400 border-red-500/50">
                                                <X className="w-3 h-3 mr-1" />
                                                NON COMPATIBLE
                                              </Badge>
                                            ) : null}
                                          </div>
                                        </div>
                                      </div>
                                      {isGamblingCompatible === true ? (
                                        <Dice1 className="w-6 h-6 text-avalanche-red animate-pulse" />
                                      ) : (
                                        <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center">
                                          <X className="w-4 h-4 text-gray-400" />
                                        </div>
                                      )}
                                    </div>
                                  </CardHeader>
                                  
                                  <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                      <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-400 font-medium">Balance:</span>
                                        <span className="text-lg font-black text-white">
                                          {formatBalance(token.userBalance)} {token.symbol}
                                        </span>
                                      </div>
                                    </div>
                                    
                                    <Button
                                      onClick={() => handleSelectToken(token)}
                                      disabled={
                                        !token.userBalance || 
                                        parseFloat(token.userBalance) === 0 || 
                                        isGamblingCompatible === false ||
                                        isCheckingThisToken
                                      }
                                      className={`w-full font-black py-3 rounded-2xl transform hover:scale-105 transition-all duration-300 ${
                                        isGamblingCompatible === true
                                          ? 'pump-button bg-gradient-to-r from-avalanche-red to-red-600 hover:from-red-600 hover:to-avalanche-red text-white'
                                          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                      }`}
                                    >
                                      {isCheckingThisToken ? (
                                        <>
                                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                          VÉRIFICATION...
                                        </>
                                      ) : isGamblingCompatible === true ? (
                                        <>
                                          <Flame className="mr-2 h-5 w-5" />
                                          JOUER AU DÉ
                                        </>
                                      ) : isGamblingCompatible === false ? (
                                        <>
                                          <X className="mr-2 h-5 w-5" />
                                          NON COMPATIBLE
                                        </>
                                      ) : (
                                        <>
                                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                          CHARGEMENT...
                                        </>
                                      )}
                                    </Button>
                                  </CardContent>
                                </Card>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-20">
                        <AlertTriangle className="w-24 h-24 text-gray-600 mx-auto mb-6 animate-bounce" />
                        <p className="text-3xl font-black text-white mb-4 glow-text">
                          AUCUN TOKEN TROUVÉ
                        </p>
                        <p className="text-xl text-gray-400 font-bold mb-8">
                          Vous devez créer des tokens pour pouvoir jouer
                        </p>
                        <Button 
                          size="lg"
                          className="pump-button bg-gradient-to-r from-avalanche-red to-red-600 hover:from-red-600 hover:to-avalanche-red text-white font-black text-xl px-12 py-6 rounded-2xl transform hover:scale-110 transition-all duration-300 shadow-2xl"
                        >
                          <Star className="mr-3 h-8 w-8" />
                          CRÉER UN TOKEN
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Gambling;
