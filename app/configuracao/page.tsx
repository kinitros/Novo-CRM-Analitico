import CRMIntegrationSetup from '../components/CRMIntegrationSetup'

export default function ConfiguracaoPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Configuração do CRM</h1>
          <p className="mt-2 text-gray-600">
            Configure a integração com seu CRM atual para sincronizar dados em tempo real
          </p>
        </div>
        
        <CRMIntegrationSetup />
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Configuração CRM | CRM Analytics',
  description: 'Configure a integração com seu CRM atual para sincronização de dados'
}