import { useEffect, useState } from 'react';
import { ArrowUpCircle, ArrowDownCircle, Clock, AlertCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { loyaltyPointsApi } from '@/db/api';
import type { LoyaltyPointWithOrder } from '@/types/types';

interface PointsHistoryProps {
  userId: string;
}

export default function PointsHistory({ userId }: PointsHistoryProps) {
  const [history, setHistory] = useState<LoyaltyPointWithOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [userId]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await loyaltyPointsApi.getPointsHistory(userId);
      setHistory(data);
    } catch (error) {
      console.error('Error loading points history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earned':
        return <ArrowUpCircle className="w-4 h-4 text-green-600" />;
      case 'redeemed':
        return <ArrowDownCircle className="w-4 h-4 text-blue-600" />;
      case 'expired':
        return <Clock className="w-4 h-4 text-orange-600" />;
      case 'adjusted':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getTransactionBadge = (type: string) => {
    const variants: Record<string, any> = {
      earned: 'default',
      redeemed: 'secondary',
      expired: 'destructive',
      adjusted: 'outline'
    };
    return (
      <Badge variant={variants[type] || 'outline'}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Points History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Points History</CardTitle>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No points transactions yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="text-sm">
                      {formatDate(transaction.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTransactionIcon(transaction.transaction_type)}
                        {getTransactionBadge(transaction.transaction_type)}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {transaction.description || 'No description'}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      <span className={transaction.points > 0 ? 'text-green-600' : 'text-red-600'}>
                        {transaction.points > 0 ? '+' : ''}{transaction.points}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
