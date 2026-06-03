import { useState } from 'react';
import { ChevronDown, HelpCircle, LayoutDashboard, ListChecks, CreditCard, PieChart } from 'lucide-react';

interface AccordionItemProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

const AccordionItem = ({ title, icon, children, isOpen, onToggle }: AccordionItemProps) => {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-[#1E3A8A]">{icon}</span>}
          <h3 className="font-semibold text-left">{title}</h3>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-[#6B7280] transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      {isOpen && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          {children}
        </div>
      )}
    </div>
  );
};

export function HelpPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <HelpCircle className="w-8 h-8 text-[#1E3A8A]" />
          <h1 className="text-[#1E3A8A]">Manual do Usuário - QFin</h1>
        </div>
        <p className="text-[#6B7280]">
          Bem-vindo ao QFin! Este guia vai ajudá-lo a aproveitar ao máximo todas as funcionalidades
          do sistema de gerenciamento financeiro pessoal.
        </p>
      </div>

      {/* Getting Started */}
      <div className="mb-6">
        <h2 className="text-[#1E3A8A] mb-4">Começando</h2>
        <div className="space-y-3">
          <AccordionItem
            title="O que é o QFin?"
            icon={<HelpCircle className="w-5 h-5" />}
            isOpen={openIndex === 0}
            onToggle={() => toggleAccordion(0)}
          >
            <div className="space-y-3">
              <p className="text-[#6B7280]">
                O QFin é um sistema completo de gerenciamento financeiro pessoal que permite
                controlar suas receitas, despesas e financiamentos de forma intuitiva e visual.
              </p>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="font-semibold mb-2 text-[#1E3A8A]">Principais recursos:</h4>
                <ul className="list-disc list-inside space-y-1 text-[#6B7280]">
                  <li>Dashboard com visão geral de suas finanças (incluindo recorrentes e multi-moeda em BRL)</li>
                  <li>Registro de transações (receitas e despesas)</li>
                  <li>Gerenciamento de financiamentos</li>
                  <li>Relatórios e gráficos financeiros com filtros e exportações</li>
                  <li>Configurações de notificações centralizadas no Perfil</li>
                </ul>
              </div>
            </div>
          </AccordionItem>

          <AccordionItem
            title="Entendendo as cores do sistema"
            icon={<HelpCircle className="w-5 h-5" />}
            isOpen={openIndex === 1}
            onToggle={() => toggleAccordion(1)}
          >
            <div className="space-y-3">
              <p className="text-[#6B7280] mb-4">
                O QFin utiliza um sistema de cores intuitivo para facilitar a identificação de informações:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200">
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: '#1E3A8A' }}></div>
                  <div>
                    <div className="font-semibold">Azul Corporativo</div>
                    <div className="text-sm text-[#6B7280]">Elementos principais</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200">
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: '#059669' }}></div>
                  <div>
                    <div className="font-semibold">Verde Sucesso</div>
                    <div className="text-sm text-[#6B7280]">Receitas e ganhos</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200">
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: '#DC2626' }}></div>
                  <div>
                    <div className="font-semibold">Vermelho Alerta</div>
                    <div className="text-sm text-[#6B7280]">Despesas e alertas</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200">
                  <div className="w-6 h-6 rounded border border-gray-300" style={{ backgroundColor: '#6B7280' }}></div>
                  <div>
                    <div className="font-semibold">Cinza Neutro</div>
                    <div className="text-sm text-[#6B7280]">Textos secundários</div>
                  </div>
                </div>
              </div>
            </div>
          </AccordionItem>
        </div>
      </div>

      {/* Dashboard */}
      <div className="mb-6">
        <h2 className="text-[#1E3A8A] mb-4">Funcionalidades</h2>
        <div className="space-y-3">
          <AccordionItem
            title="Dashboard - Visão Geral"
            icon={<LayoutDashboard className="w-5 h-5" />}
            isOpen={openIndex === 2}
            onToggle={() => toggleAccordion(2)}
          >
            <div className="space-y-3">
              <p className="text-[#6B7280]">
                O Dashboard é a página inicial do sistema, oferecendo uma visão completa de sua situação financeira atual.
              </p>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="font-semibold mb-3 text-[#1E3A8A]">O que você encontra no Dashboard:</h4>
                
                <div className="space-y-3">
                  <div>
                    <div className="font-semibold text-sm mb-1">📊 Cards de Resumo</div>
                    <p className="text-sm text-[#6B7280]">
                      Três cards principais mostram: <span className="text-[#059669]">Total de Receitas</span>, 
                      <span className="text-[#DC2626]"> Total de Despesas</span> e 
                      <span className="text-[#1E3A8A]"> Saldo Atual</span> (receitas - despesas).
                    </p>
                  </div>
                  
                  <div>
                    <div className="font-semibold text-sm mb-1">📈 Gráfico de Evolução</div>
                    <p className="text-sm text-[#6B7280]">
                      Visualize a evolução de suas receitas e despesas ao longo do tempo, facilitando a identificação de padrões.
                    </p>
                  </div>
                  
                  <div>
                    <div className="font-semibold text-sm mb-1">🔄 Transações Recentes</div>
                    <p className="text-sm text-[#6B7280]">
                      Lista das últimas transações registradas, incluindo transações recorrentes ativas e multi-moeda convertidas para BRL.
                    </p>
                  </div>
                  
                  <div>
                    <div className="font-semibold text-sm mb-1">💳 Status dos Financiamentos</div>
                    <p className="text-sm text-[#6B7280]">
                      Resumo dos seus financiamentos ativos, mostrando valor total, saldo devedor e parcela mensal.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[#EFF6FF] p-4 rounded-lg border border-[#1E3A8A]/20">
                <div className="font-semibold text-[#1E3A8A] mb-2">💡 Dica:</div>
                <p className="text-sm text-[#6B7280]">
                  Use o ícone de cifrão (QFin) no topo para voltar rapidamente ao Dashboard de qualquer tela.
                </p>
              </div>
            </div>
          </AccordionItem>

          <AccordionItem
            title="Transações - Registre Receitas e Despesas"
            icon={<ListChecks className="w-5 h-5" />}
            isOpen={openIndex === 3}
            onToggle={() => toggleAccordion(3)}
          >
            <div className="space-y-3">
              <p className="text-[#6B7280]">
                A página de Transações permite registrar e gerenciar todas as suas movimentações financeiras.
              </p>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="font-semibold mb-3 text-[#1E3A8A]">Como adicionar uma transação:</h4>
                
                <ol className="list-decimal list-inside space-y-2 text-[#6B7280]">
                  <li>Clique no botão "Nova Transação" ou "Adicionar Receita/Despesa"</li>
                  <li>Selecione o tipo: <span className="text-[#059669] font-semibold">Receita</span> ou <span className="text-[#DC2626] font-semibold">Despesa</span></li>
                  <li>Preencha o valor da transação</li>
                  <li>Escolha ou digite uma categoria (ex: Salário, Alimentação, Transporte)</li>
                  <li>Adicione uma descrição para lembrar do que se trata</li>
                  <li>Selecione a data da transação</li>
                  <li>Clique em "Salvar" ou "Adicionar"</li>
                </ol>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="font-semibold mb-3 text-[#1E3A8A]">Gerenciando transações:</h4>
                
                <div className="space-y-2 text-sm text-[#6B7280]">
                  <p>• <strong>Visualizar:</strong> Todas as transações aparecem em lista ordenada por data</p>
                  <p>• <strong>Filtrar:</strong> Use os filtros para ver apenas receitas, despesas ou períodos específicos</p>
                  <p>• <strong>Editar:</strong> Clique no ícone de edição para modificar uma transação</p>
                  <p>• <strong>Excluir:</strong> Clique no ícone de lixeira para remover uma transação</p>
                </div>
              </div>

              <div className="bg-[#FEF3C7] p-4 rounded-lg border border-[#F59E0B]/20">
                <div className="font-semibold text-[#92400E] mb-2">⚠️ Atenção:</div>
                <p className="text-sm text-[#78350F]">
                  Seja consistente ao categorizar suas transações. Isso ajudará na geração de relatórios mais precisos!
                </p>
              </div>
            </div>
          </AccordionItem>

          <AccordionItem
            title="Financiamentos - Controle suas Dívidas"
            icon={<CreditCard className="w-5 h-5" />}
            isOpen={openIndex === 4}
            onToggle={() => toggleAccordion(4)}
          >
            <div className="space-y-3">
              <p className="text-[#6B7280]">
                Gerencie todos os seus financiamentos em um só lugar: imóveis, veículos, empréstimos e muito mais.
              </p>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="font-semibold mb-3 text-[#1E3A8A]">Como adicionar um financiamento:</h4>
                
                <ol className="list-decimal list-inside space-y-2 text-[#6B7280]">
                  <li>Clique no botão "Novo Financiamento"</li>
                  <li>Digite o nome/descrição (ex: "Financiamento do Apartamento")</li>
                  <li>Informe o valor total do financiamento</li>
                  <li>Digite o saldo devedor atual</li>
                  <li>Informe o valor da parcela mensal</li>
                  <li>Selecione o tipo (Imóvel, Veículo, Empréstimo, etc.)</li>
                  <li>Defina a data de término prevista</li>
                  <li>Clique em "Salvar"</li>
                </ol>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="font-semibold mb-3 text-[#1E3A8A]">Informações exibidas:</h4>
                
                <div className="space-y-2 text-sm text-[#6B7280]">
                  <p>• <strong>Progresso:</strong> Barra visual mostrando quanto já foi pago</p>
                  <p>• <strong>Saldo devedor:</strong> Quanto ainda falta pagar</p>
                  <p>• <strong>Parcela mensal:</strong> Valor fixo que você paga mensalmente</p>
                  <p>• <strong>Data de término:</strong> Quando o financiamento será quitado</p>
                  <p>• <strong>Percentual pago:</strong> Porcentagem do total já quitado</p>
                </div>
              </div>

              <div className="bg-[#EFF6FF] p-4 rounded-lg border border-[#1E3A8A]/20">
                <div className="font-semibold text-[#1E3A8A] mb-2">💡 Dica:</div>
                <p className="text-sm text-[#6B7280]">
                  Atualize o saldo devedor mensalmente após pagar as parcelas para ter dados precisos!
                </p>
              </div>
            </div>
          </AccordionItem>

          <AccordionItem
            title="Relatórios - Análise Detalhada"
            icon={<PieChart className="w-5 h-5" />}
            isOpen={openIndex === 5}
            onToggle={() => toggleAccordion(5)}
          >
            <div className="space-y-3">
              <p className="text-[#6B7280]">
                A página de Relatórios oferece análises aprofundadas de suas finanças com gráficos e estatísticas.
              </p>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="font-semibold mb-3 text-[#1E3A8A]">Tipos de relatórios disponíveis:</h4>
                
                <div className="space-y-3">
                  <div>
                    <div className="font-semibold text-sm mb-1">📊 Gastos por Categoria</div>
                    <p className="text-sm text-[#6B7280]">
                      Gráfico de pizza mostrando a distribuição percentual de suas despesas por categoria.
                      Identifique onde você gasta mais!
                    </p>
                  </div>
                  
                  <div>
                    <div className="font-semibold text-sm mb-1">📈 Evolução Mensal</div>
                    <p className="text-sm text-[#6B7280]">
                      Gráfico de linhas comparando receitas vs despesas ao longo dos meses.
                      Acompanhe tendências e padrões.
                    </p>
                  </div>
                  
                  <div>
                    <div className="font-semibold text-sm mb-1">📋 Balanço por Período</div>
                    <p className="text-sm text-[#6B7280]">
                      Selecione um período específico e veja um resumo detalhado de todas as movimentações.
                    </p>
                  </div>
                  
                  <div>
                    <div className="font-semibold text-sm mb-1">💰 Taxa de Poupança</div>
                    <p className="text-sm text-[#6B7280]">
                      Descubra qual percentual de sua receita você consegue poupar mensalmente.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="font-semibold mb-3 text-[#1E3A8A]">Como usar os relatórios:</h4>
                
                <ol className="list-decimal list-inside space-y-2 text-sm text-[#6B7280]">
                  <li>Use os filtros de período para analisar 1, 3, 6 meses ou 1 ano</li>
                  <li>Defina a granularidade por dia, mês ou ano para ajustar o nível de detalhe</li>
                  <li>Use filtro por categoria para focar em grupos específicos de gastos/receitas</li>
                  <li>Compare diferentes períodos para identificar melhorias</li>
                  <li>Exporte os relatórios em CSV e PDF com os filtros atualmente selecionados</li>
                </ol>
              </div>
            </div>
          </AccordionItem>
        </div>
      </div>

      {/* FAQ */}
      <div className="mb-6">
        <h2 className="text-[#1E3A8A] mb-4">Perguntas Frequentes (FAQ)</h2>
        <div className="space-y-3">
          <AccordionItem
            title="Como os dados são calculados no Dashboard?"
            icon={<HelpCircle className="w-5 h-5" />}
            isOpen={openIndex === 6}
            onToggle={() => toggleAccordion(6)}
          >
            <div className="space-y-2 text-[#6B7280]">
              <p>
                O Dashboard realiza cálculos automáticos baseados em todas as transações registradas:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                <li><strong>Total de Receitas:</strong> Soma de todas as transações do tipo "receita"</li>
                <li><strong>Total de Despesas:</strong> Soma de todas as transações do tipo "despesa"</li>
                <li><strong>Saldo:</strong> Receitas menos Despesas</li>
              </ul>
              <p className="text-sm">
                Os valores são atualizados automaticamente sempre que você adiciona, edita ou remove uma transação.
                O Dashboard também considera transações recorrentes ativas e transações multi-moeda convertidas para BRL.
              </p>
            </div>
          </AccordionItem>

          <AccordionItem
            title="Posso editar ou excluir transações antigas?"
            icon={<HelpCircle className="w-5 h-5" />}
            isOpen={openIndex === 7}
            onToggle={() => toggleAccordion(7)}
          >
            <div className="space-y-2 text-[#6B7280]">
              <p>
                Sim! Você tem controle total sobre suas transações:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                <li>Acesse a página de Transações</li>
                <li>Localize a transação que deseja modificar ou remover</li>
                <li>Use o ícone de lápis para editar ou a lixeira para excluir</li>
                <li>Os totais e gráficos serão atualizados automaticamente</li>
              </ul>
            </div>
          </AccordionItem>

          <AccordionItem
            title="Como organizar melhor minhas categorias?"
            icon={<HelpCircle className="w-5 h-5" />}
            isOpen={openIndex === 8}
            onToggle={() => toggleAccordion(8)}
          >
            <div className="space-y-2 text-[#6B7280]">
              <p>
                Uma boa organização de categorias facilita a análise de suas finanças:
              </p>
              <div className="bg-white p-3 rounded-lg border border-gray-200 mt-2">
                <p className="font-semibold text-sm mb-2 text-[#1E3A8A]">Categorias sugeridas para Despesas:</p>
                <div className="text-sm grid grid-cols-2 gap-1">
                  <span>• Alimentação</span>
                  <span>• Transporte</span>
                  <span>• Moradia</span>
                  <span>• Saúde</span>
                  <span>• Educação</span>
                  <span>• Lazer</span>
                  <span>• Vestuário</span>
                  <span>• Contas</span>
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-200 mt-2">
                <p className="font-semibold text-sm mb-2 text-[#1E3A8A]">Categorias sugeridas para Receitas:</p>
                <div className="text-sm grid grid-cols-2 gap-1">
                  <span>• Salário</span>
                  <span>• Freelance</span>
                  <span>• Investimentos</span>
                  <span>• Bônus</span>
                  <span>• Vendas</span>
                  <span>• Outros</span>
                </div>
              </div>
            </div>
          </AccordionItem>

          <AccordionItem
            title="Qual a diferença entre Dashboard e Relatórios?"
            icon={<HelpCircle className="w-5 h-5" />}
            isOpen={openIndex === 9}
            onToggle={() => toggleAccordion(9)}
          >
            <div className="space-y-2 text-[#6B7280]">
              <p>
                Embora ambos exibam informações financeiras, têm propósitos diferentes:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <div className="font-semibold text-[#1E3A8A] mb-2">📊 Dashboard</div>
                  <ul className="text-sm space-y-1">
                    <li>• Visão rápida e geral</li>
                    <li>• Dados do período atual</li>
                    <li>• Informações resumidas</li>
                    <li>• Uso diário</li>
                  </ul>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <div className="font-semibold text-[#1E3A8A] mb-2">📈 Relatórios</div>
                  <ul className="text-sm space-y-1">
                    <li>• Análise aprofundada</li>
                    <li>• Múltiplos períodos</li>
                    <li>• Gráficos detalhados</li>
                    <li>• Planejamento mensal</li>
                  </ul>
                </div>
              </div>
            </div>
          </AccordionItem>

          <AccordionItem
            title="O sistema calcula juros dos financiamentos?"
            icon={<HelpCircle className="w-5 h-5" />}
            isOpen={openIndex === 10}
            onToggle={() => toggleAccordion(10)}
          >
            <div className="space-y-2 text-[#6B7280]">
              <p>
                Atualmente, o sistema registra e acompanha os financiamentos de forma manual:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                <li>Você informa o saldo devedor atual</li>
                <li>O sistema calcula o percentual já pago</li>
                <li>Não há cálculo automático de juros ou amortização</li>
                <li>Recomendamos atualizar o saldo devedor mensalmente</li>
              </ul>
              <div className="bg-[#EFF6FF] p-3 rounded-lg border border-[#1E3A8A]/20 mt-3">
                <p className="text-sm">
                  <strong>Dica:</strong> Para calcular juros e amortizações, consulte seu contrato ou use as informações 
                  fornecidas pela instituição financeira, depois atualize o saldo devedor no sistema.
                </p>
              </div>
            </div>
          </AccordionItem>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-gradient-to-r from-[#1E3A8A] to-[#1E40AF] text-white rounded-lg p-6">
        <h2 className="mb-4">🎯 Dicas para aproveitar melhor o QFin</h2>
        <ul className="space-y-2 text-sm">
          <li>✅ Registre todas as transações imediatamente para não esquecer</li>
          <li>✅ Revise seus dados semanalmente no Dashboard (incluindo recorrentes e multi-moeda em BRL)</li>
          <li>✅ Use categorias consistentes para facilitar análises</li>
          <li>✅ Aplique filtros de granularidade e categoria nos relatórios antes de exportar CSV/PDF</li>
          <li>✅ Ajuste notificações na seção de Perfil para manter alertas relevantes</li>
          <li>✅ Use o ícone de cifrão no topo para voltar rapidamente ao Dashboard</li>
        </ul>
      </div>

      {/* Support */}
      <div className="mt-6 text-center p-6 bg-gray-100 rounded-lg">
        <HelpCircle className="w-8 h-8 text-[#1E3A8A] mx-auto mb-3" />
        <h3 className="text-[#1E3A8A] mb-2">Precisa de mais ajuda?</h3>
        <p className="text-[#6B7280] text-sm">
          Este manual cobre as principais funcionalidades do QFin. Para questões específicas
          ou sugestões de melhorias, explore cada funcionalidade do sistema na prática!
        </p>
      </div>
    </div>
  );
}
