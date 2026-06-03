import { Bell, Globe, TrendingUp, Repeat, CheckCircle, Calendar } from 'lucide-react';
import { Card } from './ui/simple-card';

interface Requirement {
  id: string;
  title: string;
  description: string;
  justification: string;
  priority: 'Alta' | 'Média' | 'Baixa';
  status: 'Implementado' | 'Em Desenvolvimento';
  icon: React.ReactNode;
  color: string;
  features: string[];
  implementationDate: string;
}

export function RequirementsOverview() {
  const requirements: Requirement[] = [
    {
      id: 'RF-01',
      title: 'Notificações Personalizadas e Lembretes',
      description: 'Sistema de notificações in-app com alertas personalizados sobre contas, orçamentos, metas e transações suspeitas.',
      justification: 'Mantém o usuário engajado e informado sobre sua situação financeira, ajudando a evitar atrasos em pagamentos e a manter o controle sobre seus objetivos.',
      priority: 'Média',
      status: 'Implementado',
      icon: <Bell className="h-6 w-6" />,
      color: '#DC2626',
      features: [
        'Alertas de contas próximas do vencimento',
        'Notificações de orçamentos excedidos',
        'Avisos de metas financeiras alcançadas',
        'Detecção de transações incomuns',
        'Configurações personalizadas (E-mail, Push, In-App)',
        'Controle de antecedência de lembretes'
      ],
      implementationDate: '25 de fevereiro de 2026'
    },
    {
      id: 'RF-02',
      title: 'Suporte Multi-moeda',
      description: 'Registro de transações em múltiplas moedas com conversão automática para moeda base escolhida.',
      justification: 'Atende usuários que lidam com finanças em múltiplas moedas (viagens, investimentos internacionais, etc.), oferecendo uma visão financeira global.',
      priority: 'Média',
      status: 'Implementado',
      icon: <Globe className="h-6 w-6" />,
      color: '#F59E0B',
      features: [
        'Suporte para 8 moedas principais (BRL, USD, EUR, GBP, JPY, CAD, AUD, CHF)',
        'Conversão automática com taxas atualizadas',
        'Seleção de moeda base personalizável',
        'Resumo consolidado em moeda base',
        'Visualização de saldo por moeda',
        'Histórico de transações multi-moeda'
      ],
      implementationDate: '25 de fevereiro de 2026'
    },
    {
      id: 'RF-03',
      title: 'Módulo de Investimentos',
      description: 'Sistema completo para registro e acompanhamento de investimentos com diferentes tipos de ativos.',
      justification: 'Expande a capacidade de gestão financeira para além do controle de receitas e despesas, permitindo que o usuário monitore seu patrimônio de forma mais abrangente.',
      priority: 'Baixa',
      status: 'Implementado',
      icon: <TrendingUp className="h-6 w-6" />,
      color: '#059669',
      features: [
        'Suporte para Ações, Fundos, Renda Fixa e Criptomoedas',
        'Cálculo automático de rentabilidade',
        'Visualização de lucro/prejuízo em tempo real',
        'Distribuição de portfólio por tipo',
        'Histórico de compras e valores atuais',
        'Dashboard consolidado de investimentos'
      ],
      implementationDate: '25 de fevereiro de 2026'
    },
    {
      id: 'RF-04',
      title: 'Recorrência de Transações',
      description: 'Agendamento de receitas e despesas recorrentes com lançamento automático ou confirmação.',
      justification: 'Simplifica o registro de transações fixas e previsíveis, economizando tempo do usuário e reduzindo erros.',
      priority: 'Alta',
      status: 'Implementado',
      icon: <Repeat className="h-6 w-6" />,
      color: '#1E3A8A',
      features: [
        'Frequências: Diária, Semanal, Mensal e Anual',
        'Lançamento automático ou com confirmação',
        'Configuração de datas de início e término',
        'Pausa temporária de recorrências',
        'Previsão de próximos lançamentos',
        'Cálculo de impacto mensal'
      ],
      implementationDate: '25 de fevereiro de 2026'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Alta':
        return '#DC2626';
      case 'Média':
        return '#F59E0B';
      case 'Baixa':
        return '#059669';
      default:
        return '#6B7280';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#1E3A8A' }}>
          Requisitos Funcionais - Overview
        </h2>
        <p style={{ color: '#6B7280' }}>
          Visão geral dos novos requisitos implementados no Sistema QFin
        </p>
      </div>

      {/* Resumo Geral */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: '#6B7280' }}>Total de RFs</p>
              <p className="text-2xl font-bold" style={{ color: '#1E3A8A' }}>
                4
              </p>
            </div>
            <Calendar className="h-8 w-8" style={{ color: '#1E3A8A', opacity: 0.2 }} />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: '#6B7280' }}>Implementados</p>
              <p className="text-2xl font-bold" style={{ color: '#059669' }}>
                4
              </p>
            </div>
            <CheckCircle className="h-8 w-8" style={{ color: '#059669', opacity: 0.2 }} />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: '#6B7280' }}>Alta Prioridade</p>
              <p className="text-2xl font-bold" style={{ color: '#DC2626' }}>
                1
              </p>
            </div>
            <div 
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: '#DC2626' }}
            />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: '#6B7280' }}>Data Release</p>
              <p className="text-sm font-bold" style={{ color: '#1E3A8A' }}>
                25/02/2026
              </p>
            </div>
            <Calendar className="h-8 w-8" style={{ color: '#1E3A8A', opacity: 0.2 }} />
          </div>
        </Card>
      </div>

      {/* Lista Detalhada de Requisitos */}
      <div className="space-y-4">
        {requirements.map((req) => (
          <Card key={req.id} className="overflow-hidden">
            <div className="p-6">
              <div className="flex items-start gap-4">
                {/* Ícone */}
                <div
                  className="h-14 w-14 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${req.color}20`, color: req.color }}
                >
                  {req.icon}
                </div>

                {/* Conteúdo Principal */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-mono px-2 py-1 rounded" style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}>
                          {req.id}
                        </span>
                        <span 
                          className="text-xs px-2 py-1 rounded font-semibold"
                          style={{ 
                            backgroundColor: `${getPriorityColor(req.priority)}20`,
                            color: getPriorityColor(req.priority)
                          }}
                        >
                          Prioridade {req.priority}
                        </span>
                        <span 
                          className="text-xs px-2 py-1 rounded font-semibold flex items-center gap-1"
                          style={{ backgroundColor: '#05966920', color: '#059669' }}
                        >
                          <CheckCircle className="h-3 w-3" />
                          {req.status}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold mb-2" style={{ color: '#1E3A8A' }}>
                        {req.title}
                      </h3>
                      <p className="mb-3" style={{ color: '#6B7280' }}>
                        {req.description}
                      </p>
                    </div>
                  </div>

                  {/* Justificativa */}
                  <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: '#F9FAFB' }}>
                    <p className="text-sm font-semibold mb-1" style={{ color: '#1E3A8A' }}>
                      Justificativa:
                    </p>
                    <p className="text-sm" style={{ color: '#6B7280' }}>
                      {req.justification}
                    </p>
                  </div>

                  {/* Features */}
                  <div>
                    <p className="text-sm font-semibold mb-2" style={{ color: '#1E3A8A' }}>
                      Funcionalidades Implementadas:
                    </p>
                    <div className="grid gap-2 md:grid-cols-2">
                      {req.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: '#059669' }} />
                          <span className="text-sm" style={{ color: '#6B7280' }}>
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Data de Implementação */}
                  <div className="mt-4 pt-4 border-t flex items-center gap-2">
                    <Calendar className="h-4 w-4" style={{ color: '#6B7280' }} />
                    <span className="text-sm" style={{ color: '#6B7280' }}>
                      Histórico: {req.implementationDate}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Informação Adicional */}
      <Card className="p-6" style={{ backgroundColor: '#EFF6FF' }}>
        <div className="flex gap-3">
          <CheckCircle className="h-5 w-5 flex-shrink-0" style={{ color: '#1E3A8A' }} />
          <div>
            <h4 className="font-semibold mb-1" style={{ color: '#1E3A8A' }}>
              Status da Implementação
            </h4>
            <p className="text-sm" style={{ color: '#6B7280' }}>
              Todos os 4 requisitos funcionais foram implementados com sucesso e estão disponíveis para uso. 
              Cada funcionalidade foi desenvolvida com interface intuitiva, seguindo a paleta de cores do QFin 
              e com foco na experiência do usuário. As páginas incluem dados de exemplo para demonstração completa.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
