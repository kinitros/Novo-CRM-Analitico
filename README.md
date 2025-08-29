# CRM Dashboard System - Deploy no Vercel

## 🚀 Deploy Rápido no Vercel

### 📋 Pré-requisitos
- Conta no [Vercel](https://vercel.com)
- Conta no [GitHub](https://github.com) (opcional, mas recomendado)
- Node.js instalado localmente (para testes)

### 🔧 Configuração do Projeto

#### 1. Estrutura do Projeto
```
crm-dashboard-system/
├── api/
│   └── crm.php              # API serverless PHP
├── frontend/
│   ├── dist/                 # Build do React (gerado)
│   ├── src/
│   └── package.json
├── vercel.json               # Configuração do Vercel
└── README.md
```

#### 2. Arquivos Principais
- **`vercel.json`**: Configuração de build e rotas
- **`api/crm.php`**: API serverless com dados de fallback
- **`frontend/`**: Aplicação React/TypeScript

### 🌐 Deploy no Vercel

#### Opção 1: Deploy via GitHub (Recomendado)

1. **Criar repositório no GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/crm-dashboard-system.git
   git push -u origin main
   ```

2. **Conectar ao Vercel:**
   - Acesse [vercel.com](https://vercel.com)
   - Clique em "New Project"
   - Importe o repositório do GitHub
   - Configure as variáveis de ambiente (opcional)

3. **Deploy automático:**
   - O Vercel detectará automaticamente a configuração
   - Build será executado automaticamente
   - URL será gerada: `https://crm-dashboard-system.vercel.app`

#### Opção 2: Deploy via CLI

1. **Instalar Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login no Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel --prod
   ```

### ⚙️ Configurações

#### Variáveis de Ambiente (Opcional)
No painel do Vercel, adicione:
- `CRM_BASE_URL`: `https://crm.conectaprime.com`
- `USE_FALLBACK_DATA`: `true`
- `JWT_TOKEN`: Seu token JWT atual

#### Build Settings
- **Framework Preset**: Other
- **Build Command**: `cd frontend && npm run build`
- **Output Directory**: `frontend/dist`
- **Install Command**: `cd frontend && npm install`

### 🎯 URLs de Acesso

Após o deploy:
- **Frontend**: `https://crm-dashboard-system.vercel.app`
- **API**: `https://crm-dashboard-system.vercel.app/api/crm/metrics`

### 📊 Endpoints da API

- `GET /api/crm/metrics` - Métricas gerais
- `GET /api/crm/clientes` - Lista de clientes
- `GET /api/crm/vendas` - Lista de vendas
- `GET /api/crm/produtos` - Lista de produtos
- `GET /api/crm/sales-chart` - Dados do gráfico
- `GET /api/crm/customer-sales` - Top clientes
- `GET /api/crm/product-sales` - Top produtos

### 🔧 Desenvolvimento Local

1. **Instalar dependências:**
   ```bash
   cd frontend
   npm install
   ```

2. **Executar em desenvolvimento:**
   ```bash
   npm run dev
   ```

3. **Build local:**
   ```bash
   npm run build
   ```

### 🛠️ Troubleshooting

#### Problema: Build falha
**Solução**: Verificar se todas as dependências estão instaladas:
```bash
cd frontend && npm install
```

#### Problema: API não responde
**Solução**: Verificar se o arquivo `api/crm.php` existe e tem as permissões corretas.

#### Problema: CORS errors
**Solução**: Os headers CORS já estão configurados no `api/crm.php`.

### 📈 Funcionalidades

✅ **Dashboard Completo**
- Métricas de vendas em tempo real
- Gráficos interativos
- Top clientes e produtos

✅ **Gestão de Dados**
- Lista de clientes com busca
- Histórico de vendas
- Catálogo de produtos

✅ **Performance**
- Cache inteligente
- Dados de fallback
- API serverless

✅ **Responsivo**
- Interface adaptável
- Mobile-friendly
- Navegação intuitiva

### 🎉 Resultado Final

Após o deploy, você terá:
- ✅ CRM funcionando em `https://crm-dashboard-system.vercel.app`
- ✅ API serverless com dados simulados
- ✅ Interface responsiva e moderna
- ✅ Deploy automático via GitHub
- ✅ SSL/HTTPS automático
- ✅ CDN global do Vercel

### 📞 Suporte

Se encontrar problemas:
1. Verifique os logs no painel do Vercel
2. Confirme se todos os arquivos foram enviados
3. Teste os endpoints da API individualmente

**🚀 Seu CRM estará online em minutos!**