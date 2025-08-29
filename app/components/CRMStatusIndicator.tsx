'use client'

import { motion } from 'framer-motion'
import { CheckCircle, AlertCircle, Wifi, WifiOff } from 'lucide-react'
import { useCRM } from '../contexts/CRMContext'

interface CRMStatusIndicatorProps {
  showDetails?: boolean
  className?: string
}

export default function CRMStatusIndicator({ showDetails = false, className = '' }: CRMStatusIndicatorProps) {
  const { status, config, testConnection, isLoading } = useCRM()

  const getStatusColor = () => {
    if (isLoading) return 'text-yellow-500'
    return status.connected ? 'text-green-500' : 'text-red-500'
  }

  const getStatusIcon = () => {
    if (isLoading) {
      return <Wifi className="w-4 h-4 animate-pulse" />
    }
    return status.connected ? (
      <CheckCircle className="w-4 h-4" />
    ) : (
      <WifiOff className="w-4 h-4" />
    )
  }

  const getStatusText = () => {
    if (isLoading) return 'Testando conexão...'
    if (status.connected) return 'CRM Conectado'
    return status.error || 'CRM Desconectado'
  }

  const formatLastTest = () => {
    if (!status.lastTest) return 'Nunca testado'
    
    const now = new Date()
    const diff = now.getTime() - status.lastTest.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'Agora mesmo'
    if (minutes < 60) return `${minutes}min atrás`
    
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h atrás`
    
    const days = Math.floor(hours / 24)
    return `${days}d atrás`
  }

  if (!showDetails) {
    // Versão compacta para header/navbar
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`flex items-center space-x-2 ${className}`}
      >
        <div className={getStatusColor()}>
          {getStatusIcon()}
        </div>
        <span className={`text-sm font-medium ${getStatusColor()}`}>
          {status.connected ? 'Online' : 'Offline'}
        </span>
      </motion.div>
    )
  }

  // Versão detalhada
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-lg border p-4 ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={getStatusColor()}>
            {getStatusIcon()}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              Status da Conexão CRM
            </h3>
            <p className={`text-sm ${getStatusColor()}`}>
              {getStatusText()}
            </p>
          </div>
        </div>
        
        <button
          onClick={testConnection}
          disabled={isLoading}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Testando...' : 'Testar'}
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
        <div>
          <span className="font-medium">Último teste:</span>
          <br />
          {formatLastTest()}
        </div>
        
        {status.responseTime && (
          <div>
            <span className="font-medium">Tempo de resposta:</span>
            <br />
            {status.responseTime}ms
          </div>
        )}
        
        <div className="col-span-2">
          <span className="font-medium">Servidor:</span>
          <br />
          {config.baseUrl}
        </div>
        
        {status.error && (
          <div className="col-span-2 p-2 bg-red-50 border border-red-200 rounded text-red-700">
            <span className="font-medium">Erro:</span> {status.error}
          </div>
        )}
      </div>
    </motion.div>
  )
}