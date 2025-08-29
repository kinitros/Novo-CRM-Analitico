import { api } from "encore.dev/api";
import { crmDB } from "./db";
import { SalesMetrics } from "./types";

// Retrieves comprehensive sales metrics and KPIs.
export const getSalesMetrics = api<void, SalesMetrics>(
  { expose: true, method: "GET", path: "/crm/metrics" },
  async () => {
    const currentDate = new Date();
    const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    // Get current month metrics
    const currentMetrics = await crmDB.queryRow`
      SELECT 
        COUNT(*)::INTEGER as total_sales,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COUNT(DISTINCT customer_id)::INTEGER as total_customers,
        COALESCE(AVG(total_amount), 0) as average_order_value
      FROM sales 
      WHERE sale_date >= ${currentMonth}
    `;

    // Get last month metrics for growth calculation
    const lastMonthMetrics = await crmDB.queryRow`
      SELECT 
        COUNT(*)::INTEGER as total_sales,
        COALESCE(SUM(total_amount), 0) as total_revenue
      FROM sales 
      WHERE sale_date >= ${lastMonth} AND sale_date < ${currentMonth}
    `;

    const salesGrowth = lastMonthMetrics?.total_sales 
      ? ((currentMetrics!.total_sales - lastMonthMetrics.total_sales) / lastMonthMetrics.total_sales) * 100
      : 0;

    const revenueGrowth = lastMonthMetrics?.total_revenue 
      ? ((currentMetrics!.total_revenue - lastMonthMetrics.total_revenue) / lastMonthMetrics.total_revenue) * 100
      : 0;

    return {
      total_sales: currentMetrics!.total_sales,
      total_revenue: currentMetrics!.total_revenue,
      total_customers: currentMetrics!.total_customers,
      average_order_value: currentMetrics!.average_order_value,
      sales_growth: salesGrowth,
      revenue_growth: revenueGrowth,
    };
  }
);
