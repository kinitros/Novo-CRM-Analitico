import React, { useState } from 'react';

// Componente de Dashboard Principal
function Dashboard() {
  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ color: '#333', marginBottom: '20px', fontSize: '24px' }}>CRM Dashboard</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e9ecef', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#495057', margin: '0 0 10px 0', fontSize: '16px' }}>📊 Total de Vendas</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#28a745', margin: 0 }}>R$ 89.650</p>
          <p style={{ fontSize: '12px', color: '#6c757d', margin: '5px 0 0 0' }}>+12% vs mês anterior</p>
        </div>
        
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e9ecef', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#495057', margin: '0 0 10px 0', fontSize: '16px' }}>👥 Clientes</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#007bff', margin: 0 }}>342</p>
          <p style={{ fontSize: '12px', color: '#6c757d', margin: '5px 0 0 0' }}>+8% novos clientes</p>
        </div>
        
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e9ecef', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#495057', margin: '0 0 10px 0', fontSize: '16px' }}>📦 Produtos</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#6f42c1', margin: 0 }}>50</p>
          <p style={{ fontSize: '12px', color: '#6c757d', margin: '5px 0 0 0' }}>Catálogo ativo</p>
        </div>
        
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e9ecef', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#495057', margin: '0 0 10px 0', fontSize: '16px' }}>💰 Ticket Médio</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#fd7e14', margin: 0 }}>R$ 262,13</p>
          <p style={{ fontSize: '12px', color: '#6c757d', margin: '5px 0 0 0' }}>Por transação</p>
        </div>
      </div>
      
      <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e9ecef', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h3 style={{ color: '#333', marginBottom: '15px', fontSize: '18px' }}>📈 Resumo de Performance</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div style={{ padding: '10px', background: '#f8f9fa', borderRadius: '6px' }}>
            <span style={{ color: '#28a745', fontWeight: 'bold' }}>✅</span>
            <span style={{ marginLeft: '8px', color: '#495057' }}>Sistema Online</span>
          </div>
          <div style={{ padding: '10px', background: '#f8f9fa', borderRadius: '6px' }}>
            <span style={{ color: '#28a745', fontWeight: 'bold' }}>✅</span>
            <span style={{ marginLeft: '8px', color: '#495057' }}>API Funcionando</span>
          </div>
          <div style={{ padding: '10px', background: '#f8f9fa', borderRadius: '6px' }}>
            <span style={{ color: '#28a745', fontWeight: 'bold' }}>✅</span>
            <span style={{ marginLeft: '8px', color: '#495057' }}>Dados Sincronizados</span>
          </div>
          <div style={{ padding: '10px', background: '#f8f9fa', borderRadius: '6px' }}>
            <span style={{ color: '#28a745', fontWeight: 'bold' }}>✅</span>
            <span style={{ marginLeft: '8px', color: '#495057' }}>Deploy Ativo</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente principal com layout sidebar
