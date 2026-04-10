import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowLeft } from 'lucide-react';
import PostCard from '../components/PostCard';
import { usePosts } from '../hooks/usePosts';
import { useAuth } from '../hooks/useAuth';
import { getUserById } from '../data/mockUsers';

export default function PostSearchScreen() {
  const navigate = useNavigate();
  const { posts } = usePosts();
  const { language } = useAuth();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const results = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    const q = debouncedQuery.toLowerCase();
    return posts.filter(post => {
      const author = getUserById(post.author_id);
      const authorName = author?.display_name?.toLowerCase() || '';
      const body = post.body?.toLowerCase() || '';
      const pollQ = post.poll_question?.toLowerCase() || '';
      return body.includes(q) || authorName.includes(q) || pollQ.includes(q);
    });
  }, [posts, debouncedQuery]);

  return (
    <div className="flex flex-col min-h-dvh" style={{ backgroundColor: '#FAFAF8' }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-3 py-2 flex items-center gap-2 sticky top-0 z-10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full text-gray-500 hover:bg-gray-100 btn-press flex-shrink-0"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={language === 'es' ? 'Buscar publicaciones...' : 'Search posts...'}
            autoFocus
            className="w-full pl-10 pr-10 py-2.5 bg-gray-100 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all placeholder-gray-400"
          />
          {query.length > 0 && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center btn-press"
            >
              <X size={12} className="text-gray-600" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {!debouncedQuery.trim() && (
          <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-gray-500 text-base font-medium">
              {language === 'es' ? 'Busca en toda la comunidad' : 'Search the whole community'}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {language === 'es' ? 'Nombre del autor, contenido o encuesta' : 'Author name, content or poll'}
            </p>
          </div>
        )}

        {debouncedQuery.trim() && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
            <div className="text-5xl mb-4">😔</div>
            <p className="text-gray-700 text-base font-semibold mb-1">
              {language === 'es' ? 'Sin resultados' : 'No results'}
            </p>
            <p className="text-gray-400 text-sm">
              {language === 'es' ? `No encontramos "${debouncedQuery}"` : `Nothing found for "${debouncedQuery}"`}
            </p>
          </div>
        )}

        {results.length > 0 && (
          <div>
            <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
              <span className="text-sm text-gray-500 font-medium">
                {results.length} {language === 'es' ? 'resultado(s)' : 'result(s)'}
              </span>
            </div>
            {results.map(post => <PostCard key={post.id} post={post} />)}
            <div className="h-6" />
          </div>
        )}
      </div>
    </div>
  );
}
