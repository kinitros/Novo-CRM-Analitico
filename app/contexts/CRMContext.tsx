'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface CRMConfig {
  baseUrl: string
  apiToken: string
  autoSync: boolean
  syncInterval: number
}

interface ConnectionStatus {
  connected: boolean
  lastTest: Date | null
  error: string | null
  responseTime: number | null
}

interface CRMContextType {
  config: CRMConfig
  setConfig: (config: CRMConfig) => void
  status: ConnectionStatus
  setStatus: (status: ConnectionStatus) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  testConnection: () => Promise<void>
  saveConfig: () => Promise<void>
}

const defaultConfig: CRMConfig = {
  baseUrl: 'https://crm.conectaprime.com',
  apiToken: '',
  autoSync: true,
  syncInterval: 5
}

const defaultStatus: ConnectionStatus = {
  connected: false,
  lastTest: null,
  error: null,
  responseTime: null
}

const CRMContext = createContext<CRMContextType | undefined>(undefined)

export function CRMProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<CRMConfig>(defaultConfig)
  const [status, setStatus] = useState<ConnectionStatus>(defaultStatus)
  const [isLoading, setIsLoading] = useState(false)

  // Carregar configuração salva ao inicializar
  useEffect(() => {
    const savedConfig = localStorage.getItem('crm-config')
    const savedStatus = localStorage.getItem('crm-status')
    
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig))
      } catch (error) {
        console.error('Erro ao carregar configuração:', error)
      }
    }
    
    if (savedStatus) {
      try {
        const parsedStatus = JSON.parse(savedStatus)
        // Converter string de data de volta para Date
        if (parsedStatus.lastTest) {
          parsedStatus.lastTest = new Date(parsedStatus.lastTest)
        }
        setStatus(parsedStatus)
      } catch (error) {
        console.error('Erro ao carregar status:', error)
      }
    }
  }, [])

  // Salvar status no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem('crm-status', JSON.stringify(status))
  }, [status])

  // Testar conexão
  const testConnection = async () => {
    setIsLoading(true)
    const startTime = Date.now()
    
    try {
      const response = await fetch('/api/crm-integration?type=test', {
        method: 'GET',
        headers: {
          'X-CRM-URL': config.baseUrl,
          'X-CRM-TOKEN': config.apiToken
        }
      })
      
      const responseTime = Date.now() - startTime
      const result = await response.json()
      
      if (result.success) {
        setStatus({
          connected: true,
          lastTest: new Date(),
          error: null,
          responseTime
        })
      } else {
        setStatus({
          connected: false,
          lastTest: new Date(),
          error: result.error || 'Erro na conexão',
          responseTime
        })
      }
    } catch (error) {
      setStatus({
        connected: false,
        lastTest: new Date(),
        error: error instanceof Error ? error.message : 'Erro de rede',
        responseTime: Date.now() - startTime
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Salvar configuração
  const saveConfig = async () => {
    setIsLoading(true)
    
    try {
      // Salvar no localStorage
      localStorage.setItem('crm-config', JSON.stringify(config))
      
      // Testar conexão após salvar
      await testConnection()
      
    } catch (error) {
      console.error('Erro ao salvar configuração:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-sync se habilitado
  useEffect(() => {
    if (config.autoSync && status.connected) {
      const interval = setInterval(() => {
        testConnection()
      }, config.syncInterval * 60 * 1000) // Converter minutos para ms
      
      return () => clearInterval(interval)
    }
  }, [config.autoSync, config.syncInterval, status.connected])

  const value: CRMContextType = {
    config,
    setConfig,
    status,
    setStatus,
    isLoading,
    setIsLoading,
    testConnection,
    saveConfig
  }

  return (
    <CRMContext.Provider value={value}>
      {children}
    </CRMContext.Provider>
  )
}

export function useCRM() {
  const context = useContext(CRMContext)
  if (context === undefined) {
    throw new Error('useCRM deve ser usado dentro de um CRMProvider')
  }
  return context
}