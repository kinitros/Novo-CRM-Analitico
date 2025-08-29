'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  DollarSign,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Menu,
  Bell,
  Settings,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Calendar,
  Globe,
  ExternalLink,
} from 'lucide-react'
import CRMStatusIndicator from './components/CRMStatusIndicator'

// Dados simulados para demonstração
const salesData = [
  { month: 'Jan', vendas: 45000, meta: 50000, clientes: 120, crescimento: 8.5 },
  { month: 'Fev', vendas: 52000, meta: 50000, clientes: 135, crescimento: 15.6 },
  { month: 'Mar', vendas: 48000, meta: 55000, clientes: 128, crescimento: -7.7 },
  { month: 'Abr', vendas: 61000, meta: 55000, clientes: 142, crescimento: 27.1 },
  { month: 'Mai', vendas: 58000, meta: 60000, clientes: 138, crescimento: -4.9 },
  { month: 'Jun', vendas: 67000, meta: 60000, clientes: 155, crescimento: 15.5 },
]

const customerSegments = [
  { name: 'Premium', value: 35, color: '#3b82f6', count: 1247 },
  { name: 'Regular', value: 45, color: '#10b981', count: 1598 },
  { name: 'Básico', value: 20, color: '#f59e0b', count: 712 },
]

const topProducts = [
  { produto: 'Produto Premium A', vendas: 12500, crescimento: 15.2, categoria: 'Premium' },
  { produto: 'Produto Standard B', vendas: 9800, crescimento: -3.1, categoria: 'Standard' },
  { produto: 'Produto Deluxe C', vendas: 8600, crescimento: 8.7, categoria: 'Deluxe' },
  { produto: 'Produto Basic D', vendas: 7200, crescimento: 22.4, categoria: 'Basic' },
  { produto: 'Produto Pro E', vendas: 6100, crescimento: -1.8, categoria: 'Pro' },
]

const revenueData = [
  { day: '1', receita: 2400, transacoes: 12 },
  { day: '2', receita: 1398, transacoes: 8 },
  { day: '3', receita: 9800, transacoes: 45 },
  { day: '4', receita: 3908, transacoes: 18 },
  { day: '5', receita: 4800, transacoes: 22 },
  { day: '6', receita: 3800, transacoes: 16 },
  { day: '7', receita: 4300, transacoes: 19 },
]

interface MetricCardProps {
  title: string
  value: string
  change: number
  icon: React.ReactNode
  color: string
  subtitle?: string
  trend?: 'up' | 'down' | 'stable'
}

function MetricCard({ title, value, change, icon, color, subtitle, trend = 'up' }: MetricCardProps) {
  const isPositive = change > 0
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="dashboard-card hover-lift group"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 animate-counter mb-2">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mb-2">{subtitle}</p>
          )}
          <div className="flex items-center">
            {isPositive ? (
              <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm font-semibold ${
              isPositive ? 'text-emerald-600' : 'text-red-600'
            }`}>
              {isPositive ? '+' : ''}{change}%
            </span>
            <span className="text-sm text-gray-500 ml-1">vs mês anterior</span>
          </div>
        </div>
        <div className={`p-4 rounded-2xl ${color} group-hover:scale-110 transition-transform duration-200`}>
          {icon}
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-gray-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
    </motion.div>
  )
}

interface SidebarProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const [activeMenu, setActiveMenu] = useState('dashboard')

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Principal', icon: '📊', category: 'Dashboards' },
    { id: 'executive', label: 'Dashboard Executivo', icon: '📈', category: 'Dashboards' },
    { id: 'intelligence', label: 'Business Intelligence', icon: '🧠', category: 'Dashboards' },
    { id: 'clientes', label: 'Dashboard de Clientes', icon: '👥', category: 'Análise' },
    { id: 'inactive', label: 'Clientes Inativos', icon: '😴', category: 'Análise' },
    { id: 'segmentation', label: 'Segmentação RFM', icon: '🎯', category: 'Análise' },
    { id: 'vendas', label: 'Dashboard de Vendas', icon: '💰', category: 'Vendas' },
    { id: 'advanced-sales', label: 'Vendas Avançadas', icon: '📊', category: 'Vendas' },
    { id: 'products', label: 'Produtos', icon: '📦', category: 'Vendas' },
    { id: 'configuracao', label: 'Integração CRM', icon: '🔗', category: 'Config' },
    { id: 'jwt', label: 'Configuração JWT', icon: '🔐', category: 'Config' },
  ]

  const categories = ['Dashboards', 'Análise', 'Vendas', 'Config']

  return (
    <>
      {/* Overlay para mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
      
      {/* Sidebar */}
      <div className="lg:block lg:w-80 lg:flex-shrink-0">
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: isOpen ? 0 : -300 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed left-0 top-0 h-full w-80 bg-white shadow-2xl z-50 lg:relative lg:translate-x-0 lg:shadow-none lg:border-r lg:border-gray-200"
        >
            {/* Header do Sidebar */}
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-blue-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">CRM Analytics</h1>
                    <p className="text-blue-100 text-sm">Dashboard Pro</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="lg:hidden p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Menu de Navegação */}
            <div className="flex-1 overflow-y-auto p-4">
              {categories.map(category => (
                <div key={category} className="mb-6">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
                    {category === 'Dashboards' && 'Dashboards Executivos'}
                    {category === 'Análise' && 'Análise de Clientes'}
                    {category === 'Vendas' && 'Vendas & Produtos'}
                    {category === 'Config' && 'Configurações'}
                  </h3>
                  <div className="space-y-1">
                    {menuItems.filter(item => item.category === category).map(item => {
                      const isExternal = ['executive', 'intelligence', 'clientes', 'inactive', 'segmentation', 'vendas', 'advanced-sales', 'products', 'configuracao', 'jwt'].includes(item.id)
                      
                      if (isExternal) {
                        return (
                          <Link key={item.id} href={`/${item.id}`}>
                            <motion.div
                              className="w-full sidebar-nav-item sidebar-nav-item-inactive group"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <span className="text-lg mr-3">{item.icon}</span>
                              <span className="font-medium">{item.label}</span>
                              <ExternalLink className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                            </motion.div>
                          </Link>
                        )
                      }
                      
                      return (
                        <motion.button
                          key={item.id}
                          onClick={() => setActiveMenu(item.id)}
                          className={`w-full sidebar-nav-item ${
                            activeMenu === item.id ? 'sidebar-nav-item-active' : 'sidebar-nav-item-inactive'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <span className="text-lg mr-3">{item.icon}</span>
                          <span className="font-medium">{item.label}</span>
                          {activeMenu === item.id && (
                            <motion.div
                              layoutId="activeIndicator"
                              className="absolute right-2 w-2 h-2 bg-white rounded-full"
                            />
                          )}
                        </motion.button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer do Sidebar */}
            <div className="p-4 border-t border-gray-100">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">U</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">Usuário Admin</p>
                  <p className="text-xs text-gray-500">admin@empresa.com</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
    </>
  )
}

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true) // Aberta por padrão
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    // Simula carregamento de dados
    const timer = setTimeout(() => setIsLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Atualiza o relógio a cada minuto
    const interval = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"
          />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Carregando CRM Analytics</h2>
          <p className="text-gray-600">Preparando seus dados...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Superior */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Principal</h1>
                <p className="text-sm text-gray-600">Visão geral do seu negócio em tempo real</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              
              <CRMStatusIndicator />
              
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                  <Search className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
                </button>
                <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Conteúdo do Dashboard */}
        <main className="flex-1 overflow-auto p-6">
          {/* Métricas Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Receita Total"
              value="R$ 342.500"
              change={12.5}
              icon={<DollarSign className="w-6 h-6 text-white" />}
              color="bg-gradient-to-r from-emerald-500 to-emerald-600"
              subtitle="Últimos 30 dias"
            />
            <MetricCard
              title="Novos Clientes"
              value="1.247"
              change={8.2}
              icon={<Users className="w-6 h-6 text-white" />}
              color="bg-gradient-to-r from-blue-500 to-blue-600"
              subtitle="Este mês"
            />
            <MetricCard
              title="Vendas Realizadas"
              value="892"
              change={-2.1}
              icon={<ShoppingCart className="w-6 h-6 text-white" />}
              color="bg-gradient-to-r from-purple-500 to-purple-600"
              subtitle="Transações"
            />
            <MetricCard
              title="Taxa de Conversão"
              value="24.8%"
              change={5.7}
              icon={<Target className="w-6 h-6 text-white" />}
              color="bg-gradient-to-r from-orange-500 to-orange-600"
              subtitle="Média mensal"
            />
          </div>

          {/* Gráficos Principais */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Gráfico de Vendas vs Meta */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="chart-container"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Vendas vs Meta Mensal</h3>
                  <p className="text-sm text-gray-600">Comparativo de performance</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#666" fontSize={12} />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip
                    formatter={(value, name) => [
                      `R$ ${Number(value).toLocaleString('pt-BR')}`,
                      name === 'vendas' ? 'Vendas' : 'Meta'
                    ]}
                    labelStyle={{ color: '#333' }}
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="vendas" fill="url(#salesGradient)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="meta" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
                  <defs>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0.9}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Gráfico de Segmentação de Clientes */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="chart-container"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Segmentação de Clientes</h3>
                  <p className="text-sm text-gray-600">Distribuição por categoria</p>
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={customerSegments}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {customerSegments.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name, props) => [
                      `${value}% (${props.payload.count} clientes)`, 
                      'Percentual'
                    ]} 
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center space-x-6 mt-4">
                {customerSegments.map((segment, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: segment.color }}
                    />
                    <div className="text-sm">
                      <span className="font-medium text-gray-900">{segment.name}</span>
                      <span className="text-gray-500 ml-1">({segment.value}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Seção Inferior */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Receita dos Últimos 7 Dias */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="chart-container"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Receita Semanal</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" stroke="#666" fontSize={12} />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip
                    formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, 'Receita']}
                    labelFormatter={(label) => `Dia ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="receita"
                    stroke="#10b981"
                    fill="url(#revenueGradient)"
                  />
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Top 5 Produtos */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="dashboard-card col-span-2"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Top 5 Produtos</h3>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">Ver todos</button>
              </div>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{product.produto}</p>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">R$ {product.vendas.toLocaleString('pt-BR')}</span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {product.categoria}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {product.crescimento > 0 ? (
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                      <span className={`text-sm font-semibold ${
                        product.crescimento > 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {product.crescimento > 0 ? '+' : ''}{product.crescimento}%
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Insights Inteligentes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
            className="mt-8"
          >
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-2xl p-6 shadow-sm">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-blue-500 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Insights Inteligentes</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2" />
                        <p className="text-blue-800"><strong>Oportunidade:</strong> Produto Basic D teve crescimento de 22.4% - considere aumentar estoque e marketing</p>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-amber-500 rounded-full mt-2" />
                        <p className="text-blue-800"><strong>Atenção:</strong> Produto Standard B com queda de 3.1% - revisar estratégia de vendas</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                        <p className="text-blue-800"><strong>Meta:</strong> Faltam R$ 17.500 para atingir a meta mensal - foque em clientes Premium</p>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                        <p className="text-blue-800"><strong>Tendência:</strong> Taxa de conversão subiu 5.7% - estratégia atual está funcionando</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  )
}