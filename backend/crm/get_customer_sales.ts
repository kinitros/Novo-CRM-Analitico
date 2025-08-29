import { api, Query } from "encore.dev/api";
import { crmDB } from "./db";
import { CustomerSalesData } from "./types";

interface GetCustomerSalesParams {
  limit: Query<number>;
}

interface GetCustomerSalesResponse {
  customers: CustomerSalesData[];
}

// Retrieves top customers with their purchase statistics.
export const getCustomerSales = api<GetCustomerSalesParams, GetCustomerSalesResponse>(
  { expose: true, method: "GET", path: "/crm/customer-sales" },
  async ({ limit }) => {
    const queryLimit = limit || 10;

    const rows = await crmDB.queryAll<CustomerSalesData>`
      SELECT 
        c.name as customer_name,
        COUNT(s.id)::INTEGER as total_purchases,
        SUM(s.total_amount) as total_spent,
        MAX(s.sale_date) as last_purchase
      FROM customers c
      JOIN sales s ON c.id = s.customer_id
      GROUP BY c.id, c.name
      ORDER BY total_spent DESC
      LIMIT ${queryLimit}
    `;

    return { customers: rows };
  }
);
