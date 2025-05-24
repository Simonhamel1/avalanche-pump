
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Zap, Shield, TrendingUp } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-avalanche-dark mb-4">
            À propos d'AvalanchePump
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            La plateforme de lancement de tokens nouvelle génération sur Avalanche
          </p>
        </div>

        <div className="grid gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-6 h-6 text-avalanche-red" />
                <span>Qu'est-ce qu'AvalanchePump ?</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p className="text-gray-600 leading-relaxed">
                AvalanchePump est une plateforme décentralisée qui permet à chacun de créer et 
                d'investir dans de nouveaux tokens sur la blockchain Avalanche. Inspirée par le 
                succès de Pump.fun, notre plateforme utilise un système de bonding curve pour 
                assurer une tarification équitable et transparente.
              </p>
              <p className="text-gray-600 leading-relaxed mt-4">
                Notre mission est de démocratiser la création de tokens tout en offrant un 
                environnement sécurisé pour les investisseurs. Chaque token créé suit une courbe 
                de prix mathématique qui garantit la liquidité et la transparence.
              </p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span>Bonding Curve</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Système de tarification automatique qui ajuste le prix en fonction de l'offre 
                  et de la demande, garantissant une liquidité constante.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Shield className="w-5 h-5 text-blue-500" />
                  <span>Sécurité</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Smart contracts audités sur Avalanche, transactions transparentes et 
                  mécanismes de protection contre les manipulations.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Zap className="w-5 h-5 text-avalanche-red" />
                  <span>Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Transactions rapides et peu coûteuses grâce à la blockchain Avalanche, 
                  parfaite pour le trading à haute fréquence.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Avalanche Blockchain</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Avalanche est une plateforme blockchain de nouvelle génération qui offre:
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start space-x-2">
                  <span className="text-avalanche-red mt-1">•</span>
                  <span>Transactions ultra-rapides (sub-second finality)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-avalanche-red mt-1">•</span>
                  <span>Frais extrêmement bas</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-avalanche-red mt-1">•</span>
                  <span>Consensus écologique et durable</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-avalanche-red mt-1">•</span>
                  <span>Compatibilité avec l'écosystème Ethereum</span>
                </li>
              </ul>
              <a 
                href="https://www.avax.network/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-avalanche-red hover:text-red-600 transition-colors"
              >
                <span>En savoir plus sur Avalanche</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Chainlink CCIP</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Prochainement, intégration de Chainlink CCIP pour:
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start space-x-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Interopérabilité entre blockchains</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Transferts de tokens cross-chain</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Données de prix fiables et décentralisées</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Infrastructure sécurisée pour DeFi</span>
                </li>
              </ul>
              <a 
                href="https://chain.link/cross-chain" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-blue-500 hover:text-blue-600 transition-colors"
              >
                <span>Découvrir Chainlink CCIP</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Feuille de Route</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium text-gray-900">Phase 1 - Lancement (Actuel)</h4>
                  <p className="text-sm text-gray-600">Interface utilisateur, bonding curves, création de tokens</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium text-gray-900">Phase 2 - Smart Contracts</h4>
                  <p className="text-sm text-gray-600">Déploiement des contrats, intégration wallet, transactions réelles</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium text-gray-900">Phase 3 - Chainlink CCIP</h4>
                  <p className="text-sm text-gray-600">Interopérabilité, oracles de prix, fonctionnalités avancées</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default About;
