import React, { useState, useEffect } from 'react';
import { backend } from '../client';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  ShoppingCart,
  AlertTriangle,
  CheckCircle,
  Target,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  Eye,
  Calendar,
  Filter
} from 'lucide-react';

interface KPIs {
  totalClientes: number;
  totalVendas: number;
  receitaTotal: number;
  ticketMedio: number;
  crescimentoVendas: number;
  crescimentoReceita: number;
  taxaSatisfacao: number;
}

interface Alerta {
  tipo: 'warning' | 'error' | 'success' | 'info';
  titulo: string;
  mensagem: string;
  acao: string;
}

interface Oportunidade {
  titulo: string;
  descricao: string;
  potencial: 'Alto' | 'Médio' | 'Baixo';
}

interface ResumoExecutivo {
  statusGeral: string;
  principalMetrica: string;
  proximaAcao: string;
}

interface ExecutiveDashboardData {
  kpis: KPIs;
  topProdutos: Record<string, { receita: number; quantidade: number }>;
  alertas: Alerta[];
  oportunidades: Oportunidade[];
  resumoExecutivo: ResumoExecutivo;
}

const ExecutiveDashboard: React.FC = () => {
  const [data, setData] = useState<ExecutiveDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('https://prime.top1midia.com/crm-proxy.php/crm/executive-dashboard');
      if (!response.ok) {
        throw new Error('Falha ao carregar dados do dashboard');
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
    // Auto-refresh a cada 5 minutos
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
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

  const getAlertIcon = (tipo: string) => {
    switch (tipo) {
      case 'error': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      default: return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };

  const getAlertBgColor = (tipo: string) => {
    switch (tipo) {
      case 'error': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'success': return 'bg-green-50 border-green-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  const getPotentialColor = (potencial: string) => {
    switch (potencial) {
      case 'Alto': return 'text-green-600 bg-green-100';
      case 'Médio': return 'text-yellow-600 bg-yellow-100';
      case 'Baixo': return 'text-gray-600 bg-gray-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando Dashboard Executivo...</p>
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
                <BarChart3 className="w-8 h-8 text-blue-600" />
                Dashboard Executivo
              </h1>
              <p className="text-gray-600 mt-1">Visão estratégica completa do negócio</p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="7">Últimos 7 dias</option>
                <option value="30">Últimos 30 dias</option>
                <option value="90">Últimos 90 dias</option>
              </select>
              <button
                onClick={fetchData}
                disabled={refreshing}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Activity className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Atualizar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Resumo Executivo */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">Resumo Executivo</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-blue-100 text-sm">Status Geral</p>
                    <p className="text-lg font-semibold">{data.resumoExecutivo.statusGeral}</p>
                  </div>
                  <div>
                    <p className="text-blue-100 text-sm">Principal Métrica</p>
                    <p className="text-lg font-semibold">{data.resumoExecutivo.principalMetrica}</p>
                  </div>
                  <div>
                    <p className="text-blue-100 text-sm">Próxima Ação</p>
                    <p className="text-lg font-semibold">{data.resumoExecutivo.proximaAcao}</p>
                  </div>
                </div>
              </div>
              <Target className="w-16 h-16 text-blue-200" />
            </div>
          </div>
        </div>

        {/* KPIs Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total de Clientes</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatNumber(data.kpis.totalClientes)}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total de Vendas</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatNumber(data.kpis.totalVendas)}
                </p>
                <div className="flex items-center mt-2">
                  {data.kpis.crescimentoVendas >= 0 ? (
                    <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    data.kpis.crescimentoVendas >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatPercentage(data.kpis.crescimentoVendas)}
                  </span>
                </div>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Receita Total</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(data.kpis.receitaTotal)}
                </p>
                <div className="flex items-center mt-2">
                  {data.kpis.crescimentoReceita >= 0 ? (
                    <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    data.kpis.crescimentoReceita >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatPercentage(data.kpis.crescimentoReceita)}
                  </span>
                </div>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Ticket Médio</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(data.kpis.ticketMedio)}
                </p>
                <div className="flex items-center mt-2">
                  <Star className="w-4 h-4 text-purple-500 mr-1" />
                  <span className="text-sm font-medium text-purple-600">
                    Satisfação: {data.kpis.taxaSatisfacao.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Alertas Inteligentes */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-500" />
                Alertas Inteligentes
              </h3>
              <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {data.alertas.length} alertas
              </span>
            </div>
            <div className="space-y-4">
              {data.alertas.length > 0 ? (
                data.alertas.map((alerta, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${getAlertBgColor(alerta.tipo)}`}>
                    <div className="flex items-start gap-3">
                      {getAlertIcon(alerta.tipo)}
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{alerta.titulo}</h4>
                        <p className="text-sm text-gray-600 mt-1">{alerta.mensagem}</p>
                        <p className="text-sm font-medium text-blue-600 mt-2">
                          💡 {alerta.acao}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="text-gray-600">Nenhum alerta no momento</p>
                  <p className="text-sm text-gray-500">Tudo funcionando perfeitamente!</p>
                </div>
              )}
            </div>
          </div>

          {/* Oportunidades */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-green-500" />
                Oportunidades
              </h3>
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {data.oportunidades.length} oportunidades
              </span>
            </div>
            <div className="space-y-4">
              {data.oportunidades.length > 0 ? (
                data.oportunidades.map((oportunidade, index) => (
                  <div key={index} className="p-4 rounded-lg border border-green-200 bg-green-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{oportunidade.titulo}</h4>
                        <p className="text-sm text-gray-600 mt-1">{oportunidade.descricao}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPotentialColor(oportunidade.potencial)}`}>
                        {oportunidade.potencial}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Eye className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Analisando oportunidades...</p>
                  <p className="text-sm text-gray-500">Novas oportunidades serão identificadas automaticamente</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top Produtos */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-blue-500" />
              Top Produtos por Receita
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(data.topProdutos).slice(0, 6).map(([produto, stats], index) => (
              <div key={produto} className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 truncate">{produto}</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    #{index + 1}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Receita:</span>
                    <span className="font-medium">{formatCurrency(stats.receita)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Quantidade:</span>
                    <span className="font-medium">{formatNumber(stats.quantidade)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;