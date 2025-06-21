
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Coins, Trophy, Flame, Loader2 } from 'lucide-react';
import { Token } from '@/services/tokenService';
import { getDiceGameService, BetResult, GameStats, PayoutCalculation } from '@/services/diceGameService';
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
  const { toast } = useToast();

  const diceGameService = getDiceGameService();

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = async () => {
    try {
      await diceGameService.initialize();
      await loadGameData();
      setupEventListeners();
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du jeu:', error);
      toast({
        title: "Erreur d'initialisation",
        description: "Impossible de charger le jeu de dés. Vérifiez votre connexion wallet.",
        variant: "destructive",
      });
    }
  };

  const loadGameData = async () => {
    try {
      const [stats, balance, history] = await Promise.all([
        diceGameService.getGameStats(),
        diceGameService.getPlayerBalance(),
        diceGameService.getPlayerBetsWithDetails()
      ]);
      
      setGameStats(stats);
      setPlayerBalance(balance);
      setBetHistory(history);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  };

  const setupEventListeners = () => {
    diceGameService.subscribeToEvents({
      onBetPlaced: (player, requestId, betAmount) => {
        console.log('Pari placé:', { player, requestId, betAmount });
        setCurrentRequestId(requestId);
      },
      onBetResult: (player, requestId, randomNumber, payout, won) => {
        handleBetResult({ requestId, randomNumber, payout, won });
      },
    });
  };

  const handleBetResult = (result: { requestId: string; randomNumber: string; payout: string; won: boolean }) => {
    const randomNum = parseInt(result.randomNumber);
    const roll = randomNum % 10000;
    const diceValue = (randomNum % 6) + 1;
    setDiceResult(diceValue);
    
    const won = result.won;
    if (won) {
      const betAmt = parseFloat(betAmount);
      const payout = parseFloat(result.payout);
      const multiplier = (payout / betAmt).toFixed(1);
      setLastWin({ amount: result.payout, multiplier: `${multiplier}x` });
    } else {
      setLastWin(null);
    }
    
    setIsRolling(false);
    setAnimatingDice(false);
    
    toast({
      title: won ? "🎉 Victoire !" : "😔 Défaite",
      description: `Dé: ${diceValue} - ${won ? `Gain: ${result.payout} tokens` : 'Meilleure chance la prochaine fois !'}`,
      variant: won ? "default" : "destructive"
    });
    
    loadGameData();
    onBetPlaced?.();
  };

  const placeBet = async () => {
    if (!betAmount || !gameStats) return;
    
    const betValue = parseFloat(betAmount);
    const minBet = parseFloat(gameStats.minimumBet);
    const userBalance = parseFloat(playerBalance);
    
    if (betValue < minBet) {
      toast({
        title: "Pari invalide",
        description: `Le pari minimum est de ${gameStats.minimumBet} tokens`,
        variant: "destructive"
      });
      return;
    }
    
    if (betValue > userBalance) {
      toast({
        title: "Solde insuffisant",
        description: `Votre solde est de ${playerBalance} tokens`,
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
        title: "Pari placé !",
        description: "En attente du résultat VRF...",
      });
      
      // Attendre le résultat avec timeout
      try {
        const result = await diceGameService.waitForBetResult(requestId, 120000);
        console.log('Résultat reçu:', result);
      } catch (timeoutError) {
        console.warn('Timeout VRF, mais l\'événement peut encore arriver');
        toast({
          title: "Délai d'attente",
          description: "Le résultat prend plus de temps que prévu. Le résultat sera affiché dès réception.",
          variant: "default"
        });
      }
    } catch (error: any) {
      console.error('Erreur lors du placement du pari:', error);
      setIsRolling(false);
      setAnimatingDice(false);
      
      toast({
        title: "Erreur",
        description: error.message || "Impossible de placer le pari",
        variant: "destructive"
      });
    }
  };
    }
    
    if (betValue > userBalance) {
      toast({
        title: "Solde insuffisant",
        description: `Vous n'avez que ${token.userBalance} ${token.symbol}`,
        variant: "destructive"
      });
      return;
    }

    try {
      setIsRolling(true);
      setAnimatingDice(true);
      setDiceResult(null);
      setLastWin(null);
      
      await gamblingService.placeBet(token.address, betAmount);
      
      toast({
        title: "🎲 Dé lancé !",
        description: "Le hasard décide de votre sort...",
      });
      
      setBetAmount('');
    } catch (error) {
      setIsRolling(false);
      setAnimatingDice(false);
      console.error('Erreur lors du pari:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors du placement du pari",
        variant: "destructive"
      });
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

  const getWinConditions = () => [
    { dice: [1], multiplier: '0x', probability: '16.7%', color: 'text-red-400' },
    { dice: [2], multiplier: '0x', probability: '16.7%', color: 'text-red-400' },
    { dice: [3], multiplier: '1.5x', probability: '16.7%', color: 'text-yellow-400' },
    { dice: [4], multiplier: '2x', probability: '16.7%', color: 'text-blue-400' },
    { dice: [5], multiplier: '5x', probability: '16.7%', color: 'text-green-400' },
    { dice: [6], multiplier: '10x', probability: '16.7%', color: 'text-purple-400' }
  ];

  return (
    <div className="space-y-6">
      {/* Zone de jeu principale */}
      <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-avalanche-red/30 overflow-hidden">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-avalanche-red to-red-400">
            🎲 JEU DE DÉ - {token.symbol}
          </CardTitle>
          <p className="text-gray-400">Lancez le dé et tentez votre chance !</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Dé central */}
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
            
            {diceResult && (
              <div className="text-center">
                <p className="text-xl font-bold text-white">Résultat: {diceResult}</p>
                {lastWin ? (
                  <p className="text-green-400 font-bold">
                    🎉 Gain: {lastWin.amount} {token.symbol}
                  </p>
                ) : (
                  <p className="text-red-400 font-bold">
                    😔 Pas de chance cette fois
                  </p>
                )}
              </div>
            )}
          </div>

          <Separator className="bg-gray-700" />

          {/* Zone de pari */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Montant du pari ({token.symbol})
              </label>
              <Input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                placeholder={`Min: ${minimumBet}`}
                className="bg-gray-700/50 border-gray-600 text-white text-center text-lg font-bold"
                disabled={isRolling}
              />
              <p className="text-xs text-gray-400 mt-1">
                Solde: {token.userBalance || '0'} {token.symbol}
              </p>
            </div>
            
            <Button
              onClick={placeBet}
              disabled={isRolling || !betAmount}
              className="w-full bg-gradient-to-r from-avalanche-red to-red-600 hover:from-red-600 hover:to-avalanche-red text-white font-black py-4 text-lg rounded-2xl transform hover:scale-105 transition-all duration-300"
            >
              {isRolling ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  LANCEMENT DU DÉ...
                </>
              ) : (
                <>
                  <Flame className="mr-2 h-5 w-5" />
                  LANCER LE DÉ
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des gains */}
      <Card className="bg-gray-800/50 border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-green-400 flex items-center">
            <Trophy className="mr-2 h-5 w-5" />
            Table des Gains
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {getWinConditions().map((condition, index) => (
              <div key={index} className="bg-gray-700/30 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-white mb-1">
                  Dé {condition.dice.join(',')}
                </div>
                <Badge variant={condition.multiplier === '0x' ? 'destructive' : 'default'} className="mb-2">
                  {condition.multiplier}
                </Badge>
                <div className={`text-xs ${condition.color}`}>
                  {condition.probability}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Historique récent */}
      {betHistory.length > 0 && (
        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-blue-400 flex items-center">
              <Coins className="mr-2 h-5 w-5" />
              Historique Récent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {betHistory.slice(0, 5).map((bet, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-700/30 rounded text-sm">
                  <span className="text-gray-300">Pari: {bet.betAmount} {token.symbol}</span>
                  {bet.status === 'completed' && bet.result ? (
                    <span className={bet.result.won ? 'text-green-400' : 'text-red-400'}>
                      {bet.result.won ? `+${bet.result.payout}` : '0'} {token.symbol}
                    </span>
                  ) : (
                    <Badge variant="outline" className="text-xs">En cours</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DiceGame;
