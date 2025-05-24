
import React, { useState, useEffect } from 'react';
import TokenCard from '@/components/TokenCard';
import BuyTokenModal from '@/components/BuyTokenModal';
import { Token, TokenService } from '@/services/tokenService';
import { Search, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
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
  const { toast } = useToast();

  const tokenService = TokenService.getInstance();

  useEffect(() => {
    loadTokens();
  }, []);

  useEffect(() => {
    filterTokens();
  }, [tokens, searchQuery]);

  const loadTokens = () => {
    const allTokens = tokenService.getAllTokens();
    setTokens(allTokens);
  };

  const filterTokens = () => {
    if (!searchQuery) {
      setFilteredTokens(tokens);
      return;
    }

    const filtered = tokens.filter(token =>
      token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredTokens(filtered);
  };

  const handleBuyToken = (tokenId: string) => {
    const token = tokens.find(t => t.id === tokenId);
    if (token) {
      setSelectedToken(token);
      setIsBuyModalOpen(true);
    }
  };

  const handleConfirmBuy = async (amount: number) => {
    if (!selectedToken) return;

    try {
      await tokenService.buyToken(selectedToken.id, amount);
      toast({
        title: "Achat réussi !",
        description: `Vous avez acheté ${amount} AVAX de ${selectedToken.symbol}`,
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

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Rechercher des tokens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tokens Grid */}
        {filteredTokens.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTokens.map((token) => (
              <TokenCard
                key={token.id}
                token={token}
                onBuy={handleBuyToken}
                isWalletConnected={isWalletConnected}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {searchQuery ? 'Aucun token trouvé' : 'Aucun token disponible'}
            </p>
          </div>
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
