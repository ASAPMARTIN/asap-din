import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, Users, BookOpen, SquarePen } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useAuth();

  const tabs = [
    { id: 'home', path: '/', icon: Home, label_es: 'Inicio', label_en: 'Home' },
    { id: 'search', path: '/search', icon: Search, label_es: 'Buscar', label_en: 'Search' },
    { id: 'compose', path: '/compose', icon: null, label_es: 'Publicar', label_en: 'Post' },
    { id: 'members', path: '/members', icon: Users, label_es: 'Mi Red', label_en: 'Network' },
    { id: 'guias', path: '/guias', icon: BookOpen, label_es: 'Guías', label_en: 'Guides' },
  ];

  const isActive = (tab) => {
    if (tab.path === '/') return location.pathname === '/';
    if (tab.id === 'members') {
      return location.pathname.startsWith('/members') || location.pathname.startsWith('/profile');
    }
    return location.pathname.startsWith(tab.path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 bottom-nav-height z-40 shadow-[0_-1px_0_rgba(0,0,0,0.06)]">
      <div className="flex h-[68px]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab);

          // Center compose button — styled differently
          if (tab.id === 'compose') {
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className="flex-1 flex flex-col items-center justify-center gap-1 btn-press"
              >
                <div className="w-12 h-12 bg-[#0F1A2E] rounded-full flex items-center justify-center shadow-md -mt-5">
                  <SquarePen size={20} className="text-white" strokeWidth={2} />
                </div>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className="flex-1 flex flex-col items-center justify-center gap-1 btn-press"
            >
              <div className={`w-14 h-8 flex items-center justify-center rounded-full transition-colors duration-200 ${
                active ? 'bg-blue-100' : ''
              }`}>
                <Icon
                  size={22}
                  className={`transition-colors duration-200 ${active ? 'text-blue-600' : 'text-gray-400'}`}
                  fill={active ? 'currentColor' : 'none'}
                  strokeWidth={active ? 0 : 1.75}
                />
              </div>
              <span className={`text-xs font-semibold transition-colors duration-200 ${active ? 'text-blue-600' : 'text-gray-400'}`}>
                {language === 'es' ? tab.label_es : tab.label_en}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
