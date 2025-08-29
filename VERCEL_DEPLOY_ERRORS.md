# 🚨 LOGS DE ERRO DO VERCEL DEPLOY

## 📋 Instruções:
1. **Cole aqui todos os logs de erro** do Vercel
2. **Inclua timestamps** se disponíveis
3. **Adicione contexto** sobre quando o erro ocorreu
4. **Mantenha formatação** para facilitar análise

---

## 🔍 ERRO #1 - [DATA/HORA]

### 📊 Contexto:
- **Deploy Attempt:** #X
- **Branch:** main
- **Commit:** [hash]
- **Trigger:** [manual/automatic]

### 📝 Logs Completos:
```
[15:36:23.897] Running build in Washington, D.C., USA (East) – iad1
[15:36:23.898] Build machine configuration: 2 cores, 8 GB
[15:36:23.927] Cloning github.com/kinitros/Novo-CRM-Analitico (Branch: main, Commit: 5f1173e)
[15:36:24.059] Previous build caches not available
[15:36:24.235] Cloning completed: 308.000ms
[15:36:24.578] Running "vercel build"
[15:36:25.150] Vercel CLI 46.1.0
[15:36:25.323] WARN! Due to `builds` existing in your configuration file, the Build and Development Settings defined in your Project Settings will not apply. Learn More: https://vercel.link/unused-build-settings
[15:36:25.735] > Installing Builder: vercel-php@0.6.0
[15:36:28.187] Installing dependencies...
[15:36:32.841] 
[15:36:32.842] added 185 packages in 4s
[15:36:32.842] 
[15:36:32.842] 19 packages are looking for funding
[15:36:32.843]   run `npm fund` for details
[15:36:32.896] Running "npm run vercel-build"
[15:36:33.024] 
[15:36:33.025] > frontend@1.0.0 vercel-build
[15:36:33.025] > npm run build
[15:36:33.026] 
[15:36:33.155] 
[15:36:33.156] > frontend@1.0.0 build
[15:36:33.156] > tsc && vite build
[15:36:33.156] 
[15:36:39.580] ../backend/crm/create_sample_data.ts(1,21): error TS2307: Cannot find module 'encore.dev/api' or its corresponding type declarations.
[15:36:39.581] ../backend/crm/db.ts(1,29): error TS2307: Cannot find module 'encore.dev/storage/sqldb' or its corresponding type declarations.
[15:36:39.581] ../backend/crm/get_customer_sales.ts(1,28): error TS2307: Cannot find module 'encore.dev/api' or its corresponding type declarations.
[15:36:39.582] ../backend/crm/get_customer_sales.ts(16,12): error TS7031: Binding element 'limit' implicitly has an 'any' type.
[15:36:39.582] ../backend/crm/get_product_sales.ts(1,28): error TS2307: Cannot find module 'encore.dev/api' or its corresponding type declarations.
[15:36:39.582] ../backend/crm/get_product_sales.ts(16,12): error TS7031: Binding element 'limit' implicitly has an 'any' type.
[15:36:39.583] ../backend/crm/get_sales.ts(1,28): error TS2307: Cannot find module 'encore.dev/api' or its corresponding type declarations.
[15:36:39.583] ../backend/crm/get_sales.ts(18,12): error TS7031: Binding element 'limit' implicitly has an 'any' type.
[15:36:39.583] ../backend/crm/get_sales.ts(18,19): error TS7031: Binding element 'offset' implicitly has an 'any' type.
[15:36:39.584] ../backend/crm/get_sales_chart_data.ts(1,28): error TS2307: Cannot find module 'encore.dev/api' or its corresponding type declarations.
[15:36:39.584] ../backend/crm/get_sales_chart_data.ts(16,12): error TS7031: Binding element 'days' implicitly has an 'any' type.
[15:36:39.584] ../backend/crm/get_sales_metrics.ts(1,21): error TS2307: Cannot find module 'encore.dev/api' or its corresponding type declarations.
[15:36:39.584] App.tsx(33,37): error TS2741: Property 'children' is missing in type '{}' but required in type 'LayoutProps'.
[15:36:39.584] client.ts(7,40): error TS2307: Cannot find module 'encore.dev/api' or its corresponding type declarations.
[15:36:39.585] client.ts(242,8): error TS2307: Cannot find module 'encore.dev/api' or its corresponding type declarations.
[15:36:39.585] client.ts(881,22): error TS2580: Cannot find name 'process'. Do you need to install type definitions for node? Try `npm i --save-dev @types/node`.
[15:36:39.585] components/TopCustomers.tsx(40,43): error TS7006: Parameter 'customer' implicitly has an 'any' type.
[15:36:39.586] components/TopCustomers.tsx(40,53): error TS7006: Parameter 'index' implicitly has an 'any' type.
[15:36:39.586] components/TopProducts.tsx(36,41): error TS7006: Parameter 'product' implicitly has an 'any' type.
[15:36:39.586] components/TopProducts.tsx(36,50): error TS7006: Parameter 'index' implicitly has an 'any' type.
[15:36:39.587] pages/AdvancedProductAnalytics.tsx(82,45): error TS7006: Parameter 'product' implicitly has an 'any' type.
[15:36:39.587] pages/AdvancedProductAnalytics.tsx(94,17): error TS18046: 'data' is of type 'unknown'.
[15:36:39.587] pages/AdvancedProductAnalytics.tsx(95,16): error TS18046: 'data' is of type 'unknown'.
[15:36:39.587] pages/AdvancedProductAnalytics.tsx(96,20): error TS18046: 'data' is of type 'unknown'.
[15:36:39.588] pages/AdvancedProductAnalytics.tsx(100,45): error TS7006: Parameter 'product' implicitly has an 'any' type.
[15:36:39.588] pages/AdvancedProductAnalytics.tsx(239,78): error TS7006: Parameter 'product' implicitly has an 'any' type.
[15:36:39.588] pages/AdvancedProductAnalytics.tsx(239,87): error TS7006: Parameter 'index' implicitly has an 'any' type.
[15:36:39.589] pages/AdvancedProductAnalytics.tsx(258,77): error TS7006: Parameter 'product' implicitly has an 'any' type.
[15:36:39.589] pages/AdvancedProductAnalytics.tsx(258,86): error TS7006: Parameter 'index' implicitly has an 'any' type.
[15:36:39.589] pages/AdvancedProductAnalytics.tsx(295,57): error TS7006: Parameter 'd' implicitly has an 'any' type.
[15:36:39.589] pages/AdvancedProductAnalytics.tsx(411,45): error TS7006: Parameter 'product' implicitly has an 'any' type.
[15:36:39.590] pages/AdvancedProductAnalytics.tsx(490,64): error TS7006: Parameter 'month' implicitly has an 'any' type.
[15:36:39.590] pages/AdvancedProductAnalytics.tsx(506,61): error TS7006: Parameter 'segment' implicitly has an 'any' type.
[15:36:39.590] pages/BusinessIntelligence.tsx(436,22): error TS2304: Cannot find name 'DollarSign'.
[15:36:39.590] pages/CRMIntegration.tsx(44,32): error TS2339: Property 'getSyncStatus' does not exist on type '{ getSalesMetrics: () => Promise<any>; getSalesChartData: (params?: { days?: number | undefined; } | undefined) => Promise<any>; getCustomerSales: (params?: { limit?: number | undefined; } | undefined) => Promise<...>; ... 11 more ...; listRegisteredWebhooks: (params: any) => Promise<...>; }'.
[15:36:39.591] pages/CustomerSegmentation.tsx(84,14): error TS18046: 'data' is of type 'unknown'.
[15:36:39.591] pages/CustomerSegmentation.tsx(85,16): error TS18046: 'data' is of type 'unknown'.
[15:36:39.591] pages/CustomerSegmentation.tsx(90,23): error TS2571: Object is of type 'unknown'.
[15:36:39.591] pages/CustomerSegmentation.tsx(90,42): error TS2571: Object is of type 'unknown'.
[15:36:39.592] pages/CustomerSegmentation.tsx(95,16): error TS18046: 'data' is of type 'unknown'.
[15:36:39.592] pages/CustomerSegmentation.tsx(96,16): error TS18046: 'data' is of type 'unknown'.
[15:36:39.592] pages/CustomerSegmentation.tsx(100,49): error TS7006: Parameter 'customer' implicitly has an 'any' type.
[15:36:39.592] pages/CustomerSegmentation.tsx(203,17): error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'number'.
[15:36:39.593] pages/CustomerSegmentation.tsx(204,51): error TS18046: 'segment' is of type 'unknown'.
[15:36:39.593] pages/CustomerSegmentation.tsx(356,49): error TS7006: Parameter 'customer' implicitly has an 'any' type.
[15:36:39.593] pages/Customers.tsx(269,42): error TS2339: Property 'total_compras' does not exist on type 'Cliente'.
[15:36:39.593] pages/Customers.tsx(271,40): error TS2339: Property 'ultima_compra' does not exist on type 'Cliente'.
[15:36:39.593] pages/Customers.tsx(273,63): error TS2339: Property 'ultima_compra' does not exist on type 'Cliente'.
[15:36:39.594] pages/Customers.tsx(280,44): error TS2339: Property 'valor_total_gasto' does not exist on type 'Cliente'.
[15:36:39.594] pages/Customers.tsx(330,46): error TS2339: Property 'total_compras' does not exist on type 'Cliente'.
[15:36:39.594] pages/Customers.tsx(333,42): error TS2339: Property 'valor_total_gasto' does not exist on type 'Cliente'.
[15:36:39.594] pages/Customers.tsx(337,34): error TS2339: Property 'ultima_compra' does not exist on type 'Cliente'.
[15:36:39.595] pages/Customers.tsx(339,64): error TS2339: Property 'ultima_compra' does not exist on type 'Cliente'.
[15:36:39.595] pages/ExecutiveDashboard.tsx(2,10): error TS2614: Module '"../client"' has no exported member 'backend'. Did you mean to use 'import backend from "../client"' instead?
[15:36:39.595] pages/Products.tsx(75,43): error TS7006: Parameter 'product' implicitly has an 'any' type.
[15:36:39.596] pages/Products.tsx(75,52): error TS7006: Parameter 'index' implicitly has an 'any' type.
[15:36:39.596] vite.config.ts(2,18): error TS2307: Cannot find module 'path' or its corresponding type declarations.
[15:36:39.596] vite.config.ts(8,25): error TS2304: Cannot find name '__dirname'.
[15:36:39.596] vite.config.ts(9,39): error TS2304: Cannot find name '__dirname'.
[15:36:39.597] vite.config.ts(10,32): error TS2304: Cannot find name '__dirname'.
[15:36:39.609] npm error Lifecycle script `build` failed with error:
[15:36:39.610] npm error code 2
[15:36:39.610] npm error path /vercel/path0/frontend
[15:36:39.610] npm error workspace frontend@1.0.0
[15:36:39.610] npm error location /vercel/path0/frontend
[15:36:39.610] npm error command failed
[15:36:39.610] npm error command sh -c tsc && vite build
[15:36:39.618] npm error Lifecycle script `vercel-build` failed with error:
[15:36:39.618] npm error code 2
[15:36:39.618] npm error path /vercel/path0/frontend
[15:36:39.618] npm error workspace frontend@1.0.0
[15:36:39.618] npm error location /vercel/path0/frontend
[15:36:39.619] npm error command failed
[15:36:39.619] npm error command sh -c npm run build
[15:36:39.629] Error: Command "npm run vercel-build" exited with 2