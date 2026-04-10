import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { mockResources, RESOURCE_CATEGORIES, getResourcesByCategory } from '../data/mockResources';
import { useAuth } from '../hooks/useAuth';
import { mockUsers } from '../data/mockUsers';

export default function ResourcesScreen() {
  const navigate = useNavigate();
  const { language } = useAuth();
  const [activeCategory, setActiveCategory] = useState('ifta');

  const resources = getResourcesByCategory(activeCategory);

  return (
    <div className="flex flex-col min-h-dvh" style={{ backgroundColor: '#FAFAF8' }}>
      <TopBar />

      <div className="flex-1 overflow-y-auto pb-safe">
        {/* Page title — community framing */}
        <div className="bg-white px-4 pt-4 pb-4 border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-900 mb-0.5">
            {language === 'es' ? 'Guías de la Comunidad' : 'Community Guides'}
          </h1>
          <p className="text-sm text-gray-500 mb-3">
            {language === 'es'
              ? 'Escrito por y para camioneros independientes'
              : 'Written by and for independent truckers'}
          </p>
          {/* Curated badge */}
          <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full">
            <span>✓</span>
            {language === 'es'
              ? `Curado por ${mockUsers.length} miembros`
              : `Curated by ${mockUsers.length} members`}
          </span>
        </div>

        {/* Category tabs */}
        <div className="bg-white border-b border-gray-200">
          <div className="flex overflow-x-auto no-scrollbar px-4 gap-1 py-2">
            {RESOURCE_CATEGORIES.map(cat => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat.key
                    ? 'bg-[#0F1A2E] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {language === 'es' ? cat.label_es : cat.label_en}
              </button>
            ))}
          </div>
        </div>

        {/* Resources list */}
        <div className="bg-white mx-4 mt-4 rounded-2xl overflow-hidden border border-gray-100 shadow-soft">
          {resources.length === 0 ? (
            <div className="py-12 text-center px-8">
              <p className="text-gray-400 text-sm">
                {language === 'es' ? 'No hay artículos en esta categoría aún.' : 'No articles in this category yet.'}
              </p>
            </div>
          ) : (
            resources.map((resource, i) => (
              <button
                key={resource.id}
                onClick={() => navigate(`/guias/${resource.id}`)}
                className={`w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 active:bg-gray-100 text-left transition-colors ${
                  i < resources.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <div className="flex-1 pr-3">
                  <p className="text-sm font-semibold text-gray-900 leading-snug mb-1">
                    {language === 'es' ? resource.title_es : resource.title_en}
                  </p>
                  <p className="text-xs text-gray-400">
                    {language === 'es' ? 'Por la comunidad ASAP-DIN' : 'By the ASAP-DIN community'}
                  </p>
                </div>
                <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
              </button>
            ))
          )}
        </div>

        {/* Other categories preview */}
        {mockResources.filter(r => r.category !== activeCategory).length > 0 && (
          <div className="px-4 mt-4 mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              {language === 'es' ? 'Más guías de la comunidad' : 'More community guides'}
            </p>
            <div className="space-y-2">
              {mockResources.filter(r => r.category !== activeCategory).slice(0, 3).map(resource => (
                <button
                  key={resource.id}
                  onClick={() => navigate(`/guias/${resource.id}`)}
                  className="w-full flex items-center justify-between bg-white px-4 py-3.5 rounded-xl border border-gray-100 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left shadow-soft"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 leading-snug mb-0.5">
                      {language === 'es' ? resource.title_es : resource.title_en}
                    </p>
                    <p className="text-xs text-gray-400">
                      {RESOURCE_CATEGORIES.find(c => c.key === resource.category)?.[language === 'es' ? 'label_es' : 'label_en']}
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 flex-shrink-0 ml-3" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
