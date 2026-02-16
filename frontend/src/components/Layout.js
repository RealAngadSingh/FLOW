import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Activity, Video, Map, Car, AlertTriangle, BarChart3, Settings, Menu, X } from 'lucide-react';

const Layout = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { path: '/', label: 'DASHBOARD', icon: Activity },
    { path: '/live', label: 'LIVE TRAFFIC', icon: Map },
    { path: '/intersections', label: 'INTERSECTIONS', icon: Activity },
    { path: '/vehicles', label: 'VEHICLE LOGS', icon: Car },
    { path: '/incidents', label: 'INCIDENTS', icon: AlertTriangle },
    { path: '/feeds', label: 'VIDEO FEEDS', icon: Video },
    { path: '/analytics', label: 'ANALYTICS', icon: BarChart3 },
    { path: '/schedules', label: 'SCHEDULES', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Sidebar */}
      <aside
        data-testid="sidebar"
        className={`fixed left-0 top-0 h-full bg-black border-r border-zinc-800 z-50 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } w-64`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 border-b border-zinc-800 flex items-center px-6">
            <Activity className="w-6 h-6 text-blue-500 mr-3" />
            <span className="text-xl font-bold uppercase tracking-wider text-zinc-100">
              SmartFlow AI
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto scrollbar-thin">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
                  className={`flex items-center px-4 py-3 rounded-sm text-sm font-medium tracking-wide transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* System Status */}
          <div className="p-4 border-t border-zinc-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                System Status
              </span>
              <span className="flex items-center text-emerald-500 text-xs font-bold">
                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                ONLINE
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'md:pl-64' : 'pl-0'}`}>
        {/* Header */}
        <header className="h-16 border-b border-zinc-800 flex items-center px-6 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-40">
          <button
            data-testid="toggle-sidebar-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mr-4 p-2 rounded-sm hover:bg-zinc-800 text-zinc-400"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center flex-1">
            <h1 className="text-lg font-bold uppercase tracking-tight text-zinc-100">
              Traffic Control Center
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-xs text-zinc-500 font-mono">
              {new Date().toLocaleTimeString()}
            </div>
            <Settings data-testid="settings-icon" className="w-5 h-5 text-zinc-400 cursor-pointer hover:text-zinc-100" />
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
