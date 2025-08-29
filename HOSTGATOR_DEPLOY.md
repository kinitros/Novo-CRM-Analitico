# Deploy CRM Avançado na HostGator - Guia Completo

## 🎯 Objetivo
Implantar o sistema CRM avançado na HostGator usando subdomínio, similar ao que foi feito com o CRM atual.

## 📋 Pré-requisitos
- Conta HostGator ativa
- Domínio configurado (ex: conectaprime.com)
- Acesso ao cPanel
- Arquivos do projeto preparados

## 🚀 Passo a Passo Completo

### Passo 1: Preparar os Arquivos do Frontend

#### 1.1 Build do Frontend
```bash
# No terminal, navegue para o frontend
cd frontend

# Instale dependências (se necessário)
npm install

# Gere os arquivos de produção
npm run build
```

Isso criará uma pasta `dist` com todos os arquivos estáticos.

#### 1.2 Verificar Arquivos Gerados
A pasta `dist` deve conter:
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── ...
└── vite.svg
```

### Passo 2: Configurar Subdomínio na HostGator

#### 2.1 Acessar cPanel
1. Faça login na sua conta HostGator
2. Acesse o **cPanel**
3. Procure por **"Subdomínios"** ou **"Subdomains"**

#### 2.2 Criar Subdomínio
1. **Subdomínio**: `analytics` (ou `crm-analytics`)
2. **Domínio**: Selecione seu domínio principal (ex: conectaprime.com)
3. **Pasta de Destino**: Deixe automático (geralmente `public_html/analytics`)
4. Clique em **"Criar"**

**Resultado**: `analytics.conectaprime.com` → `/public_html/analytics/`

#### 2.3 Aguardar Propagação DNS
- Pode levar de 15 minutos a 24 horas
- Teste acessando: `http://analytics.conectaprime.com`

### Passo 3: Upload dos Arquivos Frontend

#### 3.1 Via Gerenciador de Arquivos (cPanel)
1. No cPanel, acesse **"Gerenciador de Arquivos"**
2. Navegue para `/public_html/analytics/`
3. **Delete** o arquivo `index.html` padrão (se existir)
4. **Upload** todos os arquivos da pasta `dist`:
   - Selecione todos os arquivos de `dist/`
   - Arraste para o gerenciador ou use "Upload"
   - **Importante**: Mantenha a estrutura de pastas!

#### 3.2 Estrutura Final no Servidor
```
/public_html/analytics/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── ...
└── vite.svg
```

#### 3.3 Testar Frontend
Acesse: `https://analytics.conectaprime.com`
- Deve carregar o dashboard CRM
- **Nota**: APIs não funcionarão ainda (próximo passo)

### Passo 4: Configurar Backend (Webhooks)

#### 4.1 Opção A: Backend PHP (Recomendado para HostGator)

Crie arquivo `webhook-receive.php` na pasta `/public_html/api/`:

