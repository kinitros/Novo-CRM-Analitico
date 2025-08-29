import { api, Query } from "encore.dev/api";
import { crmDB } from "./db";

interface CRMIntegrationConfig {
  base_url: string;
  api_key?: string;
  username?: string;
  password?: string;
  sync_interval_hours: number;
  last_sync: Date | null;
  enabled: boolean;
}

interface ExternalCustomer {
  external_id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  created_at: Date;
  updated_at: Date;
}

interface ExternalProduct {
  external_id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  sku?: string;
  created_at: Date;
  updated_at: Date;
}

interface ExternalSale {
  external_id: string;
  customer_external_id: string;
  total_amount: number;
  status: string;
  sale_date: Date;
  items: {
    product_external_id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }[];
}

interface SyncResult {
  success: boolean;
  message: string;
  customers_synced: number;
  products_synced: number;
  sales_synced: number;
  errors: string[];
  sync_duration_ms: number;
}

// Simulates data extraction from external CRM system
class CRMDataExtractor {
  private config: CRMIntegrationConfig;

  constructor(config: CRMIntegrationConfig) {
    this.config = config;
  }

  // Simulate API call or web scraping to get customers
  async extractCustomers(): Promise<ExternalCustomer[]> {
    // In a real implementation, this would make HTTP requests to crm.conectaprime.com
    // For now, we'll simulate the data extraction
    
    console.log(`Extracting customers from ${this.config.base_url}`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return simulated data - in real implementation, parse HTML or API response
    return [
      {
        external_id: "ext_001",
        name: "Cliente Importado 1",
        email: "cliente1@importado.com",
        phone: "(11) 99999-0001",
        company: "Empresa Importada 1",
        created_at: new Date('2024-01-15'),
        updated_at: new Date()
      },
      {
        external_id: "ext_002",
        name: "Cliente Importado 2",
        email: "cliente2@importado.com",
        phone: "(11) 99999-0002",
        company: "Empresa Importada 2",
        created_at: new Date('2024-02-10'),
        updated_at: new Date()
      }
    ];
  }

  // Simulate API call or web scraping to get products
  async extractProducts(): Promise<ExternalProduct[]> {
    console.log(`Extracting products from ${this.config.base_url}`);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return [
      {
        external_id: "prod_001",
        name: "Produto Importado 1",
        description: "Descrição do produto importado 1",
        price: 1200.00,
        category: "Importados",
        sku: "IMP001",
        created_at: new Date('2024-01-01'),
        updated_at: new Date()
      },
      {
        external_id: "prod_002",
        name: "Produto Importado 2",
        description: "Descrição do produto importado 2",
        price: 2500.00,
        category: "Importados",
        sku: "IMP002",
        created_at: new Date('2024-01-05'),
        updated_at: new Date()
      }
    ];
  }

  // Simulate API call or web scraping to get sales
  async extractSales(): Promise<ExternalSale[]> {
    console.log(`Extracting sales from ${this.config.base_url}`);
    
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    return [
      {
        external_id: "sale_001",
        customer_external_id: "ext_001",
        total_amount: 1200.00,
        status: "completed",
        sale_date: new Date('2024-03-15'),
        items: [
          {
            product_external_id: "prod_001",
            quantity: 1,
            unit_price: 1200.00,
            total_price: 1200.00
          }
        ]
      },
      {
        external_id: "sale_002",
        customer_external_id: "ext_002",
        total_amount: 5000.00,
        status: "completed",
        sale_date: new Date('2024-03-20'),
        items: [
          {
            product_external_id: "prod_002",
            quantity: 2,
            unit_price: 2500.00,
            total_price: 5000.00
          }
        ]
      }
    ];
  }
}

// Syncs data from external CRM system
export const syncExternalCRM = api<void, SyncResult>(
  { expose: true, method: "POST", path: "/crm/sync-external" },
  async () => {
    const startTime = Date.now();
    const errors: string[] = [];
    let customersSynced = 0;
    let productsSynced = 0;
    let salesSynced = 0;

    try {
      // Configuration for external CRM
      const config: CRMIntegrationConfig = {
        base_url: "https://crm.conectaprime.com",
        username: "admin", // In production, store securely
        password: "password", // In production, use environment variables
        sync_interval_hours: 24,
        last_sync: null,
        enabled: true
      };

      const extractor = new CRMDataExtractor(config);

      // Extract and sync customers
      try {
        const externalCustomers = await extractor.extractCustomers();
        
        for (const extCustomer of externalCustomers) {
          // Check if customer already exists
          const existingCustomer = await crmDB.queryRow<{ id: number }>`
            SELECT id FROM customers WHERE email = ${extCustomer.email}
          `;

          if (!existingCustomer) {
            await crmDB.exec`
              INSERT INTO customers (name, email, phone, company, created_at, updated_at)
              VALUES (${extCustomer.name}, ${extCustomer.email}, ${extCustomer.phone}, 
                      ${extCustomer.company}, ${extCustomer.created_at}, ${extCustomer.updated_at})
            `;
            customersSynced++;
          } else {
            // Update existing customer
            await crmDB.exec`
              UPDATE customers 
              SET name = ${extCustomer.name}, phone = ${extCustomer.phone}, 
                  company = ${extCustomer.company}, updated_at = ${extCustomer.updated_at}
              WHERE email = ${extCustomer.email}
            `;
            customersSynced++;
          }
        }
      } catch (error) {
        errors.push(`Customer sync error: ${error}`);
      }

      // Extract and sync products
      try {
        const externalProducts = await extractor.extractProducts();
        
        for (const extProduct of externalProducts) {
          // Check if product already exists by SKU
          const existingProduct = await crmDB.queryRow<{ id: number }>`
            SELECT id FROM products WHERE sku = ${extProduct.sku}
          `;

          if (!existingProduct) {
            await crmDB.exec`
              INSERT INTO products (name, description, price, category, sku, created_at, updated_at)
              VALUES (${extProduct.name}, ${extProduct.description}, ${extProduct.price}, 
                      ${extProduct.category}, ${extProduct.sku}, ${extProduct.created_at}, ${extProduct.updated_at})
            `;
            productsSynced++;
          } else {
            // Update existing product
            await crmDB.exec`
              UPDATE products 
              SET name = ${extProduct.name}, description = ${extProduct.description}, 
                  price = ${extProduct.price}, category = ${extProduct.category}, 
                  updated_at = ${extProduct.updated_at}
              WHERE sku = ${extProduct.sku}
            `;
            productsSynced++;
          }
        }
      } catch (error) {
        errors.push(`Product sync error: ${error}`);
      }

      // Extract and sync sales
      try {
        const externalSales = await extractor.extractSales();
        
        for (const extSale of externalSales) {
          // Get customer ID by email (assuming we can map external_id to email)
          const customer = await crmDB.queryRow<{ id: number }>`
            SELECT id FROM customers WHERE email LIKE '%importado%' LIMIT 1
          `;

          if (customer) {
            // Check if sale already exists
            const existingSale = await crmDB.queryRow<{ id: number }>`
              SELECT id FROM sales 
              WHERE customer_id = ${customer.id} 
                AND total_amount = ${extSale.total_amount} 
                AND sale_date = ${extSale.sale_date}
            `;

            if (!existingSale) {
              // Insert sale
              const saleResult = await crmDB.queryRow<{ id: number }>`
                INSERT INTO sales (customer_id, total_amount, status, sale_date, created_at, updated_at)
                VALUES (${customer.id}, ${extSale.total_amount}, ${extSale.status}, 
                        ${extSale.sale_date}, NOW(), NOW())
                RETURNING id
              `;

              if (saleResult) {
                // Insert sale items
                for (const item of extSale.items) {
                  // Get product ID by SKU
                  const product = await crmDB.queryRow<{ id: number }>`
                    SELECT id FROM products WHERE sku LIKE 'IMP%' LIMIT 1
                  `;

                  if (product) {
                    await crmDB.exec`
                      INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, total_price, created_at)
                      VALUES (${saleResult.id}, ${product.id}, ${item.quantity}, 
                              ${item.unit_price}, ${item.total_price}, NOW())
                    `;
                  }
                }
                salesSynced++;
              }
            }
          }
        }
      } catch (error) {
        errors.push(`Sales sync error: ${error}`);
      }

      const syncDuration = Date.now() - startTime;

      return {
        success: errors.length === 0,
        message: errors.length === 0 ? 
          "Sincronização concluída com sucesso" : 
          `Sincronização concluída com ${errors.length} erro(s)",
        customers_synced: customersSynced,
        products_synced: productsSynced,
        sales_synced: salesSynced,
        errors,
        sync_duration_ms: syncDuration
      };

    } catch (error) {
      return {
        success: false,
        message: `Erro geral na sincronização: ${error}`,
        customers_synced: customersSynced,
        products_synced: productsSynced,
        sales_synced: salesSynced,
        errors: [...errors, `${error}`],
        sync_duration_ms: Date.now() - startTime
      };
    }
  }
);

// Gets sync status and configuration
export const getSyncStatus = api<void, {
  last_sync: Date | null;
  sync_enabled: boolean;
  next_sync_scheduled: Date | null;
  total_records_synced: {
    customers: number;
    products: number;
    sales: number;
  };
}>(
  { expose: true, method: "GET", path: "/crm/sync-status" },
  async () => {
    // Get counts of imported records (simplified)
    const customerCount = await crmDB.queryRow<{ count: number }>`
      SELECT COUNT(*)::INTEGER as count FROM customers WHERE email LIKE '%importado%'
    `;
    
    const productCount = await crmDB.queryRow<{ count: number }>`
      SELECT COUNT(*)::INTEGER as count FROM products WHERE sku LIKE 'IMP%'
    `;
    
    const salesCount = await crmDB.queryRow<{ count: number }>`
      SELECT COUNT(*)::INTEGER as count FROM sales s
      JOIN customers c ON s.customer_id = c.id
      WHERE c.email LIKE '%importado%'
    `;

    return {
      last_sync: new Date(), // In production, store this in database
      sync_enabled: true,
      next_sync_scheduled: new Date(Date.now() + 24 * 60 * 60 * 1000), // Next 24 hours
      total_records_synced: {
        customers: customerCount?.count || 0,
        products: productCount?.count || 0,
        sales: salesCount?.count || 0
      }
    };
  }
);