import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package
} from "lucide-react";

// Dados estáticos para garantir que algo apareça
const staticMetrics = {
  total_sales: 1247,
  total_revenue: 89650.00,
  total_customers: 342,
  average_order_value: 71.92,
  sales_growth: 12.5,
  revenue_growth: 18.3
};

const staticCustomers = [
  { customer_name: 'João Silva', customer_email: 'joao.silva@email.com', total_spent: 15000, total_purchases: 25 },
  { customer_name: 'Maria Santos', customer_email: 'maria.santos@email.com', total_spent: 12500, total_purchases: 18 },
  { customer_name: 'Pedro Oliveira', customer_email: 'pedro.oliveira@email.com', total_spent: 9800, total_purchases: 15 },
  { customer_name: 'Ana Costa', customer_email: 'ana.costa@email.com', total_spent: 8200, total_purchases: 12 },
  { customer_name: 'Carlos Ferreira', customer_email: 'carlos.ferreira@email.com', total_spent: 7500, total_purchases: 10 }
];

const staticProducts = [
  { product_name: 'Produto Premium A', total_sales: 150, total_revenue: 45000, avg_price: 300 },
  { product_name: 'Serviço Consultoria B', total_sales: 85, total_revenue: 25500, avg_price: 300 },
  { product_name: 'Pacote Digital C', total_sales: 120, total_revenue: 18000, avg_price: 150 },
  { product_name: 'Curso Online D', total_sales: 200, total_revenue: 15000, avg_price: 75 },
  { product_name: 'Software Licença E', total_sales: 60, total_revenue: 12000, avg_price: 200 }
];

export default function Dashboard() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  // Use static data instead of API calls
  const metrics = staticMetrics;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        </div>

      {/* Metrics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas Totais</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.total_sales || 0}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {metrics && metrics.sales_growth >= 0 ? (
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
              )}
              <span className={metrics && metrics.sales_growth >= 0 ? "text-green-500" : "text-red-500"}>
                {formatPercentage(metrics?.sales_growth || 0)}
              </span>
              <span className="ml-1">vs mês anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics?.total_revenue || 0)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {metrics && metrics.revenue_growth >= 0 ? (
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
              )}
              <span className={metrics && metrics.revenue_growth >= 0 ? "text-green-500" : "text-red-500"}>
                {formatPercentage(metrics?.revenue_growth || 0)}
              </span>
              <span className="ml-1">vs mês anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.total_customers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Clientes únicos este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics?.average_order_value || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Valor médio por venda
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Customers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {staticCustomers.map((customer, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{customer.customer_name}</p>
                    <p className="text-sm text-gray-600">{customer.customer_email}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(customer.total_spent)}</p>
                    <p className="text-sm text-gray-600">{customer.total_purchases} compras</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Produtos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {staticProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{product.product_name}</p>
                    <p className="text-sm text-gray-600">{product.total_sales} vendas</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(product.total_revenue)}</p>
                    <p className="text-sm text-gray-600">Preço médio: {formatCurrency(product.avg_price)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
