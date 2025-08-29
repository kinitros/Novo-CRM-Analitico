import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingCart,
  Search,
  Filter,
  Download,
  Eye,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Plus,
  X,
  Tag,
  Package,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';

interface Cliente {
  nome: string;
  email: string;
  telefone?: string;
}

interface Produto {
  nome: string;
  quantidade: number;
  valorUnitario: number;
  subtotal: number;
  statusEnvio?: string;
  link?: string;
  observacao?: string;
}

interface Venda {
  _id: string;
  idTransacao: string;
  cliente: Cliente;
  produtos: Produto[];
  valorTotal: number;
  data: string;
  status: string;
  entregaStatus: string;
  formaPagamento?: string;
  origem?: string;
  tags?: string[];
  utms?: {
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
  };
}

interface SalesData {
  data: Venda[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const Sales: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVendas, setTotalVendas] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Estados para filtros
  const [filtroIdVenda, setFiltroIdVenda] = useState('');
  const [filtroBuscaGeral, setFiltroBuscaGeral] = useState('');
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');
  const [filtroTag, setFiltroTag] = useState('');
  const [filtroEntrega, setFiltroEntrega] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroOrigem, setFiltroOrigem] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Mapeamento de status para cores e ícones
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'concluído':
      case 'enviado':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pendente':
      case 'parcial':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'cancelado':
      case 'reembolsado':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'concluído':
      case 'enviado':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'parcial':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelado':
      case 'reembolsado':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTagColor = (tag: string) => {
    const colors: Record<string, string> = {
      'nova-loja': 'bg-blue-100 text-blue-800',
      'agencia-prime': 'bg-green-100 text-green-800',
      'new-seguidores': 'bg-pink-100 text-pink-800',
      'woocommerce': 'bg-red-100 text-red-800',
      'whatsapp': 'bg-yellow-100 text-yellow-800',
    };
    return colors[tag] || 'bg-gray-100 text-gray-800';
  };

  const fetchVendas = async (page = 1) => {
    try {
      setRefreshing(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });

      if (filtroIdVenda) params.append('idTransacao', filtroIdVenda);
      if (filtroBuscaGeral) params.append('search', filtroBuscaGeral);
      if (filtroDataInicio) params.append('start_date', filtroDataInicio);
      if (filtroDataFim) params.append('end_date', filtroDataFim);
      if (filtroTag) params.append('tag', filtroTag);
      if (filtroEntrega) params.append('entrega_status', filtroEntrega);
      if (filtroStatus) params.append('status', filtroStatus);
      if (filtroOrigem) params.append('origem', filtroOrigem);

      const response = await fetch(`https://prime.top1midia.com/crm-proxy.php/crm/vendas?${params}`);
      if (!response.ok) {
        throw new Error('Falha ao carregar vendas');
      }

      const result = await response.json();
      
      // Tratamento seguro dos dados retornados
      if (result && typeof result === 'object') {
        // Se result tem estrutura { data: [], pagination: {} }
        if (result.data && Array.isArray(result.data)) {
          setVendas(result.data);
          setCurrentPage(result.pagination?.page || 1);
          setTotalPages(result.pagination?.pages || 1);
          setTotalVendas(result.pagination?.total || 0);
        }
        // Se result é diretamente um array
        else if (Array.isArray(result)) {
          setVendas(result);
          setCurrentPage(1);
          setTotalPages(1);
          setTotalVendas(result.length);
        }
        // Se result tem erro
        else if (result.error) {
          throw new Error(result.error);
        }
        // Fallback para dados vazios
        else {
          setVendas([]);
          setCurrentPage(1);
          setTotalPages(1);
          setTotalVendas(0);
        }
      } else {
        // Se result não é um objeto válido
        setVendas([]);
        setCurrentPage(1);
        setTotalPages(1);
        setTotalVendas(0);
      }
      
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar vendas:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      // Garantir que vendas seja sempre um array em caso de erro
      setVendas([]);
      setCurrentPage(1);
      setTotalPages(1);
      setTotalVendas(0);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Carregar filtros da URL
    const searchParams = new URLSearchParams(location.search);
    setFiltroIdVenda(searchParams.get('idTransacao') || '');
    setFiltroBuscaGeral(searchParams.get('search') || '');
    setFiltroDataInicio(searchParams.get('start_date') || '');
    setFiltroDataFim(searchParams.get('end_date') || '');
    setFiltroTag(searchParams.get('tag') || '');
    setFiltroEntrega(searchParams.get('entrega_status') || '');
    setFiltroStatus(searchParams.get('status') || '');
    setFiltroOrigem(searchParams.get('origem') || '');

    fetchVendas(1);
  }, [location.search]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchVendas(page);
  };

  const handleAplicarFiltros = () => {
    const params = new URLSearchParams();
    if (filtroIdVenda) params.set('idTransacao', filtroIdVenda);
    if (filtroBuscaGeral) params.set('search', filtroBuscaGeral);
    if (filtroDataInicio) params.set('start_date', filtroDataInicio);
    if (filtroDataFim) params.set('end_date', filtroDataFim);
    if (filtroTag) params.set('tag', filtroTag);
    if (filtroEntrega) params.set('entrega_status', filtroEntrega);
    if (filtroStatus) params.set('status', filtroStatus);
    if (filtroOrigem) params.set('origem', filtroOrigem);

    navigate(`?${params.toString()}`, { replace: true });
    fetchVendas(1);
  };

  const handleLimparFiltros = () => {
    setFiltroIdVenda('');
    setFiltroBuscaGeral('');
    setFiltroDataInicio('');
    setFiltroDataFim('');
    setFiltroTag('');
    setFiltroEntrega('');
    setFiltroStatus('');
    setFiltroOrigem('');
    navigate('', { replace: true });
    fetchVendas(1);
  };

  const handleRowClick = (idTransacao: string) => {
    const searchParams = new URLSearchParams(location.search);
    navigate(`/sale-details/${idTransacao}?${searchParams.toString()}`);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando vendas...</p>
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
            onClick={() => fetchVendas(currentPage)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <ShoppingCart className="w-8 h-8 text-blue-600" />
                Vendas
              </h1>
              <p className="text-gray-600 mt-1">Gerencie e acompanhe todas as vendas</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filtros
              </button>
              <button
                onClick={() => fetchVendas(currentPage)}
                disabled={refreshing}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Atualizar
              </button>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Nova Venda
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros */}
        {showFilters && (
          <div className="bg-white rounded-xl p-6 shadow-sm border mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Filtros de Busca</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID da Venda</label>
                <input
                  type="text"
                  value={filtroIdVenda}
                  onChange={(e) => setFiltroIdVenda(e.target.value)}
                  placeholder="Digite o ID..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Busca Geral</label>
                <input
                  type="text"
                  value={filtroBuscaGeral}
                  onChange={(e) => setFiltroBuscaGeral(e.target.value)}
                  placeholder="Nome, email, telefone..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
                <input
                  type="date"
                  value={filtroDataInicio}
                  onChange={(e) => setFiltroDataInicio(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
                <input
                  type="date"
                  value={filtroDataFim}
                  onChange={(e) => setFiltroDataFim(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tag</label>
                <select
                  value={filtroTag}
                  onChange={(e) => setFiltroTag(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todas as Tags</option>
                  <option value="nova-loja">Nova Loja</option>
                  <option value="agencia-prime">Agência Prime</option>
                  <option value="new-seguidores">New Seguidores</option>
                  <option value="woocommerce">WooCommerce</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status Entrega</label>
                <select
                  value={filtroEntrega}
                  onChange={(e) => setFiltroEntrega(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos</option>
                  <option value="Pendente">Pendente</option>
                  <option value="Parcial">Parcial</option>
                  <option value="Enviado">Enviado</option>
                  <option value="Concluído">Concluído</option>
                  <option value="Reembolsado">Reembolsado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos</option>
                  <option value="Pago">Pago</option>
                  <option value="Pendente">Pendente</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Origem</label>
                <select
                  value={filtroOrigem}
                  onChange={(e) => setFiltroOrigem(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todas</option>
                  <option value="Yampi">Yampi</option>
                  <option value="WooCommerce">WooCommerce</option>
                  <option value="Manual">Manual</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAplicarFiltros}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Aplicar Filtros
              </button>
              <button
                onClick={handleLimparFiltros}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Limpar
              </button>
            </div>
          </div>
        )}

        {/* Resumo */}
        {vendas.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border mb-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">
                  Mostrando {(currentPage - 1) * 20 + 1} a {Math.min(currentPage * 20, totalVendas)} de {totalVendas} vendas
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button className="text-blue-600 hover:text-blue-700 flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Exportar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tabela Desktop */}
        <div className="hidden md:block">
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID / Tags
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entrega
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vendas.map((venda) => (
                  <tr
                    key={venda.idTransacao}
                    onClick={() => handleRowClick(venda.idTransacao)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          #{venda.idTransacao}
                        </div>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {venda.tags && venda.tags.length > 0 ? (
                            venda.tags.map((tag) => (
                              <span
                                key={tag}
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getTagColor(tag)}`}
                              >
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-500">Sem tags</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {venda.cliente.nome}
                        </div>
                        <div className="text-sm text-gray-500">
                          {venda.cliente.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(venda.data)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(venda.valorTotal)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(venda.status)}`}>
                        {getStatusIcon(venda.status)}
                        {venda.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(venda.entregaStatus)}`}>
                        {getStatusIcon(venda.entregaStatus)}
                        {venda.entregaStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRowClick(venda.idTransacao)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <Mail className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cards Mobile */}
        <div className="md:hidden space-y-4">
          {vendas.map((venda) => (
            <div
              key={venda.idTransacao}
              onClick={() => handleRowClick(venda.idTransacao)}
              className="bg-white rounded-lg p-4 shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-medium text-gray-900">#{venda.idTransacao}</h3>
                  <p className="text-sm text-gray-600">{venda.cliente.nome}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{formatCurrency(venda.valorTotal)}</p>
                  <p className="text-sm text-gray-500">{formatDate(venda.data)}</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center mb-3">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(venda.status)}`}>
                  {getStatusIcon(venda.status)}
                  {venda.status}
                </span>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(venda.entregaStatus)}`}>
                  {getStatusIcon(venda.entregaStatus)}
                  {venda.entregaStatus}
                </span>
              </div>

              {venda.tags && venda.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap mb-3">
                  {venda.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getTagColor(tag)}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t">
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRowClick(venda.idTransacao);
                    }}
                    className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    <span className="text-sm">Ver Detalhes</span>
                  </button>
                </div>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="text-green-600 hover:text-green-900"
                >
                  <Mail className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 rounded-lg ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sales;
