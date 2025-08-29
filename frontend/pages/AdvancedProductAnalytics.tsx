import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import backend from "~backend/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  DollarSign, 
  Users,
  ShoppingCart,
  BarChart3,
  Calendar,
  Target,
  Award
} from "lucide-react";
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
  PieChart, 
  Pie, 
  Cell,
  ScatterChart,
  Scatter
} from "recharts";

export default function AdvancedProductAnalytics() {
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState("total_revenue");
  const [timePeriod, setTimePeriod] = useState("365");
  const [limit, setLimit] = useState("50");

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ["advanced-product-analytics", category, sortBy, timePeriod, limit],
    queryFn: () => backend.crm.getAdvancedProductAnalytics({ 
      category: category || undefined,
      sort_by: sortBy,
      time_period: parseInt(timePeriod),
      limit: parseInt(limit)
    }),
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'growing': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <BarChart3 className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'growing': return 'bg-green-100 text-green-800 border-green-200';
      case 'declining': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  // Prepare data for charts
  const topProductsData = analyticsData ? 
    analyticsData.products.slice(0, 10).map(product => ({
      name: product.product_name.length > 15 ? 
        product.product_name.substring(0, 15) + '...' : product.product_name,
      fullName: product.product_name,
      revenue: product.total_revenue,
      quantity: product.total_quantity_sold,
      customers: product.unique_customers
    })) : [];

  const categoryData = analyticsData ? 
    Object.entries(analyticsData.category_summary).map(([category, data]) => ({
      name: category,
      products: data.total_products,
      revenue: data.total_revenue,
      performance: data.avg_performance_score
    })) : [];

  const performanceScatterData = analyticsData ? 
    analyticsData.products.slice(0, 30).map(product => ({
      x: product.total_quantity_sold,
      y: product.total_revenue,
      z: product.profitability_score,
      name: product.product_name,
      trend: product.performance_trend
    })) : [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Análise Avançada de Produtos</h1>
        <div className="flex gap-4">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas</SelectItem>
              <SelectItem value="Software">Software</SelectItem>
              <SelectItem value="Serviços">Serviços</SelectItem>
              <SelectItem value="Educação">Educação</SelectItem>
              <SelectItem value="Suporte">Suporte</SelectItem>
              <SelectItem value="Licenças">Licenças</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="total_revenue">Receita</SelectItem>
              <SelectItem value="total_quantity_sold">Quantidade</SelectItem>
              <SelectItem value="growth_rate">Crescimento</SelectItem>
            </SelectContent>
          </Select>

          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="90">90 dias</SelectItem>
              <SelectItem value="180">180 dias</SelectItem>
              <SelectItem value="365">1 ano</SelectItem>
              <SelectItem value="730">2 anos</SelectItem>
            </SelectContent>
          </Select>

          <Select value={limit} onValueChange={setLimit}>
            <SelectTrigger className="w-24">
              <SelectValue placeholder="Limite" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Insights Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos em Crescimento</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {analyticsData?.insights.top_growing_products.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Com tendência de alta
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos em Declínio</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {analyticsData?.insights.declining_products.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Precisam atenção
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos Sazonais</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {analyticsData?.insights.seasonal_products.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Com variação sazonal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alto Valor</CardTitle>
            <Award className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {analyticsData?.insights.high_value_products.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Maior valor por cliente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Insights */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Top Produtos em Crescimento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analyticsData?.insights.top_growing_products.slice(0, 5).map((product, index) => (
                <div key={product} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded">
                  <span className="text-sm font-medium">{product}</span>
                  <Badge className="bg-green-100 text-green-800">#{index + 1}</Badge>
                </div>
              )) || <div className="text-muted-foreground text-sm">Nenhum produto em crescimento identificado</div>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Produtos de Alto Valor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analyticsData?.insights.high_value_products.slice(0, 5).map((product, index) => (
                <div key={product} className="flex items-center justify-between p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                  <span className="text-sm font-medium">{product}</span>
                  <Badge className="bg-yellow-100 text-yellow-800">#{index + 1}</Badge>
                </div>
              )) || <div className="text-muted-foreground text-sm">Nenhum produto de alto valor identificado</div>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Produtos por Receita</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Carregando gráfico...</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProductsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis fontSize={12} />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), "Receita"]}
                    labelFormatter={(label) => {
                      const item = topProductsData.find(d => d.name === label);
                      return item ? item.fullName : label;
                    }}
                  />
                  <Bar dataKey="revenue" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Carregando gráfico...</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="revenue"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [formatCurrency(value), "Receita"]} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Análise de Performance - Quantidade vs Receita</CardTitle>
          <p className="text-sm text-muted-foreground">
            Cada ponto representa um produto. Tamanho do ponto = Score de Lucratividade
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-80 flex items-center justify-center">
              <div className="animate-pulse text-muted-foreground">Carregando gráfico...</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart data={performanceScatterData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="x" 
                  name="Quantidade"
                  fontSize={12}
                  label={{ value: 'Quantidade Vendida', position: 'insideBottom', offset: -10 }}
                />
                <YAxis 
                  dataKey="y" 
                  name="Receita"
                  fontSize={12}
                  label={{ value: 'Receita Total', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'Quantidade') return [value, 'Unidades'];
                    if (name === 'Receita') return [formatCurrency(Number(value)), 'Receita'];
                    return [value, name];
                  }}
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0]) {
                      const data = payload[0].payload;
                      return `${data.name} (${data.trend})`;
                    }
                    return label;
                  }}
                />
                <Scatter 
                  dataKey="y" 
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
              </ScatterChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Product List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista Detalhada de Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="animate-pulse space-y-2 p-4 border rounded">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {analyticsData?.products.map((product) => (
                <div key={product.product_id} className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Package className="h-5 w-5 text-blue-500" />
                        <span className="font-medium text-lg">{product.product_name}</span>
                        <Badge className={`${getTrendColor(product.performance_trend)} border`}>
                          {getTrendIcon(product.performance_trend)}
                          {product.performance_trend === 'growing' ? 'Crescendo' :
                           product.performance_trend === 'declining' ? 'Declinando' : 'Estável'}
                        </Badge>
                        {product.sku && (
                          <Badge variant="outline" className="text-xs">
                            SKU: {product.sku}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-sm text-muted-foreground mb-3">
                        Categoria: {product.category} • Preço: {formatCurrency(product.price)}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Receita Total:</span>
                          <div className="font-medium text-green-600">{formatCurrency(product.total_revenue)}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Quantidade:</span>
                          <div className="font-medium">{product.total_quantity_sold}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Pedidos:</span>
                          <div className="font-medium">{product.total_orders}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Clientes:</span>
                          <div className="font-medium">{product.unique_customers}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Crescimento:</span>
                          <div className={`font-medium ${
                            product.growth_rate > 0 ? 'text-green-600' : 
                            product.growth_rate < 0 ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {product.growth_rate > 0 ? '+' : ''}{product.growth_rate.toFixed(1)}%
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Score:</span>
                          <div className="font-medium">{product.profitability_score.toFixed(0)}/100</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mt-3">
                        <div>
                          <span className="text-muted-foreground">Qtd. Média/Pedido:</span>
                          <div className="font-medium">{product.average_order_quantity.toFixed(1)}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Receita/Cliente:</span>
                          <div className="font-medium">{formatCurrency(product.revenue_per_customer)}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Última Venda:</span>
                          <div className="font-medium">
                            {product.days_since_last_sale < 999 ? 
                              `${product.days_since_last_sale} dias atrás` : 'Nunca'
                            }
                          </div>
                        </div>
                      </div>

                      {/* Seasonal Performance */}
                      {product.seasonal_performance.length > 0 && (
                        <div className="mt-4">
                          <div className="text-sm font-medium mb-2">Performance Sazonal (Últimos 12 meses):</div>
                          <div className="grid grid-cols-6 gap-2">
                            {product.seasonal_performance.map((month) => (
                              <div key={month.month} className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs">
                                <div className="font-medium">{month.month}/</div>
                                <div className="text-green-600">{formatCurrency(month.revenue)}</div>
                                <div className="text-muted-foreground">{month.quantity} un.</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Customer Segments */}
                      {product.customer_segments.length > 0 && (
                        <div className="mt-4">
                          <div className="text-sm font-medium mb-2">Performance por Segmento de Cliente:</div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            {product.customer_segments.map((segment) => (
                              <div key={segment.segment} className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs">
                                <div className="font-medium">{segment.segment}</div>
                                <div className="text-blue-600">{formatCurrency(segment.revenue)}</div>
                                <div className="text-muted-foreground">{segment.customers} clientes</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}