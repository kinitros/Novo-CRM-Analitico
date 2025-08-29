'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Search,
  Filter,
  Download,
  Eye,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  UserCheck,
  UserX,
  Tag,
  MoreVertical,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react'
import { useCRMIntegration, useCustomerData } from '../hooks/useCRMIntegration'

// Interfaces para tipagem
interface Cliente {
  _id: string
  email: string
  nome: string
  telefone: string
  ativo: boolean
  totalCompras: number
  numeroCompras: number
  ultimaCompra?: string
  tags: string[]
  grupo?: string
  saldoCreditos: number
  createdAt: string
  rfmSegment?: 'Champions' | 'Loyal' | 'Potential' | 'At Risk' | 'Lost'
  clv?: number
}

interface FiltrosCliente {
  busca: string
  status: 'todos' | 'ativos' | 'inativos'
  segmento: string
  tag: string
  ordenacao: 'nome' | 'ultimaCompra' | 'totalCompras' | 'numeroCompras'
  direcao: 'asc' | 'desc'
}

export default function ClientesDashboard() {
  const [filtros, setFiltros] = useState<FiltrosCliente>({
    busca: '',
    status: 'todos',
    segmento: '',
    tag: '',
    ordenacao: 'ultimaCompra',
    direcao: 'desc'
  })
  
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null)
  const [showFiltros, setShowFiltros] = useState(false)
  const [paginaAtual, setPaginaAtual] = useState(1)
  const clientesPorPagina = 20

  // Hooks de integração CRM
  const { data, loading, error, refresh, isConnected } = useCRMIntegration()
  const { customers, loading: loadingCustomers, reload: reloadCustomers } = useCustomerData()

  // Estados locais para dados processados
  const [clientesProcessados, setClientesProcessados] = useState<Cliente[]>([])
  const [estatisticas, setEstatisticas] = useState({
    total: 0,
    ativos: 0,
    inativos: 0,
    novosEstesMes: 0,
    ticketMedio: 0,
    clvMedio: 0
  })

  // Processar dados dos clientes
  useEffect(() => {
    if (customers && customers.length > 0) {
      const processados = customers.map((cliente: any) => {
        // Calcular segmento RFM
        const diasUltimaCompra = cliente.ultimaCompra 
          ? Math.floor((Date.now() - new Date(cliente.ultimaCompra).getTime()) / (1000 * 60 * 60 * 24))
          : 999
        
        let rfmSegment: Cliente['rfmSegment'] = 'Lost'
        if (diasUltimaCompra <= 30 && cliente.numeroCompras >= 5 && cliente.totalCompras >= 1000) {
          rfmSegment = 'Champions'
        } else if (diasUltimaCompra <= 60 && cliente.numeroCompras >= 3) {
          rfmSegment = 'Loyal'
        } else if (diasUltimaCompra <= 90 && cliente.numeroCompras >= 1) {
          rfmSegment = 'Potential'
        } else if (diasUltimaCompra <= 180) {
          rfmSegment = 'At Risk'
        }

        // Calcular CLV estimado
        const clv = cliente.numeroCompras > 0 
          ? (cliente.totalCompras / cliente.numeroCompras) * cliente.numeroCompras * 2.5
          : 0

        return {
          ...cliente,
          rfmSegment,
          clv
        }
      })

      setClientesProcessados(processados)

      // Calcular estatísticas
      const agora = new Date()
      const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1)
      
      const stats = {
        total: processados.length,
        ativos: processados.filter(c => c.ativo).length,
        inativos: processados.filter(c => !c.ativo).length,
        novosEstesMes: processados.filter(c => new Date(c.createdAt) >= inicioMes).length,
        ticketMedio: processados.reduce((acc, c) => acc + (c.numeroCompras > 0 ? c.totalCompras / c.numeroCompras : 0), 0) / processados.length,
        clvMedio: processados.reduce((acc, c) => acc + (c.clv || 0), 0) / processados.length
      }
      
      setEstatisticas(stats)
    }
  }, [customers])

  // Filtrar clientes
  const clientesFiltrados = clientesProcessados.filter(cliente => {
    if (filtros.busca && !cliente.nome.toLowerCase().includes(filtros.busca.toLowerCase()) && 
        !cliente.email.toLowerCase().includes(filtros.busca.toLowerCase())) {
      return false
    }
    
    if (filtros.status === 'ativos' && !cliente.ativo) return false
    if (filtros.status === 'inativos' && cliente.ativo) return false
    
    if (filtros.segmento && cliente.rfmSegment !== filtros.segmento) return false
    
    if (filtros.tag && !cliente.tags.includes(filtros.tag)) return false
    
    return true
  })

  // Ordenar clientes
  const clientesOrdenados = [...clientesFiltrados].sort((a, b) => {
    let valorA: any, valorB: any
    
    switch (filtros.ordenacao) {
      case 'nome':
        valorA = a.nome.toLowerCase()
        valorB = b.nome.toLowerCase()
        break
      case 'ultimaCompra':
        valorA = a.ultimaCompra ? new Date(a.ultimaCompra).getTime() : 0
        valorB = b.ultimaCompra ? new Date(b.ultimaCompra).getTime() : 0
        break
      case 'totalCompras':
        valorA = a.totalCompras
        valorB = b.totalCompras
        break
      case 'numeroCompras':
        valorA = a.numeroCompras
        valorB = b.numeroCompras
        break
      default:
        return 0
    }
    
    if (filtros.direcao === 'asc') {
      return valorA > valorB ? 1 : -1
    } else {
      return valorA < valorB ? 1 : -1
    }
  })

  // Paginação
  const totalPaginas = Math.ceil(clientesOrdenados.length / clientesPorPagina)
  const clientesPaginados = clientesOrdenados.slice(
    (paginaAtual - 1) * clientesPorPagina,
    paginaAtual * clientesPorPagina
  )

  // Função para obter cor do segmento RFM
  const getSegmentColor = (segment: Cliente['rfmSegment']) => {
    switch (segment) {
      case 'Champions': return 'bg-green-100 text-green-800'
      case 'Loyal': return 'bg-blue-100 text-blue-800'
      case 'Potential': return 'bg-yellow-100 text-yellow-800'
      case 'At Risk': return 'bg-orange-100 text-orange-800'
      case 'Lost': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

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

  if (loading || loadingCustomers) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Carregando dados dos clientes...</p>
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
              <Users className="w-8 h-8 mr-3 text-blue-500" />
              Dashboard de Clientes
            </div>
            <p className="text-gray-600 mt-2">Análise completa da base de clientes com segmentação RFM</p>
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

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Clientes</p>
                <p className="text-2xl font-bold text-gray-900">{estatisticas.total.toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
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
                <p className="text-sm text-gray-600">Clientes Ativos</p>
                <p className="text-2xl font-bold text-green-600">{estatisticas.ativos.toLocaleString()}</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-500" />
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
                <p className="text-sm text-gray-600">Novos Este Mês</p>
                <p className="text-2xl font-bold text-blue-600">{estatisticas.novosEstesMes.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
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
                <p className="text-sm text-gray-600">Ticket Médio</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(estatisticas.ticketMedio)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-500" />
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
                <p className="text-sm text-gray-600">CLV Médio</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(estatisticas.clvMedio)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-500" />
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
                <p className="text-sm text-gray-600">Taxa de Ativação</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {((estatisticas.ativos / estatisticas.total) * 100).toFixed(1)}%
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Busca */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={filtros.busca}
              onChange={(e) => setFiltros(prev => ({ ...prev, busca: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtros rápidos */}
          <div className="flex items-center space-x-4">
            <select
              value={filtros.status}
              onChange={(e) => setFiltros(prev => ({ ...prev, status: e.target.value as any }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos os Status</option>
              <option value="ativos">Apenas Ativos</option>
              <option value="inativos">Apenas Inativos</option>
            </select>

            <select
              value={filtros.segmento}
              onChange={(e) => setFiltros(prev => ({ ...prev, segmento: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os Segmentos</option>
              <option value="Champions">Champions</option>
              <option value="Loyal">Loyal</option>
              <option value="Potential">Potential</option>
              <option value="At Risk">At Risk</option>
              <option value="Lost">Lost</option>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ordenar por</label>
                  <select
                    value={filtros.ordenacao}
                    onChange={(e) => setFiltros(prev => ({ ...prev, ordenacao: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ultimaCompra">Última Compra</option>
                    <option value="nome">Nome</option>
                    <option value="totalCompras">Total de Compras</option>
                    <option value="numeroCompras">Número de Compras</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Direção</label>
                  <select
                    value={filtros.direcao}
                    onChange={(e) => setFiltros(prev => ({ ...prev, direcao: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="desc">Decrescente</option>
                    <option value="asc">Crescente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tag</label>
                  <input
                    type="text"
                    placeholder="Filtrar por tag..."
                    value={filtros.tag}
                    onChange={(e) => setFiltros(prev => ({ ...prev, tag: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tabela de Clientes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Segmento RFM
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Compras
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor Total
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CLV Estimado
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Última Compra
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clientesPaginados.map((cliente, index) => (
                <motion.tr
                  key={cliente._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {cliente.nome.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{cliente.nome}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {cliente.email}
                        </div>
                        {cliente.telefone && (
                          <div className="text-sm text-gray-500 flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {cliente.telefone}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      getSegmentColor(cliente.rfmSegment)
                    }`}>
                      {cliente.rfmSegment}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <ShoppingCart className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{cliente.numeroCompras}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(cliente.totalCompras)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Ticket: {formatCurrency(cliente.numeroCompras > 0 ? cliente.totalCompras / cliente.numeroCompras : 0)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(cliente.clv || 0)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {cliente.ultimaCompra ? (
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {formatDate(cliente.ultimaCompra)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Nunca</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      cliente.ativo 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {cliente.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setClienteSelecionado(cliente)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="Ver detalhes"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600 p-1 rounded">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
                    <span className="font-medium">{(paginaAtual - 1) * clientesPorPagina + 1}</span>
                    {' '}até{' '}
                    <span className="font-medium">
                      {Math.min(paginaAtual * clientesPorPagina, clientesOrdenados.length)}
                    </span>
                    {' '}de{' '}
                    <span className="font-medium">{clientesOrdenados.length}</span>
                    {' '}resultados
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((pagina) => (
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
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Detalhes do Cliente */}
      <AnimatePresence>
        {clienteSelecionado && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setClienteSelecionado(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Detalhes do Cliente</h2>
                  <button
                    onClick={() => setClienteSelecionado(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Informações básicas */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Informações Básicas</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Nome</label>
                        <p className="text-sm text-gray-900">{clienteSelecionado.nome}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <p className="text-sm text-gray-900">{clienteSelecionado.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Telefone</label>
                        <p className="text-sm text-gray-900">{clienteSelecionado.telefone || 'Não informado'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          clienteSelecionado.ativo 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {clienteSelecionado.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Métricas */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Métricas</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <ShoppingCart className="w-5 h-5 text-blue-500 mr-2" />
                          <div>
                            <p className="text-sm text-blue-600">Total de Compras</p>
                            <p className="text-lg font-semibold text-blue-900">
                              {formatCurrency(clienteSelecionado.totalCompras)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
                          <div>
                            <p className="text-sm text-green-600">Número de Pedidos</p>
                            <p className="text-lg font-semibold text-green-900">{clienteSelecionado.numeroCompras}</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <DollarSign className="w-5 h-5 text-purple-500 mr-2" />
                          <div>
                            <p className="text-sm text-purple-600">Ticket Médio</p>
                            <p className="text-lg font-semibold text-purple-900">
                              {formatCurrency(clienteSelecionado.numeroCompras > 0 
                                ? clienteSelecionado.totalCompras / clienteSelecionado.numeroCompras 
                                : 0
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <TrendingUp className="w-5 h-5 text-orange-500 mr-2" />
                          <div>
                            <p className="text-sm text-orange-600">CLV Estimado</p>
                            <p className="text-lg font-semibold text-orange-900">
                              {formatCurrency(clienteSelecionado.clv || 0)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Segmentação */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Segmentação</h3>
                    <div className="flex items-center space-x-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Segmento RFM</label>
                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                          getSegmentColor(clienteSelecionado.rfmSegment)
                        }`}>
                          {clienteSelecionado.rfmSegment}
                        </span>
                      </div>
                      {clienteSelecionado.tags && clienteSelecionado.tags.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                          <div className="flex flex-wrap gap-1">
                            {clienteSelecionado.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full"
                              >
                                <Tag className="w-3 h-3 mr-1" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Datas importantes */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Histórico</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Cliente desde</label>
                        <p className="text-sm text-gray-900">{formatDate(clienteSelecionado.createdAt)}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Última compra</label>
                        <p className="text-sm text-gray-900">
                          {clienteSelecionado.ultimaCompra 
                            ? formatDate(clienteSelecionado.ultimaCompra)
                            : 'Nunca'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}