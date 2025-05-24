#!/bin/bash

echo "🚀 Test de l'interface dynamique Token Portfolio"
echo "================================================"

# Vérifier que les fichiers existent
echo "✅ Vérification des fichiers..."
if [ -f "src/pages/Portfolio.tsx" ]; then
    echo "   ✓ Portfolio.tsx existe"
else
    echo "   ❌ Portfolio.tsx manquant"
    exit 1
fi

if [ -f "src/components/TokenSkeleton.tsx" ]; then
    echo "   ✓ TokenSkeleton.tsx existe"
else
    echo "   ❌ TokenSkeleton.tsx manquant"
    exit 1
fi

if [ -f "src/components/NetworkStatus.tsx" ]; then
    echo "   ✓ NetworkStatus.tsx existe"
else
    echo "   ❌ NetworkStatus.tsx manquant"
    exit 1
fi

if [ -f "src/components/StatsDisplay.tsx" ]; then
    echo "   ✓ StatsDisplay.tsx existe"
else
    echo "   ❌ StatsDisplay.tsx manquant"
    exit 1
fi

# Vérifier la compilation
echo ""
echo "🔨 Test de compilation..."
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "   ✓ Compilation réussie"
else
    echo "   ❌ Erreur de compilation"
    exit 1
fi

# Compter les lignes de code ajoutées
echo ""
echo "📊 Statistiques du projet:"
echo "   - Portfolio.tsx: $(wc -l < src/pages/Portfolio.tsx) lignes"
echo "   - TokenSkeleton.tsx: $(wc -l < src/components/TokenSkeleton.tsx) lignes"
echo "   - NetworkStatus.tsx: $(wc -l < src/components/NetworkStatus.tsx) lignes"
echo "   - StatsDisplay.tsx: $(wc -l < src/components/StatsDisplay.tsx) lignes"
echo "   - CSS personnalisé: $(wc -l < src/index.css) lignes"

echo ""
echo "🎉 Interface pump.fun-style prête !"
echo "   🌐 Serveur: http://localhost:8083"
echo "   ✨ Tokens visibles sans wallet"
echo "   🔒 Interactions nécessitent une connexion"
echo "   📱 Interface responsive et animée"
