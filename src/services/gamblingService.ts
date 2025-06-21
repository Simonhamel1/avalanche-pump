
import { contractService, BetPlacedEvent, BetResultEvent, GambleBet } from './contractService';
import { walletService } from './walletService';

export interface GamblingGame {
  tokenAddress: string;
  tokenName: string;
  tokenSymbol: string;
  minimumBet: string;
  userBalance: string;
  recentBets: GambleBet[];
}

export interface BetHistory {
  requestId: string;
  betAmount: string;
  result?: {
    randomNumber: string;
    payout: string;
    won: boolean;
    diceValue: number;
  };
  timestamp: Date;
  status: 'pending' | 'completed';
}

export class GamblingService {
  private static instance: GamblingService;
  private activeBets: Map<string, BetHistory> = new Map();

  static getInstance(): GamblingService {
    if (!GamblingService.instance) {
      GamblingService.instance = new GamblingService();
    }
    return GamblingService.instance;
  }

  /**
   * Initialise une session de jeu pour un token
   */
  async initializeGame(tokenAddress: string): Promise<GamblingGame> {
    try {
      const currentAccount = walletService.getCurrentAccount();
      if (!currentAccount) {
        throw new Error('Wallet non connecté');
      }

      // Obtenir les informations du token
      const tokenInfo = await contractService.getTokenInfo(tokenAddress, currentAccount);
      const minimumBet = await contractService.getMinimumBet(tokenAddress);
      
      // Obtenir l'historique des paris récents
      const playerBetIds = await contractService.getPlayerBets(tokenAddress, currentAccount);
      const recentBets = await Promise.all(
        playerBetIds.slice(-5).map(id => contractService.getBetDetails(tokenAddress, id))
      );

      return {
        tokenAddress,
        tokenName: tokenInfo.name,
        tokenSymbol: tokenInfo.symbol,
        minimumBet,
        userBalance: tokenInfo.userBalance || '0',
        recentBets
      };
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du jeu:', error);
      throw error;
    }
  }

  /**
   * Place un pari
   */
  async placeBet(tokenAddress: string, betAmount: string): Promise<string> {
    try {
      console.log('Placing dice bet:', betAmount, 'on token:', tokenAddress);
      
      const betEvent = await contractService.placeBet(tokenAddress, betAmount, false);
      
      // Ajouter le pari aux paris actifs
      this.activeBets.set(betEvent.requestId, {
        requestId: betEvent.requestId,
        betAmount: betEvent.betAmount,
        timestamp: new Date(),
        status: 'pending'
      });

      return betEvent.requestId;
    } catch (error) {
      console.error('Erreur lors du placement du pari:', error);
      throw error;
    }
  }

  /**
   * Obtient l'historique des paris d'un utilisateur
   */
  async getBetHistory(tokenAddress: string): Promise<BetHistory[]> {
    try {
      const currentAccount = walletService.getCurrentAccount();
      if (!currentAccount) {
        return [];
      }

      const playerBetIds = await contractService.getPlayerBets(tokenAddress, currentAccount);
      
      const history = await Promise.all(
        playerBetIds.map(async (id) => {
          const betDetails = await contractService.getBetDetails(tokenAddress, id);
          
          const historyItem: BetHistory = {
            requestId: id,
            betAmount: betDetails.betAmount,
            timestamp: new Date(),
            status: betDetails.fulfilled ? 'completed' : 'pending'
          };

          if (betDetails.fulfilled) {
            const randomNum = parseInt(betDetails.randomNumber);
            const diceValue = (randomNum % 6) + 1; // Convertir en valeur de dé (1-6)
            
            historyItem.result = {
              randomNumber: betDetails.randomNumber,
              payout: betDetails.payout,
              won: parseFloat(betDetails.payout) > parseFloat(betDetails.betAmount),
              diceValue
            };
          }

          return historyItem;
        })
      );

      return history.reverse(); // Plus récents en premier
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
      return [];
    }
  }

  /**
   * Écoute les résultats des paris en temps réel
   */
  async subscribeToResults(tokenAddress: string, callback: (result: BetResultEvent) => void): Promise<void> {
    await contractService.subscribeToBetResults(tokenAddress, (event) => {
      // Mettre à jour les paris actifs
      if (this.activeBets.has(event.requestId)) {
        const bet = this.activeBets.get(event.requestId)!;
        bet.status = 'completed';
        
        const randomNum = parseInt(event.randomNumber);
        const diceValue = (randomNum % 6) + 1;
        
        bet.result = {
          randomNumber: event.randomNumber,
          payout: event.payout,
          won: event.won,
          diceValue
        };
      }

      callback(event);
    });
  }

  /**
   * Calcule les multiplicateurs pour le jeu de dés
   */
  calculateDiceOdds(): { dice: number; multiplier: string; probability: string }[] {
    return [
      { dice: 1, multiplier: '0x', probability: '16.7%' },
      { dice: 2, multiplier: '0x', probability: '16.7%' },
      { dice: 3, multiplier: '1.5x', probability: '16.7%' },
      { dice: 4, multiplier: '2x', probability: '16.7%' },
      { dice: 5, multiplier: '5x', probability: '16.7%' },
      { dice: 6, multiplier: '10x', probability: '16.7%' }
    ];
  }

  /**
   * Détermine le gain basé sur le résultat du dé
   */
  calculateDicePayout(betAmount: number, diceValue: number): number {
    switch (diceValue) {
      case 1:
      case 2:
        return 0; // Perte
      case 3:
        return betAmount * 1.5;
      case 4:
        return betAmount * 2;
      case 5:
        return betAmount * 5;
      case 6:
        return betAmount * 10;
      default:
        return 0;
    }
  }

  /**
   * Nettoie les ressources
   */
  cleanup(): void {
    this.activeBets.clear();
  }
}
