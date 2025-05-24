import React, { useState, useEffect } from 'react';
import TokenCard from '@/components/TokenCard';
import BuyTokenModal from '@/components/BuyTokenModal';
import AvalancheStatus from '@/components/AvalancheStatus';
import { Token, TokenService } from '@/services/tokenService';
import { walletService } from '@/services/walletService';
import { Search, TrendingUp, Loader2, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface HomeProps {
  isWalletConnected: boolean;
}

const Home: React.FC<HomeProps> = ({ isWalletConnected }) => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [filteredTokens, setFilteredTokens] = useState<Token[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const tokenService = TokenService.getInstance();

  useEffect(() => {
    loadTokens();
  }, []);

  useEffect(() => {
    filterTokens();
  }, [tokens, searchQuery]);

  const loadTokens = async () => {
    try {
      setIsLoading(true);
      const allTokens = await tokenService.getAllTokens();
      setTokens(allTokens);
      console.log(`${allTokens.length} tokens chargés depuis la blockchain`);
    } catch (error) {
      console.error('Erreur lors du chargement des tokens:', error);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les tokens depuis la blockchain. Vérifiez votre connexion.",
        variant: "destructive"
      });
      // En cas d'erreur, afficher un tableau vide plutôt que de laisser l'ancien état
      setTokens([]);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTokens = async () => {
    try {
      setIsRefreshing(true);
      await tokenService.refreshTokens();
      const allTokens = await tokenService.getAllTokens();
      setTokens(allTokens);
      toast({
        title: "Tokens actualisés",
        description: `${allTokens.length} tokens chargés depuis la blockchain`,
      });
    } catch (error) {
      console.error('Erreur lors de l\'actualisation:', error);
      toast({
        title: "Erreur d'actualisation",
        description: "Impossible d'actualiser les tokens",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const filterTokens = () => {
    if (!searchQuery) {
      setFilteredTokens(tokens);
      return;
    }

    const filtered = tokens.filter(token =>
      token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.creator.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredTokens(filtered);
  };

  const handleBuyToken = (tokenAddress: string) => {
    const token = tokens.find(t => t.address === tokenAddress);
    if (token) {
      setSelectedToken(token);
      setIsBuyModalOpen(true);
    }
  };

  const handleConfirmBuy = async (amount: number) => {
    if (!selectedToken) return;

    try {
      // Pour l'instant, on simule l'achat car il n'y a pas de bonding curve
      // Dans une implémentation future, on pourrait ajouter un contrat de trading
      toast({
        title: "Fonctionnalité à venir",
        description: `L'achat de tokens sera disponible prochainement`,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Erreur d'achat",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleSwitchToAvalanche = async () => {
    try {
      await walletService.switchToAvalanche();
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-avalanche-dark mb-4">
            Découvrez les Tokens Avalanche
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Investissez dans les nouveaux tokens via notre système de bonding curve. 
            Créez, achetez et tradez en toute sécurité sur Avalanche.
          </p>
        </div>

        {/* Avalanche Status */}
        <div className="mb-8">
          <AvalancheStatus 
            isConnected={isWalletConnected}
            isAvalancheNetwork={walletService.isAvalancheNetwork()}
            networkName={walletService.getNetworkName()}
            onSwitchNetwork={handleSwitchToAvalanche}
          />
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-avalanche-red mr-3" />
              <div>
                <p className="text-2xl font-bold text-avalanche-dark">{tokens.length}</p>
                <p className="text-gray-600">Tokens Actifs</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-green-600 font-bold">$</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-avalanche-dark">
                  {tokens.reduce((sum, token) => sum + token.marketCap, 0).toLocaleString()}
                </p>
                <p className="text-gray-600">Volume Total</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 font-bold">⚡</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-avalanche-dark">Avalanche</p>
                <p className="text-gray-600">Réseau</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Refresh Bar */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Rechercher des tokens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            onClick={refreshTokens}
            disabled={isRefreshing}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Actualiser</span>
          </Button>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-avalanche-red" />
            <span className="ml-2 text-gray-600">Chargement des tokens...</span>
          </div>
        ) : (
          <>
            {/* Tokens Grid */}
            {filteredTokens.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredTokens.map((token) => (
                  <TokenCard
                    key={token.address}
                    token={token}
                    onBuy={handleBuyToken}
                    isWalletConnected={isWalletConnected}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  {searchQuery ? 'Aucun token trouvé' : 'Aucun token créé pour le moment'}
                </p>
                <p className="text-gray-400 mt-2">
                  Soyez le premier à créer un token sur Avalanche !
                </p>
              </div>
            )}
          </>
        )}

        {/* Buy Modal */}
        <BuyTokenModal
          isOpen={isBuyModalOpen}
          onClose={() => setIsBuyModalOpen(false)}
          token={selectedToken}
          onConfirm={handleConfirmBuy}
        />
      </div>
    </div>
  );
};

export default Home;
