
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, TrendingUp, AlertCircle } from 'lucide-react';

interface PortfolioProps {
  isWalletConnected: boolean;
  walletAddress?: string;
}

const Portfolio: React.FC<PortfolioProps> = ({ isWalletConnected, walletAddress }) => {
  // Mock data pour la démonstration
  const mockHoldings = [
    {
      id: '1',
      name: 'AvalancheToken',
      symbol: 'AVAX',
      amount: 1000,
      currentPrice: 0.0001,
      purchasePrice: 0.00008,
      imageUrl: 'https://cryptologos.cc/logos/avalanche-avax-logo.png'
    },
    {
      id: '2',
      name: 'SnowToken',
      symbol: 'SNOW',
      amount: 5000,
      currentPrice: 0.00005,
      purchasePrice: 0.00003,
      imageUrl: 'https://via.placeholder.com/64/E84142/FFFFFF?text=SNOW'
    }
  ];

  const calculatePnL = (amount: number, currentPrice: number, purchasePrice: number) => {
    const currentValue = amount * currentPrice;
    const purchaseValue = amount * purchasePrice;
    const pnl = currentValue - purchaseValue;
    const pnlPercentage = ((currentPrice - purchasePrice) / purchasePrice) * 100;
    return { pnl, pnlPercentage, currentValue };
  };

  const totalPortfolioValue = mockHoldings.reduce((total, holding) => {
    return total + (holding.amount * holding.currentPrice);
  }, 0);

  const totalPnL = mockHoldings.reduce((total, holding) => {
    const { pnl } = calculatePnL(holding.amount, holding.currentPrice, holding.purchasePrice);
    return total + pnl;
  }, 0);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!isWalletConnected) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-avalanche-dark mb-8">
              Mon Portefeuille
            </h1>
            
            <Card className="max-w-md mx-auto">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto" />
                  <h3 className="text-lg font-medium text-gray-900">
                    Wallet non connecté
                  </h3>
                  <p className="text-gray-600">
                    Connectez votre wallet pour voir votre portefeuille et vos positions.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-avalanche-dark mb-4">
            Mon Portefeuille
          </h1>
          <div className="flex items-center space-x-2 text-gray-600">
            <Wallet className="w-4 h-4" />
            <span>{formatAddress(walletAddress!)}</span>
          </div>
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Valeur Totale
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-avalanche-dark">
                {totalPortfolioValue.toFixed(4)} AVAX
              </div>
              <p className="text-xs text-gray-500 mt-1">
                ≈ ${(totalPortfolioValue * 30).toFixed(2)} USD
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                P&L Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalPnL >= 0 ? '+' : ''}{totalPnL.toFixed(4)} AVAX
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {totalPnL >= 0 ? '+' : ''}{((totalPnL / (totalPortfolioValue - totalPnL)) * 100).toFixed(2)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Tokens Détenus
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-avalanche-dark">
                {mockHoldings.length}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Types différents
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Holdings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-avalanche-red" />
              <span>Mes Positions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mockHoldings.length > 0 ? (
              <div className="space-y-4">
                {mockHoldings.map((holding) => {
                  const { pnl, pnlPercentage, currentValue } = calculatePnL(
                    holding.amount,
                    holding.currentPrice,
                    holding.purchasePrice
                  );

                  return (
                    <div key={holding.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <img 
                          src={holding.imageUrl} 
                          alt={holding.name}
                          className="w-12 h-12 rounded-full"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://via.placeholder.com/48/E84142/FFFFFF?text=${holding.symbol.charAt(0)}`;
                          }}
                        />
                        <div>
                          <h3 className="font-semibold text-avalanche-dark">
                            {holding.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {holding.amount.toLocaleString()} {holding.symbol}
                          </p>
                        </div>
                      </div>

                      <div className="text-right space-y-1">
                        <div className="font-semibold text-avalanche-dark">
                          {currentValue.toFixed(4)} AVAX
                        </div>
                        <div className={`text-sm ${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {pnl >= 0 ? '+' : ''}{pnl.toFixed(4)} AVAX ({pnl >= 0 ? '+' : ''}{pnlPercentage.toFixed(2)}%)
                        </div>
                        <div className="text-xs text-gray-500">
                          Prix: {holding.currentPrice.toFixed(6)} AVAX
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucune position
                </h3>
                <p className="text-gray-600">
                  Vous n'avez pas encore de tokens dans votre portefeuille.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transaction History Placeholder */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Historique des Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-gray-600">
                L'historique des transactions sera disponible après l'intégration des smart contracts.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Portfolio;