```php
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Configuração do banco de dados
$host = 'localhost';
$dbname = 'seu_usuario_crm_analytics';
$username = 'seu_usuario';
$password = 'sua_senha';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erro de conexão com banco']);
    exit;
}

// Receber webhook
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (!$data || !isset($data['event'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Payload inválido']);
        exit;
    }
    
    // Log do webhook recebido
    error_log("Webhook recebido: " . $data['event'] . " - " . $input);
    
    // Processar diferentes tipos de eventos
    switch ($data['event']) {
        case 'cliente_criado':
        case 'cliente_atualizado':
            processarCliente($pdo, $data);
            break;
            
        case 'venda_criada':
        case 'venda_status_entrega_atualizado':
            processarVenda($pdo, $data);
            break;
            
        default:
            error_log("Evento não reconhecido: " . $data['event']);
    }
    
    echo json_encode(['success' => true, 'message' => 'Webhook processado']);
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido']);
}

function processarCliente($pdo, $data) {
    $cliente = $data['data'];
    
    // Verificar se cliente já existe
    $stmt = $pdo->prepare("SELECT id FROM customers WHERE email = ?");
    $stmt->execute([$cliente['email']]);
    
    if ($stmt->rowCount() > 0) {
        // Atualizar cliente existente
        $stmt = $pdo->prepare("
            UPDATE customers 
            SET name = ?, phone = ?, company = ?, updated_at = NOW() 
            WHERE email = ?
        ");
        $stmt->execute([
            $cliente['nome'] ?? $cliente['name'],
            $cliente['telefone'] ?? $cliente['phone'],
            $cliente['empresa'] ?? $cliente['company'],
            $cliente['email']
        ]);
    } else {
        // Inserir novo cliente
        $stmt = $pdo->prepare("
            INSERT INTO customers (name, email, phone, company, created_at, updated_at) 
            VALUES (?, ?, ?, ?, NOW(), NOW())
        ");
        $stmt->execute([
            $cliente['nome'] ?? $cliente['name'],
            $cliente['email'],
            $cliente['telefone'] ?? $cliente['phone'],
            $cliente['empresa'] ?? $cliente['company']
        ]);
    }
}

function processarVenda($pdo, $data) {
    $venda = $data['data'];
    
    // Buscar cliente
    $stmt = $pdo->prepare("SELECT id FROM customers WHERE email = ?");
    $stmt->execute([$venda['cliente']['email'] ?? $venda['customerEmail']]);
    $customer = $stmt->fetch();
    
    if ($customer) {
        // Inserir venda
        $stmt = $pdo->prepare("
            INSERT INTO sales (customer_id, total_amount, status, sale_date, created_at, updated_at) 
            VALUES (?, ?, ?, ?, NOW(), NOW())
        ");
        $stmt->execute([
            $customer['id'],
            $venda['valorTotal'] ?? $venda['total'],
            $venda['status'] ?? 'completed',
            $venda['dataVenda'] ?? date('Y-m-d H:i:s')
        ]);
        
        $saleId = $pdo->lastInsertId();
        
        // Processar itens da venda (se existirem)
        if (isset($venda['itens']) || isset($venda['items'])) {
            $items = $venda['itens'] ?? $venda['items'];
            foreach ($items as $item) {
                // Buscar ou criar produto
                $stmt = $pdo->prepare("SELECT id FROM products WHERE name = ?");
                $stmt->execute([$item['produto'] ?? $item['name']]);
                $product = $stmt->fetch();
                
                if (!$product) {
                    // Criar produto
                    $stmt = $pdo->prepare("
                        INSERT INTO products (name, price, category, created_at, updated_at) 
                        VALUES (?, ?, 'Importado', NOW(), NOW())
                    ");
                    $stmt->execute([
                        $item['produto'] ?? $item['name'],
                        $item['preco'] ?? $item['price'] ?? 0
                    ]);
                    $productId = $pdo->lastInsertId();
                } else {
                    $productId = $product['id'];
                }
                
                // Inserir item da venda
                $stmt = $pdo->prepare("
                    INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, total_price, created_at) 
                    VALUES (?, ?, ?, ?, ?, NOW())
                ");
                $quantity = $item['quantidade'] ?? $item['quantity'] ?? 1;
                $unitPrice = $item['preco'] ?? $item['price'] ?? 0;
                $stmt->execute([
                    $saleId,
                    $productId,
                    $quantity,
                    $unitPrice,
                    $quantity * $unitPrice
                ]);
            }
        }
    }
}
?>
```

#### 4.2 Criar Estrutura de Pastas
No Gerenciador de Arquivos, crie:
```
/public_html/
├── analytics/          # Frontend (já criado)
└── api/               # Backend PHP
    └── webhook-receive.php
```

### Passo 5: Configurar Banco de Dados

#### 5.1 Criar Banco MySQL
1. No cPanel, acesse **"Bancos de Dados MySQL"**
2. **Criar Banco**: `seu_usuario_crm_analytics`
3. **Criar Usuário**: `crm_user` com senha forte
4. **Adicionar Usuário ao Banco** com todos os privilégios

#### 5.2 Criar Tabelas
No **phpMyAdmin**, execute:

```sql
-- Tabela de clientes
CREATE TABLE customers (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  company VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de produtos
CREATE TABLE products (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  category VARCHAR(100),
  sku VARCHAR(100) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de vendas
CREATE TABLE sales (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  customer_id BIGINT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'completed',
  sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Tabela de itens de venda
CREATE TABLE sale_items (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  sale_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Índices para performance
CREATE INDEX idx_sales_customer_id ON sales(customer_id);
CREATE INDEX idx_sales_sale_date ON sales(sale_date);
CREATE INDEX idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX idx_sale_items_product_id ON sale_items(product_id);
```

### Passo 6: Configurar SSL (HTTPS)

#### 6.1 Ativar SSL Gratuito
1. No cPanel, acesse **"SSL/TLS"**
2. Vá em **"Let's Encrypt SSL"**
3. Selecione o subdomínio `analytics.conectaprime.com`
4. Clique em **"Issue"**
5. Aguarde a instalação (alguns minutos)

#### 6.2 Forçar HTTPS
1. Em **"SSL/TLS"** → **"Edge Certificates"**
2. Ative **"Always Use HTTPS"**

### Passo 7: Testar a Integração

#### 7.1 Testar Webhook Manualmente
```bash
curl -X POST https://analytics.conectaprime.com/api/webhook-receive.php \
  -H "Content-Type: application/json" \
  -d '{
    "event": "cliente_criado",
    "timestamp": "2025-01-28T10:00:00Z",
    "data": {
      "nome": "Teste Cliente",
      "email": "teste@exemplo.com",
      "telefone": "(11) 99999-9999",
      "empresa": "Empresa Teste"
    }
  }'
```

#### 7.2 Verificar Logs
- **Logs PHP**: cPanel → "Logs de Erro"
- **Logs de Acesso**: cPanel → "Logs de Acesso"

### Passo 8: Configurar Webhooks no CRM Atual

#### 8.1 Registrar Webhook
Use o token JWT que você tem:

```bash
curl -X POST https://crm.conectaprime.com/api/webhooks \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://analytics.conectaprime.com/api/webhook-receive.php",
    "events": ["cliente_criado", "cliente_atualizado", "venda_criada"]
  }'
```

### Passo 9: URLs Finais

```
✅ Frontend: https://analytics.conectaprime.com
✅ Backend:  https://analytics.conectaprime.com/api/webhook-receive.php
✅ CRM Atual: https://crm.conectaprime.com (inalterado)
```

## 🔧 Troubleshooting

### Problema: "500 Internal Server Error"
**Soluções**:
1. Verificar logs de erro no cPanel
2. Conferir permissões dos arquivos (644 para arquivos, 755 para pastas)
3. Verificar sintaxe do PHP
4. Confirmar configuração do banco de dados

### Problema: Frontend não carrega
**Soluções**:
1. Verificar se `index.html` está na raiz do subdomínio
2. Conferir se a pasta `assets` foi copiada corretamente
3. Verificar permissões dos arquivos
4. Limpar cache do navegador

### Problema: Webhook não recebe dados
**Soluções**:
1. Testar URL manualmente com curl
2. Verificar logs de erro PHP
3. Confirmar se SSL está ativo
4. Verificar se o CRM atual consegue acessar a URL

### Problema: Banco de dados não conecta
**Soluções**:
1. Verificar credenciais no arquivo PHP
2. Confirmar se usuário tem privilégios no banco
3. Testar conexão via phpMyAdmin
4. Verificar se o banco foi criado corretamente

## 📊 Monitoramento

### Logs Importantes
1. **Erro PHP**: `/public_html/error_logs/`
2. **Acesso**: cPanel → "Logs de Acesso"
3. **Webhook**: Logs customizados no PHP

### Métricas para Acompanhar
- Webhooks recebidos por dia
- Erros de processamento
- Tempo de resposta das APIs
- Uso de espaço em disco

## 🎉 Resultado Final

Após seguir todos os passos, você terá:

✅ **Dashboard CRM Avançado**: `https://analytics.conectaprime.com`
✅ **Webhooks Funcionando**: Sincronização automática
✅ **Banco de Dados**: MySQL com todas as tabelas
✅ **SSL Ativo**: Conexões seguras
✅ **Logs Configurados**: Monitoramento completo

**Seu CRM avançado estará 100% funcional na HostGator!** 🚀