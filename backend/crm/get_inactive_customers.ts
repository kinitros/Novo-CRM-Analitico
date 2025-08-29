import { api, Query } from "encore.dev/api";
import { crmDB } from "./db";

interface InactiveCustomer {
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

interface GetInactiveCustomersParams {
  days_threshold?: Query<number>;
  limit?: Query<number>;
  risk_level?: Query<string>;
}

interface GetInactiveCustomersResponse {
  customers: InactiveCustomer[];
  summary: {
    total_inactive: number;
    low_risk: number;
    medium_risk: number;
    high_risk: number;
    critical_risk: number;
    potential_lost_revenue: number;
  };
}

// Retrieves customers who haven't made purchases recently with risk analysis.
export const getInactiveCustomers = api<GetInactiveCustomersParams, GetInactiveCustomersResponse>(
  { expose: true, method: "GET", path: "/crm/inactive-customers" },
  async ({ days_threshold, limit, risk_level }) => {
    const daysThreshold = days_threshold || 60; // Default 60 days
    const queryLimit = limit || 50;
    
    // Get customers with their last purchase info
    const rows = await crmDB.queryAll<{
      customer_id: number;
      customer_name: string;
      customer_email: string;
      company: string | null;
      last_purchase_date: Date;
      days_since_last_purchase: number;
      total_lifetime_value: number;
      total_purchases: number;
      average_order_value: number;
    }>`
      WITH customer_stats AS (
        SELECT 
          c.id as customer_id,
          c.name as customer_name,
          c.email as customer_email,
          c.company,
          MAX(s.sale_date) as last_purchase_date,
          EXTRACT(DAY FROM (NOW() - MAX(s.sale_date))) as days_since_last_purchase,
          SUM(s.total_amount) as total_lifetime_value,
          COUNT(s.id) as total_purchases,
          AVG(s.total_amount) as average_order_value
        FROM customers c
        LEFT JOIN sales s ON c.id = s.customer_id
        GROUP BY c.id, c.name, c.email, c.company
        HAVING MAX(s.sale_date) IS NOT NULL 
          AND EXTRACT(DAY FROM (NOW() - MAX(s.sale_date))) >= ${daysThreshold}
      )
      SELECT * FROM customer_stats
      ORDER BY days_since_last_purchase DESC, total_lifetime_value DESC
      LIMIT ${queryLimit}
    `;

    // Calculate risk levels and categorize customers
    const customers: InactiveCustomer[] = rows.map(row => {
      let risk_level: 'low' | 'medium' | 'high' | 'critical';
      
      if (row.days_since_last_purchase >= 180) {
        risk_level = 'critical';
      } else if (row.days_since_last_purchase >= 120) {
        risk_level = 'high';
      } else if (row.days_since_last_purchase >= 90) {
        risk_level = 'medium';
      } else {
        risk_level = 'low';
      }

      return {
        ...row,
        risk_level
      };
    });

    // Filter by risk level if specified
    const filteredCustomers = risk_level 
      ? customers.filter(c => c.risk_level === risk_level)
      : customers;

    // Calculate summary statistics
    const summary = {
      total_inactive: customers.length,
      low_risk: customers.filter(c => c.risk_level === 'low').length,
      medium_risk: customers.filter(c => c.risk_level === 'medium').length,
      high_risk: customers.filter(c => c.risk_level === 'high').length,
      critical_risk: customers.filter(c => c.risk_level === 'critical').length,
      potential_lost_revenue: customers.reduce((sum, c) => sum + c.total_lifetime_value, 0)
    };

    return {
      customers: filteredCustomers,
      summary
    };
  }
);