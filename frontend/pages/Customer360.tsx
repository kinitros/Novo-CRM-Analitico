import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Star,
  Heart,
  Target,
  Activity,
  BarChart3,
  PieChart,
  Clock,
  MapPin,
  Tag,
  ArrowLeft,
  RefreshCw,
  Download
} from 'lucide-react';

interface CustomerMetrics {
  totalCompras: number;
  valorTotalGasto: number;
  ticketMedio: number;
  frequenciaCompras: number;
  diasComoCliente: number;
  scoreSatisfacao: number;
  valorVitalicioProjetado: number;
}

interface CustomerBehavior {
  ultimaCompra: string | null;
  primeiraCompra: string | null;
  diasUltimaCompra: number;
  riscoChurn: 'Baixo' | 'Médio' | 'Alto';
  produtosPreferidos: Record<string, { quantidade: number; valor: number }>;
}

interface CustomerRecommendations {
  proximaAcao: string;
  produtoSugerido: string;
  melhorDiaContato: string;
  campanhaRecomendada: string;
}

interface Customer360Data {
  cliente: {
    _id: string;
    nome: string;
    email: string;
    telefone: string;
    createdAt: string;
    updatedAt: string;
  };
  metricas: CustomerMetrics;
  comportamento: CustomerBehavior;
  historico: {
    vendas: any[];
    envios: any[];
  };
  recomendacoes: CustomerRecommendations;
  segmento: string;
  previsoes: {
    proximaCompra: string;
    valorProximaCompra: number;
    probabilidadeCompra: number;
  };
}

