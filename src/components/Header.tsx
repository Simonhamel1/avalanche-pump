
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Wallet, Home, Plus, User, Info, ExternalLink } from 'lucide-react';

interface HeaderProps {
  walletAddress?: string;
  walletBalance?: string;
  networkName?: string;
  isAvalancheNetwork?: boolean;
  onConnectWallet: () => void;
  onDisconnectWallet: () => void;
  onSwitchToAvalanche?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  walletAddress, 
  walletBalance,
  networkName,
  isAvalancheNetwork,
  onConnectWallet, 
  onDisconnectWallet,
  onSwitchToAvalanche
}) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo et titre */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-avalanche-red rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <h1 className="text-xl font-bold text-avalanche-dark">
                AvalanchePump
              </h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'text-avalanche-red bg-red-50' 
                  : 'text-avalanche-dark hover:text-avalanche-red'
              }`}
            >
              <Home size={18} />
              <span>Accueil</span>
            </Link>
            
            <Link
              to="/create"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/create') 
                  ? 'text-avalanche-red bg-red-50' 
                  : 'text-avalanche-dark hover:text-avalanche-red'
              }`}
            >
              <Plus size={18} />
              <span>Créer</span>
            </Link>
            
            <Link
              to="/portfolio"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/portfolio') 
                  ? 'text-avalanche-red bg-red-50' 
                  : 'text-avalanche-dark hover:text-avalanche-red'
              }`}
            >
              <User size={18} />
              <span>Portefeuille</span>
            </Link>
            
            <Link
              to="/about"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/about') 
                  ? 'text-avalanche-red bg-red-50' 
                  : 'text-avalanche-dark hover:text-avalanche-red'
              }`}
            >
              <Info size={18} />
              <span>À propos</span>
            </Link>
          </nav>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {walletAddress ? (
              <div className="flex items-center space-x-3">
                {/* Network indicator */}
                {networkName && (
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    isAvalancheNetwork 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {networkName}
                  </div>
                )}
                
                {/* Balance */}
                {walletBalance && (
                  <div className="text-sm font-medium text-gray-700">
                    {parseFloat(walletBalance).toFixed(4)} AVAX
                  </div>
                )}
                
                {/* Address */}
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {formatAddress(walletAddress)}
                </div>
                
                {/* Switch network button if not on Avalanche */}
                {!isAvalancheNetwork && onSwitchToAvalanche && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={onSwitchToAvalanche}
                    className="text-orange-600 border-orange-600 hover:bg-orange-50"
                  >
                    <ExternalLink className="mr-1 h-3 w-3" />
                    Avalanche
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onDisconnectWallet}
                >
                  Déconnecter
                </Button>
              </div>
            ) : (
              <Button 
                onClick={onConnectWallet}
                className="bg-avalanche-red hover:bg-red-600 text-white"
              >
                <Wallet className="mr-2 h-4 w-4" />
                Connecter Wallet
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
