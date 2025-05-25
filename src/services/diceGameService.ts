// Service pour la gestion du jeu de dés utilisant le CustomERC20Token avec Chainlink VRF
import { ethers } from 'ethers';
import { walletService } from './walletService';
import CustomERC20TokenABI from '@/contracts/abis/CustomERC20Token.json';
import { getCustomTokenAddress } from '@/config/contracts';

export interface BetResult {
  requestId: string;
  player: string;
  betAmount: string;
  fulfilled: boolean;
  randomNumber: string;
  payout: string;
  won: boolean;
}

export interface GameStats {
  totalBets: number;
  totalWinnings: string;
  totalLosses: string;
  winRate: number;
  minimumBet: string;
  houseEdge: string;
}

export interface VRFConfig {
  subscriptionId: string;
  keyHash: string;
  callbackGasLimit: number;
  requestConfirmations: number;
  numWords: number;
}

export interface PayoutCalculation {
  roll: number;
  multiplier: number;
  payout: string;
  description: string;
}

export class DiceGameService {
  private contract: ethers.Contract | null = null;
  private provider: ethers.BrowserProvider | null = null;
  private contractAddress: string;

  constructor(contractAddress: string) {
    this.contractAddress = contractAddress;
  }

  /**
   * Initialise le service avec le provider du wallet
   */
  async initialize(): Promise<void> {
    try {
      this.provider = walletService.getProvider();
      if (!this.provider) {
        throw new Error('Provider non disponible. Connectez votre wallet.');
      }

      const signer = await this.provider.getSigner();
      this.contract = new ethers.Contract(
        this.contractAddress,
        CustomERC20TokenABI.abi,
        signer
      );

      console.log('Service de jeu de dés initialisé avec le contrat:', this.contractAddress);
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du service de jeu:', error);
      throw error;
    }
  }

  /**
   * Vérifie si le service est initialisé
   */
  private ensureInitialized(): void {
    if (!this.contract || !this.provider) {
      throw new Error('Service non initialisé. Appelez initialize() d\'abord.');
    }
  }

  /**
   * Calcule le payout potentiel selon la logique du contrat
   * Cette fonction reproduit calculatePayout du smart contract
   */
  calculatePayout(betAmount: string, randomNumber?: number): PayoutCalculation {
    const betAmountBN = ethers.parseEther(betAmount);
    
    // Si pas de nombre aléatoire fourni, utiliser la distribution moyenne
    const roll = randomNumber !== undefined ? randomNumber % 10000 : Math.floor(Math.random() * 10000);
    
    let multiplier = 0;
    let description = '';
    
    if (roll < 2500) { // 25%
      multiplier = 0;
      description = 'Vous perdez tout (0x)';
    } else if (roll < 5000) { // 25%
      multiplier = 1;
      description = 'Vous récupérez votre mise (1x)';
    } else if (roll < 8000) { // 30%
      multiplier = 1.5;
      description = 'Petit gain (1.5x)';
    } else if (roll < 9500) { // 15%
      multiplier = 3;
      description = 'Bon gain (3x)';
    } else if (roll < 9900) { // 4%
      multiplier = 10;
      description = 'Gros gain (10x)';
    } else { // 1%
      multiplier = 50;
      description = 'JACKPOT! (50x)';
    }

    const payout = multiplier === 1.5 
      ? (betAmountBN * 15n) / 10n
      : betAmountBN * BigInt(Math.floor(multiplier));
    
    return {
      roll,
      multiplier,
      payout: ethers.formatEther(payout),
      description
    };
  }

