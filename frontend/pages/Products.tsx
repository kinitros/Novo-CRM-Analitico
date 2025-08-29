import { useQuery } from "@tanstack/react-query";
import backend from "../client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Products() {
  const { data: productData, isLoading } = useQuery({
    queryKey: ["product-sales-detailed"],
    queryFn: () => backend.crm.getProductSales({ limit: 20 }),
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Produtos</h1>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Receita por Produto</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-80 flex items-center justify-center">
              <div className="animate-pulse text-muted-foreground">Carregando gráfico...</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productData?.products.slice(0, 10) || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="product_name" 
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis fontSize={12} />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), "Receita"]}
                />
                <Bar dataKey="total_revenue" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Product List */}
      <Card>
        <CardHeader>
          <CardTitle>Desempenho dos Produtos</CardTitle>
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
              {productData?.products.map((product, index) => (
                <div key={product.product_name} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="text-xs">
                        #{index + 1}
                      </Badge>
                      <span className="font-medium">{product.product_name}</span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {product.total_quantity} unidades vendidas em {product.sales_count} vendas
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-lg">
                      {formatCurrency(product.total_revenue)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Receita total
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
