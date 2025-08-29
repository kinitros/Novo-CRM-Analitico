import { api, Query } from "encore.dev/api";
import { crmDB } from "./db";
import { SalesChartData } from "./types";

interface GetSalesChartDataParams {
  days: Query<number>;
}

interface GetSalesChartDataResponse {
  data: SalesChartData[];
}

// Retrieves sales and revenue data for chart visualization over specified number of days.
export const getSalesChartData = api<GetSalesChartDataParams, GetSalesChartDataResponse>(
  { expose: true, method: "GET", path: "/crm/sales-chart" },
  async ({ days }) => {
    const daysToQuery = days || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysToQuery);

    const rows = await crmDB.queryAll<{
      date: string;
      sales: number;
      revenue: number;
    }>`
      SELECT 
        DATE(sale_date) as date,
        COUNT(*)::INTEGER as sales,
        COALESCE(SUM(total_amount), 0) as revenue
      FROM sales 
      WHERE sale_date >= ${startDate}
      GROUP BY DATE(sale_date)
      ORDER BY date ASC
    `;

    return { data: rows };
  }
);
