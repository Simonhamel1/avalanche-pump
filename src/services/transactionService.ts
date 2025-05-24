import { ethers } from 'ethers';
import { walletService } from './walletService';

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  blockNumber: number;
  gasUsed: string;
  gasPrice: string;
  type: 'send' | 'receive' | 'contract' | 'token_transfer' | 'token_creation';
  status: 'success' | 'failed' | 'pending';
  tokenAddress?: string;
  tokenName?: string;
  tokenSymbol?: string;
  tokenAmount?: string;
  description?: string;
}

export class TransactionService {
  private static instance: TransactionService;
  private transactionsCache: Map<string, Transaction[]> = new Map();
  private lastCacheUpdate: number = 0;
  private readonly CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

  static getInstance(): TransactionService {
    if (!TransactionService.instance) {
      TransactionService.instance = new TransactionService();
    }
    return TransactionService.instance;
  }

  /**
   * Récupère l'historique des transactions pour une adresse
   */
  async getTransactionHistory(address?: string, limit: number = 50): Promise<Transaction[]> {
    try {
      const targetAddress = address || walletService.getCurrentAccount();
      if (!targetAddress) {
        throw new Error('Aucune adresse disponible');
      }

      // Vérifier le cache
      const cacheKey = `${targetAddress}_${limit}`;
      const now = Date.now();
      
      if (this.transactionsCache.has(cacheKey) && 
          (now - this.lastCacheUpdate) < this.CACHE_DURATION) {
        console.log('Transactions récupérées depuis le cache');
        return this.transactionsCache.get(cacheKey)!;
      }

      const provider = walletService.getProvider();
      if (!provider) {
        throw new Error('Provider non disponible');
      }

      console.log(`Récupération des transactions pour ${targetAddress}`);

      // Récupérer les transactions récentes
      const transactions: Transaction[] = [];
      
      // Récupérer le dernier bloc
      const latestBlock = await provider.getBlockNumber();
      
      // Chercher dans les derniers blocs (limitation API)
      const blocksToCheck = Math.min(1000, latestBlock);
      const fromBlock = Math.max(0, latestBlock - blocksToCheck);

      // Récupérer les transactions depuis les derniers blocs
      for (let blockNumber = latestBlock; blockNumber >= fromBlock && transactions.length < limit; blockNumber -= 10) {
        try {
          const block = await provider.getBlock(blockNumber, true);
          if (!block || !block.transactions) continue;

          for (const tx of block.transactions) {
            if (transactions.length >= limit) break;
            
            // Les transactions dans un bloc peuvent être des strings (hash) ou des objets
            // On doit récupérer la transaction complète si c'est juste un hash
            let fullTx;
            if (typeof tx === 'string') {
              try {
                fullTx = await provider.getTransaction(tx);
                if (!fullTx) continue;
              } catch (error) {
                continue;
              }
            } else {
              fullTx = tx;
            }
            
            // Vérifier si la transaction concerne notre adresse
            if (fullTx.from?.toLowerCase() === targetAddress.toLowerCase() || 
                fullTx.to?.toLowerCase() === targetAddress.toLowerCase()) {
              
              const transaction = await this.parseTransaction(fullTx, targetAddress, block.timestamp);
              transactions.push(transaction);
            }
          }
        } catch (blockError) {
          console.warn(`Erreur lors de la récupération du bloc ${blockNumber}:`, blockError);
          continue;
        }
      }

      // Trier par timestamp décroissant
      transactions.sort((a, b) => b.timestamp - a.timestamp);

      // Mettre en cache
      this.transactionsCache.set(cacheKey, transactions);
      this.lastCacheUpdate = now;

      console.log(`${transactions.length} transactions récupérées`);
      return transactions;

    } catch (error) {
      console.error('Erreur lors de la récupération des transactions:', error);
      return [];
    }
  }

  /**
   * Parse une transaction pour extraire les informations pertinentes
   */
  private async parseTransaction(tx: any, userAddress: string, timestamp: number): Promise<Transaction> {
    const isSent = tx.from?.toLowerCase() === userAddress.toLowerCase();
    const isReceived = tx.to?.toLowerCase() === userAddress.toLowerCase();
    
    let type: Transaction['type'] = isSent ? 'send' : 'receive';
    let description = '';
    
    // Déterminer le type de transaction
    if (tx.data && tx.data !== '0x') {
      type = 'contract';
      
      // Vérifier si c'est une création de token
      if (tx.data.includes('0xa9059cbb') || tx.data.includes('0x23b872dd')) {
        type = 'token_transfer';
        description = 'Transfert de token';
      } else if (tx.data.length > 100) {
        type = 'token_creation';
        description = 'Création de token';
      } else {
        description = 'Interaction avec contrat';
      }
    } else {
      description = isSent ? 'Envoi AVAX' : 'Réception AVAX';
    }

    return {
      hash: tx.hash,
      from: tx.from || '',
      to: tx.to || '',
      value: ethers.formatEther(tx.value || '0'),
      timestamp,
      blockNumber: tx.blockNumber || 0,
      gasUsed: tx.gasLimit ? ethers.formatUnits(tx.gasLimit, 'gwei') : '0',
      gasPrice: tx.gasPrice ? ethers.formatUnits(tx.gasPrice, 'gwei') : '0',
      type,
      status: 'success', // On assume succès car dans le bloc
      description
    };
  }

  /**
   * Récupère les détails d'une transaction spécifique
   */
  async getTransactionDetails(hash: string): Promise<Transaction | null> {
    try {
      const provider = walletService.getProvider();
      if (!provider) {
        throw new Error('Provider non disponible');
      }

      const tx = await provider.getTransaction(hash);
      const receipt = await provider.getTransactionReceipt(hash);
      
      if (!tx || !receipt) {
        return null;
      }

      const block = await provider.getBlock(tx.blockNumber!);
      const userAddress = walletService.getCurrentAccount() || '';

      return await this.parseTransaction(tx, userAddress, block?.timestamp || 0);
    } catch (error) {
      console.error('Erreur lors de la récupération des détails de transaction:', error);
      return null;
    }
  }

  /**
   * Formate une adresse pour l'affichage
   */
  formatAddress(address: string): string {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  /**
   * Formate un timestamp en date lisible
   */
  formatDate(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Obtient l'URL de l'explorateur pour une transaction
   */
  getExplorerUrl(hash: string): string {
    const chainId = walletService.getConnection().chainId;
    if (chainId === 43114) {
      return `https://snowtrace.io/tx/${hash}`;
    } else if (chainId === 43113) {
      return `https://testnet.snowtrace.io/tx/${hash}`;
    }
    return '';
  }

  /**
   * Invalide le cache
   */
  clearCache(): void {
    this.transactionsCache.clear();
    this.lastCacheUpdate = 0;
  }
}

// Export de l'instance singleton
export const transactionService = TransactionService.getInstance();
