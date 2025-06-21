import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, CheckCircle, AlertCircle } from 'lucide-react';

interface NetworkStatusProps {
  isConnected: boolean;
  network?: string;
  blockNumber?: number;
}

const NetworkStatus: React.FC<NetworkStatusProps> = ({ 
  isConnected, 
  network = 'Unknown',
  blockNumber 
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Badge 
        variant={isConnected ? "default" : "destructive"}
        className={`flex items-center space-x-1 transition-all duration-300 ${
          isConnected 
            ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200' 
            : 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200'
        }`}
      >
        {isConnected ? (
          <CheckCircle className="w-3 h-3" />
        ) : (
          <AlertCircle className="w-3 h-3" />
        )}
        <span className="text-xs font-medium">
          {isConnected ? 'Connecté' : 'Déconnecté'}
        </span>
      </Badge>
      
      {isConnected && (
        <>
          <Badge variant="outline" className="text-xs">
            <Wifi className="w-3 h-3 mr-1" />
            {network}
          </Badge>
          
          {blockNumber && (
            <Badge variant="secondary" className="text-xs">
              Block #{blockNumber}
            </Badge>
          )}
        </>
      )}
    </div>
  );
};

export default NetworkStatus;
