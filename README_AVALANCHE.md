# AvalanchePump - Plateforme de lancement de tokens sur Avalanche

AvalanchePump est une plateforme décentralisée inspirée de Pump.fun qui permet de créer et d'investir dans de nouveaux tokens sur la blockchain Avalanche en utilisant un système de bonding curve.

## 🚀 Fonctionnalités principales

- **Création de tokens** : Lancez votre propre token en quelques clics
- **Bonding curve** : Système de tarification automatique et équitable
- **Intégration Core Wallet** : Support natif pour Core Wallet et MetaMask
- **Interface moderne** : Design responsive et intuitive
- **Réseau Avalanche** : Transactions rapides et peu coûteuses

## 📋 Prérequis

### Wallet requis
- **Core Wallet** (recommandé) : [Télécharger](https://core.app/)
- **MetaMask** : [Télécharger](https://metamask.io/)

### Configuration réseau
L'application détecte automatiquement et aide à configurer le réseau Avalanche.

## 🛠️ Installation et développement

### Cloner le projet
```bash
git clone [URL_DU_REPO]
cd avalanche-token-forge
```

### Installer les dépendances
```bash
npm install
```

### Démarrer en mode développement
```bash
npm run dev
```

### Builder pour la production
```bash
npm run build
```

## 📚 Documentation

- [Guide Core Wallet](./CORE_WALLET_GUIDE.md) - Instructions détaillées pour configurer et utiliser Core Wallet
- [Documentation Avalanche](https://docs.avax.network/) - Documentation officielle d'Avalanche

## 🔧 Technologies utilisées

- **Frontend** : React 18, TypeScript, Vite
- **UI** : Tailwind CSS, shadcn/ui
- **Blockchain** : Ethers.js, Avalanche
- **Wallet** : Core Wallet SDK, MetaMask
- **Routing** : React Router
- **State** : React Hooks, Context API

## 🗺️ Roadmap

### Phase 1 - Interface utilisateur ✅
- Interface de création et visualisation des tokens
- Simulation des bonding curves
- Intégration wallet (Core/MetaMask)

### Phase 2 - Smart Contracts 🔄
- Déploiement des contrats sur Avalanche
- Transactions réelles sur la blockchain
- Système de fees et tokenomics

### Phase 3 - Chainlink CCIP 📋
- Interopérabilité cross-chain
- Oracles de prix décentralisés
- Fonctionnalités DeFi avancées

## ⚡ Caractéristiques d'Avalanche

- **Vitesse** : Finalité sub-seconde
- **Frais bas** : Coûts de transaction minimes
- **Éco-responsable** : Consensus Proof-of-Stake durable
- **Compatibilité** : Compatible avec l'écosystème Ethereum

## 🛡️ Sécurité

- Smart contracts audités (Phase 2)
- Aucune garde de fonds (non-custodial)
- Transactions transparentes et vérifiables
- Code source ouvert

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🔗 Liens utiles

- [Site web Avalanche](https://www.avax.network/)
- [Core Wallet](https://core.app/)
- [Documentation Avalanche](https://docs.avax.network/)
- [Explorateur Avalanche](https://snowtrace.io/)
- [Faucet Testnet](https://faucet.avax.network/)

---

**⚠️ Avertissement** : Cette application est actuellement en développement. Les fonctionnalités de trading réel seront disponibles dans la Phase 2.

---

# Documentation originale Lovable

## Project info

**URL**: https://lovable.dev/projects/b3333312-b06b-4f09-ad87-d70a51e15f48

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/b3333312-b06b-4f09-ad87-d70a51e15f48) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/b3333312-b06b-4f09-ad87-d70a51e15f48) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
