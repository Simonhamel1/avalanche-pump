
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
      console.log('Placing bet:', betAmount, 'on token:', tokenAddress);
      
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
            timestamp: new Date(), // Dans un vrai projet, il faudrait récupérer le timestamp du block
            status: betDetails.fulfilled ? 'completed' : 'pending'
          };

          if (betDetails.fulfilled) {
            historyItem.result = {
              randomNumber: betDetails.randomNumber,
              payout: betDetails.payout,
              won: parseFloat(betDetails.payout) > parseFloat(betDetails.betAmount)
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
        bet.result = {
          randomNumber: event.randomNumber,
          payout: event.payout,
          won: event.won
        };
      }

      callback(event);
    });
  }

  /**
   * Calcule les odds/multiplicateurs pour affichage
   */
  calculateOdds(): { range: string; multiplier: string; probability: string }[] {
    return [
      { range: '0-4999', multiplier: '0x', probability: '50%' },
      { range: '5000-7999', multiplier: '1.5x', probability: '30%' },
      { range: '8000-9499', multiplier: '3x', probability: '15%' },
      { range: '9500-9899', multiplier: '10x', probability: '4%' },
      { range: '9900-9999', multiplier: '50x', probability: '1%' }
    ];
  }

  /**
   * Nettoie les ressources
   */
  cleanup(): void {
    this.activeBets.clear();
  }
}
