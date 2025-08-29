import { api } from "encore.dev/api";
import { crmDB } from "./db";

// Creates sample data for demonstration purposes.
export const createSampleData = api<void, { message: string }>(
  { expose: true, method: "POST", path: "/crm/sample-data" },
  async () => {
    // Create sample customers
    const customers = [
      { name: "João Silva", email: "joao@email.com", phone: "(11) 99999-1111", company: "Tech Corp" },
      { name: "Maria Santos", email: "maria@email.com", phone: "(11) 99999-2222", company: "Design Studio" },
      { name: "Pedro Oliveira", email: "pedro@email.com", phone: "(11) 99999-3333", company: "Marketing Plus" },
      { name: "Ana Costa", email: "ana@email.com", phone: "(11) 99999-4444", company: "Consultoria ABC" },
      { name: "Carlos Ferreira", email: "carlos@email.com", phone: "(11) 99999-5555", company: "Inovação Ltda" },
    ];

    for (const customer of customers) {
      await crmDB.exec`
        INSERT INTO customers (name, email, phone, company)
        VALUES (${customer.name}, ${customer.email}, ${customer.phone}, ${customer.company})
        ON CONFLICT (email) DO NOTHING
      `;
    }

    // Create sample products
    const products = [
      { name: "Software de Gestão", description: "Sistema completo de gestão empresarial", price: 2500.00, category: "Software", sku: "SW001" },
      { name: "Consultoria Estratégica", description: "Consultoria em estratégia de negócios", price: 5000.00, category: "Serviços", sku: "CS001" },
      { name: "Treinamento Corporativo", description: "Treinamento para equipes", price: 1500.00, category: "Educação", sku: "TR001" },
      { name: "Suporte Técnico Premium", description: "Suporte técnico 24/7", price: 800.00, category: "Suporte", sku: "SP001" },
      { name: "Licença Anual", description: "Licença de uso anual do software", price: 3000.00, category: "Licenças", sku: "LC001" },
    ];

    for (const product of products) {
      await crmDB.exec`
        INSERT INTO products (name, description, price, category, sku)
        VALUES (${product.name}, ${product.description}, ${product.price}, ${product.category}, ${product.sku})
        ON CONFLICT (sku) DO NOTHING
      `;
    }

    // Create sample sales
    const customerIds = await crmDB.queryAll<{ id: number }>`SELECT id FROM customers LIMIT 5`;
    const productIds = await crmDB.queryAll<{ id: number; price: number }>`SELECT id, price FROM products`;

    for (let i = 0; i < 20; i++) {
      const customerId = customerIds[Math.floor(Math.random() * customerIds.length)].id;
      const saleDate = new Date();
      saleDate.setDate(saleDate.getDate() - Math.floor(Math.random() * 90)); // Random date in last 90 days

      // Create sale
      const saleResult = await crmDB.queryRow<{ id: number }>`
        INSERT INTO sales (customer_id, total_amount, sale_date)
        VALUES (${customerId}, 0, ${saleDate})
        RETURNING id
      `;

      const saleId = saleResult!.id;
      let totalAmount = 0;

      // Add 1-3 random products to the sale
      const numItems = Math.floor(Math.random() * 3) + 1;
      const usedProducts = new Set();

      for (let j = 0; j < numItems; j++) {
        let productId, productPrice;
        do {
          const randomProduct = productIds[Math.floor(Math.random() * productIds.length)];
          productId = randomProduct.id;
          productPrice = randomProduct.price;
        } while (usedProducts.has(productId));

        usedProducts.add(productId);
        const quantity = Math.floor(Math.random() * 3) + 1;
        const totalPrice = productPrice * quantity;
        totalAmount += totalPrice;

        await crmDB.exec`
          INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, total_price)
          VALUES (${saleId}, ${productId}, ${quantity}, ${productPrice}, ${totalPrice})
        `;
      }

      // Update sale total
      await crmDB.exec`
        UPDATE sales SET total_amount = ${totalAmount} WHERE id = ${saleId}
      `;
    }

    return { message: "Dados de exemplo criados com sucesso!" };
  }
);
