
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dice1, Coins, TrendingUp, History, Loader2, Trophy, AlertTriangle } from 'lucide-react';
import { GamblingService, GamblingGame, BetHistory } from '@/services/gamblingService';
import { BetResultEvent } from '@/services/contractService';
import { useToast } from '@/hooks/use-toast';

interface GamblingModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenAddress: string;
  tokenName: string;
  tokenSymbol: string;
  onBetPlaced?: () => void;
}

const GamblingModal: React.FC<GamblingModalProps> = ({
  isOpen,
  onClose,
  tokenAddress,
  tokenName,
  tokenSymbol,
  onBetPlaced
}) => {
  const [game, setGame] = useState<GamblingGame | null>(null);
  const [betAmount, setBetAmount] = useState('');
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [betHistory, setBetHistory] = useState<BetHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  const gamblingService = GamblingService.getInstance();

  useEffect(() => {
    if (isOpen && tokenAddress) {
      initializeGame();
    }
  }, [isOpen, tokenAddress]);

  const initializeGame = async () => {
    try {
      setIsLoading(true);
      const gameData = await gamblingService.initializeGame(tokenAddress);
      setGame(gameData);
      
      const history = await gamblingService.getBetHistory(tokenAddress);
      setBetHistory(history);
      
      // S'abonner aux résultats en temps réel
      await gamblingService.subscribeToResults(tokenAddress, handleBetResult);
    } catch (error) {
      console.error('Erreur lors de l\'initialisation:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'initialiser le jeu",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBetResult = (result: BetResultEvent) => {
    const won = result.won;
    toast({
      title: won ? "🎉 Vous avez gagné !" : "😔 Vous avez perdu",
      description: `${won ? 'Gain' : 'Perte'}: ${result.payout} ${tokenSymbol}`,
      variant: won ? "default" : "destructive"
    });
    
    // Rafraîchir les données
    initializeGame();
    onBetPlaced?.();
  };

  const handlePlaceBet = async () => {
    if (!game || !betAmount) return;
    
    const betValue = parseFloat(betAmount);
    const minBet = parseFloat(game.minimumBet);
    const userBalance = parseFloat(game.userBalance);
    
    if (betValue < minBet) {
      toast({
        title: "Pari invalide",
        description: `Le pari minimum est de ${game.minimumBet} ${tokenSymbol}`,
        variant: "destructive"
      });
      return;
    }
    
    if (betValue > userBalance) {
      toast({
        title: "Solde insuffisant",
        description: `Vous n'avez que ${game.userBalance} ${tokenSymbol}`,
        variant: "destructive"
      });
      return;
    }

    try {
      setIsPlacingBet(true);
      const requestId = await gamblingService.placeBet(tokenAddress, betAmount);
      
      toast({
        title: "Pari placé !",
        description: `En attente du résultat... (ID: ${requestId.slice(0, 8)}...)`,
      });
      
      setBetAmount('');
      initializeGame(); // Rafraîchir les données
    } catch (error) {
      console.error('Erreur lors du pari:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors du placement du pari",
        variant: "destructive"
      });
    } finally {
      setIsPlacingBet(false);
    }
  };

  const odds = gamblingService.calculateOdds();

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl bg-gray-900 border-gray-700">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-avalanche-red" />
            <span className="ml-2 text-white">Chargement du jeu...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-avalanche-red to-red-400">
            🎲 GAMBLING GAME - {tokenSymbol}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Section de pari */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-avalanche-red">
                <Dice1 className="mr-2 h-5 w-5" />
                Place Your Bet
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Montant du pari ({tokenSymbol})
                </label>
                <Input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  placeholder={`Min: ${game?.minimumBet || '0'}`}
                  className="bg-gray-700 border-gray-600 text-white"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Solde: {game?.userBalance || '0'} {tokenSymbol}
                </p>
              </div>
              
              <Button
                onClick={handlePlaceBet}
                disabled={isPlacingBet || !betAmount}
                className="w-full bg-gradient-to-r from-avalanche-red to-red-600 hover:from-red-600 hover:to-avalanche-red text-white font-bold"
              >
                {isPlacingBet ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Placing Bet...
                  </>
                ) : (
                  <>
                    <Coins className="mr-2 h-4 w-4" />
                    PLACE BET
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Tableau des gains */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-green-400">
                <TrendingUp className="mr-2 h-5 w-5" />
                Payout Table
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {odds.map((odd, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-700 rounded">
                    <span className="text-sm text-gray-300">Roll {odd.range}</span>
                    <div className="flex items-center space-x-2">
                      <Badge variant={odd.multiplier === '0x' ? 'destructive' : 'default'}>
                        {odd.multiplier}
                      </Badge>
                      <span className="text-xs text-gray-400">{odd.probability}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Historique des paris */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-400">
              <History className="mr-2 h-5 w-5" />
              Bet History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {betHistory.length === 0 ? (
              <p className="text-gray-400 text-center py-4">Aucun pari pour le moment</p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {betHistory.slice(0, 10).map((bet, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-700 rounded text-sm">
                    <div>
                      <span className="text-gray-300">Bet: {bet.betAmount} {tokenSymbol}</span>
                      {bet.result && (
                        <span className={`ml-2 ${bet.result.won ? 'text-green-400' : 'text-red-400'}`}>
                          {bet.result.won ? <Trophy className="inline w-4 h-4" /> : <AlertTriangle className="inline w-4 h-4" />}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      {bet.status === 'pending' ? (
                        <Badge variant="outline">Pending</Badge>
                      ) : bet.result ? (
                        <span className={bet.result.won ? 'text-green-400' : 'text-red-400'}>
                          {bet.result.payout} {tokenSymbol}
                        </span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <p className="text-xs text-gray-400 text-center">
            🎲 Les résultats sont générés par Chainlink VRF pour une randomisation vérifiable et équitable
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GamblingModal;
