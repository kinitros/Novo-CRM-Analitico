import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Target,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  Package,
  Zap,
  Eye,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface PipelineStage {
  name: string;
  count: number;
  value: number;
  conversionRate: number;
  avgTimeInStage: number;
}

interface ConversionFunnel {
  stage: string;
  visitors: number;
  conversions: number;
  conversionRate: number;
  dropoffRate: number;
}

interface SalesForecasting {
  period: string;
  predictedSales: number;
  predictedRevenue: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
}

interface SeasonalityData {
  month: string;
  sales: number;
  revenue: number;
  seasonalityIndex: number;
  trend: 'peak' | 'low' | 'normal';
}

interface ProductPerformance {
  productName: string;
  sales: number;
  revenue: number;
  growth: number;
  marketShare: number;
  profitMargin: number;
}

interface AdvancedSalesData {
  pipeline: PipelineStage[];
  conversionFunnel: ConversionFunnel[];
  forecasting: SalesForecasting[];
  seasonality: SeasonalityData[];
  productPerformance: ProductPerformance[];
  insights: {
    topBottleneck: string;
    bestPerformingStage: string;
    seasonalTrend: string;
    forecastAccuracy: number;
    recommendedActions: string[];
  };
}

const AdvancedSales: React.FC = () => {
  const [data, setData] = useState<AdvancedSalesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<'pipeline' | 'funnel' | 'forecast' | 'seasonality' | 'products'>('pipeline');
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const response = await fetch(`https://prime.top1midia.com/crm-proxy.php/crm/sales-pipeline?period=${selectedPeriod}`);
      if (!response.ok) {
        throw new Error('Falha ao carregar dados de vendas avançadas');
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
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUpRight className="w-4 h-4 text-green-500" />;
      case 'down': return <ArrowDownRight className="w-4 h-4 text-red-500" />;
      default: return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

  const getSeasonalityColor = (trend: string) => {
    switch (trend) {
      case 'peak': return 'bg-green-100 text-green-800 border-green-200';
      case 'low': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando análises avançadas de vendas...</p>
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
                <Target className="w-8 h-8 text-green-600" />
                Gestão de Vendas Avançada
              </h1>
              <p className="text-gray-600 mt-1">Pipeline, conversão, forecasting e análise de sazonalidade</p>
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
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Atualizar
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Exportar
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
                { id: 'pipeline', label: 'Pipeline de Vendas', icon: BarChart3 },
                { id: 'funnel', label: 'Funil de Conversão', icon: TrendingDown },
                { id: 'forecast', label: 'Previsões', icon: Eye },
                { id: 'seasonality', label: 'Sazonalidade', icon: Calendar },
                { id: 'products', label: 'Performance de Produtos', icon: Package }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setSelectedView(id as any)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    selectedView === id
                      ? 'border-green-500 text-green-600'
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
                <p className="text-green-100 text-sm font-medium">Gargalo Principal</p>
                <p className="text-2xl font-bold mt-1">{data.insights.topBottleneck}</p>
                <p className="text-green-100 text-sm mt-2">Necessita atenção imediata</p>
              </div>
              <AlertCircle className="w-12 h-12 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Melhor Estágio</p>
                <p className="text-2xl font-bold mt-1">{data.insights.bestPerformingStage}</p>
                <p className="text-blue-100 text-sm mt-2">Maior taxa de conversão</p>
              </div>
              <CheckCircle className="w-12 h-12 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Precisão do Forecast</p>
                <p className="text-2xl font-bold mt-1">{data.insights.forecastAccuracy.toFixed(1)}%</p>
                <p className="text-purple-100 text-sm mt-2">Confiabilidade das previsões</p>
              </div>
              <Target className="w-12 h-12 text-purple-200" />
            </div>
          </div>
        </div>

        {/* Content based on selected view */}
        {selectedView === 'pipeline' && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-green-500" />
                  Pipeline de Vendas por Estágio
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {data.pipeline.map((stage, index) => (
                  <div key={stage.name} className="p-6 bg-gray-50 rounded-lg border">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900">{stage.name}</h4>
                      <span className="text-2xl font-bold text-green-600">{stage.count}</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Valor Total:</span>
                        <span className="font-medium">{formatCurrency(stage.value)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Taxa de Conversão:</span>
                        <span className="font-medium text-green-600">{stage.conversionRate.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Tempo Médio:</span>
                        <span className="font-medium">{stage.avgTimeInStage.toFixed(1)} dias</span>
                      </div>
                    </div>
                    <div className="mt-4 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(stage.conversionRate, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedView === 'funnel' && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-blue-500" />
                  Funil de Conversão
                </h3>
              </div>
              <div className="space-y-4">
                {data.conversionFunnel.map((stage, index) => {
                  const width = (stage.visitors / data.conversionFunnel[0].visitors) * 100;
                  return (
                    <div key={stage.stage} className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{stage.stage}</h4>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-600">
                            {formatNumber(stage.visitors)} visitantes
                          </span>
                          <span className="text-sm font-medium text-green-600">
                            {stage.conversionRate.toFixed(1)}% conversão
                          </span>
                          {stage.dropoffRate > 0 && (
                            <span className="text-sm font-medium text-red-600">
                              {stage.dropoffRate.toFixed(1)}% abandono
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="bg-gray-200 rounded-lg h-12 relative overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-green-500 h-full rounded-lg transition-all duration-500 flex items-center justify-center"
                          style={{ width: `${width}%` }}
                        >
                          <span className="text-white font-medium">
                            {formatNumber(stage.conversions)} conversões
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {selectedView === 'forecast' && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-purple-500" />
                  Previsões de Vendas
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.forecasting.map((forecast, index) => (
                  <div key={forecast.period} className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900">{forecast.period}</h4>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(forecast.trend)}
                        <span className={`text-sm font-medium ${
                          forecast.trend === 'up' ? 'text-green-600' :
                          forecast.trend === 'down' ? 'text-red-600' : 'text-blue-600'
                        }`}>
                          {forecast.trend === 'up' ? 'Crescimento' :
                           forecast.trend === 'down' ? 'Declínio' : 'Estável'}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Vendas Previstas</p>
                        <p className="text-2xl font-bold text-gray-900">{formatNumber(forecast.predictedSales)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Receita Prevista</p>
                        <p className="text-xl font-bold text-green-600">{formatCurrency(forecast.predictedRevenue)}</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Confiança:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          forecast.confidence >= 80 ? 'bg-green-100 text-green-800' :
                          forecast.confidence >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {forecast.confidence.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedView === 'seasonality' && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-500" />
                  Análise de Sazonalidade
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.seasonality.map((month, index) => (
                  <div key={month.month} className="p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{month.month}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeasonalityColor(month.trend)}`}>
                        {month.trend === 'peak' ? 'Pico' : month.trend === 'low' ? 'Baixa' : 'Normal'}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Vendas:</span>
                        <span className="font-medium">{formatNumber(month.sales)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Receita:</span>
                        <span className="font-medium">{formatCurrency(month.revenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Índice Sazonal:</span>
                        <span className={`font-medium ${
                          month.seasonalityIndex > 1.2 ? 'text-green-600' :
                          month.seasonalityIndex < 0.8 ? 'text-red-600' : 'text-blue-600'
                        }`}>
                          {month.seasonalityIndex.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedView === 'products' && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-indigo-500" />
                  Performance de Produtos
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Produto</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Vendas</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Receita</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Crescimento</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Market Share</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Margem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.productPerformance.map((product, index) => (
                      <tr key={product.productName} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </span>
                            <span className="font-medium text-gray-900">{product.productName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-medium">{formatNumber(product.sales)}</td>
                        <td className="py-3 px-4 text-right font-medium">{formatCurrency(product.revenue)}</td>
                        <td className="py-3 px-4 text-right">
                          <span className={`font-medium ${
                            product.growth >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatPercentage(product.growth)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-medium">{product.marketShare.toFixed(1)}%</td>
                        <td className="py-3 px-4 text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            product.profitMargin >= 30 ? 'bg-green-100 text-green-800' :
                            product.profitMargin >= 20 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {product.profitMargin.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Recomendações */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Recomendações Estratégicas
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.insights.recommendedActions.map((action, index) => (
              <div key={index} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-yellow-800 font-medium">{action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSales;