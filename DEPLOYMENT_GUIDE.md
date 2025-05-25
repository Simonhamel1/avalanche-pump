# Guide de Déploiement du Contrat CustomERC20Token avec Jeu de Dés

## 📋 Prérequis

1. **Wallet avec des fonds AVAX sur Fuji Testnet**
   - Obtenez des AVAX testnet via le [faucet Avalanche](https://faucet.avax.network/)

2. **Souscription Chainlink VRF v2+**
   - Allez sur [VRF Subscription Manager](https://vrf.chain.link/fuji)
   - Créez une souscription et notez l'ID

## 🚀 Étapes de Déploiement

### 1. Configuration des paramètres

Avant le déploiement, préparez ces informations :

```javascript
// Paramètres du contrat
const deployParams = {
  name: "GamingToken",              // Nom de votre token
  symbol: "GAME",                   // Symbole du token (3-4 caractères)
  decimals: 18,                     // Décimales (standard ERC20)
  initialSupply: "1000000",         // Supply initial (en tokens, pas en wei)
  owner: "0xVotre_Adresse",         // Adresse du propriétaire
  vrfCoordinator: "0x2eD832Ba664535e5886b75D64C46EB9a228C2610", // Fuji VRF Coordinator
  subscriptionId: 123,              // Votre ID de souscription VRF
  keyHash: "0x354d2f95da55398f44b7cff77da56283d9c6c829a4bdf1bbcaf2ad6a4d081f61" // Fuji Key Hash
};
```

### 2. Déploiement via Remix IDE

1. **Ouvrez [Remix IDE](https://remix.ethereum.org/)**

2. **Importez le contrat**
   - Copiez le contenu de `src/contracts/CustomERC20Token.sol`
   - Créez un nouveau fichier dans Remix

3. **Compilez le contrat**
   - Allez dans l'onglet "Solidity Compiler"
   - Sélectionnez la version 0.8.19+
   - Compilez le contrat

4. **Déployez sur Fuji**
   - Allez dans l'onglet "Deploy & Run Transactions"
   - Connectez votre wallet (MetaMask)
   - Sélectionnez le réseau Fuji Testnet
   - Entrez les paramètres du constructeur
   - Cliquez sur "Deploy"

### 3. Configuration post-déploiement

1. **Notez l'adresse du contrat déployé**

2. **Ajoutez le contrat comme consommateur VRF**
   - Allez sur [VRF Subscription Manager](https://vrf.chain.link/fuji)
   - Ajoutez l'adresse de votre contrat comme consommateur

3. **Financez la souscription VRF**
   - Ajoutez des LINK tokens à votre souscription (minimum 5 LINK recommandé)

### 4. Configuration de l'application

1. **Modifiez `src/config/contracts.ts`**
   ```typescript
   export const CONTRACT_ADDRESSES = {
     TESTNET: {
       TOKEN: "0xVotre_Adresse_Contrat_Deployé", // ⚠️ Remplacez par votre adresse
       // ... reste de la config
     }
   };
   ```

### 5. Test de l'intégration

1. **Lancez l'application**
   ```bash
   npm run dev
   ```

2. **Testez les fonctionnalités**
   - Connexion wallet
   - Affichage du solde de tokens
   - Placement d'un pari
   - Réception du résultat VRF

## 🔧 Scripts utiles

### Script de déploiement automatique (Hardhat)

Si vous préférez utiliser Hardhat, créez ce script :

```javascript
// scripts/deploy-custom-token.js
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Déploiement avec le compte:", deployer.address);
  console.log("Solde du compte:", (await deployer.getBalance()).toString());

  const CustomERC20Token = await ethers.getContractFactory("CustomERC20Token");
  
  const token = await CustomERC20Token.deploy(
    "GamingToken",                 // name
    "GAME",                        // symbol
    18,                           // decimals
    ethers.parseEther("1000000"), // initialSupply
    deployer.address,             // owner
    "0x2eD832Ba664535e5886b75D64C46EB9a228C2610", // vrfCoordinator
    123,                          // subscriptionId (remplacez par le vôtre)
    "0x354d2f95da55398f44b7cff77da56283d9c6c829a4bdf1bbcaf2ad6a4d081f61" // keyHash
  );

  await token.waitForDeployment();
  
  console.log("CustomERC20Token déployé à:", await token.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

## 📝 Vérification

Pour vérifier que tout fonctionne :

1. **Vérifiez la configuration VRF**
   ```javascript
   // Dans la console du navigateur
   const service = getDiceGameService();
   await service.initialize();
   const vrfConfig = await service.getVRFConfig();
   console.log(vrfConfig);
   ```

2. **Testez un petit pari**
   - Utilisez un montant minimal pour tester
   - Vérifiez que le VRF répond dans les 2-3 minutes

## ⚠️ Points importants

- **Toujours tester sur Fuji avant le mainnet**
- **Gardez des LINK dans la souscription VRF**
- **Le délai VRF peut varier de 30 secondes à 5 minutes**
- **Sauvegardez l'adresse du contrat déployé**

## 🐛 Dépannage

### Problème VRF
- Vérifiez que le contrat est bien ajouté comme consommateur
- Assurez-vous d'avoir suffisamment de LINK dans la souscription
- Vérifiez les logs Chainlink pour les erreurs

### Problème de connexion
- Vérifiez que MetaMask est connecté au bon réseau
- Actualisez la page et reconnectez le wallet

### Problème de solde
- Assurez-vous d'avoir assez de tokens pour parier
- Vérifiez que l'allowance est suffisante si nécessaire
