import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Mail, Phone, Users, Calendar, TrendingDown, Search } from "lucide-react";
import backend from "../client";
import { useState } from "react";

interface ClienteInativo {
  customer_id: string;
  customer_name: string;
  email: string;
  phone: string;
  last_purchase_date: string;
  days_since_last_purchase: number;
  total_purchases: number;
  total_spent: number;
  risk_level: string;
}

interface InactiveCustomersResponse {
  customers: ClienteInativo[];
  risk_analysis: {
    high_risk: number;
    medium_risk: number;
    low_risk: number;
  };
  total_inactive: number;
}

export default function InactiveCustomers() {
  const [daysThreshold, setDaysThreshold] = useState(90);
  const [riskFilter, setRiskFilter] = useState('');

  const { data: inactiveCustomers, isLoading } = useQuery({
    queryKey: ["inactive-customers", daysThreshold, riskFilter],
    queryFn: () => backend.crm.getInactiveCustomers({ 
      days_threshold: daysThreshold, 
      limit: 100,
      risk_level: riskFilter || undefined
    }),
  });

  const inactiveData = inactiveCustomers as InactiveCustomersResponse;
  const customers = inactiveData?.customers || [];
  const riskAnalysis = inactiveData?.risk_analysis || { high_risk: 0, medium_risk: 0, low_risk: 0 };

  const formatDate = (date: string) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString("pt-BR");
    } catch {
      return 'N/A';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value || 0);
  };

  const getRiskLevel = (daysSinceLastPurchase: number) => {
    if (daysSinceLastPurchase > 180) return { level: "high", color: "destructive", label: "Alto Risco", bgColor: "bg-red-50", textColor: "text-red-700" };
    if (daysSinceLastPurchase > 120) return { level: "medium", color: "secondary", label: "Médio Risco", bgColor: "bg-yellow-50", textColor: "text-yellow-700" };
    return { level: "low", color: "outline", label: "Baixo Risco", bgColor: "bg-green-50", textColor: "text-green-700" };
  };

  const applyThreshold = () => {
    // A query será refeita automaticamente devido ao useQuery dependency
  };



  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes Inativos</h1>
          <p className="text-muted-foreground">
            Identifique clientes em risco de churn e oportunidades de reativação
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          <Users className="w-4 h-4 mr-1" />
          {customers.length} clientes inativos
        </Badge>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Dias sem comprar (mínimo)</label>
              <Input
                type="number"
                value={daysThreshold}
                onChange={(e) => setDaysThreshold(Number(e.target.value))}
                min="30"
                max="365"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Filtrar por risco</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
              >
                <option value="">Todos os níveis</option>
                <option value="high">Alto Risco</option>
                <option value="medium">Médio Risco</option>
                <option value="low">Baixo Risco</option>
              </select>
            </div>
            <Button onClick={applyThreshold} disabled={isLoading}>
              <Search className="w-4 h-4 mr-2" />
              Filtrar
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Mostrando clientes que não compram há mais de {daysThreshold} dias
            {riskFilter && ` • Filtro: ${riskFilter === 'high' ? 'Alto Risco' : riskFilter === 'medium' ? 'Médio Risco' : 'Baixo Risco'}`}
          </p>
        </CardContent>
      </Card>

      {/* Risk Level Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alto Risco</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {riskAnalysis.high_risk.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +180 dias sem comprar
            </p>
            <div className="mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setRiskFilter('high')}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Ver detalhes
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Médio Risco</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {riskAnalysis.medium_risk.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              120-180 dias sem comprar
            </p>
            <div className="mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setRiskFilter('medium')}
                className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
              >
                Ver detalhes
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Baixo Risco</CardTitle>
            <AlertTriangle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {riskAnalysis.low_risk.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              90-120 dias sem comprar
            </p>
            <div className="mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setRiskFilter('low')}
                className="text-green-600 border-green-200 hover:bg-green-50"
              >
                Ver detalhes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>



      {/* Inactive Customers List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes Inativos</CardTitle>
          <CardDescription>
            {customers.length} clientes encontrados • Ordenados por dias sem comprar
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Analisando clientes inativos...</span>
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-12">
              <TrendingDown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum cliente inativo encontrado
              </h3>
              <p className="text-gray-500">
                Todos os clientes fizeram compras recentemente ou ajuste os filtros.
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
                        <th className="text-left py-3 px-4 font-medium">Última Compra</th>
                        <th className="text-left py-3 px-4 font-medium">Histórico</th>
                        <th className="text-left py-3 px-4 font-medium">Risco</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((customer) => {
                        const risk = getRiskLevel(customer.days_since_last_purchase);
                        return (
                          <tr key={customer.customer_id} className={`border-b hover:${risk.bgColor} transition-colors`}>
                            <td className="py-3 px-4">
                              <div>
                                <div className="font-medium text-gray-900">
                                  {customer.customer_name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  ID: {customer.customer_id.slice(-8)}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="space-y-1">
                                {customer.email && (
                                  <div className="flex items-center text-sm">
                                    <Mail className="w-3 h-3 mr-1 text-gray-400" />
                                    {customer.email}
                                  </div>
                                )}
                                {customer.phone && (
                                  <div className="flex items-center text-sm">
                                    <Phone className="w-3 h-3 mr-1 text-gray-400" />
                                    {customer.phone}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-sm">
                                <div className="font-medium">
                                  {formatDate(customer.last_purchase_date)}
                                </div>
                                <div className="text-gray-500">
                                  {customer.days_since_last_purchase} dias atrás
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-sm">
                                <div className="font-medium">
                                  {customer.total_purchases} compras
                                </div>
                                <div className="text-green-600">
                                  {formatCurrency(customer.total_spent)}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant={risk.color as any} className={risk.textColor}>
                                {risk.label}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {customers.map((customer) => {
                  const risk = getRiskLevel(customer.days_since_last_purchase);
                  return (
                    <Card key={customer.customer_id} className={`${risk.bgColor} border-l-4 ${risk.textColor.replace('text-', 'border-')}`}>
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">
                              {customer.customer_name}
                            </h3>
                            <Badge variant={risk.color as any} className={risk.textColor}>
                              {risk.label}
                            </Badge>
                          </div>
                          
                          {customer.email && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Mail className="w-3 h-3 mr-2" />
                              {customer.email}
                            </div>
                          )}
                          
                          {customer.phone && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="w-3 h-3 mr-2" />
                              {customer.phone}
                            </div>
                          )}
                          
                          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                            <div>
                              <div className="text-xs text-gray-500">Última compra</div>
                              <div className="text-sm font-medium">
                                {formatDate(customer.last_purchase_date)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {customer.days_since_last_purchase} dias atrás
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">Histórico</div>
                              <div className="text-sm font-medium">
                                {customer.total_purchases} compras
                              </div>
                              <div className="text-xs text-green-600">
                                {formatCurrency(customer.total_spent)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}