const Customer360: React.FC = () => {
  const { email } = useParams<{ email: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<Customer360Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    if (!email) {
      setError('Email do cliente não fornecido');
      setLoading(false);
      return;
    }

    try {
      setRefreshing(true);
      const response = await fetch(`https://prime.top1midia.com/crm-proxy.php/crm/customer-360?email=${encodeURIComponent(email)}`);
      if (!response.ok) {
        throw new Error('Falha ao carregar dados do cliente');
      }
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [email]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getChurnRiskColor = (risk: string) => {
    switch (risk) {
      case 'Alto': return 'text-red-600 bg-red-100 border-red-200';
      case 'Médio': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'Baixo': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case 'Champion': return 'text-purple-600 bg-purple-100 border-purple-200';
      case 'Loyal': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'Potential': return 'text-green-600 bg-green-100 border-green-200';
      case 'At Risk': return 'text-red-600 bg-red-100 border-red-200';
      case 'Novo': return 'text-gray-600 bg-gray-100 border-gray-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getSatisfactionIcon = (score: number) => {
    if (score >= 90) return <Star className="w-5 h-5 text-yellow-500" />;
    if (score >= 70) return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (score >= 50) return <Activity className="w-5 h-5 text-blue-500" />;
    return <AlertTriangle className="w-5 h-5 text-red-500" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando perfil completo do cliente...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <div className="space-x-4">
            <button
              onClick={() => navigate('/customers')}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Voltar aos Clientes
            </button>
            <button
              onClick={fetchData}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/customers')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <User className="w-8 h-8 text-blue-600" />
                  Análise 360° do Cliente
                </h1>
                <p className="text-gray-600 mt-1">Visão completa e insights preditivos</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={fetchData}
                disabled={refreshing}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Atualizar
              </button>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Exportar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Perfil do Cliente */}
        <div className="bg-white rounded-xl p-6 shadow-sm border mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{data.cliente.nome}</h2>
                <div className="flex items-center gap-4 mt-2 text-gray-600">
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    <span>{data.cliente.email}</span>
                  </div>
                  {data.cliente.telefone && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      <span>{data.cliente.telefone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Cliente desde {formatDate(data.cliente.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getSegmentColor(data.segmento)}`}>
                {data.segmento}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getChurnRiskColor(data.comportamento.riscoChurn)}`}>
                Risco: {data.comportamento.riscoChurn}
              </span>
            </div>
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Gasto</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(data.metricas.valorTotalGasto)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {data.metricas.totalCompras} compras
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Ticket Médio</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(data.metricas.ticketMedio)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Por compra
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Valor Vitalício</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(data.metricas.valorVitalicioProjetado)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Projetado
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Satisfação</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {data.metricas.scoreSatisfacao.toFixed(1)}%
                </p>
                <div className="flex items-center mt-1">
                  {getSatisfactionIcon(data.metricas.scoreSatisfacao)}
                  <span className="text-sm text-gray-500 ml-1">
                    {data.metricas.scoreSatisfacao >= 90 ? 'Excelente' :
                     data.metricas.scoreSatisfacao >= 70 ? 'Boa' :
                     data.metricas.scoreSatisfacao >= 50 ? 'Regular' : 'Baixa'}
                  </span>
                </div>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Heart className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Comportamento do Cliente */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" />
                Comportamento de Compra
              </h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Última Compra:</span>
                <span className="font-medium">{formatDate(data.comportamento.ultimaCompra)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Primeira Compra:</span>
                <span className="font-medium">{formatDate(data.comportamento.primeiraCompra)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Dias sem Comprar:</span>
                <span className="font-medium">{Math.round(data.comportamento.diasUltimaCompra)} dias</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Frequência:</span>
                <span className="font-medium">{data.metricas.frequenciaCompras.toFixed(1)} compras/mês</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Tempo como Cliente:</span>
                <span className="font-medium">{Math.round(data.metricas.diasComoCliente)} dias</span>
              </div>
            </div>
          </div>

          {/* Produtos Preferidos */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Produtos Preferidos
              </h3>
            </div>
            <div className="space-y-3">
              {Object.entries(data.comportamento.produtosPreferidos).slice(0, 5).map(([produto, stats], index) => (
                <div key={produto} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <span className="font-medium text-gray-900 truncate">{produto}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(stats.valor)}</p>
                    <p className="text-sm text-gray-500">{stats.quantidade} unidades</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Previsões e Recomendações */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Previsões */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-green-500" />
                Previsões de IA
              </h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-green-800 font-medium">Próxima Compra</span>
                  <span className="text-green-600 text-sm">{data.previsoes.probabilidadeCompra}% probabilidade</span>
                </div>
                <p className="text-green-700">{data.previsoes.proximaCompra}</p>
                <p className="text-green-600 text-sm mt-1">
                  Valor estimado: {formatCurrency(data.previsoes.valorProximaCompra)}
                </p>
              </div>
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-800 font-medium">Melhor Momento para Contato</span>
                </div>
                <p className="text-blue-700">{data.recomendacoes.melhorDiaContato}</p>
              </div>
            </div>
          </div>

          {/* Recomendações */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Tag className="w-5 h-5 text-purple-500" />
                Recomendações Estratégicas
              </h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-purple-600" />
                  <span className="text-purple-800 font-medium">Próxima Ação</span>
                </div>
                <p className="text-purple-700">{data.recomendacoes.proximaAcao}</p>
              </div>
              
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-yellow-600" />
                  <span className="text-yellow-800 font-medium">Produto Sugerido</span>
                </div>
                <p className="text-yellow-700">{data.recomendacoes.produtoSugerido}</p>
              </div>
              
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-indigo-600" />
                  <span className="text-indigo-800 font-medium">Campanha Recomendada</span>
                </div>
                <p className="text-indigo-700">{data.recomendacoes.campanhaRecomendada}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Histórico Recente */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-gray-500" />
              Histórico de Transações
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Data</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Produtos</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Valor</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.historico.vendas.slice(0, 10).map((venda, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-600">
                      {formatDate(venda.data)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-gray-900 font-medium">
                        {venda.produtos?.map((p: any) => p.nome).join(', ') || 'N/A'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-gray-900">
                      {formatCurrency(venda.valorTotal || 0)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        venda.status === 'Concluído' ? 'bg-green-100 text-green-800' :
                        venda.status === 'Pendente' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {venda.status || 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Customer360;