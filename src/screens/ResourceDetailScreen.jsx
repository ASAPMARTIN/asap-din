import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Share2 } from 'lucide-react';
import TopBar from '../components/TopBar';
import ShareSheet from '../components/ShareSheet';
import { getResourceById } from '../data/mockResources';
import { useAuth } from '../hooks/useAuth';

// Very basic markdown renderer (handles # headings, **bold**, bullets, ✅ 🚫 emojis natively)
function SimpleMarkdown({ text }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1.5 text-sm text-gray-800 leading-relaxed">
      {lines.map((line, i) => {
        if (line.startsWith('# ')) return <h1 key={i} className="text-xl font-bold text-gray-900 mt-4 mb-2">{line.slice(2)}</h1>;
        if (line.startsWith('## ')) return <h2 key={i} className="text-base font-bold text-gray-900 mt-4 mb-1.5">{line.slice(3)}</h2>;
        if (line.startsWith('### ')) return <h3 key={i} className="text-sm font-bold text-gray-900 mt-3 mb-1">{line.slice(4)}</h3>;
        if (line.startsWith('- ')) return (
          <div key={i} className="flex gap-2 ml-1">
            <span className="text-gray-400 mt-0.5 flex-shrink-0">•</span>
            <span>{renderInline(line.slice(2))}</span>
          </div>
        );
        if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="font-semibold">{line.slice(2, -2)}</p>;
        if (line === '') return <div key={i} className="h-1" />;
        return <p key={i}>{renderInline(line)}</p>;
      })}
    </div>
  );
}

function renderInline(text) {
  // Handle **bold**
  const parts = text.split(/(\*\*[^*]+\*\*)/);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

export default function ResourceDetailScreen() {
  const { id } = useParams();
  const { language, toggleLanguage } = useAuth();
  const [shareOpen, setShareOpen] = useState(false);
  const [viewLang, setViewLang] = useState(language);

  const resource = getResourceById(id);

  if (!resource) {
    return (
      <div className="min-h-dvh bg-gray-50 flex flex-col">
        <TopBar showBack />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">Artículo no encontrado</p>
        </div>
      </div>
    );
  }

  const title = viewLang === 'es' ? resource.title_es : resource.title_en;
  const body = viewLang === 'es' ? resource.body_es : resource.body_en;

  return (
    <div className="flex flex-col min-h-dvh bg-white">
      <TopBar showBack />

      <div className="flex-1 overflow-y-auto">
        {/* Controls bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200">
          {/* Language toggle */}
          <div className="flex bg-white rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setViewLang('es')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${viewLang === 'es' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}
            >
              ES
            </button>
            <button
              onClick={() => setViewLang('en')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${viewLang === 'en' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}
            >
              EN
            </button>
          </div>

          <button
            onClick={() => setShareOpen(true)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
          >
            <Share2 size={16} />
            <span>{language === 'es' ? 'Compartir' : 'Share'}</span>
          </button>
        </div>

        {/* Article content */}
        <div className="px-4 pt-5 pb-10">
          <SimpleMarkdown text={body} />
        </div>
      </div>

      <ShareSheet
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        type="resource"
        id={resource.id}
        title={title}
        lang={language}
      />
    </div>
  );
}
