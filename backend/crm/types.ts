export interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  category?: string;
  sku?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Sale {
  id: number;
  customer_id: number;
  total_amount: number;
  status: string;
  sale_date: Date;
  created_at: Date;
  updated_at: Date;
}

export interface SaleItem {
  id: number;
  sale_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: Date;
}

export interface SaleWithDetails extends Sale {
  customer_name: string;
  customer_email: string;
  items: Array<{
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
}

export interface SalesMetrics {
  total_sales: number;
  total_revenue: number;
  total_customers: number;
  average_order_value: number;
  sales_growth: number;
  revenue_growth: number;
}

export interface SalesChartData {
  date: string;
  sales: number;
  revenue: number;
}

export interface ProductSalesData {
  product_name: string;
  total_quantity: number;
  total_revenue: number;
  sales_count: number;
}

export interface CustomerSalesData {
  customer_name: string;
  total_purchases: number;
  total_spent: number;
  last_purchase: Date;
}

export interface InactiveCustomer {
  customer_id: number;
  customer_name: string;
  customer_email: string;
  company?: string;
  last_purchase_date: Date;
  days_since_last_purchase: number;
  total_lifetime_value: number;
  total_purchases: number;
  average_order_value: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
}

export interface CustomerRFMData {
  customer_id: number;
  customer_name: string;
  customer_email: string;
  company?: string;
  recency_days: number;
  frequency_score: number;
  monetary_value: number;
  rfm_score: string;
  segment: 'Champions' | 'Loyal Customers' | 'Potential Loyalists' | 'New Customers' | 'Promising' | 'Need Attention' | 'About to Sleep' | 'At Risk' | 'Cannot Lose Them' | 'Hibernating' | 'Lost';
  lifetime_value: number;
  average_order_value: number;
  total_orders: number;
  last_purchase_date: Date;
  customer_since: Date;
  recommended_action: string;
}

export interface ProductAnalytics {
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
