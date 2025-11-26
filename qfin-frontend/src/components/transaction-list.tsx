import { useState } from "react";
import { TrendingUp, TrendingDown, Trash2, Edit } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import type { Transaction } from '../types';

interface TransactionListProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: number) => void;
  onUpdateTransaction: (id: number, transaction: Partial<Transaction>) => void;
}

export function TransactionList({ transactions, onDeleteTransaction, onUpdateTransaction }: TransactionListProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [editType, setEditType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDate, setEditDate] = useState('');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setEditType(transaction.type);
    setEditAmount(transaction.amount.toString());
    setEditCategory(transaction.category);
    setEditDescription(transaction.description);
    setEditDate(transaction.date);
    setIsEditOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTransaction || !editAmount || !editCategory || !editDescription || !editDate) return;

    onUpdateTransaction(selectedTransaction.id, {
      type: editType,
      amount: parseFloat(editAmount),
      category: editCategory,
      description: editDescription,
      date: editDate
    });

    setIsEditOpen(false);
    setSelectedTransaction(null);
  };

  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <>
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
                      onClick={() => handleEdit(transaction)}
                      className="h-8 w-8 hover:bg-blue-50"
                      style={{ color: '#1E3A8A' }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
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

      {/* Dialog para editar transação */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle style={{ color: '#1E3A8A' }}>
              Editar Transação
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editType">Tipo</Label>
              <Select value={editType} onValueChange={(value: 'INCOME' | 'EXPENSE') => setEditType(value)} required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INCOME">Receita</SelectItem>
                  <SelectItem value="EXPENSE">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editAmount">Valor</Label>
              <Input
                id="editAmount"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editCategory">Categoria</Label>
              <Input
                id="editCategory"
                placeholder="Ex: Alimentação"
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editDescription">Descrição</Label>
              <Input
                id="editDescription"
                placeholder="Ex: Almoço no restaurante"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editDate">Data</Label>
              <Input
                id="editDate"
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                required
              />
            </div>

            <div className="flex gap-2">
              <Button 
                type="submit" 
                className="flex-1"
                style={{ backgroundColor: '#1E3A8A', borderColor: '#1E3A8A' }}
              >
                Salvar Alterações
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
