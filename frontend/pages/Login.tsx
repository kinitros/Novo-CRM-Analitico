import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Shield,
  TrendingUp,
  BarChart3,
  Users,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface LoginCredentials {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Usuário admin pré-configurado
  const adminUser = {
    email: 'admin@seguidoresprime.com',
    password: '+Gustavo99!',
    name: 'Administrador',
    role: 'admin'
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validação básica
      if (!credentials.email || !credentials.password) {
        throw new Error('Por favor, preencha todos os campos');
      }

      // Validação do usuário admin
      if (credentials.email === adminUser.email && credentials.password === adminUser.password) {
        // Simular delay de autenticação
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Salvar dados do usuário no localStorage
        localStorage.setItem('user', JSON.stringify({
          email: adminUser.email,
          name: adminUser.name,
          role: adminUser.role
        }));
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('role', adminUser.role);
        
        setSuccess('Login realizado com sucesso!');
        
        // Redirecionar para o dashboard após sucesso
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } else {
        throw new Error('Email ou senha incorretos');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl flex bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 p-12 flex-col justify-between relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 border border-white rounded-full"></div>
            <div className="absolute top-32 right-20 w-24 h-24 border border-white rounded-full"></div>
            <div className="absolute bottom-20 left-20 w-40 h-40 border border-white rounded-full"></div>
            <div className="absolute bottom-32 right-10 w-16 h-16 border border-white rounded-full"></div>
          </div>
          
          {/* Header */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Seguidores Prime</h1>
                <p className="text-blue-100">CRM Avançado</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-white leading-tight">
                Gerencie seu negócio com
                <span className="block text-yellow-300">inteligência artificial</span>
              </h2>
              <p className="text-xl text-blue-100 leading-relaxed">
                Dashboard executivo, análise de clientes 360°, business intelligence e muito mais.
              </p>
            </div>
          </div>
          
          {/* Features */}
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-4 text-white">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                <BarChart3 className="w-5 h-5" />
              </div>
              <span className="text-lg">Analytics Avançados</span>
            </div>
            <div className="flex items-center gap-4 text-white">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-lg">Gestão de Clientes 360°</span>
            </div>
            <div className="flex items-center gap-4 text-white">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-lg">Segurança Empresarial</span>
            </div>
          </div>
        </div>
        
        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
          <div className="w-full max-w-md mx-auto">
            {/* Mobile Header */}
            <div className="lg:hidden mb-8 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="bg-blue-600 p-3 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Seguidores Prime</h1>
              </div>
              <p className="text-gray-600">CRM Avançado</p>
            </div>
            
            {/* Form Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Bem-vindo de volta!</h2>
              <p className="text-gray-600">Faça login para acessar seu dashboard</p>
            </div>
            
            {/* Success/Error Messages */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span className="text-red-700">{error}</span>
              </div>
            )}
            
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-green-700">{success}</span>
              </div>
            )}
            
            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  E-mail
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={credentials.email}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Digite seu e-mail"
                  />
                </div>
              </div>
              
              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={credentials.password}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Digite sua senha"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Entrando...
                  </>
                ) : (
                  <>
                    <User className="w-5 h-5 mr-2" />
                    Entrar no CRM
                  </>
                )}
              </button>
            </form>
            

            
            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                © 2024 Seguidores Prime. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;