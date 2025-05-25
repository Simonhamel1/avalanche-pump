import { ethers } from 'ethers';
import { walletService } from './walletService';

// Adresses des contrats déployés sur Avalanche - NOUVELLES ADRESSES
export const FACTORY_CONTRACT_ADDRESS = '0x2CB5A989febF39FA77889682adA469d9942634C5';
export const VRF_SUBSCRIPTION_MANAGER_ADDRESS = '0x12972Fe6e8Ab1ac9bd6AED800fC57e21bbC62da6';

// ABI du contrat ERC20TokenFactory
const FACTORY_ABI = [
  // Events
  "event TokenCreated(address indexed tokenAddress, address indexed owner, string name, string symbol, uint8 decimals, uint256 initialSupply)",
  
  // Read functions
  "function deployedTokens(uint256) view returns (address)",
  "function ownerToTokens(address, uint256) view returns (address)",
  "function isFactoryToken(address) view returns (bool)",
  "function factoryOwner() view returns (address)",
  "function creationFee() view returns (uint256)",
  "function getAllTokens() view returns (address[])",
  "function getTokensByOwner(address owner) view returns (address[])",
  "function getTotalTokensCreated() view returns (uint256)",
  
  // Write functions
  "function createToken(string memory name, string memory symbol, uint8 decimals, uint256 initialSupply) payable returns (address)"
];

// ABI du contrat CustomERC20Token
const TOKEN_ABI = [
  // Read functions
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function owner() view returns (address)",
  
  // Write functions
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "function mint(address to, uint256 amount) returns (bool)",
  "function burn(uint256 amount) returns (bool)",
  "function burnFrom(address from, uint256 amount) returns (bool)",
  "function pause() returns (bool)",
  "function unpause() returns (bool)",
  "function transferOwnership(address newOwner)",
  
  // Events
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
  "event Mint(address indexed to, uint256 value)",
  "event Burn(address indexed from, uint256 value)"
];

// Types pour les tokens
export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  owner: string;
  userBalance?: string;
}

export interface TokenCreationParams {
  name: string;
  symbol: string;
  decimals: number;
  initialSupply: number;
}

export interface TokenCreatedEvent {
  tokenAddress: string;
  owner: string;
  name: string;
  symbol: string;
  decimals: number;
  initialSupply: string;
  transactionHash: string;
  blockNumber: number;
}

export interface BetPlacedEvent {
  player: string;
  requestId: string;
  betAmount: string;
  transactionHash: string;
}

export interface BetResultEvent {
  player: string;
  requestId: string;
  randomNumber: string;
  payout: string;
  won: boolean;
  transactionHash: string;
}

export interface GambleBet {
  player: string;
  betAmount: string;
  fulfilled: boolean;
  randomNumber: string;
  payout: string;
}

class ContractService {
  private factoryContract: ethers.Contract | null = null;

  /**
   * Obtient une instance du contrat factory
   */
  private async getFactoryContract(): Promise<ethers.Contract> {
    if (!this.factoryContract) {
      const provider = walletService.getProvider();
      if (!provider) {
        throw new Error('Aucun provider disponible');
      }

      const signer = await provider.getSigner();
      this.factoryContract = new ethers.Contract(
        FACTORY_CONTRACT_ADDRESS,
        FACTORY_ABI,
        signer
      );
    }
    return this.factoryContract;
  }

  /**
   * Obtient une instance d'un contrat token
   */
  private async getTokenContract(tokenAddress: string): Promise<ethers.Contract> {
    const provider = walletService.getProvider();
    if (!provider) {
      throw new Error('Aucun provider disponible');
    }

    const signer = await provider.getSigner();
    return new ethers.Contract(tokenAddress, TOKEN_ABI, signer);
  }

  /**
   * Obtient les frais de création de token
   */
  async getCreationFee(): Promise<string> {
    try {
      const factory = await this.getFactoryContract();
      const fee = await factory.creationFee();
      return ethers.formatEther(fee);
    } catch (error) {
      console.error('Erreur lors de la récupération des frais:', error);
      throw new Error('Impossible de récupérer les frais de création');
    }
  }

