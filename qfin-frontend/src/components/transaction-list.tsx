import { TrendingUp, TrendingDown, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import type { Transaction } from '../types';

interface TransactionListProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: number) => void;
}

export function TransactionList({ transactions, onDeleteTransaction }: TransactionListProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle style={{ color: '#1E3A8A' }}>
          Transações Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedTransactions.length === 0 ? (
          <div className="text-center py-8">
            <p style={{ color: '#6B7280' }}>
              Nenhuma transação encontrada. Adicione uma nova transação para começar.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedTransactions.slice(0, 10).map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ 
                      backgroundColor: transaction.type === 'INCOME' ? '#059669' : '#DC2626',
                      color: 'white'
                    }}
                  >
                    {transaction.type === 'INCOME' ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{transaction.description}</p>
                      <Badge 
                        variant="secondary"
                        style={{ 
                          backgroundColor: '#F3F4F6',
                          color: '#6B7280'
                        }}
                      >
                        {transaction.category}
                      </Badge>
                    </div>
                    <p className="text-sm" style={{ color: '#6B7280' }}>
                      {formatDate(transaction.date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span 
                    className="font-bold"
                    style={{ 
                      color: transaction.type === 'INCOME' ? '#059669' : '#DC2626'
                    }}
                  >
                    {transaction.type === 'INCOME' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteTransaction(transaction.id)}
                    className="h-8 w-8 hover:bg-red-50"
                    style={{ color: '#DC2626' }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}