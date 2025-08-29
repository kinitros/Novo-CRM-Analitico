import { api, Query } from "encore.dev/api";
import { crmDB } from "./db";

interface WebhookPayload {
  event: string;
  timestamp: string;
  data: any;
}

interface WebhookRegistration {
  webhook_url: string;
  events: string[];
  active: boolean;
  created_at: Date;
}

interface WebhookResponse {
  success: boolean;
  message: string;
  webhook_id?: string;
}

// Recebe webhooks do CRM atual (Node.js/MongoDB)
export const receiveWebhook = api<WebhookPayload, { success: boolean; message: string }>(
  { expose: true, method: "POST", path: "/crm/webhook/receive" },
  async (payload) => {
    try {
      console.log(`Webhook recebido: ${payload.event}`, payload.data);
      
      switch (payload.event) {
        case 'cliente_criado':
        case 'cliente_atualizado':
          await processCustomerWebhook(payload);
          break;
          
        case 'venda_criada':
        case 'venda_status_entrega_atualizado':
        case 'venda_status_envio_atualizado':
          await processSaleWebhook(payload);
          break;
          
        case 'reposicao_criada':
        case 'reposicao_atualizada':
          await processProductWebhook(payload);
          break;
          
        case 'envio_criado':
        case 'envio_concluido':
          await processShippingWebhook(payload);
          break;
          
        default:
          console.log(`Evento não reconhecido: ${payload.event}`);
      }
      
      return {
        success: true,
        message: `Webhook ${payload.event} processado com sucesso`
      };
      
    } catch (error) {
      console.error('Erro ao processar webhook:', error);
      return {
        success: false,
        message: `Erro ao processar webhook: ${error}`
      };
    }
  }
);

// Processa webhooks de clientes
async function processCustomerWebhook(payload: WebhookPayload) {
  const customerData = payload.data;
  
  // Mapear campos do MongoDB para PostgreSQL
  const mappedCustomer = {
    name: customerData.nome || customerData.name,
    email: customerData.email,
    phone: customerData.telefone || customerData.phone,
    company: customerData.empresa || customerData.company,
    external_id: customerData._id,
    created_at: new Date(customerData.createdAt || customerData.created_at || Date.now()),
    updated_at: new Date(customerData.updatedAt || customerData.updated_at || Date.now())
  };
  
  if (payload.event === 'cliente_criado') {
    // Verificar se cliente já existe
    const existingCustomer = await crmDB.queryRow<{ id: number }>`
      SELECT id FROM customers WHERE email = ${mappedCustomer.email}
    `;
    
    if (!existingCustomer) {
      await crmDB.exec`
        INSERT INTO customers (name, email, phone, company, created_at, updated_at)
        VALUES (${mappedCustomer.name}, ${mappedCustomer.email}, ${mappedCustomer.phone}, 
                ${mappedCustomer.company}, ${mappedCustomer.created_at}, ${mappedCustomer.updated_at})
      `;
      console.log(`Cliente criado: ${mappedCustomer.name}`);
    }
  } else if (payload.event === 'cliente_atualizado') {
    // Atualizar cliente existente
    await crmDB.exec`
      UPDATE customers 
      SET name = ${mappedCustomer.name}, phone = ${mappedCustomer.phone}, 
          company = ${mappedCustomer.company}, updated_at = ${mappedCustomer.updated_at}
      WHERE email = ${mappedCustomer.email}
    `;
    console.log(`Cliente atualizado: ${mappedCustomer.name}`);
  }
}

// Processa webhooks de vendas
async function processSaleWebhook(payload: WebhookPayload) {
  const saleData = payload.data;
  
  // Mapear campos do MongoDB para PostgreSQL
  const mappedSale = {
    external_id: saleData._id,
    customer_email: saleData.cliente?.email || saleData.customerEmail,
    total_amount: saleData.valorTotal || saleData.total || saleData.valor,
    status: mapSaleStatus(saleData.status || saleData.statusEntrega || saleData.statusEnvio),
    sale_date: new Date(saleData.dataVenda || saleData.createdAt || Date.now()),
    items: saleData.itens || saleData.items || []
  };
  
  if (payload.event === 'venda_criada') {
    // Buscar cliente pelo email
    const customer = await crmDB.queryRow<{ id: number }>`
      SELECT id FROM customers WHERE email = ${mappedSale.customer_email}
    `;
    
    if (customer) {
      // Verificar se venda já existe
      const existingSale = await crmDB.queryRow<{ id: number }>`
        SELECT id FROM sales 
        WHERE customer_id = ${customer.id} 
          AND total_amount = ${mappedSale.total_amount}
          AND sale_date = ${mappedSale.sale_date}
      `;
      
      if (!existingSale) {
        // Criar nova venda
        const saleResult = await crmDB.queryRow<{ id: number }>`
          INSERT INTO sales (customer_id, total_amount, status, sale_date, created_at, updated_at)
          VALUES (${customer.id}, ${mappedSale.total_amount}, ${mappedSale.status}, 
                  ${mappedSale.sale_date}, NOW(), NOW())
          RETURNING id
        `;
        
        // Processar itens da venda
        if (saleResult && mappedSale.items.length > 0) {
          for (const item of mappedSale.items) {
            // Buscar ou criar produto
            let product = await crmDB.queryRow<{ id: number }>`
              SELECT id FROM products WHERE name = ${item.produto || item.name}
            `;
            
            if (!product) {
              // Criar produto se não existir
              product = await crmDB.queryRow<{ id: number }>`
                INSERT INTO products (name, price, category, created_at, updated_at)
                VALUES (${item.produto || item.name}, ${item.preco || item.price || 0}, 
                        'Importado', NOW(), NOW())
                RETURNING id
              `;
            }
            
            if (product) {
              // Criar item da venda
              await crmDB.exec`
                INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, total_price, created_at)
                VALUES (${saleResult.id}, ${product.id}, ${item.quantidade || item.quantity || 1}, 
                        ${item.preco || item.price || 0}, 
                        ${(item.quantidade || 1) * (item.preco || item.price || 0)}, NOW())
              `;
            }
          }
        }
        
        console.log(`Venda criada: ${mappedSale.external_id}`);
      }
    }
  } else {
    // Atualizar status da venda
    await crmDB.exec`
      UPDATE sales s
      SET status = ${mappedSale.status}, updated_at = NOW()
      FROM customers c
      WHERE s.customer_id = c.id 
        AND c.email = ${mappedSale.customer_email}
        AND s.total_amount = ${mappedSale.total_amount}
    `;
    console.log(`Status da venda atualizado: ${mappedSale.status}`);
  }
}

// Processa webhooks de produtos/reposição
async function processProductWebhook(payload: WebhookPayload) {
  const productData = payload.data;
  
  const mappedProduct = {
    name: productData.produto || productData.name,
    description: productData.descricao || productData.description,
    price: productData.preco || productData.price || 0,
    category: productData.categoria || productData.category || 'Reposição',
    sku: productData.sku || productData.codigo,
    external_id: productData._id
  };
  
  // Verificar se produto já existe
  const existingProduct = await crmDB.queryRow<{ id: number }>`
    SELECT id FROM products WHERE name = ${mappedProduct.name}
  `;
  
  if (!existingProduct) {
    await crmDB.exec`
      INSERT INTO products (name, description, price, category, sku, created_at, updated_at)
      VALUES (${mappedProduct.name}, ${mappedProduct.description}, ${mappedProduct.price}, 
              ${mappedProduct.category}, ${mappedProduct.sku}, NOW(), NOW())
    `;
    console.log(`Produto criado: ${mappedProduct.name}`);
  } else {
    await crmDB.exec`
      UPDATE products 
      SET description = ${mappedProduct.description}, price = ${mappedProduct.price}, 
          category = ${mappedProduct.category}, sku = ${mappedProduct.sku}, updated_at = NOW()
      WHERE name = ${mappedProduct.name}
    `;
    console.log(`Produto atualizado: ${mappedProduct.name}`);
  }
}

// Processa webhooks de envio
async function processShippingWebhook(payload: WebhookPayload) {
  const shippingData = payload.data;
  
  // Atualizar status de entrega das vendas relacionadas
  if (shippingData.vendaId || shippingData.saleId) {
    const status = payload.event === 'envio_concluido' ? 'delivered' : 'shipped';
    
    await crmDB.exec`
      UPDATE sales 
      SET status = ${status}, updated_at = NOW()
      WHERE id IN (
        SELECT s.id FROM sales s
        JOIN customers c ON s.customer_id = c.id
        WHERE s.total_amount = ${shippingData.valor || 0}
      )
    `;
    
    console.log(`Status de envio atualizado: ${status}`);
  }
}

// Mapear status do CRM atual para o novo sistema
function mapSaleStatus(status: string): string {
  const statusMap: { [key: string]: string } = {
    'pendente': 'pending',
    'processando': 'processing',
    'enviado': 'shipped',
    'entregue': 'delivered',
    'cancelado': 'cancelled',
    'completed': 'completed'
  };
  
  return statusMap[status?.toLowerCase()] || 'pending';
}

