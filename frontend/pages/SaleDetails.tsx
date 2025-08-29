import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Package,
  Tag,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Edit,
  Save,
  X,
  History,
  RefreshCw,
  Send,
  RotateCcw,
  Eye,
  Download,
  MessageSquare
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
  orderId?: string;
  dataEnvio?: string;
  colaboradorResponsavel?: string;
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

interface HistoricoPedido {
  idCompra: string;
  produto: string;
  valor: number;
  dataCompra: string;
  status: string;
  link?: string;
  colaboradorResponsavel?: string;
}

interface Alteracao {
  dataAlteracao: string;
  produtoIndex: number;
  statusEnvio: string;
  observacao: string;
  colaboradorResponsavel: string;
}

interface SaleDetailsData {
  venda: Venda;
  historico: HistoricoPedido[];
  alteracoes: Alteracao[];
  numeroPedidos: number;
}

const SaleDetails: React.FC = () => {
  const { idTransacao } = useParams<{ idTransacao: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState<SaleDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'resumo' | 'historico-cliente' | 'informacoes-adicionais'>('resumo');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Estados para edição
  const [productUpdates, setProductUpdates] = useState<Record<number, { statusEnvio: string; observacao: string }>>({});
  const [editingPerfil, setEditingPerfil] = useState(false);
  const [perfilValue, setPerfilValue] = useState('');

  const fetchData = async () => {
    if (!idTransacao) {
      setError('ID da transação não fornecido');
      setLoading(false);
      return;
    }

    try {
      setRefreshing(true);
      const response = await fetch(`https://prime.top1midia.com/crm-proxy.php/crm/sale-details?idTransacao=${idTransacao}`);
      if (!response.ok) {
        throw new Error('Falha ao carregar detalhes da venda');
      }

      const result: SaleDetailsData = await response.json();
      setData(result);
      
      // Inicializar estados de edição
      const initialUpdates: Record<number, { statusEnvio: string; observacao: string }> = {};
      result.venda.produtos.forEach((produto, index) => {
        initialUpdates[index] = {
          statusEnvio: produto.statusEnvio || 'Não Enviado',
          observacao: produto.observacao || ''
        };
      });
      setProductUpdates(initialUpdates);
      
      // Definir perfil inicial
      if (result.venda.produtos.length > 0) {
        setPerfilValue(result.venda.produtos[0].link || '');
      }
      
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
  }, [idTransacao]);

  const handleVoltar = () => {
    const searchParams = new URLSearchParams(location.search);
    navigate(`/sales?${searchParams.toString()}`);
  };

  const handleStatusChange = (index: number, newStatus: string) => {
    setProductUpdates(prev => ({
      ...prev,
      [index]: { ...prev[index], statusEnvio: newStatus }
    }));
  };

  const handleObservacaoChange = (index: number, newObservacao: string) => {
    setProductUpdates(prev => ({
      ...prev,
      [index]: { ...prev[index], observacao: newObservacao }
    }));
  };

  const handleSaveProductUpdate = async (index: number) => {
    try {
      const update = productUpdates[index];
      const response = await fetch(`https://prime.top1midia.com/crm-proxy.php/crm/update-product-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          idTransacao,
          produtoIndex: index,
          statusEnvio: update.statusEnvio,
          observacao: update.observacao
        })
      });

      if (!response.ok) {
        throw new Error('Falha ao atualizar produto');
      }

      setSuccessMessage(`Status do produto ${index + 1} atualizado com sucesso!`);
      setTimeout(() => setSuccessMessage(null), 3000);
      
      // Recarregar dados
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar produto');
    }
  };

  const handleSavePerfil = async () => {
    try {
      const response = await fetch(`https://prime.top1midia.com/crm-proxy.php/crm/update-perfil`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          idTransacao,
          perfil: perfilValue
        })
      });

      if (!response.ok) {
        throw new Error('Falha ao atualizar perfil');
      }

      setSuccessMessage('Perfil atualizado com sucesso!');
      setTimeout(() => setSuccessMessage(null), 3000);
      setEditingPerfil(false);
      
      // Recarregar dados
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar perfil');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'enviado':
      case 'concluído':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pendente':
      case 'não enviado':
      case 'em análise':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'perfil privado':
      case 'perfil errado':
      case 'cancelado':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'reposição':
        return <RotateCcw className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'enviado':
      case 'concluído':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pendente':
      case 'não enviado':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'em análise':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'perfil privado':
      case 'perfil errado':
      case 'cancelado':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'reposição':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando detalhes da venda...</p>
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
          <div className="space-x-4">
            <button
              onClick={handleVoltar}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Voltar às Vendas
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
                onClick={handleVoltar}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Detalhes da Venda #{idTransacao}
                </h1>
                <p className="text-gray-600 mt-1">Informações completas da transação</p>
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
        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {successMessage}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'resumo', label: 'Resumo', icon: Package },
                { id: 'historico-cliente', label: 'Histórico do Cliente', icon: History },
                { id: 'informacoes-adicionais', label: 'Informações Adicionais', icon: MessageSquare }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === id
                      ? 'border-blue-500 text-blue-600'
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

        {/* Tab Content */}
        {activeTab === 'resumo' && (
          <div className="space-y-8">
            {/* Cliente e Venda Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Cliente */}
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center gap-3 mb-6">
                  <User className="w-6 h-6 text-blue-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Cliente</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Nome</p>
                      <p className="font-medium text-gray-900">{data.venda.cliente.nome}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">E-mail</p>
                      <p className="font-medium text-gray-900">{data.venda.cliente.email}</p>
                    </div>
                  </div>
                  {data.venda.cliente.telefone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Telefone</p>
                        <p className="font-medium text-gray-900">{data.venda.cliente.telefone}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Package className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Número de Pedidos</p>
                      <p className="font-medium text-gray-900">{data.numeroPedidos}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Venda */}
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center gap-3 mb-6">
                  <DollarSign className="w-6 h-6 text-green-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Venda</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(data.venda.status)}`}>
                        {getStatusIcon(data.venda.status)}
                        {data.venda.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Data</p>
                      <p className="font-medium text-gray-900">{formatDate(data.venda.data)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">@ do Perfil</p>
                      <div className="flex items-center gap-2">
                        {editingPerfil ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={perfilValue}
                              onChange={(e) => setPerfilValue(e.target.value)}
                              className="px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                            <button
                              onClick={handleSavePerfil}
                              className="text-green-600 hover:text-green-700"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingPerfil(false)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">
                              {data.venda.produtos[0]?.link || 'Não informado'}
                            </p>
                            <button
                              onClick={() => setEditingPerfil(true)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {data.venda.formaPagamento && (
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Forma de Pagamento</p>
                        <p className="font-medium text-gray-900">{data.venda.formaPagamento}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Package className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Status de Entrega</p>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(data.venda.entregaStatus)}`}>
                        {getStatusIcon(data.venda.entregaStatus)}
                        {data.venda.entregaStatus}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* UTMs */}
            {data.venda.utms && (
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center gap-3 mb-6">
                  <Tag className="w-6 h-6 text-purple-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Informações de Marketing</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">UTM Source</p>
                    <p className="font-medium text-gray-900">{data.venda.utms.utmSource || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">UTM Medium</p>
                    <p className="font-medium text-gray-900">{data.venda.utms.utmMedium || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">UTM Campaign</p>
                    <p className="font-medium text-gray-900">{data.venda.utms.utmCampaign || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Produtos */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center gap-3 mb-6">
                <Package className="w-6 h-6 text-orange-500" />
                <h3 className="text-lg font-semibold text-gray-900">Produtos e Entrega</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Produto</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Quantidade</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Valor Unit.</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">@ do Perfil</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Observação</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.venda.produtos.map((produto, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900">{produto.nome}</p>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{produto.quantidade}</td>
                        <td className="py-3 px-4 text-gray-600">{formatCurrency(produto.valorUnitario)}</td>
                        <td className="py-3 px-4 text-gray-600">{produto.link || 'Não informado'}</td>
                        <td className="py-3 px-4">
                          <div className="space-y-2">
                            <select
                              value={productUpdates[index]?.statusEnvio || 'Não Enviado'}
                              onChange={(e) => handleStatusChange(index, e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            >
                              <option value="Não Enviado">Não Enviado</option>
                              <option value="Em análise">Em análise</option>
                              <option value="Reposição">Reposição</option>
                              <option value="Perfil Privado">Perfil Privado</option>
                              <option value="Perfil Errado">Perfil Errado</option>
                              <option value="Enviado">Enviado</option>
                            </select>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="space-y-2">
                            <textarea
                              value={productUpdates[index]?.observacao || ''}
                              onChange={(e) => handleObservacaoChange(index, e.target.value)}
                              rows={2}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm resize-none"
                              placeholder="Observações..."
                            />
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => handleSaveProductUpdate(index)}
                              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center gap-1"
                            >
                              <Save className="w-3 h-3" />
                              Salvar
                            </button>
                            {productUpdates[index]?.statusEnvio === 'Enviado' ? (
                              <div className="flex gap-1">
                                <button className="bg-orange-600 text-white px-2 py-1 rounded text-xs hover:bg-orange-700 flex items-center gap-1">
                                  <RotateCcw className="w-3 h-3" />
                                  Reposição
                                </button>
                                <button className="bg-gray-600 text-white px-2 py-1 rounded text-xs hover:bg-gray-700 flex items-center gap-1">
                                  <History className="w-3 h-3" />
                                  Histórico
                                </button>
                              </div>
                            ) : (
                              <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center gap-1">
                                <Send className="w-3 h-3" />
                                Enviar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Valor Total */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Valor Total</h3>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(data.venda.valorTotal)}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'historico-cliente' && (
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center gap-3 mb-6">
              <History className="w-6 h-6 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900">
                Histórico de Pedidos: {data.venda.cliente.nome}
              </h3>
            </div>
            {data.historico.length === 0 ? (
              <p className="text-gray-600 text-center py-8">Este cliente não possui pedidos anteriores.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">ID da Compra</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Produto</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Valor</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Data</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">@ do Perfil</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Colaborador</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.historico.map((pedido, index) => (
                      <tr 
                        key={index} 
                        className={`border-b border-gray-100 hover:bg-gray-50 ${
                          pedido.idCompra === idTransacao ? 'bg-blue-50' : ''
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{pedido.idCompra}</span>
                            {pedido.idCompra === idTransacao && (
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                                Venda Atual
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{pedido.produto}</td>
                        <td className="py-3 px-4 text-gray-600">{formatCurrency(pedido.valor)}</td>
                        <td className="py-3 px-4 text-gray-600">{formatDateTime(pedido.dataCompra)}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(pedido.status)}`}>
                            {getStatusIcon(pedido.status)}
                            {pedido.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{pedido.link || 'Não informado'}</td>
                        <td className="py-3 px-4 text-gray-600">{pedido.colaboradorResponsavel || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'informacoes-adicionais' && (
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="w-6 h-6 text-purple-500" />
              <h3 className="text-lg font-semibold text-gray-900">Histórico de Alterações</h3>
            </div>
            {data.alteracoes.length === 0 ? (
              <p className="text-gray-600 text-center py-8">Nenhuma alteração registrada para esta venda.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Data da Alteração</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Produto Alterado</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Status de Envio</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Observação</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Colaborador</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.alteracoes.map((alteracao, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-600">{formatDateTime(alteracao.dataAlteracao)}</td>
                        <td className="py-3 px-4 text-gray-600">
                          {data.venda.produtos[alteracao.produtoIndex]?.nome || `Produto ${alteracao.produtoIndex + 1}`}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(alteracao.statusEnvio)}`}>
                            {getStatusIcon(alteracao.statusEnvio)}
                            {alteracao.statusEnvio}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{alteracao.observacao || 'Nenhuma observação'}</td>
                        <td className="py-3 px-4 text-gray-600">{alteracao.colaboradorResponsavel || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SaleDetails;