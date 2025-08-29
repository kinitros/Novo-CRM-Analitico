'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  Download,
  Eye,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Package,
  Users,
  Target,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Cell,
  AreaChart,
  Area
} from 'recharts'
import { useCRMIntegration, useSalesData } from '../hooks/useCRMIntegration'

// Interfaces para tipagem
interface Venda {
  _id: string
  idTransacao: string
  cliente: {
    nome: string
    email: string
    telefone: string
  }
  produtos: Array<{
    nome: string
    quantidade: number
    valorUnitario: number
    subtotal: number
    statusEnvio?: string
    link?: string
  }>
  valorTotal: number
  data: string
  status: string
  formaPagamento?: string
  origem?: string
  tags?: string[]
  utms?: {
    utmSource?: string
    utmMedium?: string
    utmCampaign?: string
  }
  entregaStatus?: string
}

interface FiltrosVenda {
  dataInicio: string
  dataFim: string
  status: string
  origem: string
  formaPagamento: string
  utmSource: string
  busca: string
}

interface MetricasVenda {
  totalVendas: number
  receitaTotal: number
  ticketMedio: number
  totalProdutos: number
  taxaConversao: number
  crescimentoMensal: number
}

export default function VendasDashboard() {
  const [filtros, setFiltros] = useState<FiltrosVenda>({
    dataInicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dataFim: new Date().toISOString().split('T')[0],
    status: '',
    origem: '',
    formaPagamento: '',
    utmSource: '',
    busca: ''
  })
  
  const [vendaSelecionada, setVendaSelecionada] = useState<Venda | null>(null)
  const [showFiltros, setShowFiltros] = useState(false)
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [tipoVisualizacao, setTipoVisualizacao] = useState<'tabela' | 'cards'>('tabela')
  const vendasPorPagina = 20

  // Hooks de integração CRM
  const { data, loading, error, refresh, isConnected } = useCRMIntegration()
  const { sales, loading: loadingSales, reload: reloadSales } = useSalesData(filtros.dataInicio, filtros.dataFim)

  // Estados locais para dados processados
  const [vendasProcessadas, setVendasProcessadas] = useState<Venda[]>([])
  const [metricas, setMetricas] = useState<MetricasVenda>({
    totalVendas: 0,
    receitaTotal: 0,
    ticketMedio: 0,
    totalProdutos: 0,
    taxaConversao: 0,
    crescimentoMensal: 0
  })
  const [dadosGraficos, setDadosGraficos] = useState({
    vendasPorDia: [],
    vendasPorOrigem: [],
    vendasPorFormaPagamento: [],
    produtosMaisVendidos: [],
    funil: []
  })

  // Processar dados das vendas
  useEffect(() => {
    if (sales && sales.length > 0) {
      const processadas = sales.filter((venda: any) => {
        // Aplicar filtros
        if (filtros.status && venda.status !== filtros.status) return false
        if (filtros.origem && venda.origem !== filtros.origem) return false
        if (filtros.formaPagamento && venda.formaPagamento !== filtros.formaPagamento) return false
        if (filtros.utmSource && venda.utms?.utmSource !== filtros.utmSource) return false
        if (filtros.busca) {
          const busca = filtros.busca.toLowerCase()
          if (!venda.cliente.nome.toLowerCase().includes(busca) &&
              !venda.cliente.email.toLowerCase().includes(busca) &&
              !venda.idTransacao.toLowerCase().includes(busca)) {
            return false
          }
        }
        return true
      })

      setVendasProcessadas(processadas)

      // Calcular métricas
      const totalVendas = processadas.length
      const receitaTotal = processadas.reduce((acc: number, venda: any) => acc + venda.valorTotal, 0)
      const ticketMedio = totalVendas > 0 ? receitaTotal / totalVendas : 0
      const totalProdutos = processadas.reduce((acc: number, venda: any) => 
        acc + venda.produtos.reduce((prodAcc: number, prod: any) => prodAcc + prod.quantidade, 0), 0
      )

      // Calcular crescimento mensal (comparar com mês anterior)
      const mesAtual = new Date().getMonth()
      const anoAtual = new Date().getFullYear()
      const vendasMesAtual = processadas.filter((venda: any) => {
        const dataVenda = new Date(venda.data)
        return dataVenda.getMonth() === mesAtual && dataVenda.getFullYear() === anoAtual
      })
      const vendasMesAnterior = processadas.filter((venda: any) => {
        const dataVenda = new Date(venda.data)
        const mesAnterior = mesAtual === 0 ? 11 : mesAtual - 1
        const anoAnterior = mesAtual === 0 ? anoAtual - 1 : anoAtual
        return dataVenda.getMonth() === mesAnterior && dataVenda.getFullYear() === anoAnterior
      })
      
      const receitaMesAtual = vendasMesAtual.reduce((acc: number, venda: any) => acc + venda.valorTotal, 0)
      const receitaMesAnterior = vendasMesAnterior.reduce((acc: number, venda: any) => acc + venda.valorTotal, 0)
      const crescimentoMensal = receitaMesAnterior > 0 
        ? ((receitaMesAtual - receitaMesAnterior) / receitaMesAnterior) * 100 
        : 0

      setMetricas({
        totalVendas,
        receitaTotal,
        ticketMedio,
        totalProdutos,
        taxaConversao: 85.2, // Valor simulado - pode ser calculado com dados reais
        crescimentoMensal
      })

      // Preparar dados para gráficos
      prepararDadosGraficos(processadas)
    }
  }, [sales, filtros])

  const prepararDadosGraficos = (vendas: any[]) => {
    // Vendas por dia
    const vendasPorDia = vendas.reduce((acc: any, venda: any) => {
      const data = new Date(venda.data).toISOString().split('T')[0]
      if (!acc[data]) {
        acc[data] = { data, vendas: 0, receita: 0 }
      }
      acc[data].vendas += 1
      acc[data].receita += venda.valorTotal
      return acc
    }, {})

    // Vendas por origem
    const vendasPorOrigem = vendas.reduce((acc: any, venda: any) => {
      const origem = venda.origem || 'Não informado'
      if (!acc[origem]) {
        acc[origem] = { name: origem, value: 0, receita: 0 }
      }
      acc[origem].value += 1
      acc[origem].receita += venda.valorTotal
      return acc
    }, {})

    // Vendas por forma de pagamento
    const vendasPorFormaPagamento = vendas.reduce((acc: any, venda: any) => {
      const forma = venda.formaPagamento || 'Não informado'
      if (!acc[forma]) {
        acc[forma] = { name: forma, value: 0, receita: 0 }
      }
      acc[forma].value += 1
      acc[forma].receita += venda.valorTotal
      return acc
    }, {})

    // Produtos mais vendidos
    const produtosMaisVendidos = vendas.reduce((acc: any, venda: any) => {
      venda.produtos.forEach((produto: any) => {
        if (!acc[produto.nome]) {
          acc[produto.nome] = { name: produto.nome, quantidade: 0, receita: 0 }
        }
        acc[produto.nome].quantidade += produto.quantidade
        acc[produto.nome].receita += produto.subtotal
      })
      return acc
    }, {})

    setDadosGraficos({
      vendasPorDia: Object.values(vendasPorDia).sort((a: any, b: any) => a.data.localeCompare(b.data)),
      vendasPorOrigem: Object.values(vendasPorOrigem),
      vendasPorFormaPagamento: Object.values(vendasPorFormaPagamento),
      produtosMaisVendidos: Object.values(produtosMaisVendidos)
        .sort((a: any, b: any) => b.quantidade - a.quantidade)
        .slice(0, 10),
      funil: [
        { etapa: 'Visitantes', valor: 10000, taxa: 100 },
        { etapa: 'Leads', valor: 2500, taxa: 25 },
        { etapa: 'Prospects', valor: 750, taxa: 7.5 },
        { etapa: 'Vendas', valor: vendas.length, taxa: (vendas.length / 10000) * 100 }
      ]
    })
  }

  // Cores para gráficos
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316']

  // Função para formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  // Função para formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  // Função para formatar data e hora
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  // Filtrar e paginar vendas
  const vendasFiltradas = vendasProcessadas
  const totalPaginas = Math.ceil(vendasFiltradas.length / vendasPorPagina)
  const vendasPaginadas = vendasFiltradas.slice(
    (paginaAtual - 1) * vendasPorPagina,
    paginaAtual * vendasPorPagina
  )

  if (loading || loadingSales) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Carregando dados de vendas...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-500" />
          <p className="text-red-600 mb-4">Erro ao carregar dados: {error}</p>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <ShoppingCart className="w-8 h-8 mr-3 text-blue-500" />
              Dashboard de Vendas
            </h1>
            <p className="text-gray-600 mt-2">Análise completa de vendas e performance comercial</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
              isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {isConnected ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span className="text-sm font-medium">
                {isConnected ? 'CRM Conectado' : 'CRM Desconectado'}
              </span>
            </div>
            
            <button
              onClick={refresh}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Atualizar</span>
            </button>
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Vendas</p>
                <p className="text-2xl font-bold text-gray-900">{metricas.totalVendas.toLocaleString()}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-blue-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Receita Total</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(metricas.receitaTotal)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ticket Médio</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(metricas.ticketMedio)}</p>
              </div>
              <Target className="w-8 h-8 text-purple-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Produtos Vendidos</p>
                <p className="text-2xl font-bold text-orange-600">{metricas.totalProdutos.toLocaleString()}</p>
              </div>
              <Package className="w-8 h-8 text-orange-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taxa de Conversão</p>
                <p className="text-2xl font-bold text-emerald-600">{metricas.taxaConversao.toFixed(1)}%</p>
              </div>
              <Activity className="w-8 h-8 text-emerald-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Crescimento Mensal</p>
                <div className="flex items-center">
                  {metricas.crescimentoMensal >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <p className={`text-2xl font-bold ${
                    metricas.crescimentoMensal >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metricas.crescimentoMensal >= 0 ? '+' : ''}{metricas.crescimentoMensal.toFixed(1)}%
                  </p>
                </div>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Vendas por Dia */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Vendas por Dia</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dadosGraficos.vendasPorDia}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="data" 
                stroke="#666" 
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
              />
              <YAxis stroke="#666" fontSize={12} />
              <Tooltip
                formatter={(value, name) => [
                  name === 'vendas' ? `${value} vendas` : formatCurrency(Number(value)),
                  name === 'vendas' ? 'Vendas' : 'Receita'
                ]}
                labelFormatter={(label) => `Data: ${formatDate(label)}`}
              />
              <Area
                type="monotone"
                dataKey="receita"
                stroke="#3B82F6"
                fill="url(#gradientReceita)"
                strokeWidth={2}
              />
              <defs>
                <linearGradient id="gradientReceita" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Vendas por Origem */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Vendas por Origem</h3>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={dadosGraficos.vendasPorOrigem}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {dadosGraficos.vendasPorOrigem.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name, props) => [
                `${value} vendas (${formatCurrency(props.payload.receita)})`,
                'Vendas'
              ]} />
            </RechartsPieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {dadosGraficos.vendasPorOrigem.map((entry: any, index: number) => (
              <div key={entry.name} className="flex items-center space-x-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm text-gray-600">{entry.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Período */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={filtros.dataInicio}
                onChange={(e) => setFiltros(prev => ({ ...prev, dataInicio: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-500">até</span>
              <input
                type="date"
                value={filtros.dataFim}
                onChange={(e) => setFiltros(prev => ({ ...prev, dataFim: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Busca */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por cliente, email ou ID..."
              value={filtros.busca}
              onChange={(e) => setFiltros(prev => ({ ...prev, busca: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Controles */}
          <div className="flex items-center space-x-4">
            <select
              value={filtros.status}
              onChange={(e) => setFiltros(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os Status</option>
              <option value="Pagamento Aprovado">Pagamento Aprovado</option>
              <option value="Compra Concluída">Compra Concluída</option>
              <option value="Compra Aprovada">Compra Aprovada</option>
            </select>

            <button
              onClick={() => setShowFiltros(!showFiltros)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-4 h-4" />
              <span>Filtros</span>
            </button>

            <button className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
              <Download className="w-4 h-4" />
              <span>Exportar</span>
            </button>
          </div>
        </div>

        {/* Filtros avançados */}
        <AnimatePresence>
          {showFiltros && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Origem</label>
                  <select
                    value={filtros.origem}
                    onChange={(e) => setFiltros(prev => ({ ...prev, origem: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todas as Origens</option>
                    <option value="Yampi">Yampi</option>
                    <option value="WooCommerce">WooCommerce</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Forma de Pagamento</label>
                  <select
                    value={filtros.formaPagamento}
                    onChange={(e) => setFiltros(prev => ({ ...prev, formaPagamento: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todas as Formas</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="PIX">PIX</option>
                    <option value="Boleto">Boleto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">UTM Source</label>
                  <input
                    type="text"
                    placeholder="Ex: facebook, google..."
                    value={filtros.utmSource}
                    onChange={(e) => setFiltros(prev => ({ ...prev, utmSource: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => setFiltros({
                      dataInicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                      dataFim: new Date().toISOString().split('T')[0],
                      status: '',
                      origem: '',
                      formaPagamento: '',
                      utmSource: '',
                      busca: ''
                    })}
                    className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    Limpar Filtros
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tabela de Vendas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Vendas Recentes</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setTipoVisualizacao('tabela')}
                className={`px-3 py-1 rounded-lg text-sm ${
                  tipoVisualizacao === 'tabela' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Tabela
              </button>
              <button
                onClick={() => setTipoVisualizacao('cards')}
                className={`px-3 py-1 rounded-lg text-sm ${
                  tipoVisualizacao === 'cards' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Cards
              </button>
            </div>
          </div>
        </div>

        {tipoVisualizacao === 'tabela' ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Venda
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produtos
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vendasPaginadas.map((venda, index) => (
                  <motion.tr
                    key={venda._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">#{venda.idTransacao}</div>
                        <div className="text-sm text-gray-500">{venda.origem || 'Manual'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{venda.cliente.nome}</div>
                        <div className="text-sm text-gray-500">{venda.cliente.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {venda.produtos.length} produto{venda.produtos.length > 1 ? 's' : ''}
                      </div>
                      <div className="text-sm text-gray-500">
                        {venda.produtos.slice(0, 2).map(p => p.nome).join(', ')}
                        {venda.produtos.length > 2 && '...'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(venda.valorTotal)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        venda.status === 'Compra Concluída' 
                          ? 'bg-green-100 text-green-800'
                          : venda.status === 'Pagamento Aprovado'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {venda.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(venda.data)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setVendaSelecionada(venda)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="Ver detalhes"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vendasPaginadas.map((venda, index) => (
                <motion.div
                  key={venda._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setVendaSelecionada(venda)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-900">#{venda.idTransacao}</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      venda.status === 'Compra Concluída' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {venda.status}
                    </span>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-900">{venda.cliente.nome}</p>
                    <p className="text-xs text-gray-500">{venda.cliente.email}</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(venda.valorTotal)}</p>
                      <p className="text-xs text-gray-500">{venda.produtos.length} produto{venda.produtos.length > 1 ? 's' : ''}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{formatDate(venda.data)}</p>
                      <p className="text-xs text-gray-400">{venda.origem || 'Manual'}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Paginação */}
        {totalPaginas > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setPaginaAtual(Math.max(1, paginaAtual - 1))}
                  disabled={paginaAtual === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPaginaAtual(Math.min(totalPaginas, paginaAtual + 1))}
                  disabled={paginaAtual === totalPaginas}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Próximo
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando{' '}
                    <span className="font-medium">{(paginaAtual - 1) * vendasPorPagina + 1}</span>
                    {' '}até{' '}
                    <span className="font-medium">
                      {Math.min(paginaAtual * vendasPorPagina, vendasFiltradas.length)}
                    </span>
                    {' '}de{' '}
                    <span className="font-medium">{vendasFiltradas.length}</span>
                    {' '}resultados
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    {Array.from({ length: Math.min(totalPaginas, 5) }, (_, i) => {
                      let pagina
                      if (totalPaginas <= 5) {
                        pagina = i + 1
                      } else if (paginaAtual <= 3) {
                        pagina = i + 1
                      } else if (paginaAtual >= totalPaginas - 2) {
                        pagina = totalPaginas - 4 + i
                      } else {
                        pagina = paginaAtual - 2 + i
                      }
                      
                      return (
                        <button
                          key={pagina}
                          onClick={() => setPaginaAtual(pagina)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            pagina === paginaAtual
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pagina}
                        </button>
                      )
                    })}
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Detalhes da Venda */}
      <AnimatePresence>
        {vendaSelecionada && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setVendaSelecionada(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Detalhes da Venda #{vendaSelecionada.idTransacao}</h2>
                  <button
                    onClick={() => setVendaSelecionada(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Informações da Venda */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações da Venda</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">ID da Transação:</span>
                        <span className="font-medium">{vendaSelecionada.idTransacao}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Data:</span>
                        <span className="font-medium">{formatDateTime(vendaSelecionada.data)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          vendaSelecionada.status === 'Compra Concluída' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {vendaSelecionada.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Valor Total:</span>
                        <span className="font-bold text-lg">{formatCurrency(vendaSelecionada.valorTotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Origem:</span>
                        <span className="font-medium">{vendaSelecionada.origem || 'Manual'}</span>
                      </div>
                      {vendaSelecionada.formaPagamento && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Forma de Pagamento:</span>
                          <span className="font-medium">{vendaSelecionada.formaPagamento}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Informações do Cliente */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações do Cliente</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nome:</span>
                        <span className="font-medium">{vendaSelecionada.cliente.nome}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{vendaSelecionada.cliente.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Telefone:</span>
                        <span className="font-medium">{vendaSelecionada.cliente.telefone || 'Não informado'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Produtos */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Produtos</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantidade</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Valor Unitário</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {vendaSelecionada.produtos.map((produto, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 text-sm text-gray-900">{produto.nome}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{produto.quantidade}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(produto.valorUnitario)}</td>
                            <td className="px-4 py-2 text-sm font-medium text-gray-900">{formatCurrency(produto.subtotal)}</td>
                            <td className="px-4 py-2">
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                produto.statusEnvio === 'Enviado' 
                                  ? 'bg-green-100 text-green-800'
                                  : produto.statusEnvio === 'Não Enviado'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {produto.statusEnvio || 'Pendente'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* UTMs */}
                {vendaSelecionada.utms && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações de Marketing</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="text-sm text-gray-600">UTM Source:</span>
                        <p className="font-medium">{vendaSelecionada.utms.utmSource || 'Não informado'}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="text-sm text-gray-600">UTM Medium:</span>
                        <p className="font-medium">{vendaSelecionada.utms.utmMedium || 'Não informado'}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="text-sm text-gray-600">UTM Campaign:</span>
                        <p className="font-medium">{vendaSelecionada.utms.utmCampaign || 'Não informado'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}