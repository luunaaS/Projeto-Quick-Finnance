import { useState } from 'react';
import { Header } from '../components/header';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    category: 'Primeiros Passos',
    question: 'Como criar uma conta no Quick Finnance?',
    answer: 'Para criar uma conta, acesse a página inicial e clique em "Registrar" ou "Criar Conta". Preencha o formulário com seu nome, e-mail e crie uma senha segura. Após clicar em "Registrar", sua conta será criada e você será direcionado para a tela de login.',
  },
  {
    category: 'Primeiros Passos',
    question: 'Como faço login no sistema?',
    answer: 'Na página de login, insira o e-mail e a senha que você cadastrou e clique em "Entrar". Você será levado ao Dashboard, a central de controle das suas finanças.',
  },
  {
    category: 'Primeiros Passos',
    question: 'O que é o Dashboard?',
    answer: 'O Dashboard é a tela principal do sistema onde você tem uma visão geral da sua saúde financeira. Nele você encontra o saldo atual, resumo do mês com gráficos, últimas transações e o progresso das suas metas financeiras.',
  },
  {
    category: 'Transações',
    question: 'Como adicionar uma nova transação?',
    answer: 'No menu principal, clique em "Transações" e depois em "Adicionar Nova". Selecione se é uma Receita ou Despesa, preencha o valor, descrição, categoria e data, e clique em "Salvar".',
  },
  {
    category: 'Transações',
    question: 'Posso editar ou excluir uma transação?',
    answer: 'Sim! Vá até a lista de transações, encontre a que deseja alterar e clique nos ícones de editar (lápis) ou excluir (lixeira). Você pode corrigir erros ou remover lançamentos quando necessário.',
  },
  {
    category: 'Transações',
    question: 'O que são categorias de transações?',
    answer: 'Categorias são classificações que ajudam a organizar suas transações, como "Alimentação", "Transporte", "Salário", etc. Elas facilitam a análise de onde seu dinheiro está sendo gasto ou recebido.',
  },
  {
    category: 'Transações',
    question: 'Posso criar minhas próprias categorias?',
    answer: 'Sim! Na área de Configurações, você pode gerenciar categorias: criar novas, editar ou excluir categorias existentes para organizar suas finanças do seu jeito.',
  },
  {
    category: 'Relatórios',
    question: 'Como gerar relatórios financeiros?',
    answer: 'Acesse a seção "Relatórios" no menu. Você pode filtrar por período (data início e fim), categoria ou tipo de transação (receitas, despesas ou todos). O sistema exibirá gráficos e tabelas com seus dados financeiros.',
  },
  {
    category: 'Relatórios',
    question: 'Posso exportar meus relatórios?',
    answer: 'Sim! Na página de relatórios, você encontrará botões para exportar suas transações em CSV, financiamentos em CSV ou um relatório completo em PDF. Esses arquivos podem ser salvos e analisados em outras ferramentas como Excel.',
  },
  {
    category: 'Relatórios',
    question: 'Quais tipos de gráficos estão disponíveis?',
    answer: 'O sistema oferece gráficos de pizza mostrando a distribuição de receitas e despesas por categoria, além de gráficos de barras comparando o total de receitas versus despesas no período selecionado.',
  },
  {
    category: 'Metas Financeiras',
    question: 'Como criar uma meta financeira?',
    answer: 'Vá até a seção "Metas" e clique em "Criar Nova Meta". Dê um nome para sua meta (ex: "Viagem de Férias"), defina o valor total que deseja alcançar e a data limite. O sistema mostrará seu progresso automaticamente.',
  },
  {
    category: 'Metas Financeiras',
    question: 'Como o sistema calcula o progresso das minhas metas?',
    answer: 'O sistema acompanha suas transações e calcula automaticamente quanto você já economizou em relação ao valor total da meta. O progresso é exibido em porcentagem e valor absoluto.',
  },
  {
    category: 'Metas Financeiras',
    question: 'Posso ter várias metas ao mesmo tempo?',
    answer: 'Sim! Você pode criar quantas metas desejar e acompanhar o progresso de todas elas simultaneamente no Dashboard e na seção de Metas.',
  },
  {
    category: 'Financiamentos',
    question: 'O que é a seção de Financiamentos?',
    answer: 'A seção de Financiamentos permite que você registre e acompanhe empréstimos, financiamentos de veículos, imóveis ou qualquer outro tipo de dívida parcelada. Você pode visualizar o saldo devedor, parcelas pagas e a pagar.',
  },
  {
    category: 'Financiamentos',
    question: 'Como adicionar um financiamento?',
    answer: 'Acesse "Financiamentos" no menu e clique em "Adicionar Novo". Preencha as informações como tipo de financiamento, valor total, taxa de juros, número de parcelas e data de início.',
  },
  {
    category: 'Segurança',
    question: 'Como alterar minha senha?',
    answer: 'Vá até a área de Perfil ou Configurações e procure pela opção "Alterar Senha". Digite sua senha atual e a nova senha duas vezes para confirmar. É recomendado alterar sua senha periodicamente para manter sua conta segura.',
  },
  {
    category: 'Segurança',
    question: 'Meus dados estão seguros?',
    answer: 'Sim! O Quick Finnance utiliza criptografia e boas práticas de segurança para proteger suas informações. Suas senhas são armazenadas de forma criptografada e suas transações são protegidas por autenticação.',
  },
  {
    category: 'Problemas Técnicos',
    question: 'O que fazer se esquecer minha senha?',
    answer: 'Na tela de login, procure pela opção "Esqueci minha senha". Você receberá instruções por e-mail para redefinir sua senha de forma segura.',
  },
  {
    category: 'Problemas Técnicos',
    question: 'Por que meus gráficos não aparecem?',
    answer: 'Os gráficos só são exibidos quando há dados disponíveis no período selecionado. Certifique-se de que você tem transações registradas e que os filtros de data estão corretos.',
  },
  {
    category: 'Problemas Técnicos',
    question: 'Como limpar os filtros de relatórios?',
    answer: 'Na página de Relatórios, você encontrará um botão "Limpar" ao lado do botão "Aplicar". Clique nele para resetar todos os filtros e visualizar todos os seus dados.',
  },
];

