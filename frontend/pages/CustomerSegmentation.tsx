import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import backend from "~backend/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Crown, 
  Heart, 
  TrendingUp, 
  UserPlus, 
  Star,
  AlertCircle,
  Moon,
  AlertTriangle,
  Shield,
  Zap,
  X
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ScatterChart, Scatter } from "recharts";

export default function CustomerSegmentation() {
  const [selectedSegment, setSelectedSegment] = useState("");
  const [limit, setLimit] = useState("100");

  const { data: segmentationData, isLoading } = useQuery({
    queryKey: ["customer-segmentation", selectedSegment, limit],
    queryFn: () => backend.crm.getCustomerSegmentation({ 
      segment: selectedSegment || undefined,
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

  const getSegmentIcon = (segment: string) => {
    switch (segment) {
      case 'Champions': return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'Loyal Customers': return <Heart className="h-4 w-4 text-red-500" />;
      case 'Potential Loyalists': return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'New Customers': return <UserPlus className="h-4 w-4 text-green-500" />;
      case 'Promising': return <Star className="h-4 w-4 text-purple-500" />;
      case 'Need Attention': return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'About to Sleep': return <Moon className="h-4 w-4 text-indigo-500" />;
      case 'At Risk': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'Cannot Lose Them': return <Shield className="h-4 w-4 text-red-700" />;
      case 'Hibernating': return <Zap className="h-4 w-4 text-gray-500" />;
      case 'Lost': return <X className="h-4 w-4 text-gray-700" />;
      default: return <UserPlus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case 'Champions': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Loyal Customers': return 'bg-red-100 text-red-800 border-red-200';
      case 'Potential Loyalists': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'New Customers': return 'bg-green-100 text-green-800 border-green-200';
      case 'Promising': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Need Attention': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'About to Sleep': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'At Risk': return 'bg-red-100 text-red-800 border-red-200';
      case 'Cannot Lose Them': return 'bg-red-200 text-red-900 border-red-300';
      case 'Hibernating': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Lost': return 'bg-gray-200 text-gray-900 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Prepare data for charts
  const segmentDistributionData = segmentationData ? 
    Object.entries(segmentationData.segment_summary).map(([segment, data]) => ({
      name: segment,
      value: data.count,
      revenue: data.total_value
    })) : [];

  const segmentValueData = segmentationData ? 
    Object.entries(segmentationData.segment_summary)
      .sort((a, b) => b[1].total_value - a[1].total_value)
      .slice(0, 8)
      .map(([segment, data]) => ({
        name: segment.length > 12 ? segment.substring(0, 12) + '...' : segment,
        fullName: segment,
        value: data.total_value,
        count: data.count
      })) : [];

  const rfmScatterData = segmentationData ? 
    segmentationData.customers.slice(0, 50).map(customer => ({
      x: customer.frequency_score,
      y: customer.monetary_value,
      z: customer.recency_days,
      name: customer.customer_name,
      segment: customer.segment
    })) : [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C', '#8DD1E1', '#D084D0', '#87D068'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Segmentação de Clientes (RFM)</h1>
        <div className="flex gap-4">
          <Select value={selectedSegment} onValueChange={setSelectedSegment}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por segmento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os segmentos</SelectItem>
              <SelectItem value="Champions">Champions</SelectItem>
              <SelectItem value="Loyal Customers">Clientes Leais</SelectItem>
              <SelectItem value="Potential Loyalists">Potenciais Leais</SelectItem>
              <SelectItem value="New Customers">Novos Clientes</SelectItem>
              <SelectItem value="Promising">Promissores</SelectItem>
              <SelectItem value="Need Attention">Precisam Atenção</SelectItem>
              <SelectItem value="About to Sleep">Prestes a Dormir</SelectItem>
              <SelectItem value="At Risk">Em Risco</SelectItem>
              <SelectItem value="Cannot Lose Them">Não Podemos Perder</SelectItem>
              <SelectItem value="Hibernating">Hibernando</SelectItem>
              <SelectItem value="Lost">Perdidos</SelectItem>
            </SelectContent>
          </Select>

          <Select value={limit} onValueChange={setLimit}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Limite" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
              <SelectItem value="200">200</SelectItem>
              <SelectItem value="500">500</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{segmentationData?.total_customers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Clientes analisados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Champions</CardTitle>
            <Crown className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {segmentationData?.segment_summary['Champions']?.count || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Melhores clientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Risco</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {(segmentationData?.segment_summary['At Risk']?.count || 0) + 
               (segmentationData?.segment_summary['Cannot Lose Them']?.count || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Precisam atenção urgente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(
                Object.values(segmentationData?.segment_summary || {})
                  .reduce((sum, segment) => sum + segment.total_value, 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Valor total dos clientes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Segmento</CardTitle>
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
                    data={segmentDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {segmentDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Valor por Segmento</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Carregando gráfico...</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={segmentValueData}>
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
                    formatter={(value: number) => [formatCurrency(value), "Valor Total"]}
                    labelFormatter={(label) => {
                      const item = segmentValueData.find(d => d.name === label);
                      return item ? item.fullName : label;
                    }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* RFM Analysis Scatter Plot */}
      <Card>
        <CardHeader>
          <CardTitle>Análise RFM - Frequência vs Valor Monetário</CardTitle>
          <p className="text-sm text-muted-foreground">
            Cada ponto representa um cliente. Tamanho do ponto = Recência (menor = mais recente)
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-80 flex items-center justify-center">
              <div className="animate-pulse text-muted-foreground">Carregando gráfico...</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart data={rfmScatterData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="x" 
                  name="Frequência"
                  fontSize={12}
                  label={{ value: 'Frequência de Compras', position: 'insideBottom', offset: -10 }}
                />
                <YAxis 
                  dataKey="y" 
                  name="Valor Monetário"
                  fontSize={12}
                  label={{ value: 'Valor Monetário', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'Frequência') return [value, 'Compras'];
                    if (name === 'Valor Monetário') return [formatCurrency(Number(value)), 'Valor Total'];
                    return [value, name];
                  }}
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0]) {
                      const data = payload[0].payload;
                      return `${data.name} (${data.segment})`;
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

      {/* Customer List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes Segmentados</CardTitle>
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
              {segmentationData?.customers.map((customer) => (
                <div key={customer.customer_id} className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getSegmentIcon(customer.segment)}
                        <span className="font-medium text-lg">{customer.customer_name}</span>
                        <Badge className={`${getSegmentColor(customer.segment)} border`}>
                          {customer.segment}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          RFM: {customer.rfm_score}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground mb-2">
                        {customer.customer_email} {customer.company && `• ${customer.company}`}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Recência:</span>
                          <div className="font-medium">{customer.recency_days} dias</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Frequência:</span>
                          <div className="font-medium">{customer.frequency_score} compras</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Valor Total:</span>
                          <div className="font-medium">{formatCurrency(customer.monetary_value)}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Ticket Médio:</span>
                          <div className="font-medium">{formatCurrency(customer.average_order_value)}</div>
                        </div>
                      </div>
                      
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                          Ação Recomendada:
                        </div>
                        <div className="text-sm text-blue-800 dark:text-blue-200">
                          {customer.recommended_action}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right ml-4">
                      <div className="text-sm text-muted-foreground">Última Compra</div>
                      <div className="font-medium">{formatDate(customer.last_purchase_date)}</div>
                      <div className="text-sm text-muted-foreground mt-2">Cliente desde</div>
                      <div className="font-medium">{formatDate(customer.customer_since)}</div>
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