import { api, Query } from "encore.dev/api";
import { crmDB } from "./db";
import { SaleWithDetails } from "./types";

interface GetSalesParams {
  limit: Query<number>;
  offset: Query<number>;
}

interface GetSalesResponse {
  sales: SaleWithDetails[];
  total: number;
}

// Retrieves detailed sales information with customer and product details.
export const getSales = api<GetSalesParams, GetSalesResponse>(
  { expose: true, method: "GET", path: "/crm/sales" },
  async ({ limit, offset }) => {
    const queryLimit = limit || 20;
    const queryOffset = offset || 0;

    // Get total count
    const totalResult = await crmDB.queryRow<{ count: number }>`
      SELECT COUNT(*)::INTEGER as count FROM sales
    `;

    // Get sales with customer details
    const salesRows = await crmDB.queryAll<{
      id: number;
      customer_id: number;
      total_amount: number;
      status: string;
      sale_date: Date;
      created_at: Date;
      updated_at: Date;
      customer_name: string;
      customer_email: string;
    }>`
      SELECT 
        s.id, s.customer_id, s.total_amount, s.status, s.sale_date, s.created_at, s.updated_at,
        c.name as customer_name, c.email as customer_email
      FROM sales s
      JOIN customers c ON s.customer_id = c.id
      ORDER BY s.sale_date DESC
      LIMIT ${queryLimit} OFFSET ${queryOffset}
    `;

    // Get sale items for each sale
    const salesWithDetails: SaleWithDetails[] = [];
    for (const sale of salesRows) {
      const items = await crmDB.queryAll<{
        product_name: string;
        quantity: number;
        unit_price: number;
        total_price: number;
      }>`
        SELECT 
          p.name as product_name,
          si.quantity,
          si.unit_price,
          si.total_price
        FROM sale_items si
        JOIN products p ON si.product_id = p.id
        WHERE si.sale_id = ${sale.id}
      `;

      salesWithDetails.push({
        ...sale,
        items,
      });
    }

    return {
      sales: salesWithDetails,
      total: totalResult?.count || 0,
    };
  }
);