export default function App() {
  const [activeMenu, setActiveMenu] = useState('dashboard');

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Principal', icon: '📊' },
    { id: 'dashboard-executivo', label: 'Dashboard Executivo', icon: '📈' },
    { id: 'business-intelligence', label: 'Business Intelligence', icon: '🧠' },
    { id: 'clientes', label: 'Clientes', icon: '👥' },
    { id: 'clientes-inativos', label: 'Clientes Inativos', icon: '😴' },
    { id: 'segmentacao-rfm', label: 'Segmentação RFM', icon: '🎯' },
    { id: 'vendas', label: 'Vendas', icon: '💰' },
    { id: 'vendas-avancadas', label: 'Vendas Avançadas', icon: '📊' },
    { id: 'produtos', label: 'Produtos', icon: '📦' },
    { id: 'analise-avancada', label: 'Análise Avançada', icon: '🔍' },
    { id: 'integracao-crm', label: 'Integração CRM', icon: '🔗' },
    { id: 'configuracao-jwt', label: 'Configuração JWT', icon: '🔐' }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Arial, sans-serif', background: '#f8f9fa' }}>
      {/* Sidebar */}
      <div style={{ 
        width: '280px', 
        background: '#fff', 
        borderRight: '1px solid #e9ecef',
        boxShadow: '2px 0 4px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header do Sidebar */}
        <div style={{ 
          padding: '20px', 
          borderBottom: '1px solid #e9ecef',
          background: '#007bff',
          color: 'white'
        }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: '18px', 
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center'
          }}>
            📊 CRM Analytics
          </h1>
        </div>

        {/* Menu de Navegação */}
        <div style={{ flex: 1, padding: '10px 0' }}>
          <div style={{ padding: '0 15px', marginBottom: '10px' }}>
            <h3 style={{ 
              fontSize: '12px', 
              color: '#6c757d', 
              textTransform: 'uppercase', 
              fontWeight: 'bold',
              margin: '0 0 10px 0',
              letterSpacing: '0.5px'
            }}>DASHBOARDS EXECUTIVOS</h3>
          </div>
          
          {menuItems.slice(0, 3).map(item => (
            <div
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              style={{
                padding: '12px 20px',
                cursor: 'pointer',
                background: activeMenu === item.id ? '#e3f2fd' : 'transparent',
                borderLeft: activeMenu === item.id ? '3px solid #007bff' : '3px solid transparent',
                color: activeMenu === item.id ? '#007bff' : '#495057',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (activeMenu !== item.id) {
                  e.target.style.background = '#f8f9fa';
                }
              }}
              onMouseLeave={(e) => {
                if (activeMenu !== item.id) {
                  e.target.style.background = 'transparent';
                }
              }}
            >
              <span style={{ marginRight: '10px', fontSize: '16px' }}>{item.icon}</span>
              {item.label}
            </div>
          ))}

          <div style={{ padding: '0 15px', margin: '20px 0 10px 0' }}>
            <h3 style={{ 
              fontSize: '12px', 
              color: '#6c757d', 
              textTransform: 'uppercase', 
              fontWeight: 'bold',
              margin: '0 0 10px 0',
              letterSpacing: '0.5px'
            }}>ANÁLISE DE CLIENTES</h3>
          </div>
          
          {menuItems.slice(3, 6).map(item => (
            <div
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              style={{
                padding: '12px 20px',
                cursor: 'pointer',
                background: activeMenu === item.id ? '#e3f2fd' : 'transparent',
                borderLeft: activeMenu === item.id ? '3px solid #007bff' : '3px solid transparent',
                color: activeMenu === item.id ? '#007bff' : '#495057',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (activeMenu !== item.id) {
                  e.target.style.background = '#f8f9fa';
                }
              }}
              onMouseLeave={(e) => {
                if (activeMenu !== item.id) {
                  e.target.style.background = 'transparent';
                }
              }}
            >
              <span style={{ marginRight: '10px', fontSize: '16px' }}>{item.icon}</span>
              {item.label}
            </div>
          ))}

          <div style={{ padding: '0 15px', margin: '20px 0 10px 0' }}>
            <h3 style={{ 
              fontSize: '12px', 
              color: '#6c757d', 
              textTransform: 'uppercase', 
              fontWeight: 'bold',
              margin: '0 0 10px 0',
              letterSpacing: '0.5px'
            }}>VENDAS & PRODUTOS</h3>
          </div>
          
          {menuItems.slice(6, 10).map(item => (
            <div
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              style={{
                padding: '12px 20px',
                cursor: 'pointer',
                background: activeMenu === item.id ? '#e3f2fd' : 'transparent',
                borderLeft: activeMenu === item.id ? '3px solid #007bff' : '3px solid transparent',
                color: activeMenu === item.id ? '#007bff' : '#495057',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (activeMenu !== item.id) {
                  e.target.style.background = '#f8f9fa';
                }
              }}
              onMouseLeave={(e) => {
                if (activeMenu !== item.id) {
                  e.target.style.background = 'transparent';
                }
              }}
            >
              <span style={{ marginRight: '10px', fontSize: '16px' }}>{item.icon}</span>
              {item.label}
            </div>
          ))}

          <div style={{ padding: '0 15px', margin: '20px 0 10px 0' }}>
            <h3 style={{ 
              fontSize: '12px', 
              color: '#6c757d', 
              textTransform: 'uppercase', 
              fontWeight: 'bold',
              margin: '0 0 10px 0',
              letterSpacing: '0.5px'
            }}>CONFIGURAÇÕES</h3>
          </div>
          
          {menuItems.slice(10).map(item => (
            <div
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              style={{
                padding: '12px 20px',
                cursor: 'pointer',
                background: activeMenu === item.id ? '#e3f2fd' : 'transparent',
                borderLeft: activeMenu === item.id ? '3px solid #007bff' : '3px solid transparent',
                color: activeMenu === item.id ? '#007bff' : '#495057',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (activeMenu !== item.id) {
                  e.target.style.background = '#f8f9fa';
                }
              }}
              onMouseLeave={(e) => {
                if (activeMenu !== item.id) {
                  e.target.style.background = 'transparent';
                }
              }}
            >
              <span style={{ marginRight: '10px', fontSize: '16px' }}>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>
      </div>

      {/* Área Principal */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header Superior */}
        <div style={{ 
          background: '#fff', 
          borderBottom: '1px solid #e9ecef',
          padding: '15px 30px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: 0, color: '#333', fontSize: '20px' }}>CRM Dashboard</h2>
              <p style={{ margin: '5px 0 0 0', color: '#6c757d', fontSize: '14px' }}>Painel de controle e análise de dados</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ 
                background: '#e8f5e8', 
                color: '#28a745', 
                padding: '5px 12px', 
                borderRadius: '20px', 
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                ● ONLINE
              </div>
              <div style={{ color: '#6c757d', fontSize: '12px' }}>
                Última atualização: {new Date().toLocaleTimeString('pt-BR')}
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          <Dashboard />
        </div>
      </div>
    </div>
  );
}
