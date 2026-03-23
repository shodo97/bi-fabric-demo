import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  Database,
  Layers,
  Shield,
  ArrowLeftRight,
  Settings,
  Search,
  Bell,
  User,
  ChevronDown,
} from 'lucide-react';
import { cn } from "../../../lib/utils";
import { usePersona, personas, PersonaType } from '../../context/PersonaContext';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { persona, personaType, setPersonaType, isMarketingDirector } = usePersona();
  const [personaDropdownOpen, setPersonaDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setPersonaDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const allNavItems = [
    { 
      label: 'Talk', 
      path: '/conversational', 
      icon: MessageSquare 
    },
    { 
      label: 'Dashboard', 
      path: '/dashboard', 
      icon: LayoutDashboard 
    },
    { 
      label: 'Reports', 
      path: '/reports', 
      icon: FileText 
    },
    { 
      label: 'Datasets', 
      path: '/datasets', 
      icon: Database 
    },
    { 
      label: 'Platforms', 
      path: '/enterprise-bi', 
      icon: Layers 
    },
    { 
      label: 'Governance', 
      path: '/governance', 
      icon: Shield 
    },
    {
      label: 'Migration',
      path: '/migration',
      icon: ArrowLeftRight
    },
  ];

  const navItems = isMarketingDirector
    ? allNavItems.filter((item) => item.label !== 'Migration')
    : allNavItems;

  const bottomNavItems = [
    { 
      label: 'Settings', 
      path: '/settings', 
      icon: Settings 
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FB] font-sans text-gray-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-[60px] bg-white border-b border-[#E5E7EB] z-50 flex items-center justify-between px-6">
        {/* Left: Logo */}
        <div className="flex items-center gap-3 w-[200px]">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#E11D48]" />
            <span className="font-semibold text-[16px] tracking-tight text-[#111827]" style={{ fontFamily: 'Inter, sans-serif' }}>
              Report Hub
            </span>
          </div>
          <div className="text-[10px] text-[#6B7280] bg-gray-100 px-2 py-0.5 rounded" style={{ fontFamily: 'Inter, sans-serif' }}>
            Demo
          </div>
        </div>

        {/* Center: Global Search */}
        <div className="flex-1 max-w-2xl px-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search insights, reports, datasets…" 
              className="w-full h-[38px] pl-10 pr-4 bg-[#F8F9FB] border border-[#E5E7EB] rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
          </div>
        </div>

        {/* Right: Persona Switcher + Notification + User */}
        <div className="flex items-center gap-3 text-gray-500">
          {/* Persona Switcher */}
          {persona && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setPersonaDropdownOpen(!personaDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F8F9FB] border border-[#E5E7EB] rounded-full hover:bg-gray-100 transition-colors"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <span className="text-[13px]">{persona.icon}</span>
                <span className="text-[12px] font-medium text-[#111827]">{persona.label}</span>
                <ChevronDown className="w-3 h-3 text-[#6B7280]" />
              </button>
              {personaDropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-[220px] bg-white rounded-[10px] border border-[#E5E7EB] shadow-lg z-50 py-1.5 overflow-hidden">
                  {(['marketing_director', 'power_user'] as PersonaType[]).map((type) => {
                    const p = personas[type];
                    const isActive = personaType === type;
                    return (
                      <button
                        key={type}
                        onClick={() => {
                          setPersonaType(type);
                          setPersonaDropdownOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left transition-colors",
                          isActive ? "bg-[#FFF1F2]" : "hover:bg-[#F8F9FB]"
                        )}
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        <span className="text-[16px]">{p.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className={cn(
                            "text-[13px] font-medium",
                            isActive ? "text-[#E11D48]" : "text-[#111827]"
                          )}>{p.label}</div>
                          <div className="text-[11px] text-[#6B7280] truncate">{p.description}</div>
                        </div>
                        {isActive && (
                          <div className="w-1.5 h-1.5 rounded-full bg-[#E11D48] flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E11D48] rounded-full border border-white"></span>
          </button>
          <button className="flex items-center gap-2 p-1.5 pr-3 hover:bg-gray-100 rounded-lg transition-colors">
            <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" />
            </div>
            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </header>

      {/* Left Navigation */}
      <aside className="fixed top-[60px] left-0 bottom-0 w-[76px] bg-white border-r border-[#E5E7EB] z-40 flex flex-col">
        {/* Primary Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            // Special case for Talk: also match /talk/migration paths
            const isActive = location.pathname === item.path || 
                             location.pathname.startsWith(item.path + '/') ||
                             (item.path === '/conversational' && location.pathname.startsWith('/talk/'));
            const Icon = item.icon;
            
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-2 py-3 rounded-lg transition-all relative group",
                  isActive 
                    ? "bg-[#EFF6FF] text-[#E11D48]" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
                title={item.label}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#E11D48] rounded-r-full" />
                )}
                <Icon className={cn("w-5 h-5", isActive ? "text-[#E11D48]" : "text-gray-500 group-hover:text-gray-700")} />
                <span className={cn(
                  "text-[9px] font-medium text-center leading-tight",
                  isActive ? "text-[#E11D48]" : "text-gray-600 group-hover:text-gray-900"
                )} style={{ fontFamily: 'Inter, sans-serif' }}>
                  {item.label.split(' ')[0]}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Navigation (Settings) */}
        <nav className="py-4 px-2 border-t border-[#E5E7EB]">
          {bottomNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-2 py-3 rounded-lg transition-all relative group",
                  isActive 
                    ? "bg-[#EFF6FF] text-[#E11D48]" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
                title={item.label}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#E11D48] rounded-r-full" />
                )}
                <Icon className={cn("w-5 h-5", isActive ? "text-[#E11D48]" : "text-gray-500 group-hover:text-gray-700")} />
                <span className={cn(
                  "text-[9px] font-medium text-center leading-tight",
                  isActive ? "text-[#E11D48]" : "text-gray-600 group-hover:text-gray-900"
                )} style={{ fontFamily: 'Inter, sans-serif' }}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-[76px] pt-[60px] min-h-screen">
        <div className="p-8 max-w-[1400px] mx-auto space-y-8">
           {children}
        </div>
      </main>
    </div>
  );
}