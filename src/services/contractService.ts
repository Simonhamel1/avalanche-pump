import { ethers } from 'ethers';
import { walletService } from './walletService';

// Contract addresses deployed on Avalanche - NEW ADDRESSES
export const FACTORY_CONTRACT_ADDRESS = '0x2CB5A989febF39FA77889682adA469d9942634C5';
export const VRF_SUBSCRIPTION_MANAGER_ADDRESS = '0x12972Fe6e8Ab1ac9bd6AED800fC57e21bbC62da6';

// ERC20TokenFactory contract ABI
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

// CustomERC20Token contract ABI
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

// Token types
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
   * Gets an instance of the factory contract
   */
  private async getFactoryContract(): Promise<ethers.Contract> {
    if (!this.factoryContract) {
      const provider = walletService.getProvider();
      if (!provider) {
        throw new Error('No provider available');
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
   * Gets an instance of a token contract
   */
  private async getTokenContract(tokenAddress: string): Promise<ethers.Contract> {
    const provider = walletService.getProvider();
    if (!provider) {
      throw new Error('No provider available');
    }

    const signer = await provider.getSigner();
    return new ethers.Contract(tokenAddress, TOKEN_ABI, signer);
  }

  /**
   * Gets the token creation fee
   */
  async getCreationFee(): Promise<string> {
    try {
      const factory = await this.getFactoryContract();
      const fee = await factory.creationFee();
      return ethers.formatEther(fee);
    } catch (error) {
      console.error('Error retrieving fees:', error);
      throw new Error('Unable to retrieve creation fees');
    }
  }

  /**
   * Creates a new token
   */
  async createToken(params: TokenCreationParams): Promise<TokenCreatedEvent> {
    try {
      const factory = await this.getFactoryContract();
      
      // Get creation fee
      const fee = await factory.creationFee();
      
      console.log('Creating token with parameters:', params);
      console.log('Required fee:', ethers.formatEther(fee), 'AVAX');

      // Call createToken function with fee
      const tx = await factory.createToken(
        params.name,
        params.symbol,
        params.decimals,
        params.initialSupply,
        { value: fee }
      );

      console.log('Transaction sent:', tx.hash);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);

      // Get TokenCreated event
      const tokenCreatedEvent = receipt.logs.find((log: any) => {
        try {
          const parsedLog = factory.interface.parseLog(log);
          return parsedLog?.name === 'TokenCreated';
        } catch {
          return false;
        }
      });

      if (!tokenCreatedEvent) {
        throw new Error('TokenCreated event not found in transaction');
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
      console.error('Error creating token:', error);
      
      if (error.code === 'INSUFFICIENT_FUNDS') {
        throw new Error('Insufficient funds to pay transaction and creation fees');
      } else if (error.code === 'USER_REJECTED') {
        throw new Error('Transaction cancelled by user');
      } else if (error.message?.includes('Insufficient fee')) {
        throw new Error('Insufficient creation fee');
      } else {
        throw new Error(`Error creating token: ${error.message}`);
      }
    }
  }

  /**
   * Gets all tokens created by the factory
   */
  async getAllTokens(): Promise<string[]> {
    try {
      const factory = await this.getFactoryContract();
      return await factory.getAllTokens();
    } catch (error) {
      console.error('Error retrieving tokens:', error);
      throw new Error('Unable to retrieve token list');
    }
  }

  /**
   * Gets tokens created by a specific owner
   */
  async getTokensByOwner(owner: string): Promise<string[]> {
    try {
      const factory = await this.getFactoryContract();
      return await factory.getTokensByOwner(owner);
    } catch (error) {
      console.error('Error retrieving owner tokens:', error);
      throw new Error('Unable to retrieve owner\'s tokens');
    }
  }

  /**
   * Gets detailed information about a token
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
      console.error('Error retrieving token information:', error);
      throw new Error('Unable to retrieve token information');
    }
  }

  /**
   * Gets information about multiple tokens
   */
  async getMultipleTokensInfo(tokenAddresses: string[], userAddress?: string): Promise<TokenInfo[]> {
    try {
      const promises = tokenAddresses.map(address => 
        this.getTokenInfo(address, userAddress)
      );
      return await Promise.all(promises);
    } catch (error) {
      console.error('Error retrieving tokens information:', error);
      throw new Error('Unable to retrieve tokens information');
    }
  }

  /**
   * Transfers tokens
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
      console.error('Error during transfer:', error);
      
      if (error.code === 'USER_REJECTED') {
        throw new Error('Transaction cancelled by user');
      } else {
        throw new Error(`Error during transfer: ${error.message}`);
      }
    }
  }

  /**
   * Mints new tokens (owner only)
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
      console.error('Error during mint:', error);
      
      if (error.code === 'USER_REJECTED') {
        throw new Error('Transaction cancelled by user');
      } else {
        throw new Error(`Error during mint: ${error.message}`);
      }
    }
  }

  /**
   * Burns tokens
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
      console.error('Error during burn:', error);
      
      if (error.code === 'USER_REJECTED') {
        throw new Error('Transaction cancelled by user');
      } else {
        throw new Error(`Error during burn: ${error.message}`);
      }
    }
  }

  /**
   * Checks if an address is a token created by our factory
   */
  async isFactoryToken(tokenAddress: string): Promise<boolean> {
    try {
      const factory = await this.getFactoryContract();
      return await factory.isFactoryToken(tokenAddress);
    } catch (error) {
      console.error('Error verifying factory token:', error);
      return false;
    }
  }

  /**
   * Places a bet on a token
   */
  async placeBet(tokenAddress: string, betAmount: string, useNativePayment: boolean = false): Promise<BetPlacedEvent> {
    try {
      const tokenContract = await this.getTokenContract(tokenAddress);
      const decimals = await tokenContract.decimals();
      const amountInWei = ethers.parseUnits(betAmount, decimals);
      
      console.log('Placing bet:', betAmount, 'tokens');
      
      const tx = await tokenContract.placeBet(amountInWei, useNativePayment);
      const receipt = await tx.wait();
      
      // Get the BetPlaced event
      const betPlacedEvent = receipt.logs.find((log: any) => {
        try {
          const parsedLog = tokenContract.interface.parseLog(log);
          return parsedLog?.name === 'BetPlaced';
        } catch {
          return false;
        }
      });

      if (!betPlacedEvent) {
        throw new Error('BetPlaced event not found');
      }

      const parsedEvent = tokenContract.interface.parseLog(betPlacedEvent);
      
      return {
        player: parsedEvent.args.player,
        requestId: parsedEvent.args.requestId.toString(),
        betAmount: ethers.formatUnits(parsedEvent.args.betAmount, decimals),
        transactionHash: tx.hash
      };
    } catch (error: any) {
      console.error('Error during bet placement:', error);
      
      if (error.code === 'USER_REJECTED') {
        throw new Error('Transaction cancelled by user');
      } else if (error.message?.includes('Insufficient balance')) {
        throw new Error('Insufficient balance for this bet');
      } else if (error.message?.includes('Bet amount too low')) {
        throw new Error('Bet amount too low');
      } else {
        throw new Error(`Error during bet placement: ${error.message}`);
      }
    }
  }

  /**
   * Gets the details of a bet
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
      console.error('Error retrieving bet details:', error);
      throw new Error('Unable to retrieve bet details');
    }
  }

  /**
   * Gets a player's bet history
   */
  async getPlayerBets(tokenAddress: string, playerAddress: string): Promise<string[]> {
    try {
      const tokenContract = await this.getTokenContract(tokenAddress);
      return await tokenContract.getPlayerBets(playerAddress);
    } catch (error) {
      console.error('Error retrieving player bets:', error);
      throw new Error('Unable to retrieve bet history');
    }
  }

  /**
   * Gets the minimum bet for a token
   */
  async getMinimumBet(tokenAddress: string): Promise<string> {
    try {
      const tokenContract = await this.getTokenContract(tokenAddress);
      const decimals = await tokenContract.decimals();
      const minBet = await tokenContract.minimumBet();
      return ethers.formatUnits(minBet, decimals);
    } catch (error) {
      console.error('Error retrieving minimum bet:', error);
      throw new Error('Unable to retrieve minimum bet');
    }
  }

  /**
   * Subscribes to bet result events
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
      console.error('Error subscribing to bet results:', error);
    }
  }

  /**
   * Subscribes to token creation events
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
      console.error('Error subscribing to events:', error);
    }
  }

  /**
   * Cleans up event subscriptions
   */
  cleanup(): void {
    if (this.factoryContract) {
      this.factoryContract.removeAllListeners();
      this.factoryContract = null;
    }
  }
}

export const contractService = new ContractService();
