// Types pour l'intégration avec les wallets Ethereum/Avalanche
export {};

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      isCoreWallet?: boolean;
      request: (args: {
        method: string;
        params?: any[];
      }) => Promise<any>;
      on: (event: string, callback: (data: any) => void) => void;
      removeListener: (event: string, callback: (data: any) => void) => void;
      selectedAddress?: string;
      chainId?: string;
      networkVersion?: string;
    };
  }
}
