'use client'

import { useState, useEffect, useCallback } from 'react'

// Tipos para os dados do CRM
interface CRMMetrics {
  totalCustomers: number
  totalSales: number
  totalProducts: number
  averageTicket: number
  conversionRate: number
}

interface CRMDashboardData {
  customers: any[]
  sales: any[]
  products: any[]
  metrics: CRMMetrics
}

interface CRMIntegrationState {
  data: CRMDashboardData | null
  loading: boolean
  error: string | null
  lastSync: Date | null
}

// Hook para integração com CRM
export function useCRMIntegration() {
  const [state, setState] = useState<CRMIntegrationState>({
    data: null,
    loading: false,
    error: null,
    lastSync: null
  })

  // Função para buscar dados do CRM
  const fetchCRMData = useCallback(async (type: string, params?: Record<string, string>) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const searchParams = new URLSearchParams({
        type,
        ...params
      })
      
      const response = await fetch(`/api/crm-integration?${searchParams}`)
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Erro ao buscar dados do CRM')
      }
      
      return result.data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      setState(prev => ({ ...prev, error: errorMessage, loading: false }))
      throw error
    }
  }, [])

  // Função para buscar dados do dashboard
  const fetchDashboardData = useCallback(async (startDate?: string, endDate?: string) => {
    try {
      const params: Record<string, string> = {}
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate
      
      const data = await fetchCRMData('dashboard', params)
      
      setState(prev => ({
        ...prev,
        data,
        loading: false,
        error: null,
        lastSync: new Date()
      }))
      
      return data
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }))
      throw error
    }
  }, [fetchCRMData])

  // Função para buscar clientes
  const fetchCustomers = useCallback(async (filters?: Record<string, string>) => {
    return await fetchCRMData('customers', filters)
  }, [fetchCRMData])

  // Função para buscar vendas
  const fetchSales = useCallback(async (startDate: string, endDate: string) => {
    return await fetchCRMData('sales', { startDate, endDate })
  }, [fetchCRMData])

  // Função para buscar produtos
  const fetchProducts = useCallback(async () => {
    return await fetchCRMData('products')
  }, [fetchCRMData])

  // Função para buscar analytics
  const fetchAnalytics = useCallback(async (startDate: string, endDate: string) => {
    return await fetchCRMData('analytics', { startDate, endDate })
  }, [fetchCRMData])

  // Função para sincronizar clientes específicos
  const syncCustomers = useCallback(async (customerIds: string[]) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const response = await fetch('/api/crm-integration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'sync-customers',
          data: { customerIds }
        })
      })
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Erro ao sincronizar clientes')
      }
      
      setState(prev => ({ ...prev, loading: false, lastSync: new Date() }))
      return result.results
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      setState(prev => ({ ...prev, error: errorMessage, loading: false }))
      throw error
    }
  }, [])

  // Função para atualizar tags de cliente
  const updateCustomerTags = useCallback(async (customerId: string, tags: string[]) => {
    try {
      const response = await fetch('/api/crm-integration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update-tags',
          data: { customerId, tags }
        })
      })
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Erro ao atualizar tags')
      }
      
      return result.data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      setState(prev => ({ ...prev, error: errorMessage }))
      throw error
    }
  }, [])

  // Auto-sync dos dados do dashboard a cada 5 minutos
  useEffect(() => {
    // Buscar dados iniciais
    fetchDashboardData()
    
    // Configurar auto-sync
    const interval = setInterval(() => {
      fetchDashboardData()
    }, 5 * 60 * 1000) // 5 minutos
    
    return () => clearInterval(interval)
  }, [fetchDashboardData])

  // Função para forçar refresh
  const refresh = useCallback(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  // Função para limpar erro
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  return {
    // Estado
    data: state.data,
    loading: state.loading,
    error: state.error,
    lastSync: state.lastSync,
    
    // Funções
    fetchDashboardData,
    fetchCustomers,
    fetchSales,
    fetchProducts,
    fetchAnalytics,
    syncCustomers,
    updateCustomerTags,
    refresh,
    clearError,
    
    // Helpers
    isConnected: !state.error && state.data !== null,
    hasData: state.data !== null,
    metrics: state.data?.metrics || {
      totalCustomers: 0,
      totalSales: 0,
      totalProducts: 0,
      averageTicket: 0,
      conversionRate: 0
    }
  }
}

// Hook para dados específicos de clientes
export function useCustomerData() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const loadCustomers = useCallback(async (filters?: Record<string, string>) => {
    setLoading(true)
    setError(null)
    
    try {
      const searchParams = new URLSearchParams({
        type: 'customers',
        ...filters
      })
      
      const response = await fetch(`/api/crm-integration?${searchParams}`)
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Erro ao buscar dados do CRM')
      }
      
      setCustomers(result.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar clientes')
    } finally {
      setLoading(false)
    }
  }, [])
  
  useEffect(() => {
    loadCustomers()
  }, [loadCustomers])
  
  return {
    customers,
    loading,
    error,
    reload: loadCustomers,
    total: customers.length
  }
}

// Hook para dados de vendas
export function useSalesData(startDate?: string, endDate?: string) {
  const [sales, setSales] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const loadSales = useCallback(async () => {
    if (!startDate || !endDate) return
    
    setLoading(true)
    setError(null)
    
    try {
      const searchParams = new URLSearchParams({
        type: 'sales',
        startDate,
        endDate
      })
      
      const response = await fetch(`/api/crm-integration?${searchParams}`)
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Erro ao buscar dados do CRM')
      }
      
      setSales(result.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar vendas')
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate])
  
  useEffect(() => {
    loadSales()
  }, [loadSales])
  
  return {
    sales,
    loading,
    error,
    reload: loadSales,
    total: sales.reduce((sum, sale) => sum + (sale.valor || 0), 0)
  }
}