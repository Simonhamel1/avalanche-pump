
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/Header';
import Home from '@/pages/Home';
import CreateToken from '@/pages/CreateToken';
import Portfolio from '@/pages/Portfolio';
import Gambling from '@/pages/Gambling';
import About from '@/pages/About';
import NotFound from '@/pages/NotFound';
import { walletService } from '@/services/walletService';
import './App.css';

const queryClient = new QueryClient();

function App() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  useEffect(() => {
    // Check if wallet is already connected
    const connection = walletService.getConnection();
    setIsWalletConnected(connection.isConnected);
  }, []);

  const handleWalletConnection = (connected: boolean) => {
    setIsWalletConnected(connected);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black">
          <Header 
            isWalletConnected={isWalletConnected}
            onWalletConnection={handleWalletConnection}
          />
          <div className="h-[calc(100vh-64px)] overflow-y-auto">
            <Routes>
              <Route path="/" element={<Home isWalletConnected={isWalletConnected} />} />
              <Route path="/create" element={<CreateToken isWalletConnected={isWalletConnected} />} />
              <Route path="/portfolio" element={<Portfolio isWalletConnected={isWalletConnected} />} />
              <Route path="/gambling" element={<Gambling />} />
              <Route path="/about" element={<About />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Toaster />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
