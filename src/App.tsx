
import React, { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from './components/Header';
import Home from './pages/Home';
import CreateToken from './pages/CreateToken';
import Portfolio from './pages/Portfolio';
import About from './pages/About';
import NotFound from "./pages/NotFound";
import WalletInstallPrompt from './components/WalletInstallPrompt';
import { walletService, WalletConnection } from './services/walletService';
import { useToast } from '@/hooks/use-toast';

const queryClient = new QueryClient();

const AppContent = () => {
  const [walletConnection, setWalletConnection] = useState<WalletConnection>({
    address: '',
    isConnected: false
  });
  const [showWalletInstallPrompt, setShowWalletInstallPrompt] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Vérifier si le wallet était connecté précédemment
    checkExistingConnection();
  }, []);

  const checkExistingConnection = async () => {
    try {
      if (window.ethereum && window.ethereum.selectedAddress) {
        // Reconnecter automatiquement si possible
        const connection = await walletService.connectWallet();
        setWalletConnection(connection);
      }
    } catch (error) {
      console.log('Pas de connexion wallet existante');
    }
  };

  const handleConnectWallet = async () => {
    try {
      if (!window.ethereum) {
        setShowWalletInstallPrompt(true);
        return;
      }

      const connection = await walletService.connectWallet();
      setWalletConnection(connection);
      
      toast({
        title: "Wallet connecté !",
        description: `Adresse: ${connection.address.slice(0, 6)}...${connection.address.slice(-4)} sur ${walletService.getNetworkName()}`,
      });
    } catch (error) {
      toast({
        title: "Erreur de connexion",
        description: error instanceof Error ? error.message : "Impossible de connecter le wallet",
        variant: "destructive",
      });
    }
  };

  const handleDisconnectWallet = () => {
    walletService.disconnectWallet();
    setWalletConnection({ address: '', isConnected: false });
    toast({
      title: "Wallet déconnecté",
      description: "Votre wallet a été déconnecté avec succès",
    });
  };

  const handleSwitchToAvalanche = async () => {
    try {
      await walletService.switchToAvalanche();
      // Rafraîchir la connexion après le changement de réseau
      const connection = walletService.getConnection();
      setWalletConnection(connection);
      
      toast({
        title: "Réseau changé",
        description: "Vous êtes maintenant connecté au réseau Avalanche",
      });
    } catch (error) {
      toast({
        title: "Erreur de réseau",
        description: error instanceof Error ? error.message : "Impossible de changer de réseau",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header
        walletAddress={walletConnection.isConnected ? walletConnection.address : undefined}
        walletBalance={walletConnection.balance}
        networkName={walletConnection.isConnected ? walletService.getNetworkName() : undefined}
        isAvalancheNetwork={walletService.isAvalancheNetwork()}
        onConnectWallet={handleConnectWallet}
        onDisconnectWallet={handleDisconnectWallet}
        onSwitchToAvalanche={handleSwitchToAvalanche}
      />
      
      <main>
        <Routes>
          <Route 
            path="/" 
            element={<Home isWalletConnected={walletConnection.isConnected} />} 
          />
          <Route 
            path="/create" 
            element={<CreateToken isWalletConnected={walletConnection.isConnected} />} 
          />
          <Route 
            path="/portfolio" 
            element={
              <Portfolio 
                isWalletConnected={walletConnection.isConnected}
                walletAddress={walletConnection.address}
              />
            } 
          />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      
      {/* Wallet Install Prompt */}
      <WalletInstallPrompt 
        isVisible={showWalletInstallPrompt}
        onClose={() => setShowWalletInstallPrompt(false)}
      />
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
