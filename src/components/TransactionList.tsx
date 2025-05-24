import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Transaction, transactionService } from '@/services/transactionService';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  FileText, 
  Coins, 
  ExternalLink, 
  Clock,
  Hash,
  User,
  DollarSign
} from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  isLoading?: boolean;
  userAddress?: string;
}

const TransactionList: React.FC<TransactionListProps> = ({ 
  transactions, 
  isLoading = false,
  userAddress = ''
}) => {
  const getTransactionIcon = (type: Transaction['type'], isSent: boolean) => {
    switch (type) {
      case 'send':
        return <ArrowUpRight className="w-4 h-4 text-red-500" />;
      case 'receive':
        return <ArrowDownLeft className="w-4 h-4 text-green-500" />;
      case 'token_transfer':
        return <Coins className="w-4 h-4 text-blue-500" />;
      case 'token_creation':
        return <FileText className="w-4 h-4 text-purple-500" />;
      case 'contract':
        return <FileText className="w-4 h-4 text-gray-500" />;
      default:
        return isSent ? 
          <ArrowUpRight className="w-4 h-4 text-red-500" /> : 
          <ArrowDownLeft className="w-4 h-4 text-green-500" />;
    }
  };

  const getStatusBadge = (status: Transaction['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">Succès</Badge>;
      case 'failed':
        return <Badge variant="destructive">Échec</Badge>;
      case 'pending':
        return <Badge variant="secondary">En attente</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const getTypeLabel = (type: Transaction['type']) => {
    switch (type) {
      case 'send':
        return 'Envoi';
      case 'receive':
        return 'Réception';
      case 'token_transfer':
        return 'Transfert Token';
      case 'token_creation':
        return 'Création Token';
      case 'contract':
        return 'Contrat';
      default:
        return 'Transaction';
    }
  };

  const openInExplorer = (hash: string) => {
    const url = transactionService.getExplorerUrl(hash);
    if (url) {
      window.open(url, '_blank');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Chargement des transactions...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="w-20 h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Historique des transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune transaction trouvée
            </h3>
            <p className="text-gray-500">
              Vos transactions récentes apparaîtront ici
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Historique des transactions
          </div>
          <Badge variant="secondary">{transactions.length} transaction(s)</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((tx) => {
            const isSent = tx.from.toLowerCase() === userAddress.toLowerCase();
            const isReceived = tx.to.toLowerCase() === userAddress.toLowerCase();
            
            return (
              <div 
                key={tx.hash} 
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {getTransactionIcon(tx.type, isSent)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {getTypeLabel(tx.type)}
                      </h4>
                      {getStatusBadge(tx.status)}
                    </div>
                    
                    <div className="text-xs text-gray-500 space-y-1">
                      <div className="flex items-center space-x-2">
                        <Hash className="w-3 h-3" />
                        <span className="font-mono">
                          {transactionService.formatAddress(tx.hash)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0"
                          onClick={() => openInExplorer(tx.hash)}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <User className="w-3 h-3" />
                        <span>
                          {isSent ? 'Vers' : 'De'}: {transactionService.formatAddress(isSent ? tx.to : tx.from)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Clock className="w-3 h-3" />
                        <span>{transactionService.formatDate(tx.timestamp)}</span>
                      </div>
                    </div>
                    
                    {tx.description && (
                      <p className="text-xs text-gray-600 mt-1">{tx.description}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-2">
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <span className={`text-sm font-medium ${
                      isSent ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {isSent ? '-' : '+'}
                      {parseFloat(tx.value).toFixed(4)} AVAX
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Bloc #{tx.blockNumber}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionList;
