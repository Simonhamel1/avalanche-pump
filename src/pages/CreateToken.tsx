
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TokenService, CreateTokenParams } from '@/services/tokenService';
import { walletService } from '@/services/walletService';
import { Loader2, AlertCircle, CheckCircle, Plus, Info, Rocket, Zap, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface CreateTokenProps {
  isWalletConnected: boolean;
}

interface FormErrors {
  name?: string;
  symbol?: string;
  decimals?: string;
  initialSupply?: string;
  imageUrl?: string;
}

const CreateToken: React.FC<CreateTokenProps> = ({ isWalletConnected }) => {
  const [formData, setFormData] = useState<CreateTokenParams>({
    name: '',
    symbol: '',
    decimals: 18,
    initialSupply: 1000000,
    imageUrl: ''
  });
  const [creationFee, setCreationFee] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFee, setIsLoadingFee] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showRocketAnimation, setShowRocketAnimation] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const tokenService = TokenService.getInstance();

  useEffect(() => {
    if (isWalletConnected) {
      loadCreationFee();
    }
  }, [isWalletConnected]);

  const loadCreationFee = async () => {
    try {
      setIsLoadingFee(true);
      const fee = await tokenService.getCreationFee();
      setCreationFee(fee);
    } catch (error) {
      console.error('Error loading fees:', error);
      toast({
        title: "Error",
        description: "Unable to load creation fees",
        variant: "destructive"
      });
    } finally {
      setIsLoadingFee(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Token name is required';
    }

    if (!formData.symbol.trim()) {
      newErrors.symbol = 'Symbol is required';
    } else if (formData.symbol.length < 3 || formData.symbol.length > 5) {
      newErrors.symbol = 'Symbol must be between 3 and 5 characters';
    }

    if (formData.decimals < 0 || formData.decimals > 18) {
      newErrors.decimals = 'Decimals must be between 0 and 18';
    }

    if (formData.initialSupply <= 0) {
      newErrors.initialSupply = 'Initial supply must be greater than 0';
    }

    if (formData.imageUrl && formData.imageUrl.trim()) {
      try {
        new URL(formData.imageUrl);
      } catch {
        newErrors.imageUrl = 'Invalid URL';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof CreateTokenParams, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isWalletConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to create a token",
        variant: "destructive",
      });
      return;
    }

    if (!walletService.isAvalancheNetwork()) {
      toast({
        title: "Wrong Network",
        description: "Please switch to Avalanche network to create a token",
        variant: "destructive",
      });
      return;
    }

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const newToken = await tokenService.createToken(formData);
      
      // Déclencher l'animation de la fusée
      setShowRocketAnimation(true);
      
      toast({
        title: "🚀 TOKEN LAUNCHED TO THE MOON! 🚀",
        description: `${newToken.name} (${newToken.symbol}) is now flying through space!`,
      });

      setFormData({ 
        name: '', 
        symbol: '', 
        decimals: 18,
        initialSupply: 1000000,
        imageUrl: '' 
      });
      
      // Attendre la fin de l'animation avant de naviguer
      setTimeout(() => {
        setShowRocketAnimation(false);
        navigate('/');
      }, 4000);
    } catch (error) {
      console.error('Creation error:', error);
      toast({
        title: "Creation Error",
        description: error instanceof Error ? error.message : "An error occurred while creating the token",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchToAvalanche = async () => {
    try {
      await walletService.switchToAvalanche();
      await loadCreationFee();
      toast({
        title: "Network Switched",
        description: "You can now create your token on Avalanche",
      });
    } catch (error) {
      toast({
        title: "Network Error",
        description: error instanceof Error ? error.message : "Unable to switch network",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
      {/* Animation de la méga fusée */}
      {showRocketAnimation && (
        <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
          {/* Effet de fond spatial */}
          <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-900/50 to-black animate-pulse"></div>
          
          {/* Étoiles qui défilent */}
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`
              }}
            />
          ))}
          
          {/* La méga fusée */}
          <div className="absolute left-1/2 transform -translate-x-1/2 bottom-0 animate-rocket-launch">
            <div className="relative">
              {/* Corps de la fusée */}
              <div className="w-16 h-32 bg-gradient-to-t from-gray-300 via-white to-gray-300 rounded-t-full mx-auto relative">
                {/* Fenêtre */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-blue-400 rounded-full border-2 border-gray-400"></div>
                {/* Détails */}
                <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-8 h-2 bg-red-500 rounded"></div>
                <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-8 h-2 bg-blue-500 rounded"></div>
              </div>
              
              {/* Ailerons */}
              <div className="absolute -bottom-2 left-2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-12 border-t-red-500"></div>
              <div className="absolute -bottom-2 right-2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-12 border-t-red-500"></div>
              
              {/* Flammes de propulsion */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-12 h-16 animate-flame">
                <div className="w-full h-full bg-gradient-to-b from-orange-400 via-red-500 to-yellow-300 rounded-b-full opacity-90 animate-pulse"></div>
                <div className="absolute inset-2 bg-gradient-to-b from-yellow-300 via-orange-400 to-red-500 rounded-b-full animate-bounce"></div>
              </div>
              
              {/* Particules d'échappement */}
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-orange-400 rounded-full animate-particle"
                  style={{
                    left: `${6 + Math.random() * 4}px`,
                    bottom: `-${20 + i * 3}px`,
                    animationDelay: `${Math.random() * 1}s`,
                    animationDuration: `${0.5 + Math.random() * 0.5}s`
                  }}
                />
              ))}
            </div>
          </div>
          
          {/* Texte d'animation */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center animate-bounce">
              <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 mb-4 animate-pulse">
                🚀 TO THE MOON! 🚀
              </h2>
              <p className="text-3xl font-bold text-white animate-bounce delay-500">
                {formData.name} ({formData.symbol}) IS LAUNCHING!
              </p>
            </div>
          </div>
          
          {/* Explosion de confettis */}
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 animate-confetti"
              style={{
                left: `${40 + Math.random() * 20}%`,
                top: `${40 + Math.random() * 20}%`,
                backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'][Math.floor(Math.random() * 6)],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-avalanche-red/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-avalanche-red/5 to-blue-500/5 rounded-full blur-3xl animate-spin [animation-duration:60s]"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-avalanche-red to-white mb-6 tracking-tight glow-text">
            CREATE YOUR
            <br />
            <span className="text-avalanche-red">TOKEN</span>
          </h1>
          <div className="flex items-center justify-center space-x-4 mb-6">
            <Rocket className="w-8 h-8 text-avalanche-red animate-bounce" />
            <p className="text-xl md:text-2xl text-gray-300 font-bold tracking-wide">
              LAUNCH TO THE MOON ON AVALANCHE
            </p>
            <Rocket className="w-8 h-8 text-avalanche-red animate-bounce delay-500" />
          </div>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">            Create your token on Avalanche with our bonding curve system
          </p>
        </div>

        <Card className="pump-card group bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border-gray-700/50 hover:border-avalanche-red/50 transition-all duration-500 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3 text-2xl font-black text-white glow-text">
              <Plus className="w-8 h-8 text-avalanche-red" />
              <span>TOKEN INFORMATION</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {!isWalletConnected && (
              <div className="p-6 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-2xl backdrop-blur-xl">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-6 h-6 text-yellow-400" />
                  <p className="text-yellow-300 font-bold text-lg">
                    Connect your wallet to create a token
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-white font-bold text-lg">Token Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Ex: AvalancheToken"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={isLoading || !isWalletConnected}
                    className={`pump-input bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 rounded-2xl h-14 text-lg font-medium backdrop-blur-xl ${errors.name ? 'border-red-500' : ''}`}
                  />
                  {errors.name && (
                    <p className="text-red-400 font-bold">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="symbol" className="text-white font-bold text-lg">Symbol *</Label>
                  <Input
                    id="symbol"
                    type="text"
                    placeholder="Ex: AVAX"
                    value={formData.symbol}
                    onChange={(e) => handleInputChange('symbol', e.target.value.toUpperCase())}
                    disabled={isLoading || !isWalletConnected}
                    maxLength={5}
                    className={`pump-input bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 rounded-2xl h-14 text-lg font-medium backdrop-blur-xl ${errors.symbol ? 'border-red-500' : ''}`}
                  />
                  <p className="text-gray-400 text-sm font-medium">
                    Between 3 and 5 characters
                  </p>
                  {errors.symbol && (
                    <p className="text-red-400 font-bold">{errors.symbol}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="decimals" className="text-white font-bold text-lg">Decimals *</Label>
                  <Input
                    id="decimals"
                    type="number"
                    min="0"
                    max="18"
                    placeholder="18"
                    value={formData.decimals}
                    onChange={(e) => handleInputChange('decimals', parseInt(e.target.value) || 0)}
                    disabled={isLoading || !isWalletConnected}
                    className={`pump-input bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 rounded-2xl h-14 text-lg font-medium backdrop-blur-xl ${errors.decimals ? 'border-red-500' : ''}`}
                  />
                  <p className="text-gray-400 text-sm font-medium">
                    Decimals (0-18, recommended: 18)
                  </p>
                  {errors.decimals && (
                    <p className="text-red-400 font-bold">{errors.decimals}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="initialSupply" className="text-white font-bold text-lg">Initial Supply *</Label>
                  <Input
                    id="initialSupply"
                    type="number"
                    min="1"
                    placeholder="1,000,000"
                    value={formData.initialSupply}
                    onChange={(e) => handleInputChange('initialSupply', parseInt(e.target.value) || 0)}
                    disabled={isLoading || !isWalletConnected}
                    className={`pump-input bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 rounded-2xl h-14 text-lg font-medium backdrop-blur-xl ${errors.initialSupply ? 'border-red-500' : ''}`}
                  />
                  <p className="text-gray-400 text-sm font-medium">
                    Number of tokens to create initially
                  </p>
                  {errors.initialSupply && (
                    <p className="text-red-400 font-bold">{errors.initialSupply}</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="imageUrl" className="text-white font-bold text-lg">Image/Logo URL (optional)</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  placeholder="https://example.com/token-logo.png"
                  value={formData.imageUrl || ''}
                  onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                  disabled={isLoading || !isWalletConnected}
                  className={`pump-input bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 rounded-2xl h-14 text-lg font-medium backdrop-blur-xl ${errors.imageUrl ? 'border-red-500' : ''}`}
                />
                {errors.imageUrl && (
                  <p className="text-red-400 font-bold">{errors.imageUrl}</p>
                )}
                {formData.imageUrl && !errors.imageUrl && (
                  <div className="mt-4">
                    <p className="text-gray-400 text-sm font-medium mb-2">Preview:</p>
                    <img 
                      src={formData.imageUrl} 
                      alt="Preview"
                      className="w-20 h-20 rounded-3xl object-cover border-2 border-gray-600"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://via.placeholder.com/80/E84142/FFFFFF?text=${formData.symbol.charAt(0) || 'T'}`;
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 p-6 rounded-3xl border border-blue-500/50 backdrop-blur-xl">
                <h3 className="font-black text-blue-300 mb-4 flex items-center space-x-3 text-xl">
                  <Info className="w-6 h-6" />
                  <span>CREATION INFORMATION</span>
                </h3>
                <div className="text-blue-200 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold">Creation Fee:</span>
                    <span className="font-black text-xl">
                      {isLoadingFee ? (
                        <Loader2 className="w-5 h-5 animate-spin inline" />
                      ) : (
                        creationFee ? `${creationFee} AVAX` : 'Loading...'
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold">Tokens to Receive:</span>
                    <span className="font-black text-xl">
                      {formData.initialSupply.toLocaleString()} {formData.symbol || 'TOKEN'}
                    </span>
                  </div>
                  <div className="pt-4 border-t border-blue-400/30">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span>You will own the token contract</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Zap className="w-4 h-4 text-green-400" />
                        <span>You can mint/burn additional tokens</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Rocket className="w-4 h-4 text-avalanche-red" />
                        <span>Deployed on Avalanche C-Chain</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !isWalletConnected || !walletService.isAvalancheNetwork()}
                className="w-full neon-button bg-gradient-to-r from-avalanche-red to-red-600 hover:from-red-600 hover:to-avalanche-red text-white font-black text-xl py-6 rounded-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                    CREATING TOKEN...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-6 h-6 mr-3" />
                    CREATE TOKEN
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateToken;
