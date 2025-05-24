
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
import { WalletService, WalletConnection } from './services/walletService';
import { useToast } from '@/hooks/use-toast';

const queryClient = new QueryClient();

const AppContent = () => {
  const [walletConnection, setWalletConnection] = useState<WalletConnection>({
    address: '',
    isConnected: false
  });
  const { toast } = useToast();

  const walletService = WalletService.getInstance();

  useEffect(() => {
    // Check if wallet was previously connected
    const savedConnection = walletService.getConnection();
    if (savedConnection.isConnected) {
      setWalletConnection(savedConnection);
    }
  }, []);

  const handleConnectWallet = async () => {
    try {
      const connection = await walletService.connectWallet();
      setWalletConnection(connection);
      toast({
        title: "Wallet connecté !",
        description: `Adresse: ${connection.address.slice(0, 6)}...${connection.address.slice(-4)}`,
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

  return (
    <div className="min-h-screen bg-white">
      <Header
        walletAddress={walletConnection.isConnected ? walletConnection.address : undefined}
        onConnectWallet={handleConnectWallet}
        onDisconnectWallet={handleDisconnectWallet}
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