  /**
   * Place un pari
   */
  async placeBet(betAmount: string, useNativePayment: boolean = false): Promise<string> {
    this.ensureInitialized();

    try {
      const betAmountWei = ethers.parseEther(betAmount);
      
      console.log(`Placement d'un pari de ${betAmount} tokens...`);
      
      const tx = await this.contract!.placeBet(betAmountWei, useNativePayment);
      const receipt = await tx.wait();
      
      // Extraire le requestId du log BetPlaced
      const betPlacedEvent = receipt.logs.find((log: any) => {
        try {
          const parsed = this.contract!.interface.parseLog(log);
          return parsed?.name === 'BetPlaced';
        } catch {
          return false;
        }
      });

      if (!betPlacedEvent) {
        throw new Error('Événement BetPlaced non trouvé');
      }

      const parsed = this.contract!.interface.parseLog(betPlacedEvent);
      const requestId = parsed!.args.requestId.toString();
      
      console.log('Pari placé avec succès. Request ID:', requestId);
      return requestId;
    } catch (error) {
      console.error('Erreur lors du placement du pari:', error);
      throw error;
    }
  }

  /**
   * Obtient les détails d'un pari
   */
  async getBetDetails(requestId: string): Promise<BetResult> {
    this.ensureInitialized();

    try {
      const result = await this.contract!.getBetDetails(requestId);
      
      return {
        requestId,
        player: result.player,
        betAmount: ethers.formatEther(result.betAmount),
        fulfilled: result.fulfilled,
        randomNumber: result.randomNumber.toString(),
        payout: ethers.formatEther(result.payout),
        won: result.payout > result.betAmount
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des détails du pari:', error);
      throw error;
    }
  }

  /**
   * Obtient l'historique des paris d'un joueur
   */
  async getPlayerBets(playerAddress?: string): Promise<string[]> {
    this.ensureInitialized();

    try {
      const address = playerAddress || walletService.getCurrentAccount();
      if (!address) {
        throw new Error('Adresse du joueur non disponible');
      }

      const betIds = await this.contract!.getPlayerBets(address);
      return betIds.map((id: any) => id.toString());
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
      throw error;
    }
  }

  /**
   * Obtient l'historique complet avec détails
   */
  async getPlayerBetsWithDetails(playerAddress?: string): Promise<BetResult[]> {
    try {
      const betIds = await this.getPlayerBets(playerAddress);
      
      const betsDetails = await Promise.all(
        betIds.map(id => this.getBetDetails(id))
      );

      return betsDetails.reverse(); // Plus récents en premier
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique détaillé:', error);
      throw error;
    }
  }

  /**
   * Attend le résultat d'un pari (polling)
   */
  async waitForBetResult(requestId: string, maxWaitTime: number = 120000): Promise<BetResult> {
    const startTime = Date.now();
    const pollInterval = 3000; // 3 secondes

    while (Date.now() - startTime < maxWaitTime) {
      try {
        const betDetails = await this.getBetDetails(requestId);
        
        if (betDetails.fulfilled) {
          console.log('Résultat du pari reçu:', betDetails);
          return betDetails;
        }
        
        console.log('En attente du résultat VRF...');
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      } catch (error) {
        console.warn('Erreur lors de la vérification du résultat:', error);
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      }
    }

    throw new Error('Timeout: Le résultat VRF n\'a pas été reçu dans le délai imparti');
  }

  /**
   * Obtient les statistiques du jeu
   */
  async getGameStats(): Promise<GameStats> {
    this.ensureInitialized();

    try {
      const [minimumBet, houseEdge] = await Promise.all([
        this.contract!.minimumBet(),
        this.contract!.houseEdge()
      ]);

      // Obtenir l'historique du joueur pour calculer les stats
      const playerBets = await this.getPlayerBetsWithDetails();
      
      const totalBets = playerBets.length;
      const wins = playerBets.filter(bet => bet.won && bet.fulfilled);
      const losses = playerBets.filter(bet => !bet.won && bet.fulfilled);
      
      const totalWinnings = wins.reduce((sum, bet) => 
        sum + parseFloat(bet.payout), 0
      );
      
      const totalLosses = losses.reduce((sum, bet) => 
        sum + parseFloat(bet.betAmount), 0
      );

      const completedBets = playerBets.filter(bet => bet.fulfilled);
      const winRate = completedBets.length > 0 
        ? (wins.length / completedBets.length) * 100 
        : 0;

      return {
        totalBets,
        totalWinnings: totalWinnings.toFixed(4),
        totalLosses: totalLosses.toFixed(4),
        winRate: Math.round(winRate * 100) / 100,
        minimumBet: ethers.formatEther(minimumBet),
        houseEdge: (Number(houseEdge) / 100).toString() // Convertir basis points en pourcentage
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }

  /**
   * Obtient la configuration VRF du contrat
   */
  async getVRFConfig(): Promise<VRFConfig> {
    this.ensureInitialized();

    try {
      const config = await this.contract!.getVRFConfig();
      
      return {
        subscriptionId: config.subscriptionId.toString(),
        keyHash: config._keyHash,
        callbackGasLimit: Number(config._callbackGasLimit),
        requestConfirmations: Number(config._requestConfirmations),
        numWords: Number(config._numWords)
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de la configuration VRF:', error);
      throw error;
    }
  }

  /**
   * Obtient le solde de tokens du joueur
   */
  async getPlayerBalance(playerAddress?: string): Promise<string> {
    this.ensureInitialized();

    try {
      const address = playerAddress || walletService.getCurrentAccount();
      if (!address) {
        throw new Error('Adresse du joueur non disponible');
      }

      const balance = await this.contract!.balanceOf(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Erreur lors de la récupération du solde:', error);
      throw error;
    }
  }

  /**
   * Obtient les informations de base du token
   */
  async getTokenInfo(): Promise<{
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
  }> {
    this.ensureInitialized();

    try {
      const [name, symbol, decimals, totalSupply] = await Promise.all([
        this.contract!.name(),
        this.contract!.symbol(),
        this.contract!.decimals(),
        this.contract!.totalSupply()
      ]);

      return {
        name,
        symbol,
        decimals: Number(decimals),
        totalSupply: ethers.formatEther(totalSupply)
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des infos du token:', error);
      throw error;
    }
  }

  /**
   * Écoute les événements du contrat
   */
  subscribeToEvents(callbacks: {
    onBetPlaced?: (player: string, requestId: string, betAmount: string) => void;
    onBetResult?: (player: string, requestId: string, randomNumber: string, payout: string, won: boolean) => void;
    onTokensBurned?: (player: string, amount: string) => void;
    onTokensMinted?: (player: string, amount: string) => void;
  }): void {
    this.ensureInitialized();

    if (callbacks.onBetPlaced) {
      this.contract!.on('BetPlaced', (player, requestId, betAmount) => {
        callbacks.onBetPlaced!(player, requestId.toString(), ethers.formatEther(betAmount));
      });
    }

    if (callbacks.onBetResult) {
      this.contract!.on('BetResult', (player, requestId, randomNumber, payout, won) => {
        callbacks.onBetResult!(
          player, 
          requestId.toString(), 
          randomNumber.toString(), 
          ethers.formatEther(payout), 
          won
        );
      });
    }

    if (callbacks.onTokensBurned) {
      this.contract!.on('TokensBurned', (player, amount) => {
        callbacks.onTokensBurned!(player, ethers.formatEther(amount));
      });
    }

    if (callbacks.onTokensMinted) {
      this.contract!.on('TokensMinted', (player, amount) => {
        callbacks.onTokensMinted!(player, ethers.formatEther(amount));
      });
    }
  }

  /**
   * Arrête l'écoute des événements
   */
  unsubscribeFromEvents(): void {
    if (this.contract) {
      this.contract.removeAllListeners();
    }
  }

  /**
   * Nettoie les ressources
   */
  cleanup(): void {
    this.unsubscribeFromEvents();
    this.contract = null;
    this.provider = null;
  }
}

export default DiceGameService;

// Instance globale du service configurée avec l'adresse du contrat
let diceGameServiceInstance: DiceGameService | null = null;

export const getDiceGameService = (): DiceGameService => {
  if (!diceGameServiceInstance) {
    try {
      const contractAddress = getCustomTokenAddress();
      diceGameServiceInstance = new DiceGameService(contractAddress);
    } catch (error) {
      console.error('Erreur lors de la création du service de jeu de dés:', error);
      throw new Error('Configuration du contrat nécessaire. Veuillez configurer l\'adresse du contrat CustomERC20Token.');
    }
  }
  return diceGameServiceInstance;
};