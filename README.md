# 🚀 Avalanche Token Forge

> **Plateforme DeFi révolutionnaire pour créer, trader et gérer des tokens sur Avalanche**

Avalanche Token Forge est une application décentralisée (dApp) complète qui permet aux utilisateurs de créer facilement leurs propres tokens ERC-20 sur le réseau Avalanche, de les trader, et de participer à des jeux de hasard intégrés. Construit avec React, TypeScript et les technologies Web3 les plus récentes.

---

## ✨ Fonctionnalités Principales

### 🎯 **Création de Tokens**
- **Factory de tokens ERC-20** : Créez vos propres cryptomonnaies en quelques clics
- **Interface intuitive** : Formulaire simple pour définir nom, symbole, supply et décimales
- **Déploiement instantané** : Vos tokens sont déployés automatiquement sur Avalanche
- **Gestion d'images** : Support pour les logos personnalisés de vos tokens

### 💰 **Trading & Marketplace**
- **Achat/Vente de tokens** : Interface de trading complète
- **Visualisation en temps réel** : Prix, market cap, et statistiques détaillées
- **Portfolio personnel** : Suivi de vos investissements et holdings
- **Historique des transactions** : Tracking complet de votre activité

### 🎰 **Gambling & Gaming**
- **Jeu de dés intégré** : Pariez avec vos tokens sur des jeux de hasard
- **Smart contracts sécurisés** : Utilisation de Chainlink VRF pour la randomisation
- **Système de gains** : Multiplicateurs et récompenses attractives

### 🔗 **Intégration Blockchain**
- **Support Avalanche** : Optimisé pour les faibles frais et la rapidité
- **Connexion wallet** : Compatible avec MetaMask et autres wallets Web3
- **Surveillance réseau** : Statut du réseau en temps réel

---

## 🛠️ Technologies Utilisées

### **Frontend**
- **React 18** avec TypeScript
- **Vite** pour le build et le développement
- **Tailwind CSS** pour le styling
- **Shadcn/ui** pour les composants UI
- **React Router** pour la navigation
- **React Query** pour la gestion d'état

### **Blockchain & Web3**
- **Ethers.js** pour l'interaction blockchain
- **Avalanche SDK** pour l'intégration native
- **Web3Modal** pour la connexion wallet
- **Smart Contracts Solidity**

### **Smart Contracts**
- **CustomERC20Token.sol** : Factory pour la création de tokens
- **DiceGameContract.sol** : Contrat de jeu de dés
- **VRFSubscriptionManager.sol** : Gestion de la randomisation Chainlink

---

## 🚀 Installation & Setup

### **Prérequis**
- Node.js 18+ 
- NPM ou Bun
- MetaMask ou wallet compatible Web3
- Accès au réseau Avalanche (Mainnet/Testnet)

### **1. Cloner le projet**
```bash
git clone https://github.com/Simonhamel1/avalanche-token-forge.git
cd avalanche-token-forge
```

### **2. Installer les dépendances**
```bash
# Avec NPM
npm install

# Ou avec Bun (recommandé)
bun install
```

### **3. Configuration**
Créez un fichier `.env` à la racine :
```env
VITE_AVALANCHE_RPC_URL=https://api.avax.network/ext/bc/C/rpc
VITE_CHAIN_ID=43114
VITE_NETWORK_NAME=Avalanche
```

### **4. Démarrer l'application**
```bash
# Mode développement
npm run dev
# ou
bun run dev

# Build pour la production
npm run build
# ou
bun run build
```

---

## 📱 Utilisation

### **1. Connexion Wallet**
1. Ouvrez l'application dans votre navigateur
2. Cliquez sur "Connect Wallet" 
3. Sélectionnez MetaMask ou votre wallet préféré
4. Confirmez la connexion

