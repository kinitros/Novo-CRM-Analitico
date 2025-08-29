import { api, Query } from "encore.dev/api";
import { crmDB } from "./db";
import { ProductSalesData } from "./types";

interface GetProductSalesParams {
  limit: Query<number>;
}

interface GetProductSalesResponse {
  products: ProductSalesData[];
}

// Retrieves top-selling products with sales statistics.
export const getProductSales = api<GetProductSalesParams, GetProductSalesResponse>(
  { expose: true, method: "GET", path: "/crm/product-sales" },
  async ({ limit }) => {
    const queryLimit = limit || 10;

    const rows = await crmDB.queryAll<ProductSalesData>`
      SELECT 
        p.name as product_name,
        SUM(si.quantity)::INTEGER as total_quantity,
        SUM(si.total_price) as total_revenue,
        COUNT(DISTINCT si.sale_id)::INTEGER as sales_count
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
      GROUP BY p.id, p.name
      ORDER BY total_revenue DESC
      LIMIT ${queryLimit}
    `;

    return { products: rows };
  }
);
