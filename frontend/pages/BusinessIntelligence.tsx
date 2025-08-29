import React, { useState, useEffect } from 'react';
import {
  Brain,
  TrendingUp,
  Users,
  Target,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Zap,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Lightbulb
} from 'lucide-react';

interface CohortData {
  [mesAquisicao: string]: {
    novos: number;
    ativos: number;
    receita: number;
  };
}

interface RFMSegment {
  count: number;
  revenue: number;
  avgRecency: number;
  avgRevenue: number;
}

interface RFMAnalysis {
  [segment: string]: RFMSegment;
}

interface VendaDiaria {
  data: string;
  vendas: number;
  receita: number;
}

interface Previsao {
  vendas: number;
  receita: number;
  confianca: string;
}

interface Insights {
  melhorSegmento: string;
  tendenciaVendas: string;
  oportunidadeChurn: string;
}

interface BusinessIntelligenceData {
  cohorts: CohortData;
  rfmAnalysis: RFMAnalysis;
  vendasDiarias: VendaDiaria[];
  previsoes: {
    proximoMes: Previsao;
  };
  insights: Insights;
}

const BusinessIntelligence: React.FC = () => {
  const [data, setData] = useState<BusinessIntelligenceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedView, setSelectedView] = useState<'cohorts' | 'rfm' | 'trends' | 'predictions'>('cohorts');

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const response = await fetch(`https://prime.top1midia.com/crm-proxy.php/crm/business-intelligence?period=${selectedPeriod}`);
      if (!response.ok) {
        throw new Error('Falha ao carregar dados de Business Intelligence');
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
  }, [selectedPeriod]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getSegmentColor = (segment: string) => {
    const colors: Record<string, string> = {
      'Champions': 'bg-green-100 text-green-800 border-green-200',
      'Loyal': 'bg-blue-100 text-blue-800 border-blue-200',
      'Potential': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'At Risk': 'bg-red-100 text-red-800 border-red-200',
      'New': 'bg-purple-100 text-purple-800 border-purple-200',
      'Outros': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[segment] || colors['Outros'];
  };

  const getTrendIcon = (trend: string) => {
    switch (trend.toLowerCase()) {
      case 'crescente':
        return <ArrowUpRight className="w-4 h-4 text-green-500" />;
      case 'declinante':
        return <ArrowDownRight className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence.toLowerCase()) {
      case 'alta': return 'text-green-600 bg-green-100';
      case 'média': return 'text-yellow-600 bg-yellow-100';
      case 'baixa': return 'text-red-600 bg-red-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processando análises de Business Intelligence...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Tentar Novamente
          </button>
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
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Brain className="w-8 h-8 text-purple-600" />
                Business Intelligence
              </h1>
              <p className="text-gray-600 mt-1">Análises avançadas e insights preditivos</p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="30">Últimos 30 dias</option>
                <option value="60">Últimos 60 dias</option>
                <option value="90">Últimos 90 dias</option>
                <option value="180">Últimos 6 meses</option>
              </select>
              <button
                onClick={fetchData}
                disabled={refreshing}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Atualizar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'cohorts', label: 'Análise de Cohort', icon: Users },
                { id: 'rfm', label: 'Segmentação RFM', icon: Target },
                { id: 'trends', label: 'Tendências', icon: TrendingUp },
                { id: 'predictions', label: 'Previsões', icon: Eye }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setSelectedView(id as any)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    selectedView === id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Insights Principais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Melhor Segmento</p>
                <p className="text-2xl font-bold mt-1">{data.insights.melhorSegmento}</p>
                <p className="text-green-100 text-sm mt-2">Maior potencial de receita</p>
              </div>
              <Target className="w-12 h-12 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Tendência de Vendas</p>
                <div className="flex items-center gap-2 mt-1">
                  {getTrendIcon(data.insights.tendenciaVendas)}
                  <p className="text-2xl font-bold">{data.insights.tendenciaVendas}</p>
                </div>
                <p className="text-blue-100 text-sm mt-2">Baseado nos últimos {selectedPeriod} dias</p>
              </div>
              <TrendingUp className="w-12 h-12 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Risco de Churn</p>
                <p className="text-2xl font-bold mt-1">{data.insights.oportunidadeChurn}</p>
                <p className="text-orange-100 text-sm mt-2">Necessita atenção imediata</p>
              </div>
              <AlertCircle className="w-12 h-12 text-orange-200" />
            </div>
          </div>
        </div>

        {/* Content based on selected view */}
        {selectedView === 'cohorts' && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  Análise de Cohort por Mês de Aquisição
                </h3>
                <button className="text-blue-600 hover:text-blue-700 flex items-center gap-2 text-sm">
                  <Download className="w-4 h-4" />
                  Exportar
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Mês de Aquisição</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Novos Clientes</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Clientes Ativos</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Taxa de Retenção</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Receita</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(data.cohorts).map(([mes, cohort]) => {
                      const retentionRate = cohort.novos > 0 ? (cohort.ativos / cohort.novos) * 100 : 0;
                      return (
                        <tr key={mes} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-900">{mes}</td>
                          <td className="py-3 px-4 text-right text-gray-600">{formatNumber(cohort.novos)}</td>
                          <td className="py-3 px-4 text-right text-gray-600">{formatNumber(cohort.ativos)}</td>
                          <td className="py-3 px-4 text-right">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              retentionRate >= 50 ? 'bg-green-100 text-green-800' :
                              retentionRate >= 25 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {formatPercentage(retentionRate)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-medium text-gray-900">
                            {formatCurrency(cohort.receita)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {selectedView === 'rfm' && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-500" />
                  Segmentação RFM (Recência, Frequência, Valor Monetário)
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(data.rfmAnalysis).map(([segment, data]) => (
                  <div key={segment} className={`p-6 rounded-lg border-2 ${getSegmentColor(segment)}`}>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-lg">{segment}</h4>
                      <span className="text-2xl font-bold">{formatNumber(data.count)}</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm opacity-75">Receita Total:</span>
                        <span className="font-medium">{formatCurrency(data.revenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm opacity-75">Receita Média:</span>
                        <span className="font-medium">{formatCurrency(data.avgRevenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm opacity-75">Recência Média:</span>
                        <span className="font-medium">{Math.round(data.avgRecency)} dias</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedView === 'trends' && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <LineChart className="w-5 h-5 text-green-500" />
                  Tendências de Vendas Diárias
                </h3>
              </div>
              <div className="h-64 flex items-end justify-between space-x-1">
                {data.vendasDiarias.slice(-30).map((dia, index) => {
                  const maxVendas = Math.max(...data.vendasDiarias.map(d => d.vendas));
                  const height = maxVendas > 0 ? (dia.vendas / maxVendas) * 100 : 0;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center group">
                      <div className="relative">
                        <div
                          className="bg-blue-500 hover:bg-blue-600 transition-colors rounded-t cursor-pointer"
                          style={{ height: `${Math.max(height, 2)}%`, minHeight: '2px', width: '100%' }}
                          title={`${dia.data}: ${dia.vendas} vendas, ${formatCurrency(dia.receita)}`}
                        ></div>
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {dia.vendas} vendas<br/>
                          {formatCurrency(dia.receita)}
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 mt-1 transform rotate-45 origin-left">
                        {new Date(dia.data).getDate()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {selectedView === 'predictions' && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-indigo-500" />
                  Previsões para o Próximo Mês
                </h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(data.previsoes.proximoMes.confianca)}`}>
                  Confiança: {data.previsoes.proximoMes.confianca}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="text-center">
                  <div className="bg-blue-100 p-6 rounded-lg">
                    <BarChart3 className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    <p className="text-sm text-blue-600 font-medium mb-2">Vendas Previstas</p>
                    <p className="text-3xl font-bold text-blue-900">
                      {formatNumber(data.previsoes.proximoMes.vendas)}
                    </p>
                    <p className="text-sm text-blue-600 mt-2">unidades</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-green-100 p-6 rounded-lg">
                    <DollarSign className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    <p className="text-sm text-green-600 font-medium mb-2">Receita Prevista</p>
                    <p className="text-3xl font-bold text-green-900">
                      {formatCurrency(data.previsoes.proximoMes.receita)}
                    </p>
                    <p className="text-sm text-green-600 mt-2">faturamento</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800 mb-2">Recomendações Baseadas em IA</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Foque em reativar clientes do segmento "At Risk" para aumentar a retenção</li>
                      <li>• Implemente campanhas de upsell para clientes "Champions" e "Loyal"</li>
                      <li>• Monitore de perto a tendência de vendas nos próximos 7 dias</li>
                      <li>• Considere ajustar estratégias de marketing baseadas na sazonalidade identificada</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessIntelligence;