import { api, Query } from "encore.dev/api";
import { crmDB } from "./db";

interface CustomerRFMData {
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

interface GetCustomerSegmentationParams {
  segment?: Query<string>;
  limit?: Query<number>;
}

interface GetCustomerSegmentationResponse {
  customers: CustomerRFMData[];
  segment_summary: {
    [key: string]: {
      count: number;
      total_value: number;
      avg_recency: number;
      avg_frequency: number;
      avg_monetary: number;
    };
  };
  total_customers: number;
}

// Performs RFM (Recency, Frequency, Monetary) analysis for customer segmentation.
export const getCustomerSegmentation = api<GetCustomerSegmentationParams, GetCustomerSegmentationResponse>(
  { expose: true, method: "GET", path: "/crm/customer-segmentation" },
  async ({ segment, limit }) => {
    const queryLimit = limit || 100;
    
    // Get RFM data for all customers
    const rfmData = await crmDB.queryAll<{
      customer_id: number;
      customer_name: string;
      customer_email: string;
      company: string | null;
      recency_days: number;
      frequency_score: number;
      monetary_value: number;
      lifetime_value: number;
      average_order_value: number;
      total_orders: number;
      last_purchase_date: Date;
      customer_since: Date;
    }>`
      WITH customer_rfm AS (
        SELECT 
          c.id as customer_id,
          c.name as customer_name,
          c.email as customer_email,
          c.company,
          EXTRACT(DAY FROM (NOW() - MAX(s.sale_date))) as recency_days,
          COUNT(s.id) as frequency_score,
          SUM(s.total_amount) as monetary_value,
          SUM(s.total_amount) as lifetime_value,
          AVG(s.total_amount) as average_order_value,
          COUNT(s.id) as total_orders,
          MAX(s.sale_date) as last_purchase_date,
          c.created_at as customer_since
        FROM customers c
        LEFT JOIN sales s ON c.id = s.customer_id
        GROUP BY c.id, c.name, c.email, c.company, c.created_at
        HAVING COUNT(s.id) > 0
      )
      SELECT * FROM customer_rfm
      ORDER BY monetary_value DESC
    `;

    // Calculate RFM quintiles
    const recencyValues = rfmData.map(c => c.recency_days).sort((a, b) => a - b);
    const frequencyValues = rfmData.map(c => c.frequency_score).sort((a, b) => b - a);
    const monetaryValues = rfmData.map(c => c.monetary_value).sort((a, b) => b - a);

    const getQuintile = (value: number, values: number[], reverse = false) => {
      const quintileSize = Math.floor(values.length / 5);
      const index = values.indexOf(value);
      let quintile = Math.floor(index / quintileSize) + 1;
      if (quintile > 5) quintile = 5;
      return reverse ? 6 - quintile : quintile;
    };

    // Segment customers based on RFM scores
    const customers: CustomerRFMData[] = rfmData.map(customer => {
      const R = getQuintile(customer.recency_days, recencyValues, true); // Lower recency = higher score
      const F = getQuintile(customer.frequency_score, frequencyValues);
      const M = getQuintile(customer.monetary_value, monetaryValues);
      
      const rfmScore = `${R}${F}${M}`;
      
      // Determine segment based on RFM scores
      let segment: CustomerRFMData['segment'];
      let recommendedAction: string;
      
      if (R >= 4 && F >= 4 && M >= 4) {
        segment = 'Champions';
        recommendedAction = 'Reward them. They can become early adopters for new products and help promote your brand.';
      } else if (R >= 3 && F >= 3 && M >= 3) {
        segment = 'Loyal Customers';
        recommendedAction = 'Upsell higher value products. Ask for reviews. Engage them.';
      } else if (R >= 3 && F <= 2 && M >= 3) {
        segment = 'Potential Loyalists';
        recommendedAction = 'Offer membership or loyalty programs. Recommend related products.';
      } else if (R >= 4 && F <= 2 && M <= 2) {
        segment = 'New Customers';
        recommendedAction = 'Provide on-boarding support. Give them early success. Start building relationship.';
      } else if (R >= 3 && F <= 2 && M <= 2) {
        segment = 'Promising';
        recommendedAction = 'Create brand awareness. Offer free trials.';
      } else if (R <= 2 && F >= 3 && M >= 3) {
        segment = 'Need Attention';
        recommendedAction = 'Make limited time offers. Recommend based on past purchases. Reactivate them.';
      } else if (R <= 2 && F <= 2 && M >= 3) {
        segment = 'About to Sleep';
        recommendedAction = 'Share valuable resources. Recommend popular products. Reconnect with them.';
      } else if (R <= 2 && F >= 3 && M <= 2) {
        segment = 'At Risk';
        recommendedAction = 'Send personalized emails. Offer discounts. Provide helpful resources.';
      } else if (R <= 1 && F >= 4 && M >= 4) {
        segment = 'Cannot Lose Them';
        recommendedAction = 'Win them back via renewals or newer products. Don\'t lose them to competition.';
      } else if (R <= 2 && F <= 2 && M <= 2) {
        segment = 'Hibernating';
        recommendedAction = 'Offer other products and special discounts. Recreate brand value.';
      } else {
        segment = 'Lost';
        recommendedAction = 'Revive interest with reach out campaign. Ignore otherwise.';
      }
      
      return {
        ...customer,
        rfm_score: rfmScore,
        segment,
        recommended_action: recommendedAction
      };
    });

    // Filter by segment if specified
    const filteredCustomers = segment 
      ? customers.filter(c => c.segment === segment)
      : customers;

    // Limit results
    const limitedCustomers = filteredCustomers.slice(0, queryLimit);

    // Calculate segment summary
    const segmentSummary: { [key: string]: any } = {};
    const segments = [...new Set(customers.map(c => c.segment))];
    
    segments.forEach(seg => {
      const segmentCustomers = customers.filter(c => c.segment === seg);
      segmentSummary[seg] = {
        count: segmentCustomers.length,
        total_value: segmentCustomers.reduce((sum, c) => sum + c.lifetime_value, 0),
        avg_recency: segmentCustomers.reduce((sum, c) => sum + c.recency_days, 0) / segmentCustomers.length,
        avg_frequency: segmentCustomers.reduce((sum, c) => sum + c.frequency_score, 0) / segmentCustomers.length,
        avg_monetary: segmentCustomers.reduce((sum, c) => sum + c.monetary_value, 0) / segmentCustomers.length
      };
    });

    return {
      customers: limitedCustomers,
      segment_summary: segmentSummary,
      total_customers: customers.length
    };
  }
);