  /**
   * Crée un nouveau token
   */
  async createToken(params: TokenCreationParams): Promise<TokenCreatedEvent> {
    try {
      const factory = await this.getFactoryContract();
      
      // Obtenir les frais de création
      const fee = await factory.creationFee();
      
      console.log('Création du token avec les paramètres:', params);
      console.log('Frais requis:', ethers.formatEther(fee), 'AVAX');

      // Appeler la fonction createToken avec les frais
      const tx = await factory.createToken(
        params.name,
        params.symbol,
        params.decimals,
        params.initialSupply,
        { value: fee }
      );

      console.log('Transaction envoyée:', tx.hash);
      
      // Attendre la confirmation
      const receipt = await tx.wait();
      console.log('Transaction confirmée:', receipt);

      // Récupérer l'événement TokenCreated
      const tokenCreatedEvent = receipt.logs.find((log: any) => {
        try {
          const parsedLog = factory.interface.parseLog(log);
          return parsedLog?.name === 'TokenCreated';
        } catch {
          return false;
        }
      });

      if (!tokenCreatedEvent) {
        throw new Error('Événement TokenCreated non trouvé dans la transaction');
      }

      const parsedEvent = factory.interface.parseLog(tokenCreatedEvent);
      
      return {
        tokenAddress: parsedEvent.args.tokenAddress,
        owner: parsedEvent.args.owner,
        name: parsedEvent.args.name,
        symbol: parsedEvent.args.symbol,
        decimals: parsedEvent.args.decimals,
        initialSupply: parsedEvent.args.initialSupply.toString(),
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error: any) {
      console.error('Erreur lors de la création du token:', error);
      
      if (error.code === 'INSUFFICIENT_FUNDS') {
        throw new Error('Fonds insuffisants pour payer les frais de transaction et de création');
      } else if (error.code === 'USER_REJECTED') {
        throw new Error('Transaction annulée par l\'utilisateur');
      } else if (error.message?.includes('Insufficient fee')) {
        throw new Error('Frais de création insuffisants');
      } else {
        throw new Error(`Erreur lors de la création du token: ${error.message}`);
      }
    }
  }

  /**
   * Obtient tous les tokens créés par le factory
   */
  async getAllTokens(): Promise<string[]> {
    try {
      const factory = await this.getFactoryContract();
      return await factory.getAllTokens();
    } catch (error) {
      console.error('Erreur lors de la récupération des tokens:', error);
      throw new Error('Impossible de récupérer la liste des tokens');
    }
  }

  /**
   * Obtient les tokens créés par un propriétaire spécifique
   */
  async getTokensByOwner(owner: string): Promise<string[]> {
    try {
      const factory = await this.getFactoryContract();
      return await factory.getTokensByOwner(owner);
    } catch (error) {
      console.error('Erreur lors de la récupération des tokens du propriétaire:', error);
      throw new Error('Impossible de récupérer les tokens du propriétaire');
    }
  }

  /**
   * Obtient les informations détaillées d'un token
   */
  async getTokenInfo(tokenAddress: string, userAddress?: string): Promise<TokenInfo> {
    try {
      const tokenContract = await this.getTokenContract(tokenAddress);
      
      const [name, symbol, decimals, totalSupply, owner] = await Promise.all([
        tokenContract.name(),
        tokenContract.symbol(),
        tokenContract.decimals(),
        tokenContract.totalSupply(),
        tokenContract.owner()
      ]);

      let userBalance: string | undefined;
      if (userAddress) {
        const balance = await tokenContract.balanceOf(userAddress);
        userBalance = ethers.formatUnits(balance, decimals);
      }

      return {
        address: tokenAddress,
        name,
        symbol,
        decimals,
        totalSupply: ethers.formatUnits(totalSupply, decimals),
        owner,
        userBalance
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des informations du token:', error);
      throw new Error('Impossible de récupérer les informations du token');
    }
  }

  /**
   * Obtient les informations de plusieurs tokens
   */
  async getMultipleTokensInfo(tokenAddresses: string[], userAddress?: string): Promise<TokenInfo[]> {
    try {
      const promises = tokenAddresses.map(address => 
        this.getTokenInfo(address, userAddress)
      );
      return await Promise.all(promises);
    } catch (error) {
      console.error('Erreur lors de la récupération des informations des tokens:', error);
      throw new Error('Impossible de récupérer les informations des tokens');
    }
  }

  /**
   * Transfère des tokens
   */
  async transferToken(tokenAddress: string, to: string, amount: string): Promise<string> {
    try {
      const tokenContract = await this.getTokenContract(tokenAddress);
      const decimals = await tokenContract.decimals();
      const amountInWei = ethers.parseUnits(amount, decimals);
      
      const tx = await tokenContract.transfer(to, amountInWei);
      await tx.wait();
      
      return tx.hash;
    } catch (error: any) {
      console.error('Erreur lors du transfert:', error);
      
      if (error.code === 'USER_REJECTED') {
        throw new Error('Transaction annulée par l\'utilisateur');
      } else {
        throw new Error(`Erreur lors du transfert: ${error.message}`);
      }
    }
  }

  /**
   * Mint de nouveaux tokens (seulement le propriétaire)
   */
  async mintTokens(tokenAddress: string, to: string, amount: string): Promise<string> {
    try {
      const tokenContract = await this.getTokenContract(tokenAddress);
      const decimals = await tokenContract.decimals();
      const amountInWei = ethers.parseUnits(amount, decimals);
      
      const tx = await tokenContract.mint(to, amountInWei);
      await tx.wait();
      
      return tx.hash;
    } catch (error: any) {
      console.error('Erreur lors du mint:', error);
      
      if (error.code === 'USER_REJECTED') {
        throw new Error('Transaction annulée par l\'utilisateur');
      } else {
        throw new Error(`Erreur lors du mint: ${error.message}`);
      }
    }
  }

  /**
   * Burn des tokens
   */
  async burnTokens(tokenAddress: string, amount: string): Promise<string> {
    try {
      const tokenContract = await this.getTokenContract(tokenAddress);
      const decimals = await tokenContract.decimals();
      const amountInWei = ethers.parseUnits(amount, decimals);
      
      const tx = await tokenContract.burn(amountInWei);
      await tx.wait();
      
      return tx.hash;
    } catch (error: any) {
      console.error('Erreur lors du burn:', error);
      
      if (error.code === 'USER_REJECTED') {
        throw new Error('Transaction annulée par l\'utilisateur');
      } else {
        throw new Error(`Erreur lors du burn: ${error.message}`);
      }
    }
  }

  /**
   * Vérifie si une adresse est un token créé par notre factory
   */
  async isFactoryToken(tokenAddress: string): Promise<boolean> {
    try {
      const factory = await this.getFactoryContract();
      return await factory.isFactoryToken(tokenAddress);
    } catch (error) {
      console.error('Erreur lors de la vérification du token factory:', error);
      return false;
    }
  }

  /**
   * Place un pari sur un token
   */
  async placeBet(tokenAddress: string, betAmount: string, useNativePayment: boolean = false): Promise<BetPlacedEvent> {
    try {
      const tokenContract = await this.getTokenContract(tokenAddress);
      const decimals = await tokenContract.decimals();
      const amountInWei = ethers.parseUnits(betAmount, decimals);
      
      console.log('Placing bet:', betAmount, 'tokens');
      
      const tx = await tokenContract.placeBet(amountInWei, useNativePayment);
      const receipt = await tx.wait();
      
      // Récupérer l'événement BetPlaced
      const betPlacedEvent = receipt.logs.find((log: any) => {
        try {
          const parsedLog = tokenContract.interface.parseLog(log);
          return parsedLog?.name === 'BetPlaced';
        } catch {
          return false;
        }
      });

      if (!betPlacedEvent) {
        throw new Error('Événement BetPlaced non trouvé');
      }

      const parsedEvent = tokenContract.interface.parseLog(betPlacedEvent);
      
      return {
        player: parsedEvent.args.player,
        requestId: parsedEvent.args.requestId.toString(),
        betAmount: ethers.formatUnits(parsedEvent.args.betAmount, decimals),
        transactionHash: tx.hash
      };
    } catch (error: any) {
      console.error('Erreur lors du pari:', error);
      
      if (error.code === 'USER_REJECTED') {
        throw new Error('Transaction annulée par l\'utilisateur');
      } else if (error.message?.includes('Insufficient balance')) {
        throw new Error('Solde insuffisant pour ce pari');
      } else if (error.message?.includes('Bet amount too low')) {
        throw new Error('Montant du pari trop faible');
      } else {
        throw new Error(`Erreur lors du pari: ${error.message}`);
      }
    }
  }

  /**
   * Obtient les détails d'un pari
   */
  async getBetDetails(tokenAddress: string, requestId: string): Promise<GambleBet> {
    try {
      const tokenContract = await this.getTokenContract(tokenAddress);
      const decimals = await tokenContract.decimals();
      
      const betDetails = await tokenContract.getBetDetails(requestId);
      
      return {
        player: betDetails.player,
        betAmount: ethers.formatUnits(betDetails.betAmount, decimals),
        fulfilled: betDetails.fulfilled,
        randomNumber: betDetails.randomNumber.toString(),
        payout: ethers.formatUnits(betDetails.payout, decimals)
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des détails du pari:', error);
      throw new Error('Impossible de récupérer les détails du pari');
    }
  }

  /**
   * Obtient l'historique des paris d'un joueur
   */
  async getPlayerBets(tokenAddress: string, playerAddress: string): Promise<string[]> {
    try {
      const tokenContract = await this.getTokenContract(tokenAddress);
      return await tokenContract.getPlayerBets(playerAddress);
    } catch (error) {
      console.error('Erreur lors de la récupération des paris du joueur:', error);
      throw new Error('Impossible de récupérer l\'historique des paris');
    }
  }

  /**
   * Obtient le pari minimum pour un token
   */
  async getMinimumBet(tokenAddress: string): Promise<string> {
    try {
      const tokenContract = await this.getTokenContract(tokenAddress);
      const decimals = await tokenContract.decimals();
      const minBet = await tokenContract.minimumBet();
      return ethers.formatUnits(minBet, decimals);
    } catch (error) {
      console.error('Erreur lors de la récupération du pari minimum:', error);
      throw new Error('Impossible de récupérer le pari minimum');
    }
  }

  /**
   * Écoute les événements de résultats de paris
   */
  async subscribeToBetResults(tokenAddress: string, callback: (event: BetResultEvent) => void): Promise<void> {
    try {
      const tokenContract = await this.getTokenContract(tokenAddress);
      
      tokenContract.on('BetResult', (player, requestId, randomNumber, payout, won, event) => {
        callback({
          player,
          requestId: requestId.toString(),
          randomNumber: randomNumber.toString(),
          payout: payout.toString(),
          won,
          transactionHash: event.transactionHash
        });
      });
    } catch (error) {
      console.error('Erreur lors de l\'abonnement aux résultats de paris:', error);
    }
  }

  /**
   * Écoute les événements de création de tokens
   */
  async subscribeToTokenCreation(callback: (event: TokenCreatedEvent) => void): Promise<void> {
    try {
      const factory = await this.getFactoryContract();
      
      factory.on('TokenCreated', (tokenAddress, owner, name, symbol, decimals, initialSupply, event) => {
        callback({
          tokenAddress,
          owner,
          name,
          symbol,
          decimals,
          initialSupply: initialSupply.toString(),
          transactionHash: event.transactionHash,
          blockNumber: event.blockNumber
        });
      });
    } catch (error) {
      console.error('Erreur lors de l\'abonnement aux événements:', error);
    }
  }

  /**
   * Nettoie les abonnements aux événements
   */
  cleanup(): void {
    if (this.factoryContract) {
      this.factoryContract.removeAllListeners();
      this.factoryContract = null;
    }
  }
}

export const contractService = new ContractService();
