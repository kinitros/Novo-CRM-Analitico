import { api, Query } from "encore.dev/api";
import { crmDB } from "./db";

interface ProductAnalytics {
  product_id: number;
  product_name: string;
  category: string;
  sku?: string;
  price: number;
  total_revenue: number;
  total_quantity_sold: number;
  total_orders: number;
  unique_customers: number;
  average_order_quantity: number;
  revenue_per_customer: number;
  conversion_rate: number;
  growth_rate: number;
  seasonal_performance: {
    month: number;
    revenue: number;
    quantity: number;
    orders: number;
  }[];
  customer_segments: {
    segment: string;
    revenue: number;
    quantity: number;
    customers: number;
  }[];
  performance_trend: 'growing' | 'stable' | 'declining';
  last_sale_date: Date;
  days_since_last_sale: number;
  inventory_turnover: number;
  profitability_score: number;
}

interface GetAdvancedProductAnalyticsParams {
  product_id?: Query<number>;
  category?: Query<string>;
  limit?: Query<number>;
  sort_by?: Query<string>;
  time_period?: Query<number>; // days
}

interface GetAdvancedProductAnalyticsResponse {
  products: ProductAnalytics[];
  category_summary: {
    [category: string]: {
      total_products: number;
      total_revenue: number;
      avg_performance_score: number;
      top_performer: string;
    };
  };
  insights: {
    top_growing_products: string[];
    declining_products: string[];
    seasonal_products: string[];
    high_value_products: string[];
  };
}

