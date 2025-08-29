# Guia de Configuração de Webhooks - CRM Integration

## Problema Identificado

O sistema de webhooks não funcionou porque:
1. **URLs não públicas**: O CRM atual não consegue acessar `localhost`
2. **Backend não rodando**: O Encore backend precisa estar ativo
3. **Endpoints incorretos**: Alguns endpoints do CRM atual podem ter nomes diferentes

## Solução Completa

### Passo 1: Instalar e Configurar ngrok

**ngrok** expõe seu localhost para a internet, permitindo que o CRM atual acesse os webhooks.

#### Instalação:
```bash
# Windows (via Chocolatey)
choco install ngrok

# Ou baixe diretamente de: https://ngrok.com/download
```

#### Configuração:
1. Crie uma conta gratuita em: https://ngrok.com/
2. Obtenha seu token de autenticação
3. Configure o token:
```bash
ngrok config add-authtoken SEU_TOKEN_AQUI
```

### Passo 2: Iniciar o Backend Encore

```bash
# No terminal, navegue para o backend
cd backend

# Instale dependências se necessário
npm install

# Inicie o Encore
encore run
```

O backend deve rodar em `http://localhost:4000`

### Passo 3: Expor o Backend com ngrok

Em um novo terminal:
```bash
# Expor a porta 4000 (onde o Encore roda)
ngrok http 4000
```

Você verá algo como:
```
Forwarding  https://abc123.ngrok.io -> http://localhost:4000
```

**Copie essa URL** (ex: `https://abc123.ngrok.io`)

### Passo 4: Atualizar o Código com a URL do ngrok

Edite o arquivo `backend/crm/webhook_integration.ts` e substitua:
```typescript
const webhookUrl = `https://seu-novo-crm.ngrok.io/crm/webhook/receive`;
```

Por:
```typescript
const webhookUrl = `https://abc123.ngrok.io/crm/webhook/receive`;
```

### Passo 5: Testar a Integração

#### 5.1 Registrar Webhook
1. Acesse: http://localhost:5174/crm-integration
2. Configure:
   - **URL do CRM**: `https://crm.conectaprime.com`
   - **Token JWT**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (seu token)
   - **Eventos**: Selecione os eventos desejados
3. Clique em "Registrar Webhook"

#### 5.2 Testar Manualmente (Opcional)

Você pode testar diretamente via curl:
```bash
curl -X POST https://crm.conectaprime.com/api/webhooks \
  -H "Authorization: Bearer SEU_JWT_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://abc123.ngrok.io/crm/webhook/receive",
    "events": ["cliente_criado", "cliente_atualizado"]
  }'
```

### Passo 6: Sincronização Histórica

Após configurar os webhooks, importe dados existentes:

1. **Clientes**: Clique em "Sincronizar Clientes"
2. **Produtos**: Clique em "Sincronizar Produtos"
3. **Vendas**: Clique em "Sincronizar Vendas"

### Passo 7: Verificar Funcionamento

#### Logs do Backend:
Verifique os logs do Encore para ver se os webhooks estão sendo recebidos:
```
Webhook recebido: cliente_criado
Cliente criado: Nome do Cliente
```

#### Logs do ngrok:
No terminal do ngrok, você verá as requisições:
```
POST /crm/webhook/receive    200 OK
```

## Troubleshooting

### Problema: "Cannot GET /api/clientes"
**Solução**: O endpoint pode ser diferente. Tente:
- `/api/cliente` (singular)
- `/api/users`
- `/api/customers`

### Problema: "Acesso negado. Token não fornecido"
**Solução**: 
1. Verifique se o token JWT está correto
2. Confirme que não expirou (tokens geralmente expiram em algumas horas)
3. Gere um novo token se necessário

### Problema: ngrok "tunnel not found"
**Solução**:
1. Verifique se o backend está rodando na porta 4000
2. Reinicie o ngrok: `ngrok http 4000`
3. Atualize a URL no código

### Problema: Webhook não recebido
**Solução**:
1. Verifique se o ngrok está ativo
2. Confirme que a URL no webhook está correta
3. Verifique os logs do Encore
4. Teste o endpoint manualmente:
```bash
curl -X POST https://abc123.ngrok.io/crm/webhook/receive \
  -H "Content-Type: application/json" \
  -d '{
    "event": "teste",
    "timestamp": "2025-01-28T10:00:00Z",
    "data": {"teste": true}
  }'
```

## Estrutura Final

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│   CRM Atual     │───▶│    ngrok     │───▶│  Novo CRM       │
│ conectaprime.com│    │ (público)    │    │ (localhost)     │
└─────────────────┘    └──────────────┘    └─────────────────┘
```

## Comandos Resumidos

```bash
# Terminal 1: Backend
cd backend
encore run

# Terminal 2: ngrok
ngrok http 4000

# Terminal 3: Frontend (já rodando)
# http://localhost:5174/
```

## URLs Importantes

- **Frontend**: http://localhost:5174/
- **Backend**: http://localhost:4000/
- **ngrok**: https://abc123.ngrok.io/ (sua URL específica)
- **CRM Atual**: https://crm.conectaprime.com/
- **Integração**: http://localhost:5174/crm-integration

Após seguir estes passos, a integração via webhooks funcionará perfeitamente!