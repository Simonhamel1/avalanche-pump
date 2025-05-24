
import { contractService, TokenInfo, TokenCreationParams, TokenCreatedEvent } from './contractService';
import { walletService } from './walletService';

// Interface pour les tokens avec données enrichies
export interface Token {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  creator: string;
  userBalance?: string;
  imageUrl?: string;
  currentPrice?: number;
  marketCap?: number;
  createdAt?: Date;
  transactionHash?: string;
}

export interface CreateTokenParams {
  name: string;
  symbol: string;
  decimals: number;
  initialSupply: number;
  imageUrl?: string;
}

export class TokenService {
  private static instance: TokenService;
  private tokensCache: Map<string, Token> = new Map();
  private lastCacheUpdate: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance(): TokenService {
    if (!TokenService.instance) {
      TokenService.instance = new TokenService();
    }
    return TokenService.instance;
  }
  /**
   * Convertit TokenInfo en Token avec des données enrichies
   */
  private async tokenInfoToToken(tokenInfo: TokenInfo): Promise<Token> {
    return {
      address: tokenInfo.address,
      name: tokenInfo.name,
      symbol: tokenInfo.symbol,
      decimals: tokenInfo.decimals,
      totalSupply: tokenInfo.totalSupply,
      creator: tokenInfo.owner,
      userBalance: tokenInfo.userBalance,
      imageUrl: `https://via.placeholder.com/64/${Math.floor(Math.random() * 16777215).toString(16)}/FFFFFF?text=${tokenInfo.symbol}`,
      currentPrice: 0.0001, // Prix fictif pour l'instant
      marketCap: parseFloat(tokenInfo.totalSupply) * 0.0001,
      createdAt: new Date()
    };
  }

  /**
   * Vérifie si le cache est valide
   */
  private isCacheValid(): boolean {
    return Date.now() - this.lastCacheUpdate < this.CACHE_DURATION;
  }

  /**
   * Obtient les frais de création de token
   */
  async getCreationFee(): Promise<string> {
    try {
      return await contractService.getCreationFee();
    } catch (error) {
      console.error('Erreur lors de la récupération des frais:', error);
      throw error;
    }
  }

  /**
   * Crée un nouveau token sur la blockchain
   */
  async createToken(params: CreateTokenParams): Promise<Token> {
    try {
      console.log('Création du token sur la blockchain:', params);
      
      // Validation des paramètres
      if (!params.name.trim()) {
        throw new Error('Le nom du token est requis');
      }
      if (params.symbol.length < 3 || params.symbol.length > 5) {
        throw new Error('Le symbole doit contenir entre 3 et 5 caractères');
      }
      if (params.decimals < 0 || params.decimals > 18) {
        throw new Error('Les décimales doivent être entre 0 et 18');
      }
      if (params.initialSupply <= 0) {
        throw new Error('L\'offre initiale doit être supérieure à 0');
      }

      // Vérifier la connexion wallet
      const currentAccount = walletService.getCurrentAccount();
      if (!currentAccount) {
        throw new Error('Aucun wallet connecté');
      }

      // Créer le token via le smart contract
      const tokenCreationParams: TokenCreationParams = {
        name: params.name,
        symbol: params.symbol.toUpperCase(),
        decimals: params.decimals,
        initialSupply: params.initialSupply
      };

      const tokenCreatedEvent = await contractService.createToken(tokenCreationParams);
      
      // Obtenir les informations détaillées du token créé
      const tokenInfo = await contractService.getTokenInfo(tokenCreatedEvent.tokenAddress, currentAccount);
      const token = await this.tokenInfoToToken(tokenInfo);
      
      // Ajouter les données de l'événement
      token.transactionHash = tokenCreatedEvent.transactionHash;
      token.imageUrl = params.imageUrl || token.imageUrl;

      // Mettre à jour le cache
      this.tokensCache.set(token.address, token);
      
      console.log('Token créé avec succès:', token);
      return token;
    } catch (error) {
      console.error('Erreur lors de la création du token:', error);
      throw error;
    }
  }

  /**
   * Obtient tous les tokens créés par le factory
   */
  async getAllTokens(): Promise<Token[]> {
    try {
      // Utiliser le cache si valide
      if (this.isCacheValid() && this.tokensCache.size > 0) {
        return Array.from(this.tokensCache.values());
      }

      console.log('Récupération des tokens depuis la blockchain...');
      
      // Obtenir les adresses des tokens
      const tokenAddresses = await contractService.getAllTokens();
      
      if (tokenAddresses.length === 0) {
        return [];
      }

      // Obtenir l'adresse du wallet actuel pour les balances
      const currentAccount = walletService.getCurrentAccount();
      
      // Récupérer les informations de tous les tokens
      const tokensInfo = await contractService.getMultipleTokensInfo(tokenAddresses, currentAccount || undefined);
      
      // Convertir en tokens avec données enrichies
      const tokens = await Promise.all(tokensInfo.map(info => this.tokenInfoToToken(info)));
      
      // Mettre à jour le cache
      this.tokensCache.clear();
      tokens.forEach(token => this.tokensCache.set(token.address, token));
      this.lastCacheUpdate = Date.now();
      
      console.log(`${tokens.length} tokens récupérés`);
      return tokens;
    } catch (error) {
      console.error('Erreur lors de la récupération des tokens:', error);
      // Retourner le cache en cas d'erreur
      return Array.from(this.tokensCache.values());
    }
  }

