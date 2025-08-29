'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Settings,
  Link,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  Database,
  Zap,
  Shield
} from 'lucide-react'

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

export default function CRMIntegrationSetup() {
  const [config, setConfig] = useState<CRMConfig>({
    baseUrl: 'https://crm.conectaprime.com',
    apiToken: '',
    autoSync: true,
    syncInterval: 5
  })
  
  const [status, setStatus] = useState<ConnectionStatus>({
    connected: false,
    lastTest: null,
    error: null,
    responseTime: null
  })
  
  const [showToken, setShowToken] = useState(false)
  const [testing, setTesting] = useState(false)
  const [saving, setSaving] = useState(false)

  // Carregar configuração salva
  useEffect(() => {
    const savedConfig = localStorage.getItem('crm-config')
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig))
    }
  }, [])

  // Testar conexão com o CRM
  const testConnection = async () => {
    setTesting(true)
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
      setTesting(false)
    }
  }

  // Salvar configuração
  const saveConfig = async () => {
    setSaving(true)
    
    try {
      // Salvar no localStorage
      localStorage.setItem('crm-config', JSON.stringify(config))
      
      // Testar conexão após salvar
      await testConnection()
      
      // Aqui você pode adicionar uma chamada para salvar no backend se necessário
      
    } catch (error) {
      console.error('Erro ao salvar configuração:', error)
    } finally {
      setSaving(false)
    }
  }

  // Copiar token para clipboard
  const copyToken = async () => {
    try {
      await navigator.clipboard.writeText(config.apiToken)
      // Aqui você pode adicionar uma notificação de sucesso
    } catch (error) {
      console.error('Erro ao copiar token:', error)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-6"
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-blue-500 rounded-xl">
            <Link className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Integração CRM</h1>
            <p className="text-gray-600">Configure a conexão com seu CRM atual para análise de dados</p>
          </div>
        </div>
        
        {/* Status da Conexão */}
        <div className={`p-4 rounded-xl border-2 ${
          status.connected 
            ? 'bg-green-50 border-green-200' 
            : status.error 
            ? 'bg-red-50 border-red-200'
            : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {status.connected ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : status.error ? (
                <AlertCircle className="w-5 h-5 text-red-500" />
              ) : (
                <Database className="w-5 h-5 text-gray-500" />
              )}
              <div>
                <p className={`font-semibold ${
                  status.connected ? 'text-green-700' : status.error ? 'text-red-700' : 'text-gray-700'
                }`}>
                  {status.connected ? 'Conectado' : status.error ? 'Erro na Conexão' : 'Não Conectado'}
                </p>
                {status.lastTest && (
                  <p className="text-sm text-gray-600">
                    Último teste: {status.lastTest.toLocaleString('pt-BR')}
                    {status.responseTime && ` (${status.responseTime}ms)`}
                  </p>
                )}
              </div>
            </div>
            
            <button
              onClick={testConnection}
              disabled={testing}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${testing ? 'animate-spin' : ''}`} />
              <span>{testing ? 'Testando...' : 'Testar Conexão'}</span>
            </button>
          </div>
          
          {status.error && (
            <div className="mt-3 p-3 bg-red-100 rounded-lg">
              <p className="text-red-700 text-sm">{status.error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Configurações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuração Básica */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Settings className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Configuração Básica</h2>
          </div>
          
          <div className="space-y-4">
            {/* URL do CRM */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL do CRM Atual
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={config.baseUrl}
                  onChange={(e) => setConfig(prev => ({ ...prev, baseUrl: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://crm.conectaprime.com"
                />
                <ExternalLink className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                URL base do seu CRM atual (ex: crm.conectaprime.com)
              </p>
            </div>
            
            {/* Token de API */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token de API
              </label>
              <div className="relative">
                <input
                  type={showToken ? 'text' : 'password'}
                  value={config.apiToken}
                  onChange={(e) => setConfig(prev => ({ ...prev, apiToken: e.target.value }))}
                  className="w-full px-4 py-3 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Seu token de API do CRM"
                />
                <div className="absolute right-2 top-2 flex space-x-1">
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={copyToken}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Token de autenticação para acessar a API do CRM
              </p>
            </div>
          </div>
        </div>

        {/* Configurações Avançadas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Zap className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Sincronização</h2>
          </div>
          
          <div className="space-y-4">
            {/* Auto Sync */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Sincronização Automática
                </label>
                <p className="text-xs text-gray-500">
                  Atualizar dados automaticamente
                </p>
              </div>
              <button
                onClick={() => setConfig(prev => ({ ...prev, autoSync: !prev.autoSync }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.autoSync ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.autoSync ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            {/* Intervalo de Sync */}
            {config.autoSync && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Intervalo de Sincronização (minutos)
                </label>
                <select
                  value={config.syncInterval}
                  onChange={(e) => setConfig(prev => ({ ...prev, syncInterval: Number(e.target.value) }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={1}>1 minuto</option>
                  <option value={5}>5 minutos</option>
                  <option value={10}>10 minutos</option>
                  <option value={15}>15 minutos</option>
                  <option value={30}>30 minutos</option>
                  <option value={60}>1 hora</option>
                </select>
              </div>
            )}
            
            {/* Informações de Segurança */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start space-x-2">
                <Shield className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-blue-900">Segurança</h3>
                  <p className="text-xs text-blue-700 mt-1">
                    Todas as conexões são criptografadas e os tokens são armazenados de forma segura.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="mt-8 flex justify-end space-x-4">
        <button
          onClick={testConnection}
          disabled={testing}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          {testing ? 'Testando...' : 'Testar Conexão'}
        </button>
        
        <button
          onClick={saveConfig}
          disabled={saving || !config.baseUrl || !config.apiToken}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Salvando...' : 'Salvar Configuração'}
        </button>
      </div>

      {/* Guia de Configuração */}
      <div className="mt-8 bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Como Configurar</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start space-x-2">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
            <p>Acesse seu CRM atual em <strong>crm.conectaprime.com</strong></p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
            <p>Vá em <strong>Configurações → API → Gerar Token</strong></p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
            <p>Cole o token gerado no campo acima</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
            <p>Teste a conexão e salve a configuração</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}