
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Wallet, Home, Plus, User, Info, ExternalLink, Zap, Rocket } from 'lucide-react';

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
    <header className="bg-gradient-to-r from-gray-900 via-black to-gray-900 backdrop-blur-xl border-b border-gray-800/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo and title */}
          <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-avalanche-red to-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/50">
              <Rocket className="text-white w-6 h-6" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-900"></div>
              </div>
              <div>
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-avalanche-red">
              AvalanchePump
            </h1>
            <p className="text-xs text-gray-400 font-bold tracking-wider">TO THE MOON</p>
              </div>
            </div>
              </div>

              {/* Navigation */}
              <nav className="hidden md:flex items-center space-x-2">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${
            isActive('/') 
              ? 'text-white bg-gradient-to-r from-avalanche-red to-red-600 shadow-lg shadow-red-500/50' 
              : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <Home size={18} />
              <span>PUMP</span>
            </Link>
            
            <Link
              to="/create"
              className={`flex items-center space-x-2 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${
            isActive('/create') 
              ? 'text-white bg-gradient-to-r from-avalanche-red to-red-600 shadow-lg shadow-red-500/50' 
              : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <Plus size={18} />
              <span>CREATE</span>
            </Link>
            
            <Link
              to="/portfolio"
              className={`flex items-center space-x-2 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${
            isActive('/portfolio') 
              ? 'text-white bg-gradient-to-r from-avalanche-red to-red-600 shadow-lg shadow-red-500/50' 
              : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <User size={18} />
              <span>PORTFOLIO</span>
            </Link>
            
            <Link
              to="/about"
              className={`flex items-center space-x-2 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${
            isActive('/about') 
              ? 'text-white bg-gradient-to-r from-avalanche-red to-red-600 shadow-lg shadow-red-500/50' 
              : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <Info size={18} />
              <span>ABOUT</span>
            </Link>
              </nav>
            {/* Wallet Connection */}
            <div className="flex items-center space-x-3">
            {walletAddress ? (
            <div className="flex items-center space-x-3">
            {/* Balance */}
            {walletBalance && (
            <div className="bg-gray-800/80 backdrop-blur-xl px-4 py-2 rounded-2xl border border-cyan-500/50 shadow-lg shadow-cyan-500/30">
            <div className="text-sm font-bold text-cyan-400">
              {parseFloat(walletBalance).toFixed(4)} AVAX
            </div>
            </div>
            )}
            
            {/* Address */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2 rounded-2xl shadow-lg shadow-blue-500/50">
            <div className="text-sm font-bold text-white">
            {formatAddress(walletAddress)}
            </div>
            </div>
            
            {/* Switch network button if not on Avalanche */}
            {!isAvalancheNetwork && onSwitchToAvalanche && (
            <Button 
            size="sm"
            onClick={onSwitchToAvalanche}
            className="neon-button bg-gradient-to-r from-orange-500 to-red-500 hover:from-red-500 hover:to-orange-500 text-white font-bold px-4 py-2 rounded-2xl shadow-lg shadow-red-500/50"
            >
            <ExternalLink className="mr-1 h-4 w-4" />
            SWITCH TO AVAX
            </Button>
            )}
            
            <Button 
            variant="outline" 
            size="sm"
            onClick={onDisconnectWallet}
            className="border-2 border-gray-600 text-gray-300 hover:text-white hover:border-white rounded-2xl font-bold"
            >
            DISCONNECT
            </Button>
            </div>
              ) : (
            <Button 
            onClick={onConnectWallet}
            className="neon-button bg-gradient-to-r from-avalanche-red to-red-600 hover:from-red-600 hover:to-avalanche-red text-white font-black px-6 py-3 rounded-2xl transform hover:scale-105 transition-all duration-300 shadow-lg shadow-red-500/50"
            >
            <Wallet className="mr-2 h-5 w-5" />
            CONNECT WALLET
            </Button>
              )}
            </div>
          </div>
          </div>
          </header>
        );
      };

      export default Header;