// Provides comprehensive product analytics including performance, trends, and profitability.
export const getAdvancedProductAnalytics = api<GetAdvancedProductAnalyticsParams, GetAdvancedProductAnalyticsResponse>(
  { expose: true, method: "GET", path: "/crm/advanced-product-analytics" },
  async ({ product_id, category, limit, sort_by, time_period }) => {
    const queryLimit = limit || 50;
    const timePeriod = time_period || 365; // Default 1 year
    const sortBy = sort_by || 'total_revenue';
    
    let productFilter = "";
    if (product_id) {
      productFilter += ` AND p.id = ${product_id}`;
    }
    if (category) {
      productFilter += ` AND p.category = '${category}'`;
    }

    // Get basic product analytics
    const productData = await crmDB.queryAll<{
      product_id: number;
      product_name: string;
      category: string;
      sku: string | null;
      price: number;
      total_revenue: number;
      total_quantity_sold: number;
      total_orders: number;
      unique_customers: number;
      last_sale_date: Date;
      first_sale_date: Date;
    }>`
      SELECT 
        p.id as product_id,
        p.name as product_name,
        COALESCE(p.category, 'Sem categoria') as category,
        p.sku,
        p.price,
        COALESCE(SUM(si.total_price), 0) as total_revenue,
        COALESCE(SUM(si.quantity), 0) as total_quantity_sold,
        COUNT(DISTINCT si.sale_id) as total_orders,
        COUNT(DISTINCT s.customer_id) as unique_customers,
        MAX(s.sale_date) as last_sale_date,
        MIN(s.sale_date) as first_sale_date
      FROM products p
      LEFT JOIN sale_items si ON p.id = si.product_id
      LEFT JOIN sales s ON si.sale_id = s.id
      WHERE s.sale_date >= NOW() - INTERVAL '${timePeriod} days' OR s.sale_date IS NULL
        ${productFilter}
      GROUP BY p.id, p.name, p.category, p.sku, p.price
      ORDER BY ${sortBy === 'total_revenue' ? 'total_revenue' : 
                sortBy === 'total_quantity_sold' ? 'total_quantity_sold' : 
                sortBy === 'growth_rate' ? 'total_revenue' : 'total_revenue'} DESC
      LIMIT ${queryLimit}
    `;

    const products: ProductAnalytics[] = [];

    for (const product of productData) {
      // Calculate derived metrics
      const averageOrderQuantity = product.total_orders > 0 ? product.total_quantity_sold / product.total_orders : 0;
      const revenuePerCustomer = product.unique_customers > 0 ? product.total_revenue / product.unique_customers : 0;
      const daysSinceLastSale = product.last_sale_date ? 
        Math.floor((new Date().getTime() - product.last_sale_date.getTime()) / (1000 * 60 * 60 * 24)) : 999;

      // Calculate growth rate (comparing first half vs second half of period)
      const halfPeriod = Math.floor(timePeriod / 2);
      const midDate = new Date();
      midDate.setDate(midDate.getDate() - halfPeriod);

      const recentRevenue = await crmDB.queryRow<{ revenue: number }>`
        SELECT COALESCE(SUM(si.total_price), 0) as revenue
        FROM sale_items si
        JOIN sales s ON si.sale_id = s.id
        WHERE si.product_id = ${product.product_id}
          AND s.sale_date >= ${midDate}
      `;

      const olderRevenue = await crmDB.queryRow<{ revenue: number }>`
        SELECT COALESCE(SUM(si.total_price), 0) as revenue
        FROM sale_items si
        JOIN sales s ON si.sale_id = s.id
        WHERE si.product_id = ${product.product_id}
          AND s.sale_date < ${midDate}
          AND s.sale_date >= NOW() - INTERVAL '${timePeriod} days'
      `;

      const growthRate = olderRevenue && olderRevenue.revenue > 0 ? 
        ((recentRevenue!.revenue - olderRevenue.revenue) / olderRevenue.revenue) * 100 : 0;

      // Get seasonal performance
      const seasonalData = await crmDB.queryAll<{
        month: number;
        revenue: number;
        quantity: number;
        orders: number;
      }>`
        SELECT 
          EXTRACT(MONTH FROM s.sale_date) as month,
          SUM(si.total_price) as revenue,
          SUM(si.quantity) as quantity,
          COUNT(DISTINCT si.sale_id) as orders
        FROM sale_items si
        JOIN sales s ON si.sale_id = s.id
        WHERE si.product_id = ${product.product_id}
          AND s.sale_date >= NOW() - INTERVAL '12 months'
        GROUP BY EXTRACT(MONTH FROM s.sale_date)
        ORDER BY month
      `;

      // Get customer segment performance (simplified - based on customer value)
      const segmentData = await crmDB.queryAll<{
        segment: string;
        revenue: number;
        quantity: number;
        customers: number;
      }>`
        WITH customer_segments AS (
          SELECT 
            s.customer_id,
            SUM(s.total_amount) as customer_total,
            CASE 
              WHEN SUM(s.total_amount) >= 10000 THEN 'High Value'
              WHEN SUM(s.total_amount) >= 5000 THEN 'Medium Value'
              ELSE 'Low Value'
            END as segment
          FROM sales s
          WHERE s.sale_date >= NOW() - INTERVAL '12 months'
          GROUP BY s.customer_id
        )
        SELECT 
          cs.segment,
          SUM(si.total_price) as revenue,
          SUM(si.quantity) as quantity,
          COUNT(DISTINCT s.customer_id) as customers
        FROM sale_items si
        JOIN sales s ON si.sale_id = s.id
        JOIN customer_segments cs ON s.customer_id = cs.customer_id
        WHERE si.product_id = ${product.product_id}
        GROUP BY cs.segment
        ORDER BY revenue DESC
      `;

      // Determine performance trend
      let performanceTrend: 'growing' | 'stable' | 'declining';
      if (growthRate > 10) {
        performanceTrend = 'growing';
      } else if (growthRate < -10) {
        performanceTrend = 'declining';
      } else {
        performanceTrend = 'stable';
      }

      // Calculate inventory turnover (simplified)
      const inventoryTurnover = product.total_quantity_sold / Math.max(1, timePeriod / 365);

      // Calculate profitability score (0-100)
      const profitabilityScore = Math.min(100, 
        (product.total_revenue / Math.max(1, product.price * product.total_quantity_sold)) * 100
      );

      products.push({
        product_id: product.product_id,
        product_name: product.product_name,
        category: product.category,
        sku: product.sku,
        price: product.price,
        total_revenue: product.total_revenue,
        total_quantity_sold: product.total_quantity_sold,
        total_orders: product.total_orders,
        unique_customers: product.unique_customers,
        average_order_quantity: averageOrderQuantity,
        revenue_per_customer: revenuePerCustomer,
        conversion_rate: 0, // Would need page view data
        growth_rate: growthRate,
        seasonal_performance: seasonalData,
        customer_segments: segmentData,
        performance_trend: performanceTrend,
        last_sale_date: product.last_sale_date,
        days_since_last_sale: daysSinceLastSale,
        inventory_turnover: inventoryTurnover,
        profitability_score: profitabilityScore
      });
    }

    // Calculate category summary
    const categorySummary: { [category: string]: any } = {};
    const categories = [...new Set(products.map(p => p.category))];
    
    categories.forEach(cat => {
      const categoryProducts = products.filter(p => p.category === cat);
      const topPerformer = categoryProducts.reduce((prev, current) => 
        prev.total_revenue > current.total_revenue ? prev : current
      );
      
      categorySummary[cat] = {
        total_products: categoryProducts.length,
        total_revenue: categoryProducts.reduce((sum, p) => sum + p.total_revenue, 0),
        avg_performance_score: categoryProducts.reduce((sum, p) => sum + p.profitability_score, 0) / categoryProducts.length,
        top_performer: topPerformer.product_name
      };
    });

    // Generate insights
    const insights = {
      top_growing_products: products
        .filter(p => p.performance_trend === 'growing')
        .sort((a, b) => b.growth_rate - a.growth_rate)
        .slice(0, 5)
        .map(p => p.product_name),
      declining_products: products
        .filter(p => p.performance_trend === 'declining')
        .sort((a, b) => a.growth_rate - b.growth_rate)
        .slice(0, 5)
        .map(p => p.product_name),
      seasonal_products: products
        .filter(p => {
          const maxMonth = Math.max(...p.seasonal_performance.map(s => s.revenue));
          const minMonth = Math.min(...p.seasonal_performance.map(s => s.revenue));
          return maxMonth > minMonth * 2; // High seasonal variation
        })
        .slice(0, 5)
        .map(p => p.product_name),
      high_value_products: products
        .sort((a, b) => b.revenue_per_customer - a.revenue_per_customer)
        .slice(0, 5)
        .map(p => p.product_name)
    };

    return {
      products,
      category_summary: categorySummary,
      insights
    };
  }
);