### **2. Créer un Token**
1. Allez dans la section "Create Token"
2. Remplissez les informations :
   - **Nom** : Le nom complet de votre token
   - **Symbole** : Acronyme (ex: BTC, ETH)
   - **Décimales** : Précision (généralement 18)
   - **Supply Initial** : Nombre de tokens créés
3. Ajoutez une image (optionnel)
4. Cliquez sur "Create Token" et confirmez la transaction

### **3. Trading**
1. Parcourez les tokens disponibles sur la page d'accueil
2. Cliquez sur "Buy" pour acheter des tokens
3. Entrez le montant souhaité en AVAX
4. Confirmez la transaction

### **4. Gambling**
1. Accédez à la section "Gambling"
2. Sélectionnez le token avec lequel parier
3. Choisissez votre mise et prédiction
4. Lancez le dé et tentez votre chance !

---

## 🏗️ Architecture du Projet

```
src/
├── components/          # Composants React réutilisables
│   ├── ui/             # Composants UI de base (shadcn)
│   ├── AvalancheStatus.tsx
│   ├── TokenCard.tsx
│   ├── BuyTokenModal.tsx
│   └── ...
├── pages/              # Pages principales de l'application
│   ├── Home.tsx        # Page d'accueil avec marketplace
│   ├── CreateToken.tsx # Création de tokens
│   ├── Gambling.tsx    # Jeux de hasard
│   └── Portfolio.tsx   # Portfolio utilisateur
├── services/           # Services pour l'interaction blockchain
│   ├── tokenService.ts
│   ├── walletService.ts
│   ├── gamblingService.ts
│   └── ...
├── contracts/          # Smart contracts Solidity
│   ├── CustomERC20Token.sol
│   ├── DiceGameContract.sol
│   └── abis/          # ABI des contrats
├── config/            # Configuration blockchain
└── types/             # Types TypeScript
```

---

## 🤝 Contribution

Nous accueillons toutes les contributions ! Voici comment vous pouvez nous aider :

### **Types de contributions**
- 🐛 **Bug fixes** : Correction de bugs
- ✨ **Nouvelles fonctionnalités** : Ajout de features
- 📚 **Documentation** : Amélioration de la doc
- 🎨 **UI/UX** : Améliorations design
- ⚡ **Performance** : Optimisations

### **Process de contribution**
1. **Fork** le projet
2. **Créez** votre branche : `git checkout -b feature/ma-feature`
3. **Commitez** : `git commit -m 'feat: Ajout de ma feature'`
4. **Push** : `git push origin feature/ma-feature`
5. **Ouvrez** une Pull Request

### **Standards de code**
- Utilisez TypeScript strict
- Suivez les conventions ESLint
- Ajoutez des tests pour les nouvelles fonctionnalités
- Documentez votre code

---

## 📄 Licence

Ce projet est sous licence **MIT**. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 👥 Équipe

| Développeur | GitHub | Rôle |
|-------------|--------|------|
| **Simon Hamelin** | [@Simonhamel1](https://github.com/Simonhamel1) | Lead Developer & Smart Contracts |
| **Ewan Clabaut** | [@Clab-ewan](https://github.com/Clab-ewan) | Frontend Developer & UI/UX |

---

## 🔗 Liens Utiles

- **Documentation** : [docs.md](./docs.md)
- **Smart Contracts** : [Avalanche Explorer](https://snowtrace.io/)
- **Avalanche Network** : [avalanche.org](https://avalanche.org)
- **Support** : [Issues GitHub](https://github.com/Simonhamel1/avalanche-token-forge/issues)

---

## ⚠️ Avertissement

Ce projet est à des fins éducatives et de démonstration. Les fonctionnalités de gambling impliquent des risques financiers. Utilisez-les de manière responsable et conformément aux lois locales.

---

<div align="center">

**🌟 Si ce projet vous plaît, n'hésitez pas à lui donner une étoile ! 🌟**

Made with ❤️ by the Avalanche Token Forge Team

</div>
