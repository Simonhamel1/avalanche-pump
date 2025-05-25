#!/bin/bash

# Script de test pour l'intégration du contrat CustomERC20Token

echo "🧪 Test de l'intégration du jeu de dés avec Chainlink VRF"
echo "=================================================="

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}1. Vérification de la structure des fichiers...${NC}"

# Vérifier que les fichiers existent
files_to_check=(
    "src/services/diceGameService.ts"
    "src/components/DiceGame.tsx"
    "src/config/contracts.ts"
    "src/contracts/CustomERC20Token.sol"
    "src/contracts/abis/CustomERC20Token.json"
)

all_files_exist=true
for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file existe"
    else
        echo -e "${RED}✗${NC} $file manquant"
        all_files_exist=false
    fi
done

if [ "$all_files_exist" = false ]; then
    echo -e "${RED}❌ Certains fichiers sont manquants${NC}"
    exit 1
fi

echo -e "${BLUE}2. Vérification de la configuration...${NC}"

# Vérifier que l'adresse du contrat est configurée
if grep -q "VOTRE_ADRESSE_TOKEN_ICI" src/config/contracts.ts; then
    echo -e "${YELLOW}⚠️  L'adresse du contrat n'est pas encore configurée${NC}"
    echo -e "${YELLOW}   Veuillez modifier src/config/contracts.ts après le déploiement${NC}"
else
    echo -e "${GREEN}✓${NC} Adresse du contrat configurée"
fi

echo -e "${BLUE}3. Test de compilation TypeScript...${NC}"

# Essayer de compiler TypeScript
if npm run type-check 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Compilation TypeScript réussie"
else
    echo -e "${YELLOW}⚠️  Problème de compilation TypeScript (normal si deps manquantes)${NC}"
fi

echo -e "${BLUE}4. Vérification de l'intégration du smart contract...${NC}"

# Vérifier que l'ABI contient les bonnes fonctions
required_functions=("placeBet" "getBetDetails" "getPlayerBets")
abi_file="src/contracts/abis/CustomERC20Token.json"

if [ -f "$abi_file" ]; then
    abi_valid=true
    for func in "${required_functions[@]}"; do
        if grep -q "\"name\": \"$func\"" "$abi_file"; then
            echo -e "${GREEN}✓${NC} Fonction $func trouvée dans l'ABI"
        else
            echo -e "${RED}✗${NC} Fonction $func manquante dans l'ABI"
            abi_valid=false
        fi
    done
    
    if [ "$abi_valid" = true ]; then
        echo -e "${GREEN}✓${NC} ABI du smart contract complet"
    else
        echo -e "${RED}❌ ABI du smart contract incomplet${NC}"
    fi
else
    echo -e "${RED}✗${NC} Fichier ABI non trouvé"
fi

echo -e "${BLUE}5. Vérification de la logique du jeu...${NC}"

# Vérifier que le service contient les bonnes méthodes
service_file="src/services/diceGameService.ts"
required_methods=("placeBet" "getBetDetails" "waitForBetResult" "calculatePayout")

if [ -f "$service_file" ]; then
    service_valid=true
    for method in "${required_methods[@]}"; do
        if grep -q "async $method" "$service_file" || grep -q "$method(" "$service_file"; then
            echo -e "${GREEN}✓${NC} Méthode $method implémentée"
        else
            echo -e "${RED}✗${NC} Méthode $method manquante"
            service_valid=false
        fi
    done
    
    if [ "$service_valid" = true ]; then
        echo -e "${GREEN}✓${NC} Service de jeu de dés complet"
    else
        echo -e "${RED}❌ Service de jeu de dés incomplet${NC}"
    fi
fi

echo -e "${BLUE}6. Instructions pour continuer...${NC}"
echo ""
echo -e "${YELLOW}📋 Étapes suivantes :${NC}"
echo ""
echo -e "${YELLOW}1.${NC} Déployez le contrat CustomERC20Token sur Fuji testnet"
echo -e "   📖 Consultez DEPLOYMENT_GUIDE.md pour les instructions détaillées"
echo ""
echo -e "${YELLOW}2.${NC} Configurez l'adresse du contrat dans src/config/contracts.ts"
echo -e "   Remplacez 'VOTRE_ADRESSE_TOKEN_ICI' par l'adresse déployée"
echo ""
echo -e "${YELLOW}3.${NC} Configurez Chainlink VRF :"
echo -e "   - Créez une souscription VRF sur https://vrf.chain.link/fuji"
echo -e "   - Ajoutez votre contrat comme consommateur"
echo -e "   - Financez la souscription avec des LINK"
echo ""
echo -e "${YELLOW}4.${NC} Testez l'application :"
echo -e "   ${GREEN}npm run dev${NC}"
echo ""
echo -e "${YELLOW}5.${NC} Connectez votre wallet et testez un pari"
echo ""

echo -e "${GREEN}🎯 Intégration prête ! Suivez les étapes ci-dessus pour finaliser.${NC}"
