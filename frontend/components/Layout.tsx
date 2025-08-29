import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  ShoppingCart, 
  Package, 
  Users, 
  Menu,
  X,
  UserX,
  Target,
  TrendingUp,
  Database,
  LayoutDashboard,
  Brain,
  DollarSign,
  Settings,
  Bell,
  LogOut,
  User,
  Key
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface LayoutProps {
  children: ReactNode;
}

const navigation = [
  {
    name: 'Dashboards Executivos',
    items: [
      { name: 'Dashboard Principal', href: '/', icon: LayoutDashboard },
      { name: 'Dashboard Executivo', href: '/executive-dashboard', icon: BarChart3 },
      { name: 'Business Intelligence', href: '/business-intelligence', icon: Brain },
    ]
  },
  {
    name: 'Análise de Clientes',
    items: [
      { name: 'Clientes', href: '/customers', icon: Users },
      { name: 'Clientes Inativos', href: '/inactive-customers', icon: UserX },
      { name: 'Segmentação RFM', href: '/customer-segmentation', icon: Target },
    ]
  },
  {
       name: 'Vendas & Produtos',
       items: [
         { name: 'Vendas', href: '/sales', icon: ShoppingCart },
         { name: 'Vendas Avançadas', href: '/advanced-sales', icon: Target },
         { name: 'Produtos', href: '/products', icon: Package },
         { name: 'Análise Avançada', href: '/advanced-products', icon: TrendingUp },
         { name: 'Integração CRM', href: '/crm-integration', icon: Database },
         { name: 'Configuração JWT', href: '/jwt-integration', icon: Key },
       ]
     }
];

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Obter dados do usuário do localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = user.name || 'Usuário';
  const userEmail = user.email || '';
  
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const NavItems = () => (
    <>
      {navigation.map((section) => (
        <div key={section.name} className="mb-6">
          <div className="text-xs font-semibold leading-6 text-gray-400 uppercase tracking-wide mb-2">
            {section.name}
          </div>
          <div className="space-y-1">
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop Sidebar */}
      <div className="hidden w-64 flex-col border-r bg-white dark:bg-gray-800 lg:flex">
        <div className="flex h-16 items-center border-b px-6">
          <BarChart3 className="h-8 w-8 text-blue-600" />
          <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
            CRM Analytics
          </span>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          <NavItems />
        </nav>
      </div>

      {/* Mobile Layout */}
      <div className="flex flex-1 flex-col lg:hidden">
        <div className="flex h-16 items-center justify-between border-b bg-white px-4 dark:bg-gray-800">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
              CRM Analytics
            </span>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <nav className="space-y-1 pt-6">
                <NavItems />
              </nav>
            </SheetContent>
          </Sheet>
        </div>
        <main className="flex-1 overflow-auto p-4">
          {children}
        </main>
      </div>

      {/* Desktop Main Content */}
      <div className="hidden flex-1 flex-col lg:flex">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              CRM Dashboard
            </h1>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              
              {/* User Info */}
              <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="bg-blue-600 p-2 rounded-full">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-gray-900">{userName}</p>
                    <p className="text-xs text-gray-500">{userEmail}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
