export const CONTRACT_ADDRESSES = {
  // Fuji Testnet (43113)
  TESTNET: {
    TOKEN: "VOTRE_ADRESSE_TOKEN_ICI", // ⚠️ À remplacer par l'adresse de votre token CustomERC20Token déployé
    FACTORY: "0x2CB5A989febF39FA77889682adA469d9942634C5",
    VRF_SUBSCRIPTION_MANAGER: "0x12972Fe6e8Ab1ac9bd6AED800fC57e21bbC62da6"
  },
  // Avalanche Mainnet (43114)
  MAINNET: {
    TOKEN: undefined, // À définir si vous déployez sur le mainnet
    FACTORY: undefined,
    VRF_SUBSCRIPTION_MANAGER: undefined
  }
};

// Helper pour obtenir l'adresse du contrat CustomERC20Token
export const getCustomTokenAddress = (): string => {
  const address = CONTRACT_ADDRESSES.TESTNET.TOKEN;
  if (address === "VOTRE_ADRESSE_TOKEN_ICI") {
    throw new Error("Veuillez configurer l'adresse de votre contrat CustomERC20Token dans src/config/contracts.ts");
  }
  return address;
};

// Configuration Chainlink VRF pour Fuji
export const VRF_CONFIG = {
  TESTNET: {
    COORDINATOR: "0x2eD832Ba664535e5886b75D64C46EB9a228C2610", // Adresse du VRF Coordinator sur Fuji
    KEY_HASH: "0x354d2f95da55398f44b7cff77da56283d9c6c829a4bdf1bbcaf2ad6a4d081f61", // Fuji key hash
  },
  MAINNET: {
    COORDINATOR: "0x2eD832Ba664535e5886b75D64C46EB9a228C2610", // À remplacer par l'adresse mainnet si nécessaire
    KEY_HASH: "0x354d2f95da55398f44b7cff77da56283d9c6c829a4bdf1bbcaf2ad6a4d081f61", // À remplacer par le key hash mainnet
  }
}; 