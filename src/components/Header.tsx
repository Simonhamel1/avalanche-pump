
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, Plus, User, Dice1, Info, Rocket } from 'lucide-react';
import { walletService } from '@/services/walletService';
import { useToast } from '@/hooks/use-toast';

interface HeaderProps {
  isWalletConnected: boolean;
  onWalletConnection: (connected: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ isWalletConnected, onWalletConnection }) => {
  const location = useLocation();
  const { toast } = useToast();

  const handleConnectWallet = async () => {
    try {
      await walletService.connectWallet();
      onWalletConnection(true);
      toast({
        title: "Wallet Connected",
        description: "Your wallet has been connected successfully",
      });
    } catch (error) {
      toast({
        title: "Connection Error",
        description: error instanceof Error ? error.message : "Failed to connect wallet",
        variant: "destructive",
      });
    }
  };

  const handleDisconnectWallet = () => {
    walletService.disconnectWallet();
    onWalletConnection(false);
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
  };

  const getWalletAddress = (): string => {
    const connection = walletService.getConnection();
    return connection.address ? `${connection.address.slice(0, 6)}...${connection.address.slice(-4)}` : '';
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-gray-900/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <Rocket className="h-8 w-8 text-avalanche-red group-hover:animate-bounce transition-all duration-300" />
            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-avalanche-red">
              AVALANCHE PUMP
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link to="/">
              <Button 
                variant={isActive('/') ? 'default' : 'ghost'} 
                className={`font-bold ${isActive('/') ? 'bg-avalanche-red hover:bg-red-600' : 'text-gray-300 hover:text-white hover:bg-gray-800'}`}
              >
                <Rocket className="mr-2 h-4 w-4" />
                Home
              </Button>
            </Link>
            
            <Link to="/create">
              <Button 
                variant={isActive('/create') ? 'default' : 'ghost'} 
                className={`font-bold ${isActive('/create') ? 'bg-avalanche-red hover:bg-red-600' : 'text-gray-300 hover:text-white hover:bg-gray-800'}`}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Token
              </Button>
            </Link>
            
            <Link to="/portfolio">
              <Button 
                variant={isActive('/portfolio') ? 'default' : 'ghost'} 
                className={`font-bold ${isActive('/portfolio') ? 'bg-avalanche-red hover:bg-red-600' : 'text-gray-300 hover:text-white hover:bg-gray-800'}`}
              >
                <User className="mr-2 h-4 w-4" />
                Portfolio
              </Button>
            </Link>

            <Link to="/gambling">
              <Button 
                variant={isActive('/gambling') ? 'default' : 'ghost'} 
                className={`font-bold ${isActive('/gambling') ? 'bg-avalanche-red hover:bg-red-600' : 'text-gray-300 hover:text-white hover:bg-gray-800'}`}
              >
                <Dice1 className="mr-2 h-4 w-4" />
                Gambling
              </Button>
            </Link>
            
            <Link to="/about">
              <Button 
                variant={isActive('/about') ? 'default' : 'ghost'} 
                className={`font-bold ${isActive('/about') ? 'bg-avalanche-red hover:bg-red-600' : 'text-gray-300 hover:text-white hover:bg-gray-800'}`}
              >
                <Info className="mr-2 h-4 w-4" />
                About
              </Button>
            </Link>
          </nav>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {isWalletConnected ? (
              <div className="flex items-center space-x-3 ">
                <Badge variant="outline" className="border-green-500 text-green-400 font-bold bg-green-500/10 px-3 py-1 rounded-full animate-pulse ml-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  Connected
                </Badge>
                <Button
                  onClick={handleDisconnectWallet}
                  variant="outline"
                  className="font-bold border-avalanche-red/50 text-white hover:bg-avalanche-red hover:text-white hover:border-avalanche-red bg-gray-800/50 backdrop-blur-sm transition-all duration-300 rounded-xl px-4 py-2"
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  {getWalletAddress()}
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleConnectWallet}
                className="bg-gradient-to-r from-avalanche-red to-red-600 hover:from-red-600 hover:to-avalanche-red text-white font-bold transition-all duration-300 transform hover:scale-105 rounded-xl px-6 py-2 shadow-lg hover:shadow-avalanche-red/25"
              >
                <Wallet className="mr-2 h-4 w-4" />
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
