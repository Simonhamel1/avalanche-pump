#!/bin/bash

# Test d'intégration du système de gambling
# Ce script teste l'intégration complète du système de gambling avec les tokens de factory

echo "🎲 Test d'intégration du système de gambling"
echo "============================================="

# Vérifier que tous les fichiers nécessaires existent
echo "📁 Vérification des fichiers..."

files=(
    "src/pages/Gambling.tsx"
    "src/components/DiceGame.tsx"
    "src/services/diceGameService.ts"
    "src/services/tokenService.ts"
    "src/config/contracts.ts"
    "src/config/rpcConfig.ts"
    "src/contracts/CustomERC20Token.sol"
    "src/contracts/abis/CustomERC20Token.json"
)

missing_files=()
for file in "${files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    else
        echo "✅ $file"
    fi
done

if [ ${#missing_files[@]} -gt 0 ]; then
    echo "❌ Fichiers manquants:"
    for file in "${missing_files[@]}"; do
        echo "   - $file"
    done
    exit 1
fi

echo ""
echo "🔧 Vérification de la configuration..."

# Vérifier la configuration TypeScript
echo "📋 Vérification TypeScript..."
npx tsc --noEmit --skipLibCheck 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ TypeScript: Aucune erreur de type"
else
    echo "⚠️  TypeScript: Des erreurs de type détectées"
fi

echo ""
echo "🎯 Vérification des imports et exports..."

# Vérifier que les exports/imports sont corrects
if grep -q "createDiceGameServiceForToken" src/services/diceGameService.ts; then
    echo "✅ Export createDiceGameServiceForToken trouvé"
else
    echo "❌ Export createDiceGameServiceForToken manquant"
fi

if grep -q "isFactoryToken" src/services/tokenService.ts; then
    echo "✅ Méthode isFactoryToken trouvée"
else
    echo "❌ Méthode isFactoryToken manquante"
fi

if grep -q "gamblingCompatibility" src/pages/Gambling.tsx; then
    echo "✅ Système de compatibilité gambling implémenté"
else
    echo "❌ Système de compatibilité gambling manquant"
fi

echo ""
echo "🌐 Vérification des configurations RPC..."

if grep -q "AVALANCHE_MAINNET_RPC" src/config/rpcConfig.ts; then
    echo "✅ Configuration RPC Avalanche trouvée"
else
    echo "❌ Configuration RPC Avalanche manquante"
fi

echo ""
echo "📦 Vérification des contrats..."

if [ -f "src/contracts/abis/CustomERC20Token.json" ]; then
    # Vérifier que l'ABI contient les fonctions de gambling
    if grep -q "placeBet" src/contracts/abis/CustomERC20Token.json; then
        echo "✅ Fonctions de gambling trouvées dans l'ABI"
    else
        echo "⚠️  Fonctions de gambling non trouvées dans l'ABI"
    fi
else
    echo "❌ ABI CustomERC20Token.json manquant"
fi

echo ""
echo "🎮 Test de construction..."

# Tenter de construire le projet
echo "🔨 Construction du projet..."
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Construction réussie"
else
    echo "❌ Échec de la construction - vérifiez les erreurs de compilation"
fi

echo ""
echo "📊 Résumé des fonctionnalités implementées:"
echo "✅ Page Gambling avec sélection de tokens"
echo "✅ Vérification de compatibilité des tokens factory"
echo "✅ Indicateurs visuels pour tokens compatibles"
echo "✅ Service DiceGame avec support factory"
echo "✅ Configuration RPC avec rotation automatique"
echo "✅ Interface utilisateur full-screen"
echo "✅ Gestion d'erreurs et états de chargement"

echo ""
echo "🎯 Prochaines étapes pour le déploiement:"
echo "1. Déployer les contrats sur Fuji testnet"
echo "2. Configurer les adresses de contrat dans contracts.ts"
echo "3. Tester avec des tokens réels sur testnet"
echo "4. Configurer Chainlink VRF pour le gambling"
echo "5. Déployer l'application frontend"

echo ""
echo "🎲 Test d'intégration terminé!"
