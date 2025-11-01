import { useState, useEffect } from 'react';
import { Header } from '../components/header';
import { ReportFilters } from '../components/report-filters';
import { ReportSummaryCards } from '../components/report-summary';
import { ReportCharts } from '../components/report-charts';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { reportsService, type ReportRequest, type ReportSummary } from '../services/reports.service';
import { toast } from 'sonner';

export function Reports() {
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<ReportRequest>({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    category: '',
    type: 'ALL',
  });

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    setLoading(true);
    try {
      const [summaryData, transactionsData] = await Promise.all([
        reportsService.getSummary(filters),
        reportsService.getTransactions(filters),
      ]);
      setSummary(summaryData);
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Erro ao carregar relatório:', error);
      toast.error('Erro ao carregar dados do relatório');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    loadReportData();
  };

  const handleExportTransactionsCSV = async () => {
    try {
      await reportsService.exportTransactionsCSV(filters);
      toast.success('Transações exportadas com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar transações:', error);
      toast.error('Erro ao exportar transações');
    }
  };

  const handleExportFinancingsCSV = async () => {
    try {
      await reportsService.exportFinancingsCSV();
      toast.success('Financiamentos exportados com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar financiamentos:', error);
      toast.error('Erro ao exportar financiamentos');
    }
  };

  const handleExportPDF = async () => {
    try {
      await reportsService.exportPDF(filters);
      toast.success('Relatório PDF exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao exportar PDF');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold" style={{ color: '#1E3A8A' }}>
            Relatórios Financeiros
          </h1>
          <p className="text-gray-600 mt-2">
            Visualize e exporte seus dados financeiros
          </p>
        </div>

        {/* Filtros */}
        <div className="mb-6">
          <ReportFilters onFilterChange={handleFilterChange} />
        </div>

        {/* Botões de Exportação */}
        <div className="mb-6 flex flex-wrap gap-3">
          <Button
            onClick={handleExportTransactionsCSV}
            variant="outline"
            className="flex items-center gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Exportar Transações (CSV)
          </Button>
          <Button
            onClick={handleExportFinancingsCSV}
            variant="outline"
            className="flex items-center gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Exportar Financiamentos (CSV)
          </Button>
          <Button
            onClick={handleExportPDF}
            variant="outline"
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Exportar Relatório (PDF)
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Carregando dados...</p>
          </div>
        ) : (
          <>
            {/* Cards de Resumo */}
            <div className="mb-6">
              <ReportSummaryCards summary={summary} />
            </div>

            {/* Gráficos */}
            <div className="mb-6">
              <ReportCharts summary={summary} />
            </div>

            {/* Tabela de Transações */}
            <Card>
              <CardHeader>
                <CardTitle>Transações Detalhadas</CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    Nenhuma transação encontrada para o período selecionado
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Categoria</TableHead>
                          <TableHead>Descrição</TableHead>
                          <TableHead className="text-right">Valor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell>{formatDate(transaction.date)}</TableCell>
                            <TableCell>
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  transaction.type === 'INCOME'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {transaction.type === 'INCOME' ? 'Receita' : 'Despesa'}
                              </span>
                            </TableCell>
                            <TableCell>{transaction.category}</TableCell>
                            <TableCell>{transaction.description}</TableCell>
                            <TableCell
                              className="text-right font-medium"
                              style={{
                                color: transaction.type === 'INCOME' ? '#16a34a' : '#dc2626',
                              }}
                            >
                              {formatCurrency(transaction.amount)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
