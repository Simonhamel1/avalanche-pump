import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TokenService, CreateTokenParams } from '@/services/tokenService';
import { walletService } from '@/services/walletService';
import AvalancheStatus from '@/components/AvalancheStatus';
import { Loader2, AlertCircle, CheckCircle, Plus, Info } from 'lucide-react';
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
  const { toast } = useToast();
  const navigate = useNavigate();

  const tokenService = TokenService.getInstance();

  // Charger les frais de création au chargement du composant
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
      console.error('Erreur lors du chargement des frais:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les frais de création",
        variant: "destructive"
      });
    } finally {
      setIsLoadingFee(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom du token est requis';
    }

    if (!formData.symbol.trim()) {
      newErrors.symbol = 'Le symbole est requis';
    } else if (formData.symbol.length < 3 || formData.symbol.length > 5) {
      newErrors.symbol = 'Le symbole doit contenir entre 3 et 5 caractères';
    }

    if (formData.decimals < 0 || formData.decimals > 18) {
      newErrors.decimals = 'Les décimales doivent être entre 0 et 18';
    }

    if (formData.initialSupply <= 0) {
      newErrors.initialSupply = 'L\'offre initiale doit être supérieure à 0';
    }

    if (formData.imageUrl && formData.imageUrl.trim()) {
      try {
        new URL(formData.imageUrl);
      } catch {
        newErrors.imageUrl = 'URL invalide';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof CreateTokenParams, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isWalletConnected) {
      toast({
        title: "Wallet requis",
        description: "Veuillez connecter votre wallet pour créer un token",
        variant: "destructive",
      });
      return;
    }

    if (!walletService.isAvalancheNetwork()) {
      toast({
        title: "Réseau incorrect",
        description: "Veuillez basculer vers le réseau Avalanche pour créer un token",
        variant: "destructive",
      });
      return;
    }

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const newToken = await tokenService.createToken(formData);
      
      toast({
        title: "Token créé avec succès !",
        description: `${newToken.name} (${newToken.symbol}) a été créé sur la blockchain`,
      });

      // Reset form
      setFormData({ 
        name: '', 
        symbol: '', 
        decimals: 18,
        initialSupply: 1000000,
        imageUrl: '' 
      });
      
      // Redirect to home page
      navigate('/');
    } catch (error) {
      console.error('Erreur de création:', error);
      toast({
        title: "Erreur de création",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la création du token",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchToAvalanche = async () => {
    try {
      await walletService.switchToAvalanche();
      // Recharger les frais après le changement de réseau
      await loadCreationFee();
      toast({
        title: "Réseau changé",
        description: "Vous pouvez maintenant créer votre token sur Avalanche",
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-avalanche-dark mb-4">
            Créer un Nouveau Token
          </h1>
          <p className="text-gray-600">
            Lancez votre token sur Avalanche avec notre système de bonding curve
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="w-5 h-5 text-avalanche-red" />
              <span>Informations du Token</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!isWalletConnected && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <p className="text-yellow-800">
                    Connectez votre wallet pour créer un token
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du Token *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Ex: AvalancheToken"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={isLoading || !isWalletConnected}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="symbol">Symbole *</Label>
                <Input
                  id="symbol"
                  type="text"
                  placeholder="Ex: AVAX"
                  value={formData.symbol}
                  onChange={(e) => handleInputChange('symbol', e.target.value.toUpperCase())}
                  disabled={isLoading || !isWalletConnected}
                  maxLength={5}
                  className={errors.symbol ? 'border-red-500' : ''}
                />
                <p className="text-xs text-gray-500">
                  Entre 3 et 5 caractères
                </p>
                {errors.symbol && (
                  <p className="text-sm text-red-600">{errors.symbol}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="decimals">Décimales *</Label>
                  <Input
                    id="decimals"
                    type="number"
                    min="0"
                    max="18"
                    placeholder="18"
                    value={formData.decimals}
                    onChange={(e) => handleInputChange('decimals', parseInt(e.target.value) || 0)}
                    disabled={isLoading || !isWalletConnected}
                    className={errors.decimals ? 'border-red-500' : ''}
                  />
                  <p className="text-xs text-gray-500">
                    Nombre de décimales (0-18, recommandé: 18)
                  </p>
                  {errors.decimals && (
                    <p className="text-sm text-red-600">{errors.decimals}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="initialSupply">Offre initiale *</Label>
                  <Input
                    id="initialSupply"
                    type="number"
                    min="1"
                    placeholder="1000000"
                    value={formData.initialSupply}
                    onChange={(e) => handleInputChange('initialSupply', parseInt(e.target.value) || 0)}
                    disabled={isLoading || !isWalletConnected}
                    className={errors.initialSupply ? 'border-red-500' : ''}
                  />
                  <p className="text-xs text-gray-500">
                    Nombre de tokens à créer initialement
                  </p>
                  {errors.initialSupply && (
                    <p className="text-sm text-red-600">{errors.initialSupply}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">URL de l'Image/Logo (optionnel)</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  placeholder="https://example.com/token-logo.png"
                  value={formData.imageUrl || ''}
                  onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                  disabled={isLoading || !isWalletConnected}
                  className={errors.imageUrl ? 'border-red-500' : ''}
                />
                {errors.imageUrl && (
                  <p className="text-sm text-red-600">{errors.imageUrl}</p>
                )}
                {formData.imageUrl && !errors.imageUrl && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-2">Aperçu:</p>
                    <img 
                      src={formData.imageUrl} 
                      alt="Preview"
                      className="w-16 h-16 rounded-full object-cover border"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://via.placeholder.com/64/E84142/FFFFFF?text=${formData.symbol.charAt(0) || 'T'}`;
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="bg-blue-50 p-4 rounded-md">
                <h3 className="font-medium text-blue-900 mb-2 flex items-center space-x-2">
                  <Info className="w-4 h-4" />
                  <span>Informations de création</span>
                </h3>
                <div className="text-sm text-blue-800 space-y-2">
                  <div className="flex justify-between">
                    <span>Frais de création:</span>
                    <span className="font-medium">
                      {isLoadingFee ? (
                        <Loader2 className="w-4 h-4 animate-spin inline" />
                      ) : (
                        creationFee ? `${creationFee} AVAX` : 'Chargement...'
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tokens à recevoir:</span>
                    <span className="font-medium">
                      {formData.initialSupply.toLocaleString()} {formData.symbol || 'TOKEN'}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-blue-200">
                    <p className="text-xs">
                      • Vous serez le propriétaire du contrat token<br/>
                      • Vous pouvez mint/burn des tokens supplémentaires<br/>
                      • Le contrat est déployé sur Avalanche C-Chain
                    </p>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !isWalletConnected || !walletService.isAvalancheNetwork()}
                className="w-full bg-avalanche-red hover:bg-red-600 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Créer le Token
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
