import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, ExternalLink, Zap } from 'lucide-react';

interface AvalancheStatusProps {
  isConnected: boolean;
  isAvalancheNetwork: boolean;
  networkName?: string;
  onSwitchNetwork?: () => void;
}

const AvalancheStatus: React.FC<AvalancheStatusProps> = ({
  isConnected,
  isAvalancheNetwork,
  networkName,
  onSwitchNetwork
}) => {
  if (!isConnected) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <div className="flex-1">
              <h3 className="font-medium text-orange-900">Wallet Not Connected</h3>
              <p className="text-sm text-orange-700">
                Connect your wallet to start using Token Forge
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isAvalancheNetwork) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <h3 className="font-medium text-red-900">Wrong Network</h3>
                <p className="text-sm text-red-700">
                  You are connected to {networkName}. Switch to Avalanche to continue.
                </p>
              </div>
            </div>
            {onSwitchNetwork && (
              <Button 
                size="sm" 
                onClick={onSwitchNetwork}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <ExternalLink className="mr-1 h-3 w-3" />
                Switch to Avalanche
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-green-200 bg-green-50">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-avalanche-red" />
            <div>
              <h3 className="font-medium text-green-900">Connected to {networkName}</h3>
              <p className="text-sm text-green-700">
                Your wallet is ready to use Token Forge
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AvalancheStatus;
