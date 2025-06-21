import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Coins, Trophy, Flame, Loader2 } from 'lucide-react';
import { Token } from '@/services/tokenService';
import { GamblingService } from '@/services/gamblingService';
import { useToast } from '@/hooks/use-toast';

interface GamblingModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: Token;
  onBetPlaced?: () => void;
}

const GamblingModal: React.FC<GamblingModalProps> = ({ isOpen, onClose, token, onBetPlaced }) => {
  const [betAmount, setBetAmount] = useState('');
  const [isRolling, setIsRolling] = useState(false);
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [lastWin, setLastWin] = useState<{ amount: string; multiplier: string } | null>(null);
  const [animatingDice, setAnimatingDice] = useState(false);
  const { toast } = useToast();

  const gamblingService = GamblingService.getInstance();

  const placeBet = async () => {
    if (!betAmount) return;
    
    try {
      setIsRolling(true);
      setAnimatingDice(true);
      setDiceResult(null);
      setLastWin(null);
      
      const requestId = await gamblingService.placeBet(token.address, betAmount);
      
      // Simulate a random result for the example
      setTimeout(() => {
        const randomResult = Math.floor(Math.random() * 6) + 1;
        setDiceResult(randomResult);
        setAnimatingDice(false);
        setIsRolling(false);
        
        const payout = gamblingService.calculateDicePayout(parseFloat(betAmount), randomResult);
        if (payout > 0) {
          const multiplier = (payout / parseFloat(betAmount)).toFixed(1);
          setLastWin({ amount: payout.toString(), multiplier: `${multiplier}x` });
        }
        
        toast({
          title: payout > 0 ? "🎉 Victory!" : "😔 Defeat",
          description: `Dice: ${randomResult} - ${payout > 0 ? `Win: ${payout} ${token.symbol}` : 'Better luck next time!'}`,
          variant: payout > 0 ? "default" : "destructive"
        });
        
        onBetPlaced?.();
      }, 2000);
      
      setBetAmount('');
    } catch (error) {
      setIsRolling(false);
      setAnimatingDice(false);
      console.error('Error placing bet:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error placing the bet",
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

  const getWinConditions = () => gamblingService.calculateDiceOdds();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-gradient-to-br from-gray-800/95 to-gray-900/95 border-avalanche-red/30 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-avalanche-red to-red-400">
            🎲 DICE GAME - {token.symbol}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Central Dice */}
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
                <p className="text-xl font-bold text-white">Result: {diceResult}</p>
                {lastWin ? (
                  <p className="text-green-400 font-bold">
                    🎉 Win: {lastWin.amount} {token.symbol}
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

          {/* Betting Area */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bet Amount ({token.symbol})
              </label>
              <Input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                placeholder="Enter your bet"
                className="bg-gray-700/50 border-gray-600 text-white text-center text-lg font-bold"
                disabled={isRolling}
              />
              <p className="text-xs text-gray-400 mt-1">
                Balance: {token.userBalance || '0'} {token.symbol}
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
                  ROLLING DICE...
                </>
              ) : (
                <>
                  <Flame className="mr-2 h-5 w-5" />
                  ROLL THE DICE
                </>
              )}
            </Button>
          </div>

          {/* Payouts Table */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-green-400 flex items-center">
              <Trophy className="mr-2 h-5 w-5" />
              Payout Table
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {getWinConditions().map((condition, index) => (
                <div key={index} className="bg-gray-700/30 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-white mb-1">
                    Dice {condition.dice}
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GamblingModal;