export function FAQ() {
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  const categories = ['Todos', ...Array.from(new Set(faqData.map(item => item.category)))];

  const filteredFAQ = selectedCategory === 'Todos' 
    ? faqData 
    : faqData.filter(item => item.category === selectedCategory);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <HelpCircle className="h-8 w-8" style={{ color: '#1E3A8A' }} />
            <h1 className="text-3xl font-bold" style={{ color: '#1E3A8A' }}>
              Perguntas Frequentes (FAQ)
            </h1>
          </div>
          <p className="text-gray-600">
            Encontre respostas para as dúvidas mais comuns sobre o Quick Finnance
          </p>
        </div>

        {/* Filtro por Categoria */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtrar por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === category
                      ? 'text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={
                    selectedCategory === category
                      ? { backgroundColor: '#1E3A8A' }
                      : {}
                  }
                >
                  {category}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Lista de Perguntas */}
        <div className="space-y-4">
          {filteredFAQ.map((item, index) => (
            <Card key={index} className="overflow-hidden">
              <button
                onClick={() => toggleItem(index)}
                className="w-full text-left p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="text-xs font-semibold px-2 py-1 rounded"
                        style={{ backgroundColor: '#DBEAFE', color: '#1E3A8A' }}
                      >
                        {item.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {item.question}
                    </h3>
                  </div>
                  <div className="flex-shrink-0">
                    {openItems.includes(index) ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </div>
              </button>
              
              {openItems.includes(index) && (
                <div className="px-6 pb-6">
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-gray-700 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {filteredFAQ.length === 0 && (
          <Card>
            <CardContent className="py-12">
              <p className="text-center text-gray-500">
                Nenhuma pergunta encontrada nesta categoria.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Informação Adicional */}
        <Card className="mt-8" style={{ borderColor: '#1E3A8A', borderWidth: '2px' }}>
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2" style={{ color: '#1E3A8A' }}>
                Não encontrou o que procurava?
              </h3>
              <p className="text-gray-600 mb-4">
                Se você ainda tem dúvidas, explore o sistema! O Quick Finnance foi feito para ser intuitivo e fácil de usar.
              </p>
              <p className="text-sm text-gray-500">
                Você também pode consultar o Manual do Usuário completo na documentação do sistema.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
