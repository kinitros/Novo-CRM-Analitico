import { NextRequest, NextResponse } from 'next/server'

// Configuração do CRM atual
const CRM_BASE_URL = 'https://crm.conectaprime.com'
const CRM_API_TOKEN = process.env.CRM_API_TOKEN || 'your-api-token-here'

// Interface para dados do CRM
interface CRMCustomer {
  id: string
  nome: string
  email: string
  telefone?: string
  dataUltimaCompra?: string
  valorTotalGasto: number
  numeroPedidos: number
  tags?: string[]
  origem?: string
}

interface CRMSale {
  id: string
  clienteId: string
  valor: number
  dataVenda: string
  produto: string
  status: string
}

interface CRMProduct {
  id: string
  nome: string
  preco: number
  categoria: string
  vendasMes: number
  estoque: number
}

// Função para fazer requisições ao CRM atual
async function fetchFromCRM(endpoint: string) {
  try {
    const response = await fetch(`${CRM_BASE_URL}/api/${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${CRM_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`CRM API Error: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Erro ao conectar com CRM:', error)
    throw error
  }
}

// GET - Buscar dados do CRM
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')
  
  try {
    switch (type) {
      case 'customers':
        const customers = await fetchFromCRM('clientes')
        return NextResponse.json({
          success: true,
          data: customers,
          total: customers.length
        })
        
      case 'sales':
        const salesEndpoint = `vendas?dataInicio=${startDate}&dataFim=${endDate}`
        const sales = await fetchFromCRM(salesEndpoint)
        return NextResponse.json({
          success: true,
          data: sales,
          total: sales.reduce((sum: number, sale: CRMSale) => sum + sale.valor, 0)
        })
        
      case 'products':
        const products = await fetchFromCRM('produtos')
        return NextResponse.json({
          success: true,
          data: products,
          total: products.length
        })
        
      case 'dashboard':
        // Buscar dados consolidados para o dashboard
        const [dashboardCustomers, dashboardSales, dashboardProducts] = await Promise.all([
          fetchFromCRM('clientes?resumo=true'),
          fetchFromCRM(`vendas?dataInicio=${startDate}&dataFim=${endDate}&resumo=true`),
          fetchFromCRM('produtos?resumo=true')
        ])
        
        return NextResponse.json({
          success: true,
          data: {
            customers: dashboardCustomers,
            sales: dashboardSales,
            products: dashboardProducts,
            metrics: {
              totalCustomers: dashboardCustomers.total || 0,
              totalSales: dashboardSales.totalValue || 0,
              totalProducts: dashboardProducts.total || 0,
              averageTicket: dashboardSales.averageTicket || 0,
              conversionRate: dashboardSales.conversionRate || 0
            }
          }
        })
        
      case 'analytics':
        // Dados para análise avançada
        const analytics = await fetchFromCRM(`analytics?periodo=${startDate}&ate=${endDate}`)
        return NextResponse.json({
          success: true,
          data: analytics
        })
        
      case 'test':
        // Teste de conexão
        const testResult = await fetchFromCRM('crm/clientes?limit=1')
        return NextResponse.json({
          success: true,
          message: 'Conexão estabelecida com sucesso',
          data: { connected: true, timestamp: new Date().toISOString() }
        })
        
      default:
        return NextResponse.json(
          { success: false, error: 'Tipo de dados não especificado. Use: customers, sales, products, dashboard, analytics ou test' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Erro na integração CRM:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao conectar com o CRM atual',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

// POST - Sincronizar dados específicos
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body
    
    switch (action) {
      case 'sync-customers':
        // Sincronizar clientes específicos
        const customerIds = data.customerIds || []
        const syncResults = []
        
        for (const customerId of customerIds) {
          try {
            const customer = await fetchFromCRM(`clientes/${customerId}`)
            syncResults.push({ id: customerId, success: true, data: customer })
          } catch (error) {
            syncResults.push({ id: customerId, success: false, error: error })
          }
        }
        
        return NextResponse.json({
          success: true,
          results: syncResults
        })
        
      case 'update-tags':
        // Atualizar tags de clientes
        const { customerId, tags } = data
        const updateResult = await fetch(`${CRM_BASE_URL}/api/clientes/${customerId}/tags`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${CRM_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tags })
        })
        
        return NextResponse.json({
          success: updateResult.ok,
          data: await updateResult.json()
        })
        
      default:
        return NextResponse.json(
          { success: false, error: 'Ação não reconhecida' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Erro no POST da integração CRM:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao processar requisição',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}