import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { apiService } from '../services/api.service';

const Reports: React.FC = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const downloadReport = async (type: string) => {
    if (!startDate || !endDate) {
      alert('Por favor, selecione as datas de início e fim.');
      return;
    }

    try {
      const response = await apiService.get(`/reports/${type}/pdf?startDate=${startDate}&endDate=${endDate}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `relatorio-${type}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Erro ao baixar relatório:', error);
      alert('Erro ao gerar relatório. Verifique se você está logado.');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Relatórios Gerenciais</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Selecionar Período</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="startDate">Data de Início</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="endDate">Data de Fim</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Relatório de Transações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Gere um relatório detalhado de todas as transações no período selecionado.</p>
            <Button onClick={() => downloadReport('transactions')} className="w-full">
              Baixar PDF
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Relatório de Financiamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Gere um relatório dos financiamentos iniciados no período selecionado.</p>
            <Button onClick={() => downloadReport('financings')} className="w-full">
              Baixar PDF
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Relatório de Metas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Gere um relatório das metas financeiras e seu progresso no período selecionado.</p>
            <Button onClick={() => downloadReport('goals')} className="w-full">
              Baixar PDF
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumo Financeiro</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Gere um resumo financeiro com totais de receitas, despesas, financiamentos e metas.</p>
            <Button onClick={() => downloadReport('summary')} className="w-full">
              Baixar PDF
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
