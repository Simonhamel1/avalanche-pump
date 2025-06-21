// Service for managing Avalanche wallets with Core
import { ethers } from 'ethers';

export interface WalletConnection {
  address: string;
  isConnected: boolean;
  balance?: string;
  chainId?: number;
  provider?: any;
}

// Avalanche C-Chain network configuration
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
      // Check if Core/MetaMask is installed
      if (!window.ethereum) {
        throw new Error('Core Wallet or MetaMask not detected. Please install Core Wallet.');
      }

      console.log('Attempting to connect to Core/MetaMask wallet...');
      
      // Request access to accounts
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No account found');
      }

      // Create ethers provider
      this.provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await this.provider.getSigner();
      const address = await signer.getAddress();

      // Check current network
      const network = await this.provider.getNetwork();
      console.log('Current network:', network.chainId);

      // Switch to Avalanche if necessary
      if (network.chainId !== 43114n && network.chainId !== 43113n) {
        await this.switchToAvalanche();
      }

      // Get balance
      const balance = await this.provider.getBalance(address);
      const balanceInAvax = ethers.formatEther(balance);

      this.connection = {
        address,
        isConnected: true,
        balance: balanceInAvax,
        chainId: Number(network.chainId),
        provider: this.provider
      };

      console.log('Wallet connected:', this.connection.address);
      console.log('Balance:', balanceInAvax, 'AVAX');

      // Listen for account changes
      this.setupEventListeners();

      return this.connection;
    } catch (error) {
      console.error('Wallet connection error:', error);
      throw new Error(error instanceof Error ? error.message : 'Unable to connect wallet');
    }
  }

  private setupEventListeners(): void {
    if (window.ethereum) {
      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          this.disconnectWallet();
        } else {
          this.connection.address = accounts[0];
          // Refresh balance
          this.updateBalance();
        }
      });

      // Listen for network changes
      window.ethereum.on('chainChanged', (chainId: string) => {
        const newChainId = parseInt(chainId, 16);
        this.connection.chainId = newChainId;
        console.log('Network changed:', newChainId);
        
        // Check if still on Avalanche
        if (newChainId !== 43114 && newChainId !== 43113) {
          console.warn('You are no longer on the Avalanche network');
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
        console.error('Error updating balance:', error);
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
    console.log('Wallet disconnected');
  }

  getConnection(): WalletConnection {
    return this.connection;
  }

  async switchToAvalanche(useTestnet: boolean = false): Promise<void> {
    try {
      if (!window.ethereum) {
        throw new Error('Wallet not detected');
      }

      const targetNetwork = useTestnet ? AVALANCHE_FUJI : AVALANCHE_MAINNET;
      const chainIdHex = `0x${targetNetwork.chainId.toString(16)}`;

      console.log(`Switching to ${targetNetwork.chainName}...`);

      try {
        // Try to switch to the network
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainIdHex }],
        });
      } catch (switchError: any) {
        // If the network is not added, add it
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

      console.log(`Successfully switched to ${targetNetwork.chainName}`);
    } catch (error) {
      console.error('Error switching network:', error);
      throw new Error('Unable to switch to Avalanche');
    }
  }

  async getBalance(address?: string): Promise<string> {
    try {
      if (!this.provider) {
        throw new Error('Provider not initialized');
      }

      const targetAddress = address || this.connection.address;
      if (!targetAddress) {
        throw new Error('Address not available');
      }

      const balance = await this.provider.getBalance(targetAddress);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error retrieving balance:', error);
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
        return 'Unknown Network';
    }
  }

  getCurrentAccount(): string | null {
    return this.connection.isConnected ? this.connection.address : null;
  }

  getProvider(): ethers.BrowserProvider | null {
    return this.provider;
  }
}

// Export singleton instance for easy use
export const walletService = WalletService.getInstance();
