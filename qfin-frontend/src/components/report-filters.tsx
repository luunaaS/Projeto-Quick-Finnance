import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent } from './ui/card';
import { Filter } from 'lucide-react';

interface ReportFiltersProps {
  onFilterChange: (filters: {
    startDate: string;
    endDate: string;
    category: string;
    type: string;
  }) => void;
}

export function ReportFilters({ onFilterChange }: ReportFiltersProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('ALL');

  const handleApplyFilters = () => {
    onFilterChange({
      startDate,
      endDate,
      category,
      type,
    });
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    setCategory('');
    setType('ALL');
    onFilterChange({
      startDate: '',
      endDate: '',
      category: '',
      type: 'ALL',
    });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5" style={{ color: '#1E3A8A' }} />
          <h3 className="text-lg font-semibold" style={{ color: '#1E3A8A' }}>
            Filtros
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Data Início</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">Data Fim</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Input
              id="category"
              placeholder="Ex: Alimentação"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="type">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                <SelectItem value="INCOME">Receitas</SelectItem>
                <SelectItem value="EXPENSE">Despesas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 flex items-end gap-2">
            <Button
              onClick={handleApplyFilters}
              className="flex-1"
              style={{ backgroundColor: '#1E3A8A' }}
            >
              Aplicar
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              className="flex-1"
            >
              Limpar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
