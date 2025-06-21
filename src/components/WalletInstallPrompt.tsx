import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, ExternalLink, Download } from 'lucide-react';

interface WalletInstallPromptProps {
  isVisible: boolean;
  onClose: () => void;
}

const WalletInstallPrompt: React.FC<WalletInstallPromptProps> = ({ isVisible, onClose }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-md w-full">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-orange-600" />
              </div>
            </div>
              <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Avalanche Wallet Required
              </h3>
              <p className="text-gray-600 text-sm">
                To use Token Forge, you need to install Core Wallet or MetaMask 
                and configure it for the Avalanche network.
              </p>
            </div>

            <div className="space-y-3">
              <a
                href="https://core.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button className="w-full bg-avalanche-red hover:bg-red-600 text-white">
                  <Download className="mr-2 h-4 w-4" />
                  Download Core Wallet
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </a>
              
              <a
                href="https://metamask.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button variant="outline" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Or MetaMask
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>Recommended:</strong> Core Wallet is specially designed for Avalanche 
                and offers the best user experience.
              </p>
            </div>

            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="text-gray-500"
            >
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletInstallPrompt;
