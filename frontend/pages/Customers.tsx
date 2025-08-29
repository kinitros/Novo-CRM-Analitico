import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Search, Mail, Phone, Building, Calendar, ChevronLeft, ChevronRight, User } from "lucide-react";
import { Link } from "react-router-dom";
import backend from "../client";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  empresa: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface ClientesResponse {
  data: Cliente[];
  pagination: PaginationInfo;
}

export default function Customers() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const limit = 25;

  // Buscar clientes do CRM atual
  const { data: clientesData, isLoading: clientesLoading } = useQuery({
    queryKey: ["clientes-crm", currentPage, searchTerm],
    queryFn: () => backend.crm.getClientes({
      page: currentPage,
      limit,
      search: searchTerm || undefined
    }),
  });

  // Buscar top clientes para o gráfico
  const { data: customerSales, isLoading: salesLoading } = useQuery({
    queryKey: ["customer-sales"],
    queryFn: () => backend.crm.getCustomerSales({ limit: 10 }),
  });

  const clientes = (clientesData as ClientesResponse)?.data || [];
  const pagination = (clientesData as ClientesResponse)?.pagination || {
    page: 1,
    limit,
    total: 0,
    pages: 0
  };
  const topCustomers = customerSales?.customers || [];

  // Verificação de segurança para evitar erros de slice
  const safeClientes = Array.isArray(clientes) ? clientes : [];
  const safeTopCustomers = Array.isArray(topCustomers) ? topCustomers : [];

  const handleSearch = () => {
    setSearchTerm(searchInput);
    setCurrentPage(1);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.pages) {
      setCurrentPage(page);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return 'N/A';
    }
  };

  const formatPhone = (phone: string) => {
    if (!phone) return 'N/A';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    } else if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">
            Gerencie e analise todos os clientes do seu CRM
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          <Users className="w-4 h-4 mr-1" />
          {pagination.total.toLocaleString()} clientes
        </Badge>
      </div>

      {/* Top Clientes Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Clientes por Valor</CardTitle>
          <CardDescription>
            Clientes que mais geraram receita
          </CardDescription>
        </CardHeader>
        <CardContent>
          {salesLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={safeTopCustomers}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="customer_name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Valor Total']}
                  />
                  <Bar dataKey="total_spent" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={clientesLoading}>
              Buscar
            </Button>
            {searchTerm && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setSearchInput('');
                  setCurrentPage(1);
                }}
              >
                Limpar
              </Button>
            )}
          </div>
          {searchTerm && (
            <p className="text-sm text-muted-foreground mt-2">
              Buscando por: <strong>"{searchTerm}"</strong>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Clientes List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista Completa de Clientes</CardTitle>
          <CardDescription>
            Página {pagination.page} de {pagination.pages} 
            ({pagination.total.toLocaleString()} clientes no total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {clientesLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Carregando clientes...</span>
            </div>
          ) : safeClientes.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
              </h3>
              <p className="text-gray-500">
                {searchTerm 
                  ? 'Tente ajustar os termos de busca.' 
                  : 'Quando houver clientes cadastrados, eles aparecerão aqui.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Desktop Table */}
              <div className="hidden md:block">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Cliente</th>
                        <th className="text-left py-3 px-4 font-medium">Contato</th>
                        <th className="text-left py-3 px-4 font-medium">Compras</th>
                        <th className="text-left py-3 px-4 font-medium">Valor Total</th>
                        <th className="text-left py-3 px-4 font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {safeClientes.map((cliente) => (
                        <tr key={cliente.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium text-gray-900">
                                {cliente.nome || 'Nome não informado'}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {cliente.id ? cliente.id.slice(-8) : 'N/A'}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              {cliente.email && (
                                <div className="flex items-center text-sm">
                                  <Mail className="w-3 h-3 mr-1 text-gray-400" />
                                  {cliente.email}
                                </div>
                              )}
                              {cliente.telefone && (
                                <div className="flex items-center text-sm">
                                  <Phone className="w-3 h-3 mr-1 text-gray-400" />
                                  {formatPhone(cliente.telefone)}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm">
                              <div className="font-medium">
                                {cliente.total_compras || 0} compras
                              </div>
                              {cliente.ultima_compra && (
                                <div className="text-gray-500 text-xs">
                                  Última: {formatDate(cliente.ultima_compra)}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm font-medium text-green-600">
                              R$ {(cliente.valor_total_gasto || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Link 
                              to={`/customer-360/${encodeURIComponent(cliente.email || cliente.id)}`}
                              className="text-blue-600 hover:text-blue-900 inline-flex items-center gap-1"
                            >
                              <User className="w-4 h-4" />
                              <span className="hidden sm:inline">360°</span>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {safeClientes.map((cliente) => (
                  <Card key={cliente.id}>
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">
                            {cliente.nome || 'Nome não informado'}
                          </h3>
                          <Badge variant="outline" className="text-xs">
                             {cliente.id ? cliente.id.slice(-8) : 'N/A'}
                           </Badge>
                        </div>
                        
                        {cliente.email && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="w-3 h-3 mr-2" />
                            {cliente.email}
                          </div>
                        )}
                        
                        {cliente.telefone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="w-3 h-3 mr-2" />
                            {formatPhone(cliente.telefone)}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t">
                          <div>
                            <strong>{cliente.total_compras || 0}</strong> compras
                          </div>
                          <div className="text-green-600 font-medium">
                            R$ {(cliente.valor_total_gasto || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                        
                        {cliente.ultima_compra && (
                          <div className="text-xs text-gray-400 pt-1">
                            Última compra: {formatDate(cliente.ultima_compra)}
                          </div>
                        )}
                        
                        <div className="pt-2 border-t mt-2">
                          <Link 
                            to={`/customer-360/${encodeURIComponent(cliente.email || cliente.id)}`}
                            className="text-blue-600 hover:text-blue-900 text-sm flex items-center gap-1"
                          >
                            <User className="w-4 h-4" />
                            <span>Análise 360°</span>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
                {pagination.total.toLocaleString()} clientes
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage <= 1 || clientesLoading}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    const pageNum = Math.max(1, currentPage - 2) + i;
                    if (pageNum <= pagination.pages) {
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToPage(pageNum)}
                          disabled={clientesLoading}
                        >
                          {pageNum}
                        </Button>
                      );
                    }
                    return null;
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage >= pagination.pages || clientesLoading}
                >
                  Próxima
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
