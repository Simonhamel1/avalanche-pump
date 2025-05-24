
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Token } from '@/services/tokenService';
import { Loader2, AlertCircle } from 'lucide-react';

interface BuyTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: Token | null;
  onConfirm: (amount: number) => Promise<void>;
}

const BuyTokenModal: React.FC<BuyTokenModalProps> = ({
  isOpen,
  onClose,
  token,
  onConfirm
}) => {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      setError('Veuillez entrer un montant valide');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onConfirm(parseFloat(amount));
      setAmount('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'achat');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTokens = () => {
    if (!amount || !token) return 0;
    return parseFloat(amount) / token.currentPrice;
  };

  const handleClose = () => {
    setAmount('');
    setError('');
    onClose();
  };

  if (!token) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <img 
              src={token.imageUrl} 
              alt={token.name}
              className="w-6 h-6 rounded-full"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://via.placeholder.com/24/E84142/FFFFFF?text=${token.symbol.charAt(0)}`;
              }}
            />
            <span>Acheter {token.symbol}</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Montant en AVAX</Label>
            <Input
              id="amount"
              type="number"
              step="0.001"
              min="0.001"
              placeholder="0.1"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError('');
              }}
              disabled={isLoading}
            />
          </div>

          {amount && (
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">
                Vous recevrez environ
              </p>
              <p className="font-semibold text-avalanche-dark">
                {calculateTokens().toLocaleString('fr-FR', { maximumFractionDigits: 2 })} {token.symbol}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Prix: {token.currentPrice.toFixed(6)} AVAX par {token.symbol}
              </p>
            </div>
          )}

          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="flex space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !amount}
              className="flex-1 bg-avalanche-red hover:bg-red-600 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Achat en cours...
                </>
              ) : (
                'Confirmer l\'achat'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BuyTokenModal;
