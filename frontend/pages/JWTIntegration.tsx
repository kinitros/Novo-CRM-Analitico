import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import { Badge } from '@/components/ui/badge';
import {
  Key,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Copy,
  Eye,
  EyeOff,
  Clock,
  User,
  Mail,
  Settings
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface TokenInfo {
  email?: string;
  role?: string;
  issued_at?: string;
  expires_at?: string;
  is_expired?: boolean;
  time_remaining?: number;
  error?: string;
}

interface JWTConfig {
  current_token: string;
  token_info: TokenInfo;
  file_exists: boolean;
  file_writable: boolean;
}

const JWTIntegration: React.FC = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<JWTConfig | null>(null);
  const [newToken, setNewToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    success: boolean;
    message: string;
    response_preview?: string;
  } | null>(null);

  useEffect(() => {
    loadCurrentConfig();
  }, []);

  const loadCurrentConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://prime.top1midia.com/crm-proxy.php/crm/jwt-config');
      const data = await response.json();
      setConfig(data);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar configuração atual',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveToken = async () => {
    if (!newToken.trim()) {
      toast({
        title: 'Erro',
        description: 'Por favor, insira um token JWT',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('https://prime.top1midia.com/crm-proxy.php/crm/jwt-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: newToken.trim() }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Sucesso!',
          description: result.message,
        });
        setNewToken('');
        await loadCurrentConfig();
      } else {
        toast({
          title: 'Erro',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao salvar token',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    try {
      setTesting(true);
      const response = await fetch('https://prime.top1midia.com/crm-proxy.php/crm/test-jwt');
      const result = await response.json();
      setConnectionStatus(result);

      toast({
        title: result.success ? 'Sucesso!' : 'Erro',
        description: result.message,
        variant: result.success ? 'default' : 'destructive',
      });
    } catch (error) {
      setConnectionStatus({
        success: false,
        message: 'Erro ao testar conexão',
      });
      toast({
        title: 'Erro',
        description: 'Erro ao testar conexão',
        variant: 'destructive',
      });
    } finally {
      setTesting(false);
    }
  };

  const copyToken = () => {
    if (config?.current_token) {
      navigator.clipboard.writeText(config.current_token);
      toast({
        title: 'Copiado!',
        description: 'Token copiado para a área de transferência',
      });
    }
  };

  const formatTimeRemaining = (seconds: number) => {
    if (seconds <= 0) return 'Expirado';
    
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Integração JWT</h1>
          <p className="text-gray-600 mt-2">
            Gerencie o token JWT para conexão com o CRM atual
          </p>
        </div>
        <Button onClick={loadCurrentConfig} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Status da Conexão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Status da Conexão
          </CardTitle>
          <CardDescription>
            Teste a conectividade com o CRM atual
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button onClick={testConnection} disabled={testing}>
              {testing ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Testar Conexão
            </Button>
            
            {connectionStatus && (
              <div className="flex items-center gap-2">
                {connectionStatus.success ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span className={connectionStatus.success ? 'text-green-700' : 'text-red-700'}>
                  {connectionStatus.message}
                </span>
              </div>
            )}
          </div>
          
          {connectionStatus?.response_preview && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-yellow-800">
                Resposta: {connectionStatus.response_preview}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Token Atual */}
      {config && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              Token JWT Atual
            </CardTitle>
            <CardDescription>
              Informações do token atualmente em uso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Preview do Token */}
            <div className="space-y-2">
              <Label>Token (Preview)</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={showToken ? config.current_token : config.current_token}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button variant="outline" size="sm" onClick={() => setShowToken(!showToken)}>
                  {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button variant="outline" size="sm" onClick={copyToken}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Informações do Token */}
            {config.token_info && !config.token_info.error && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {config.token_info.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      <strong>Email:</strong> {config.token_info.email}
                    </span>
                  </div>
                )}
                
                {config.token_info.role && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      <strong>Role:</strong> 
                      <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                        {config.token_info.role}
                      </span>
                    </span>
                  </div>
                )}
                
                {config.token_info.issued_at && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      <strong>Emitido em:</strong> {config.token_info.issued_at}
                    </span>
                  </div>
                )}
                
                {config.token_info.expires_at && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      <strong>Expira em:</strong> {config.token_info.expires_at}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Status de Expiração */}
            {config.token_info && (
              <div className="flex items-center gap-2">
                {config.token_info.is_expired ? (
                  <>
                    <XCircle className="w-5 h-5 text-red-500" />
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">Token Expirado</span>
                  </>
                ) : config.token_info.time_remaining ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                      Válido por {formatTimeRemaining(config.token_info.time_remaining)}
                    </span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">Status Desconhecido</span>
                  </>
                )}
              </div>
            )}

            {/* Erro no Token */}
            {config.token_info?.error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                <div className="text-red-800">
                  {config.token_info.error}
                </div>
              </div>
            )}

            {/* Status do Arquivo */}
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                {config.file_exists ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                Arquivo: {config.file_exists ? 'Existe' : 'Não existe'}
              </div>
              <div className="flex items-center gap-1">
                {config.file_writable ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                Permissão: {config.file_writable ? 'Gravável' : 'Somente leitura'}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Atualizar Token */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Atualizar Token JWT
          </CardTitle>
          <CardDescription>
            Insira um novo token JWT para atualizar a conexão
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-token">Novo Token JWT</Label>
            <Input
              id="new-token"
              type="password"
              value={newToken}
              onChange={(e) => setNewToken(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="font-mono"
            />
          </div>
          
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div className="text-yellow-800">
              <strong>Importante:</strong> Certifique-se de que o token JWT é válido e possui as permissões necessárias para acessar o CRM.
            </div>
          </div>
          
          <Button onClick={saveToken} disabled={loading || !newToken.trim()}>
            {loading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Key className="w-4 h-4 mr-2" />
            )}
            Salvar Token
          </Button>
        </CardContent>
      </Card>

      {/* Instruções */}
      <Card>
        <CardHeader>
          <CardTitle>Como obter um novo token JWT</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>1.</strong> Acesse o CRM atual em: <code className="bg-gray-100 px-2 py-1 rounded">https://crm.conectaprime.com</code></p>
            <p><strong>2.</strong> Faça login com suas credenciais de administrador</p>
            <p><strong>3.</strong> Vá para as configurações de API ou integração</p>
            <p><strong>4.</strong> Gere um novo token JWT ou copie o token existente</p>
            <p><strong>5.</strong> Cole o token no campo acima e clique em "Salvar Token"</p>
            <p><strong>6.</strong> Use o botão "Testar Conexão" para verificar se o token está funcionando</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JWTIntegration;