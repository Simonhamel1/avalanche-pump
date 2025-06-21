import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Coins, Trophy, Flame, Loader2 } from 'lucide-react';
import { Token } from '@/services/tokenService';
import { createDiceGameServiceForToken, BetResult, GameStats, DiceGameService } from '@/services/diceGameService';
import { useToast } from '@/hooks/use-toast';

interface DiceGameProps {
  token: Token;
  onBetPlaced?: () => void;
}

const DiceGame: React.FC<DiceGameProps> = ({ token, onBetPlaced }) => {
  const [betAmount, setBetAmount] = useState('');
  const [isRolling, setIsRolling] = useState(false);
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [lastWin, setLastWin] = useState<{ amount: string; multiplier: string } | null>(null);
  const [animatingDice, setAnimatingDice] = useState(false);
  const [betHistory, setBetHistory] = useState<BetResult[]>([]);
  const [gameStats, setGameStats] = useState<GameStats | null>(null);
  const [playerBalance, setPlayerBalance] = useState<string>('0');
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
  const [diceGameService, setDiceGameService] = useState<DiceGameService | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Create a service instance for this specific token
    const service = createDiceGameServiceForToken(token.address);
    setDiceGameService(service);
    
    // Initialize the game with the new service
    initializeGameWithService(service);

    return () => {
      // Cleanup when token changes or component unmounts
      service.cleanup();
    };
  }, [token.address]);

  // Update balance when token changes
  useEffect(() => {
    setPlayerBalance(token.userBalance || '0');
  }, [token.userBalance]);

  useEffect(() => {
    return () => {
      // Cleanup when component unmounts
      if (diceGameService) {
        diceGameService.cleanup();
      }
    };
  }, [diceGameService]);

  const initializeGameWithService = async (service: DiceGameService) => {
    try {
      await service.initialize();
      await loadGameDataWithService(service);
      setupEventListenersWithService(service);
    } catch (error) {
      console.error('Error initializing game:', error);
      toast({
        title: "Initialization Error",
        description: "Could not load the dice game. Check your wallet connection.",
        variant: "destructive",
      });
    }
  };

  const loadGameDataWithService = async (service: DiceGameService) => {
    try {
      const [stats, history] = await Promise.all([
        service.getGameStats(),
        service.getPlayerBetsWithDetails()
      ]);
      setGameStats(stats);
      // Use token balance from props instead of service
      setPlayerBalance(token.userBalance || '0');
      setBetHistory(history);
    } catch (error) {
      console.error('Error loading data:', error);
      // In case of error (contract not deployed), use default values to allow testing
      setGameStats({
        minimumBet: '0.01',
        totalBets: 0,
        totalWinnings: '0',
        totalLosses: '0',
        winRate: 50,
        houseEdge: '2'
      });
      setBetHistory([]);
    }
  };

  const setupEventListenersWithService = (service: DiceGameService) => {
    service.subscribeToEvents({
      onBetPlaced: (player, requestId, betAmount) => {
        console.log('Bet placed:', { player, requestId, betAmount });
        setCurrentRequestId(requestId);
      },
      onBetResult: (player, requestId, randomNumber, payout, won) => {
        handleBetResult({ requestId, randomNumber, payout, won, service });
      },
    });
  };

  const handleBetResult = (result: { requestId: string; randomNumber: string; payout: string; won: boolean; service: DiceGameService }) => {
    const randomNum = parseInt(result.randomNumber);
    const diceValue = (randomNum % 6) + 1;
    setDiceResult(diceValue);
    
    const won = result.won;
    if (won) {
      const betAmt = parseFloat(betAmount || "0");
      const payout = parseFloat(result.payout);
      const multiplier = betAmt > 0 ? (payout / betAmt).toFixed(1) : "0";
      setLastWin({ amount: result.payout, multiplier: `${multiplier}x` });
    } else {
      setLastWin(null);
    }
    
    setIsRolling(false);
    setAnimatingDice(false);
    setCurrentRequestId(null);
    
    toast({
      title: won ? "🎉 Victory!" : "😔 Defeat",
      description: `Dice: ${diceValue} - ${won ? `Win: ${result.payout} tokens` : 'Better luck next time!'}`,
      variant: won ? "default" : "destructive"
    });
    
    // Reload game stats and call onBetPlaced to refresh token balance
    loadGameDataWithService(result.service);
    onBetPlaced?.();
  };

  const placeBet = async () => {
    if (!betAmount || !gameStats || !diceGameService) return;
    
    const betValue = parseFloat(betAmount);
    const minBet = parseFloat(gameStats.minimumBet);
    const userBalance = parseFloat(playerBalance);
    
    if (betValue < minBet) {
      toast({
        title: "Invalid Bet",
        description: `Minimum bet is ${gameStats.minimumBet} tokens`,
        variant: "destructive"
      });
      return;
    }
    
    if (betValue > userBalance) {
      toast({
        title: "Insufficient Balance",
        description: `Your balance is ${playerBalance} tokens`,
        variant: "destructive"
      });
      return;
    }
    
    setIsRolling(true);
    setAnimatingDice(true);
    setDiceResult(null);
    setLastWin(null);
    
    try {
      const requestId = await diceGameService.placeBet(betAmount);
      setCurrentRequestId(requestId);
      
      toast({
        title: "Bet Placed!",
        description: "Waiting for VRF result...",
      });
      
      // Wait for result with timeout
      try {
        const result = await diceGameService.waitForBetResult(requestId, 120000);
        console.log('Result received:', result);
      } catch (timeoutError) {
        console.warn('VRF timeout, but the event may still arrive');
        toast({
          title: "Waiting Time Exceeded",
          description: "The result is taking longer than expected. It will be displayed as soon as received.",
          variant: "default"
        });
      }
    } catch (error: any) {
      console.error('Error placing bet:', error);
      setIsRolling(false);
      setAnimatingDice(false);      
      setCurrentRequestId(null);
      
      // Check if the error is due to an unconfigured contract
      if (error.message && error.message.includes('VOTRE_ADRESSE_TOKEN_ICI')) {
        toast({
          title: "Contract not configured",
          description: "To use the dice game, you must first deploy and configure the contract address in src/config/contracts.ts",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Unable to place bet",
          variant: "destructive"
        });
      }
    }
    
    if (onBetPlaced) {
      onBetPlaced();
    }
  };

  const getDiceIcon = (value: number | null, isAnimating: boolean) => {
    if (isAnimating) {
      const icons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];
      const randomIcon = icons[Math.floor(Math.random() * icons.length)];
      return React.createElement(randomIcon, { className: "w-16 h-16 text-avalanche-red animate-spin" });
    }
    
    if (value === null) {
      return <Dice1 className="w-16 h-16 text-gray-400" />;
    }
    
    const diceIcons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];
    const DiceIcon = diceIcons[value - 1];
    return <DiceIcon className="w-16 h-16 text-avalanche-red animate-bounce" />;
  };

  const getPayoutInfo = () => [
    { range: '0-24%', multiplier: '0x (Loss)', probability: '25%', color: 'text-red-400' },
    { range: '25-49%', multiplier: '1x (Refund)', probability: '25%', color: 'text-yellow-400' },
    { range: '50-79%', multiplier: '1.5x', probability: '30%', color: 'text-blue-400' },
    { range: '80-94%', multiplier: '3x', probability: '15%', color: 'text-green-400' },
    { range: '95-98%', multiplier: '10x', probability: '4%', color: 'text-purple-400' },
    { range: '99%', multiplier: '50x (JACKPOT!)', probability: '1%', color: 'text-orange-400' }
  ];
  
  return (
    <div className="space-y-6 p-4">
      {/* Main game area */}
      <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-avalanche-red/30 overflow-hidden">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-avalanche-red to-red-400">
            🎲 CHAINLINK VRF DICE GAME
          </CardTitle>
          <p className="text-gray-400">Bet with your tokens and try your luck!</p>
          {gameStats && (
            <div className="text-sm text-gray-500">
              Minimum Bet: {gameStats.minimumBet} tokens | House Edge: {gameStats.houseEdge}%
            </div>
          )}
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Player information */}
          <div className="bg-gray-700/30 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-400">Your Balance</p>
                <p className="text-xl font-bold text-white">{playerBalance} tokens</p>
              </div>
              {gameStats && (
                <div>
                  <p className="text-sm text-gray-400">Win Rate</p>
                  <p className="text-xl font-bold text-green-400">{gameStats.winRate}%</p>
                </div>
              )}
            </div>
          </div>

          {/* Central dice */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="bg-gray-700/50 rounded-3xl p-8 border-2 border-dashed border-avalanche-red/30">
                {getDiceIcon(diceResult, animatingDice)}
              </div>
              {lastWin && (
                <div className="absolute -top-2 -right-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-bounce">
                  {lastWin.multiplier}
                </div>
              )}
            </div>
            
            {currentRequestId && isRolling && (
              <div className="text-center">
                <p className="text-sm text-gray-400">Request ID: {currentRequestId}</p>
                <p className="text-yellow-400 font-medium">Waiting for VRF...</p>
              </div>
            )}
            
            {diceResult && (
              <div className="text-center">
                <p className="text-xl font-bold text-white">Result: {diceResult}</p>
                {lastWin ? (
                  <p className="text-green-400 font-bold">
                    🎉 Win: {lastWin.amount} tokens ({lastWin.multiplier})
                  </p>
                ) : (
                  <p className="text-red-400 font-bold">
                    😔 No luck this time
                  </p>
                )}
              </div>
            )}
          </div>

          <Separator className="bg-gray-700" />

          {/* Bet area */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bet Amount (tokens)
              </label>
              <Input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                placeholder={gameStats ? `Min: ${gameStats.minimumBet}` : "Enter your bet"}
                className="bg-gray-700/50 border-gray-600 text-white text-center text-lg font-bold"
                disabled={isRolling}
                step="0.01"
                min={gameStats?.minimumBet || "0"}
                max={playerBalance}
              />
              <p className="text-xs text-gray-400 mt-1">
                Available balance: {playerBalance} tokens
              </p>
            </div>
            
            <Button
              onClick={placeBet}
              disabled={isRolling || !betAmount || !gameStats}
              className="w-full bg-gradient-to-r from-avalanche-red to-red-600 hover:from-red-600 hover:to-avalanche-red text-white font-black py-4 text-lg rounded-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none"
            >
              {isRolling ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  WAITING FOR VRF...
                </>
              ) : (
                <>
                  <Flame className="mr-2 h-5 w-5" />
                  PLACE BET
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payout table */}
      <Card className="bg-gray-800/50 border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-green-400 flex items-center">
            <Trophy className="mr-2 h-5 w-5" />
            Payout Table (Chainlink VRF)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {getPayoutInfo().map((payout, index) => (
              <div key={index} className="bg-gray-700/30 rounded-lg p-3 text-center">
                <div className="text-sm font-medium text-gray-300 mb-1">
                  Roll {payout.range}
                </div>
                <Badge 
                  variant={payout.multiplier.includes('0x') ? 'destructive' : 'default'} 
                  className="mb-2"
                >
                  {payout.multiplier}
                </Badge>
                <div className={`text-xs font-medium ${payout.color}`}>
                  {payout.probability}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-xs text-gray-500 text-center">
            The result is determined by Chainlink VRF for verifiable randomness
          </div>
        </CardContent>
      </Card>

      {/* Recent history */}
      {betHistory.length > 0 && (
        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-blue-400 flex items-center">
              <Coins className="mr-2 h-5 w-5" />
              Bet History ({betHistory.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {betHistory.slice(0, 10).map((bet, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-700/30 rounded text-sm">
                  <div className="flex-1">
                    <div className="text-gray-300">
                      Bet: {bet.betAmount} tokens
                    </div>
                    <div className="text-xs text-gray-500">
                      Request ID: {bet.requestId.slice(0, 8)}...
                    </div>
                  </div>
                  <div className="text-right">
                    {bet.fulfilled ? (
                      <div>
                        <span className={bet.won ? 'text-green-400' : 'text-red-400'}>
                          {bet.won ? `+${bet.payout}` : '0'} tokens
                        </span>
                        <div className="text-xs text-gray-500">
                          Roll: {parseInt(bet.randomNumber) % 10000}
                        </div>
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-xs">Waiting for VRF</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {gameStats && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                  <div>
                    <p className="text-gray-400">Total won</p>
                    <p className="text-green-400 font-bold">{gameStats.totalWinnings}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Total lost</p>
                    <p className="text-red-400 font-bold">{gameStats.totalLosses}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Total bets</p>
                    <p className="text-white font-bold">{gameStats.totalBets}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DiceGame;
