import { api, Query } from "encore.dev/api";
import { crmDB } from "./db";

interface CustomerBehaviorData {
  customer_id: number;
  customer_name: string;
  customer_email: string;
  purchase_frequency: number; // purchases per month
  seasonal_pattern: {
    month: number;
    purchases: number;
    revenue: number;
  }[];
  preferred_categories: {
    category: string;
    purchase_count: number;
    total_spent: number;
  }[];
  purchase_timing: {
    hour_of_day: number;
    purchase_count: number;
  }[];
  average_days_between_purchases: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  last_purchase_date: Date;
  next_predicted_purchase: Date;
}

interface GetCustomerBehaviorParams {
  customer_id?: Query<number>;
  limit?: Query<number>;
}

interface GetCustomerBehaviorResponse {
  customers: CustomerBehaviorData[];
  global_patterns: {
    peak_months: number[];
    peak_hours: number[];
    average_frequency: number;
    most_popular_categories: string[];
  };
}

// Analyzes customer purchase behavior patterns and trends.
export const getCustomerBehavior = api<GetCustomerBehaviorParams, GetCustomerBehaviorResponse>(
  { expose: true, method: "GET", path: "/crm/customer-behavior" },
  async ({ customer_id, limit }) => {
    const queryLimit = limit || 20;
    
    // Base query for customers
    let customerFilter = "";
    if (customer_id) {
      customerFilter = `AND c.id = ${customer_id}`;
    }

    // Get basic customer purchase data
    const customerData = await crmDB.queryAll<{
      customer_id: number;
      customer_name: string;
      customer_email: string;
      total_purchases: number;
      first_purchase: Date;
      last_purchase: Date;
      total_spent: number;
    }>`
      SELECT 
        c.id as customer_id,
        c.name as customer_name,
        c.email as customer_email,
        COUNT(s.id) as total_purchases,
        MIN(s.sale_date) as first_purchase,
        MAX(s.sale_date) as last_purchase,
        SUM(s.total_amount) as total_spent
      FROM customers c
      JOIN sales s ON c.id = s.customer_id
      WHERE s.sale_date >= NOW() - INTERVAL '12 months' ${customerFilter}
      GROUP BY c.id, c.name, c.email
      HAVING COUNT(s.id) > 0
      ORDER BY total_purchases DESC
      LIMIT ${queryLimit}
    `;

    const customers: CustomerBehaviorData[] = [];

    for (const customer of customerData) {
      // Calculate purchase frequency (purchases per month)
      const monthsDiff = Math.max(1, 
        (new Date().getTime() - customer.first_purchase.getTime()) / (1000 * 60 * 60 * 24 * 30)
      );
      const purchaseFrequency = customer.total_purchases / monthsDiff;

      // Get seasonal patterns
      const seasonalData = await crmDB.queryAll<{
        month: number;
        purchases: number;
        revenue: number;
      }>`
        SELECT 
          EXTRACT(MONTH FROM s.sale_date) as month,
          COUNT(s.id) as purchases,
          SUM(s.total_amount) as revenue
        FROM sales s
        WHERE s.customer_id = ${customer.customer_id}
          AND s.sale_date >= NOW() - INTERVAL '12 months'
        GROUP BY EXTRACT(MONTH FROM s.sale_date)
        ORDER BY month
      `;

      // Get preferred categories
      const categoryData = await crmDB.queryAll<{
        category: string;
        purchase_count: number;
        total_spent: number;
      }>`
        SELECT 
          COALESCE(p.category, 'Sem categoria') as category,
          COUNT(si.id) as purchase_count,
          SUM(si.total_price) as total_spent
        FROM sales s
        JOIN sale_items si ON s.id = si.sale_id
        JOIN products p ON si.product_id = p.id
        WHERE s.customer_id = ${customer.customer_id}
          AND s.sale_date >= NOW() - INTERVAL '12 months'
        GROUP BY p.category
        ORDER BY purchase_count DESC
        LIMIT 5
      `;

      // Get purchase timing patterns
      const timingData = await crmDB.queryAll<{
        hour_of_day: number;
        purchase_count: number;
      }>`
        SELECT 
          EXTRACT(HOUR FROM s.sale_date) as hour_of_day,
          COUNT(s.id) as purchase_count
        FROM sales s
        WHERE s.customer_id = ${customer.customer_id}
          AND s.sale_date >= NOW() - INTERVAL '12 months'
        GROUP BY EXTRACT(HOUR FROM s.sale_date)
        ORDER BY hour_of_day
      `;

      // Calculate average days between purchases
      const purchaseDates = await crmDB.queryAll<{ sale_date: Date }>`
        SELECT sale_date
        FROM sales
        WHERE customer_id = ${customer.customer_id}
          AND sale_date >= NOW() - INTERVAL '12 months'
        ORDER BY sale_date
      `;

      let avgDaysBetween = 0;
      if (purchaseDates.length > 1) {
        let totalDays = 0;
        for (let i = 1; i < purchaseDates.length; i++) {
          const daysDiff = (purchaseDates[i].sale_date.getTime() - purchaseDates[i-1].sale_date.getTime()) / (1000 * 60 * 60 * 24);
          totalDays += daysDiff;
        }
        avgDaysBetween = totalDays / (purchaseDates.length - 1);
      }

      // Determine trend (simple linear regression on purchase frequency)
      const recentPurchases = purchaseDates.slice(-6); // Last 6 purchases
      const olderPurchases = purchaseDates.slice(0, 6); // First 6 purchases
      
      let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
      if (recentPurchases.length >= 3 && olderPurchases.length >= 3) {
        const recentAvgInterval = recentPurchases.length > 1 ? 
          recentPurchases.reduce((sum, _, i) => {
            if (i === 0) return 0;
            return sum + (recentPurchases[i].sale_date.getTime() - recentPurchases[i-1].sale_date.getTime());
          }, 0) / (recentPurchases.length - 1) : 0;
        
        const olderAvgInterval = olderPurchases.length > 1 ?
          olderPurchases.reduce((sum, _, i) => {
            if (i === 0) return 0;
            return sum + (olderPurchases[i].sale_date.getTime() - olderPurchases[i-1].sale_date.getTime());
          }, 0) / (olderPurchases.length - 1) : 0;

        if (recentAvgInterval < olderAvgInterval * 0.8) {
          trend = 'increasing'; // Buying more frequently
        } else if (recentAvgInterval > olderAvgInterval * 1.2) {
          trend = 'decreasing'; // Buying less frequently
        }
      }

      // Predict next purchase date
      const nextPredictedPurchase = new Date(customer.last_purchase.getTime() + (avgDaysBetween * 24 * 60 * 60 * 1000));

      customers.push({
        customer_id: customer.customer_id,
        customer_name: customer.customer_name,
        customer_email: customer.customer_email,
        purchase_frequency: purchaseFrequency,
        seasonal_pattern: seasonalData,
        preferred_categories: categoryData,
        purchase_timing: timingData,
        average_days_between_purchases: avgDaysBetween,
        trend,
        last_purchase_date: customer.last_purchase,
        next_predicted_purchase: nextPredictedPurchase
      });
    }

    // Calculate global patterns
    const globalPatterns = {
      peak_months: [] as number[],
      peak_hours: [] as number[],
      average_frequency: customers.reduce((sum, c) => sum + c.purchase_frequency, 0) / customers.length,
      most_popular_categories: [] as string[]
    };

    // Find peak months globally
    const monthlyTotals = new Map<number, number>();
    customers.forEach(customer => {
      customer.seasonal_pattern.forEach(pattern => {
        monthlyTotals.set(pattern.month, (monthlyTotals.get(pattern.month) || 0) + pattern.purchases);
      });
    });
    globalPatterns.peak_months = Array.from(monthlyTotals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([month]) => month);

    // Find peak hours globally
    const hourlyTotals = new Map<number, number>();
    customers.forEach(customer => {
      customer.purchase_timing.forEach(timing => {
        hourlyTotals.set(timing.hour_of_day, (hourlyTotals.get(timing.hour_of_day) || 0) + timing.purchase_count);
      });
    });
    globalPatterns.peak_hours = Array.from(hourlyTotals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour]) => hour);

    // Find most popular categories globally
    const categoryTotals = new Map<string, number>();
    customers.forEach(customer => {
      customer.preferred_categories.forEach(category => {
        categoryTotals.set(category.category, (categoryTotals.get(category.category) || 0) + category.purchase_count);
      });
    });
    globalPatterns.most_popular_categories = Array.from(categoryTotals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category]) => category);

    return {
      customers,
      global_patterns: globalPatterns
    };
  }
);