import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import backend from "~backend/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { 
  RefreshCw, 
  Database, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Users,
  Package,
  ShoppingCart,
  ExternalLink,
  Settings,
  Play,
  Pause,
  Webhook,
  Zap,
  Link,
  History
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function CRMIntegration() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [crmBaseUrl, setCrmBaseUrl] = useState("https://crm.conectaprime.com");
  const [jwtToken, setJwtToken] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([
    'cliente_criado', 'cliente_atualizado', 'venda_criada', 
    'venda_status_entrega_atualizado', 'reposicao_criada'
  ]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: syncStatus, isLoading: statusLoading } = useQuery({
    queryKey: ["sync-status"],
    queryFn: () => backend.crm.getSyncStatus(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Mutation para registrar webhook
  const registerWebhookMutation = useMutation({
    mutationFn: () => backend.crm.registerWebhookInCurrentCRM({
      crm_base_url: crmBaseUrl,
      jwt_token: jwtToken,
      events: selectedEvents
    }),
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Webhook Registrado!",
          description: data.message,
        });
      } else {
        toast({
          title: "Erro ao Registrar Webhook",
          description: data.message,
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Erro na Conexão",
        description: "Erro ao conectar com o CRM atual.",
        variant: "destructive",
      });
    },
  });

  // Mutation para sincronização histórica
  const syncHistoricalMutation = useMutation({
    mutationFn: (dataType: 'customers' | 'sales' | 'products') => 
      backend.crm.syncHistoricalData({
        crm_base_url: crmBaseUrl,
        jwt_token: jwtToken,
        data_type: dataType
      }),
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Sincronização Histórica Concluída!",
          description: data.message,
        });
        queryClient.invalidateQueries({ queryKey: ["sync-status"] });
      } else {
        toast({
          title: "Erro na Sincronização",
          description: data.message,
          variant: "destructive",
        });
      }
    },
  });

  // Legacy sync mutation (mantido para compatibilidade)
  const syncMutation = useMutation({
    mutationFn: () => backend.crm.syncExternalCRM(),
    onMutate: () => {
      setIsSyncing(true);
      toast({
        title: "Sincronização Iniciada",
        description: "Iniciando sincronização com o CRM externo...",
      });
    },
    onSuccess: (data) => {
      setIsSyncing(false);
      queryClient.invalidateQueries({ queryKey: ["sync-status"] });
      
      if (data.success) {
        toast({
          title: "Sincronização Concluída!",
          description: `${data.customers_synced} clientes, ${data.products_synced} produtos e ${data.sales_synced} vendas sincronizados.`,
        });
      } else {
        toast({
          title: "Sincronização com Erros",
          description: data.message,
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      setIsSyncing(false);
      toast({
        title: "Erro na Sincronização",
        description: "Erro ao sincronizar com o CRM externo.",
        variant: "destructive",
      });
    },
  });

  const formatDate = (date: Date | null) => {
    if (!date) return "Nunca";
    return new Date(date).toLocaleString("pt-BR");
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const handleSync = () => {
    syncMutation.mutate();
  };

  const handleRegisterWebhook = () => {
    if (!jwtToken.trim()) {
      toast({
        title: "Token JWT Necessário",
        description: "Por favor, insira seu token JWT do CRM atual.",
        variant: "destructive",
      });
      return;
    }
    registerWebhookMutation.mutate();
  };

  const handleSyncHistorical = (dataType: 'customers' | 'sales' | 'products') => {
    if (!jwtToken.trim()) {
      toast({
        title: "Token JWT Necessário",
        description: "Por favor, insira seu token JWT do CRM atual.",
        variant: "destructive",
      });
      return;
    }
    syncHistoricalMutation.mutate(dataType);
  };

  const availableEvents = [
    { id: 'cliente_criado', label: 'Cliente Criado' },
    { id: 'cliente_atualizado', label: 'Cliente Atualizado' },
    { id: 'venda_criada', label: 'Venda Criada' },
    { id: 'venda_status_entrega_atualizado', label: 'Status Entrega Atualizado' },
    { id: 'venda_status_envio_atualizado', label: 'Status Envio Atualizado' },
    { id: 'reposicao_criada', label: 'Reposição Criada' },
    { id: 'reposicao_atualizada', label: 'Reposição Atualizada' },
    { id: 'envio_criado', label: 'Envio Criado' },
    { id: 'envio_concluido', label: 'Envio Concluído' }
  ];

  const toggleEvent = (eventId: string) => {
    setSelectedEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(e => e !== eventId)
        : [...prev, eventId]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Integração CRM</h1>
          <p className="text-muted-foreground mt-1">
            Sincronize dados do seu CRM atual (crm.conectaprime.com) com este sistema avançado
          </p>
        </div>
        <div className="flex gap-4">
          <Button 
            onClick={handleSync} 
            disabled={isSyncing}
            className="gap-2"
          >
            {isSyncing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Sincronizando...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Sincronizar Agora
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status da Integração</CardTitle>
            {syncStatus?.sync_enabled ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <Pause className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {syncStatus?.sync_enabled ? (
                <Badge className="bg-green-100 text-green-800">Ativo</Badge>
              ) : (
                <Badge className="bg-red-100 text-red-800">Inativo</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Sistema de sincronização
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Última Sincronização</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">
              {formatDate(syncStatus?.last_sync)}
            </div>
            <p className="text-xs text-muted-foreground">
              Próxima: {formatDate(syncStatus?.next_sync_scheduled)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CRM Origem</CardTitle>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">
              crm.conectaprime.com
            </div>
            <p className="text-xs text-muted-foreground">
              Sistema atual
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modo de Sincronização</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">
              Automático
            </div>
            <p className="text-xs text-muted-foreground">
              A cada 24 horas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sync Progress */}
      {isSyncing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 animate-spin" />
              Sincronização em Andamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progresso da Sincronização</span>
                  <span>Processando...</span>
                </div>
                <Progress value={65} className="w-full" />
              </div>
              <div className="text-sm text-muted-foreground">
                Extraindo dados do CRM externo e sincronizando com o sistema local...
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sync Statistics */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Sincronizados</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {syncStatus?.total_records_synced.customers || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de clientes importados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos Sincronizados</CardTitle>
            <Package className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {syncStatus?.total_records_synced.products || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de produtos importados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas Sincronizadas</CardTitle>
            <ShoppingCart className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {syncStatus?.total_records_synced.sales || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de vendas importadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Webhook Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5 text-purple-500" />
            Configuração de Webhooks (Recomendado)
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Use os webhooks já existentes no seu CRM Node.js/MongoDB para sincronização em tempo real
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Configuração da URL e Token */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="crm-url">URL do CRM Atual</Label>
                <Input
                  id="crm-url"
                  value={crmBaseUrl}
                  onChange={(e) => setCrmBaseUrl(e.target.value)}
                  placeholder="https://crm.conectaprime.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jwt-token">Token JWT</Label>
                <Input
                  id="jwt-token"
                  type="password"
                  value={jwtToken}
                  onChange={(e) => setJwtToken(e.target.value)}
                  placeholder="Seu token JWT do CRM atual"
                />
              </div>
            </div>

            {/* Seleção de Eventos */}
            <div className="space-y-3">
              <Label>Eventos para Sincronizar</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {availableEvents.map((event) => (
                  <div key={event.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={event.id}
                      checked={selectedEvents.includes(event.id)}
                      onChange={() => toggleEvent(event.id)}
                      className="rounded"
                    />
                    <label htmlFor={event.id} className="text-sm">
                      {event.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Botão para Registrar Webhook */}
            <div className="flex gap-4">
              <Button 
                onClick={handleRegisterWebhook}
                disabled={registerWebhookMutation.isPending}
                className="gap-2"
              >
                {registerWebhookMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  <>
                    <Link className="h-4 w-4" />
                    Registrar Webhook
                  </>
                )}
              </Button>
              
              <div className="text-sm text-muted-foreground flex items-center">
                <Zap className="h-4 w-4 mr-1" />
                Sincronização em tempo real
              </div>
            </div>

            {/* Informações sobre Webhooks */}
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-green-900 dark:text-green-100 text-sm mb-1">
                    Vantagens dos Webhooks:
                  </h4>
                  <ul className="text-green-800 dark:text-green-200 text-sm space-y-1">
                    <li>• Sincronização automática em tempo real</li>
                    <li>• Sem modificações no código do CRM atual</li>
                    <li>• Usa o sistema de webhooks já implementado</li>
                    <li>• Mais eficiente que polling ou exportações manuais</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sincronização Histórica */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-blue-500" />
            Sincronização de Dados Históricos
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Importe dados existentes do seu CRM atual (execute uma vez)
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button 
              onClick={() => handleSyncHistorical('customers')}
              disabled={syncHistoricalMutation.isPending}
              variant="outline"
              className="gap-2"
            >
              <Users className="h-4 w-4" />
              Sincronizar Clientes
            </Button>
            
            <Button 
              onClick={() => handleSyncHistorical('products')}
              disabled={syncHistoricalMutation.isPending}
              variant="outline"
              className="gap-2"
            >
              <Package className="h-4 w-4" />
              Sincronizar Produtos
            </Button>
            
            <Button 
              onClick={() => handleSyncHistorical('sales')}
              disabled={syncHistoricalMutation.isPending}
              variant="outline"
              className="gap-2"
            >
              <ShoppingCart className="h-4 w-4" />
              Sincronizar Vendas
            </Button>
          </div>
          
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 text-sm mb-1">
                  Importante:
                </h4>
                <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                  Execute a sincronização histórica apenas uma vez para importar dados existentes. 
                  Após isso, os webhooks manterão tudo sincronizado automaticamente.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Manual Sync Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instruções para Sincronização Manual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Quando Sincronizar:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Após adicionar novos clientes no CRM atual</li>
                  <li>• Quando houver novas vendas importantes</li>
                  <li>• Antes de gerar relatórios críticos</li>
                  <li>• Para atualizar análises em tempo real</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Frequência Recomendada:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• <strong>Diária:</strong> Para empresas com alto volume</li>
                  <li>• <strong>Semanal:</strong> Para empresas médias</li>
                  <li>• <strong>Mensal:</strong> Para empresas pequenas</li>
                  <li>• <strong>Sob demanda:</strong> Quando necessário</li>
                </ul>
              </div>
            </div>
            
            <div className="flex items-center justify-center pt-4">
              <Button 
                onClick={handleSync} 
                disabled={isSyncing}
                size="lg"
                className="gap-2"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    Sincronizando...
                  </>
                ) : (
                  <>
                    <Database className="h-5 w-5" />
                    Iniciar Sincronização Manual
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}