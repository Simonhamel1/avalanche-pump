import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, DollarSign, Activity } from 'lucide-react';

interface StatsDisplayProps {
  totalTokens: number;
  totalValue: number;
  userTokens: number;
  isWalletConnected: boolean;
  onConnect?: () => void;
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({
  totalTokens,
  totalValue,
  userTokens,
  isWalletConnected,
  onConnect
}) => {
  const stats = [
    {
      title: 'Deployed Tokens',
      value: (totalTokens).toFixed(0),
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Total Value (AVAX)',
      value: (totalValue / 1e18).toFixed(4),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      title: 'Your tokens',
      value: isWalletConnected ? (userTokens).toFixed(0) : '?',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      title: 'Statut',
      value: isWalletConnected ? 'Connected' : 'Disconnected',
      icon: Activity,
      color: isWalletConnected ? 'text-green-600' : 'text-gray-600',
      bgColor: isWalletConnected ? 'bg-green-50' : 'bg-gray-50',
      borderColor: isWalletConnected ? 'border-green-200' : 'border-gray-200'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <Card 
          key={stat.title}
          className={`${stat.borderColor} border-l-4 card-hover hover-scale transition-all duration-300`}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CardContent className="p-4">
            <div className={`${stat.bgColor} rounded-lg p-3 mb-3 inline-flex`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsDisplay;
