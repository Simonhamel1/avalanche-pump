// Service pour la gestion des wallets Avalanche avec Core
import { ethers } from 'ethers';

export interface WalletConnection {
  address: string;
  isConnected: boolean;
  balance?: string;
  chainId?: number;
  provider?: any;
}

// Configuration réseau Avalanche C-Chain
const AVALANCHE_MAINNET = {
  chainId: 43114,
  chainName: 'Avalanche C-Chain',
  nativeCurrency: {
    name: 'AVAX',
    symbol: 'AVAX',
    decimals: 18,
  },
  rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
  blockExplorerUrls: ['https://snowtrace.io/'],
};

const AVALANCHE_FUJI = {
  chainId: 43113,
  chainName: 'Avalanche Fuji Testnet',
  nativeCurrency: {
    name: 'AVAX',
    symbol: 'AVAX',
    decimals: 18,
  },
  rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
  blockExplorerUrls: ['https://testnet.snowtrace.io/'],
};

export class WalletService {
  private static instance: WalletService;
  private connection: WalletConnection = {
    address: '',
    isConnected: false
  };
  private provider: ethers.BrowserProvider | null = null;

  static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService();
    }
    return WalletService.instance;
  }

  async connectWallet(): Promise<WalletConnection> {
    try {
      // Vérifier si Core/MetaMask est installé
      if (!window.ethereum) {
        throw new Error('Core Wallet ou MetaMask non détecté. Veuillez installer Core Wallet.');
      }

      console.log('Tentative de connexion au wallet Core/MetaMask...');
      
      // Demander l'accès aux comptes
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('Aucun compte trouvé');
      }

      // Créer le provider ethers
      this.provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await this.provider.getSigner();
      const address = await signer.getAddress();

      // Vérifier le réseau actuel
      const network = await this.provider.getNetwork();
      console.log('Réseau actuel:', network.chainId);

      // Basculer vers Avalanche si nécessaire
      if (network.chainId !== 43114n && network.chainId !== 43113n) {
        await this.switchToAvalanche();
      }

      // Obtenir le solde
      const balance = await this.provider.getBalance(address);
      const balanceInAvax = ethers.formatEther(balance);

      this.connection = {
        address,
        isConnected: true,
        balance: balanceInAvax,
        chainId: Number(network.chainId),
        provider: this.provider
      };

      console.log('Wallet connecté:', this.connection.address);
      console.log('Solde:', balanceInAvax, 'AVAX');

      // Écouter les changements de compte
      this.setupEventListeners();

      return this.connection;
    } catch (error) {
      console.error('Erreur de connexion wallet:', error);
      throw new Error(error instanceof Error ? error.message : 'Impossible de connecter le wallet');
    }
  }

  private setupEventListeners(): void {
    if (window.ethereum) {
      // Écouter les changements de compte
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          this.disconnectWallet();
        } else {
          this.connection.address = accounts[0];
          // Rafraîchir le solde
          this.updateBalance();
        }
      });

      // Écouter les changements de réseau
      window.ethereum.on('chainChanged', (chainId: string) => {
        const newChainId = parseInt(chainId, 16);
        this.connection.chainId = newChainId;
        console.log('Réseau changé:', newChainId);
        
        // Vérifier si on est toujours sur Avalanche
        if (newChainId !== 43114 && newChainId !== 43113) {
          console.warn('Vous n\'êtes plus sur le réseau Avalanche');
        }
      });
    }
  }

  private async updateBalance(): Promise<void> {
    if (this.provider && this.connection.address) {
      try {
        const balance = await this.provider.getBalance(this.connection.address);
        this.connection.balance = ethers.formatEther(balance);
      } catch (error) {
        console.error('Erreur lors de la mise à jour du solde:', error);
      }
    }
  }

  disconnectWallet(): void {
    this.connection = {
      address: '',
      isConnected: false,
      chainId: undefined,
      provider: null
    };
    this.provider = null;
    console.log('Wallet déconnecté');
  }

  getConnection(): WalletConnection {
    return this.connection;
  }

  async switchToAvalanche(useTestnet: boolean = false): Promise<void> {
    try {
      if (!window.ethereum) {
        throw new Error('Wallet non détecté');
      }

      const targetNetwork = useTestnet ? AVALANCHE_FUJI : AVALANCHE_MAINNET;
      const chainIdHex = `0x${targetNetwork.chainId.toString(16)}`;

      console.log(`Basculement vers ${targetNetwork.chainName}...`);

      try {
        // Essayer de basculer vers le réseau
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainIdHex }],
        });
      } catch (switchError: any) {
        // Si le réseau n'est pas ajouté, l'ajouter
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: chainIdHex,
                chainName: targetNetwork.chainName,
                nativeCurrency: targetNetwork.nativeCurrency,
                rpcUrls: targetNetwork.rpcUrls,
                blockExplorerUrls: targetNetwork.blockExplorerUrls,
              },
            ],
          });
        } else {
          throw switchError;
        }
      }

      console.log(`Basculement vers ${targetNetwork.chainName} réussi`);
    } catch (error) {
      console.error('Erreur lors du changement de réseau:', error);
      throw new Error('Impossible de basculer vers Avalanche');
    }
  }

  async getBalance(address?: string): Promise<string> {
    try {
      if (!this.provider) {
        throw new Error('Provider non initialisé');
      }

      const targetAddress = address || this.connection.address;
      if (!targetAddress) {
        throw new Error('Adresse non disponible');
      }

      const balance = await this.provider.getBalance(targetAddress);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Erreur lors de la récupération du solde:', error);
      throw error;
    }
  }

  isAvalancheNetwork(): boolean {
    return this.connection.chainId === 43114 || this.connection.chainId === 43113;
  }

  getNetworkName(): string {
    switch (this.connection.chainId) {
      case 43114:
        return 'Avalanche Mainnet';
      case 43113:
        return 'Avalanche Fuji Testnet';
      default:
        return 'Réseau inconnu';
    }
  }

  getCurrentAccount(): string | null {
    return this.connection.isConnected ? this.connection.address : null;
  }

  getProvider(): ethers.BrowserProvider | null {
    return this.provider;
  }
}

// Export de l'instance singleton pour faciliter l'utilisation
export const walletService = WalletService.getInstance();