// API para registrar webhook no CRM atual
export const registerWebhookInCurrentCRM = api<{
  crm_base_url: string;
  jwt_token: string;
  events: string[];
}, WebhookResponse>(
  { expose: true, method: "POST", path: "/crm/webhook/register" },
  async ({ crm_base_url, jwt_token, events }) => {
    try {
      // URL do webhook que o CRM atual deve chamar (precisa ser pública)
      // Para desenvolvimento local, use ngrok ou similar
      const webhookUrl = `https://seu-novo-crm.ngrok.io/crm/webhook/receive`;
      
      console.log(`Tentando registrar webhook em: ${crm_base_url}/api/webhooks`);
      console.log(`URL do webhook: ${webhookUrl}`);
      console.log(`Eventos: ${events.join(', ')}`);
      
      // Registrar webhook no CRM atual via API
      const response = await fetch(`${crm_base_url}/api/webhooks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt_token}`
        },
        body: JSON.stringify({
          url: webhookUrl,
          events: events,
          active: true
        })
      });
      
      const responseText = await response.text();
      console.log(`Resposta do servidor: ${response.status} - ${responseText}`);
      
      if (response.ok) {
        let result;
        try {
          result = JSON.parse(responseText);
        } catch {
          result = { message: responseText };
        }
        
        return {
          success: true,
          message: 'Webhook registrado com sucesso no CRM atual',
          webhook_id: result._id || result.id || 'unknown'
        };
      } else {
        return {
          success: false,
          message: `Erro HTTP ${response.status}: ${responseText}`
        };
      }
      
    } catch (error) {
      console.error('Erro ao registrar webhook:', error);
      return {
        success: false,
        message: `Erro ao registrar webhook: ${error}`
      };
    }
  }
);

// API para sincronização inicial de dados históricos
export const syncHistoricalData = api<{
  crm_base_url: string;
  jwt_token: string;
  data_type: 'customers' | 'sales' | 'products';
}, { success: boolean; message: string; synced_count: number }>(
  { expose: true, method: "POST", path: "/crm/webhook/sync-historical" },
  async ({ crm_base_url, jwt_token, data_type }) => {
    try {
      let syncedCount = 0;
      
      // Buscar dados históricos do CRM atual
      const endpoint = data_type === 'customers' ? '/api/clientes' : 
                      data_type === 'sales' ? '/api/vendas' : 
                      data_type === 'products' ? '/api/produtos' : '/api/reposicoes';
      
      console.log(`Buscando dados históricos em: ${crm_base_url}${endpoint}`);
      
      const response = await fetch(`${crm_base_url}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${jwt_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const responseText = await response.text();
      console.log(`Resposta da sincronização: ${response.status} - ${responseText}`);
      
      if (response.ok) {
        let data;
        try {
          data = JSON.parse(responseText);
        } catch {
          throw new Error(`Resposta não é JSON válido: ${responseText}`);
        }
        
        // O CRM pode retornar dados em diferentes formatos
        const items = Array.isArray(data) ? data : 
                     data.clientes || data.vendas || data.produtos || data.reposicoes || 
                     data.data || [];
        
        console.log(`Encontrados ${items.length} itens para sincronizar`);
        
        // Processar cada item como se fosse um webhook
        for (const item of items) {
          try {
            const webhookPayload: WebhookPayload = {
              event: data_type === 'customers' ? 'cliente_criado' :
                     data_type === 'sales' ? 'venda_criada' : 'reposicao_criada',
              timestamp: new Date().toISOString(),
              data: item
            };
            
            // Processar usando as mesmas funções dos webhooks
            if (data_type === 'customers') {
              await processCustomerWebhook(webhookPayload);
            } else if (data_type === 'sales') {
              await processSaleWebhook(webhookPayload);
            } else if (data_type === 'products') {
              await processProductWebhook(webhookPayload);
            }
            
            syncedCount++;
          } catch (itemError) {
            console.error(`Erro ao processar item:`, itemError, item);
            // Continua com o próximo item
          }
        }
        
        return {
          success: true,
          message: `${syncedCount} registros de ${data_type} sincronizados com sucesso`,
          synced_count: syncedCount
        };
      } else {
        return {
          success: false,
          message: `Erro HTTP ${response.status}: ${responseText}`,
          synced_count: 0
        };
      }
      
    } catch (error) {
      console.error('Erro na sincronização histórica:', error);
      return {
        success: false,
        message: `Erro na sincronização histórica: ${error}`,
        synced_count: 0
      };
    }
  }
);

// API para listar webhooks registrados
export const listRegisteredWebhooks = api<{
  crm_base_url: string;
  jwt_token: string;
}, { success: boolean; webhooks: any[] }>(
  { expose: true, method: "GET", path: "/crm/webhook/list" },
  async ({ crm_base_url, jwt_token }) => {
    try {
      const response = await fetch(`${crm_base_url}/api/webhooks`, {
        headers: {
          'Authorization': `Bearer ${jwt_token}`
        }
      });
      
      if (response.ok) {
        const webhooks = await response.json();
        return {
          success: true,
          webhooks: webhooks
        };
      } else {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
    } catch (error) {
      return {
        success: false,
        webhooks: []
      };
    }
  }
);