  /**
   * Obtient les tokens créés par l'utilisateur connecté
   */
  async getMyTokens(): Promise<Token[]> {
    try {
      const currentAccount = walletService.getCurrentAccount();
      if (!currentAccount) {
        throw new Error('Aucun wallet connecté');
      }

      console.log('Récupération des tokens de l\'utilisateur...');
      
      // Obtenir les adresses des tokens de l'utilisateur
      const tokenAddresses = await contractService.getTokensByOwner(currentAccount);
      
      if (tokenAddresses.length === 0) {
        return [];
      }

      // Récupérer les informations des tokens
      const tokensInfo = await contractService.getMultipleTokensInfo(tokenAddresses, currentAccount);
      
      // Convertir en tokens avec données enrichies
      const tokens = await Promise.all(tokensInfo.map(info => this.tokenInfoToToken(info)));
      
      console.log(`${tokens.length} tokens de l'utilisateur récupérés`);
      return tokens;
    } catch (error) {
      console.error('Erreur lors de la récupération des tokens de l\'utilisateur:', error);
      throw error;
    }
  }

  /**
   * Obtient un token par son adresse
   */
  async getTokenByAddress(address: string): Promise<Token | undefined> {
    try {
      // Vérifier le cache d'abord
      if (this.tokensCache.has(address)) {
        return this.tokensCache.get(address);
      }

      // Obtenir l'adresse du wallet actuel pour le balance
      const currentAccount = walletService.getCurrentAccount();
      
      // Récupérer les informations du token
      const tokenInfo = await contractService.getTokenInfo(address, currentAccount || undefined);
      const token = await this.tokenInfoToToken(tokenInfo);
      
      // Mettre à jour le cache
      this.tokensCache.set(address, token);
      
      return token;
    } catch (error) {
      console.error('Erreur lors de la récupération du token:', error);
      return undefined;
    }
  }

  /**
   * Transfère des tokens
   */
  async transferToken(tokenAddress: string, to: string, amount: string): Promise<string> {
    try {
      console.log(`Transfert de ${amount} tokens vers ${to}`);
      
      const txHash = await contractService.transferToken(tokenAddress, to, amount);
      
      // Invalider le cache pour forcer une mise à jour
      this.tokensCache.delete(tokenAddress);
      this.lastCacheUpdate = 0;
      
      console.log('Transfert réussi:', txHash);
      return txHash;
    } catch (error) {
      console.error('Erreur lors du transfert:', error);
      throw error;
    }
  }

  /**
   * Mint de nouveaux tokens (seulement le propriétaire)
   */
  async mintTokens(tokenAddress: string, to: string, amount: string): Promise<string> {
    try {
      console.log(`Mint de ${amount} tokens vers ${to}`);
      
      const txHash = await contractService.mintTokens(tokenAddress, to, amount);
      
      // Invalider le cache pour forcer une mise à jour
      this.tokensCache.delete(tokenAddress);
      this.lastCacheUpdate = 0;
      
      console.log('Mint réussi:', txHash);
      return txHash;
    } catch (error) {
      console.error('Erreur lors du mint:', error);
      throw error;
    }
  }

  /**
   * Burn des tokens
   */
  async burnTokens(tokenAddress: string, amount: string): Promise<string> {
    try {
      console.log(`Burn de ${amount} tokens`);
      
      const txHash = await contractService.burnTokens(tokenAddress, amount);
      
      // Invalider le cache pour forcer une mise à jour
      this.tokensCache.delete(tokenAddress);
      this.lastCacheUpdate = 0;
      
      console.log('Burn réussi:', txHash);
      return txHash;
    } catch (error) {
      console.error('Erreur lors du burn:', error);
      throw error;
    }
  }

  /**
   * Vérifie si une adresse est un token créé par notre factory
   */
  async isFactoryToken(tokenAddress: string): Promise<boolean> {
    try {
      return await contractService.isFactoryToken(tokenAddress);
    } catch (error) {
      console.error('Erreur lors de la vérification du token factory:', error);
      return false;
    }
  }

  /**
   * Actualise le cache des tokens
   */
  async refreshTokens(): Promise<void> {
    this.lastCacheUpdate = 0;
    this.tokensCache.clear();
    await this.getAllTokens();
  }

  /**
   * Écoute les événements de création de tokens
   */
  async subscribeToTokenCreation(callback: (token: Token) => void): Promise<void> {
    try {
      await contractService.subscribeToTokenCreation(async (event: TokenCreatedEvent) => {
        // Obtenir les informations détaillées du nouveau token
        const currentAccount = walletService.getCurrentAccount();
        const tokenInfo = await contractService.getTokenInfo(event.tokenAddress, currentAccount || undefined);
        const token = await this.tokenInfoToToken(tokenInfo);
        
        // Ajouter les données de l'événement
        token.transactionHash = event.transactionHash;
        
        // Mettre à jour le cache
        this.tokensCache.set(token.address, token);
        
        // Notifier le callback
        callback(token);
      });
    } catch (error) {
      console.error('Erreur lors de l\'abonnement aux événements:', error);
    }
  }

  /**
   * Nettoie les ressources
   */
  cleanup(): void {
    this.tokensCache.clear();
    this.lastCacheUpdate = 0;
    contractService.cleanup();
  }

  /**
   * Valide une URL
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}
