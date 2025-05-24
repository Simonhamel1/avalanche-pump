
// Service pour la gestion des tokens
export interface Token {
  id: string;
  name: string;
  symbol: string;
  imageUrl: string;
  currentPrice: number;
  marketCap: number;
  creator: string;
  createdAt: Date;
}

export interface CreateTokenParams {
  name: string;
  symbol: string;
  imageUrl: string;
}

export class TokenService {
  private static instance: TokenService;
  private tokens: Token[] = [];

  static getInstance(): TokenService {
    if (!TokenService.instance) {
      TokenService.instance = new TokenService();
      // Initialiser avec quelques tokens d'exemple
      TokenService.instance.initializeMockTokens();
    }
    return TokenService.instance;
  }

  private initializeMockTokens(): void {
    this.tokens = [
      {
        id: '1',
        name: 'AvalancheToken',
        symbol: 'AVAX',
        imageUrl: 'https://cryptologos.cc/logos/avalanche-avax-logo.png',
        currentPrice: 0.0001,
        marketCap: 50000,
        creator: '0x1234...5678',
        createdAt: new Date()
      },
      {
        id: '2', 
        name: 'SnowToken',
        symbol: 'SNOW',
        imageUrl: 'https://via.placeholder.com/64/E84142/FFFFFF?text=SNOW',
        currentPrice: 0.00005,
        marketCap: 25000,
        creator: '0xabcd...efgh',
        createdAt: new Date()
      }
    ];
  }

  async createToken(params: CreateTokenParams): Promise<Token> {
    try {
      console.log('Création du token:', params);
      
      // Validation
      if (!params.name.trim()) {
        throw new Error('Le nom du token est requis');
      }
      if (params.symbol.length < 3 || params.symbol.length > 5) {
        throw new Error('Le symbole doit contenir entre 3 et 5 caractères');
      }
      if (!this.isValidUrl(params.imageUrl)) {
        throw new Error('URL d\'image invalide');
      }

      const newToken: Token = {
        id: Date.now().toString(),
        name: params.name,
        symbol: params.symbol.toUpperCase(),
        imageUrl: params.imageUrl,
        currentPrice: 0.0001, // Prix initial bonding curve
        marketCap: 1000, // Market cap initial
        creator: '0x1234...5678', // Adresse du créateur (wallet connecté)
        createdAt: new Date()
      };

      this.tokens.unshift(newToken);
      console.log('Token créé avec succès:', newToken);
      return newToken;
    } catch (error) {
      console.error('Erreur lors de la création du token:', error);
      throw error;
    }
  }

  getAllTokens(): Token[] {
    return [...this.tokens];
  }

  getTokenById(id: string): Token | undefined {
    return this.tokens.find(token => token.id === id);
  }

  async buyToken(tokenId: string, amount: number): Promise<void> {
    try {
      console.log(`Achat de ${amount} AVAX de token ${tokenId}`);
      
      const token = this.getTokenById(tokenId);
      if (!token) {
        throw new Error('Token non trouvé');
      }

      // Simulation de l'achat via bonding curve
      // Ici on intégrerait la logique smart contract
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulation délai transaction
      
      console.log('Achat réussi!');
    } catch (error) {
      console.error('Erreur lors de l\'achat:', error);
      throw error;
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}
