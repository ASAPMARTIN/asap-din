import { useState, useRef } from 'react';
import { Plus, Search } from 'lucide-react';
import { useBrokers } from '../hooks/useBrokers';
import { formatMention } from '../utils/mentionParser';
import { mockUsers, CURRENT_USER_ID } from '../data/mockUsers';

const EQUIPMENT_LABELS = {
  dry_van: 'Dry Van', flatbed: 'Flatbed', reefer: 'Reefer',
  tanker: 'Tanker', step_deck: 'Step Deck', other: 'Otro',
};

export default function BrokerMentionInput({ value, onChange, placeholder, lang = 'es', className = '' }) {
  const { searchBrokers, addBroker } = useBrokers();
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownResults, setDropdownResults] = useState([]);
  const [userResults, setUserResults] = useState([]);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionStart, setMentionStart] = useState(-1);
  const [showAddBroker, setShowAddBroker] = useState(false);
  const [newBrokerName, setNewBrokerName] = useState('');
  const [newBrokerMC, setNewBrokerMC] = useState('');
  const textareaRef = useRef(null);

  const detectMention = (text, cursor) => {
    for (let i = cursor - 1; i >= 0; i--) {
      if (text[i] === '@') return { atIndex: i, query: text.slice(i + 1, cursor) };
      if (text[i] === ' ' || text[i] === '\n') break;
    }
    return null;
  };

  const handleInput = (e) => {
    const text = e.target.value;
    onChange(text);

    const cursor = e.target.selectionStart;
    const mention = detectMention(text, cursor);

    if (mention && mention.query.length >= 0) {
      setMentionStart(mention.atIndex);
      setMentionQuery(mention.query);
      const brokerResults = searchBrokers(mention.query.length >= 1 ? mention.query : '');
      setDropdownResults(mention.query.length >= 1 ? brokerResults.slice(0, 5) : searchBrokers('a').slice(0, 5));

      // Search users
      const q = mention.query.toLowerCase();
      const matchedUsers = mockUsers
        .filter(u => u.id !== CURRENT_USER_ID && u.display_name.toLowerCase().includes(q))
        .slice(0, 3);
      setUserResults(matchedUsers);
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
      setMentionStart(-1);
      setUserResults([]);
    }
  };

  const selectBroker = (broker) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const before = value.slice(0, mentionStart);
    const after = value.slice(textarea.selectionStart);
    const mention = formatMention(broker.id, broker.dba_name || broker.legal_name);
    const newText = before + mention + ' ' + after;
    onChange(newText);
    setShowDropdown(false);
    setUserResults([]);
    setTimeout(() => {
      textarea.focus();
      const pos = before.length + mention.length + 1;
      textarea.setSelectionRange(pos, pos);
    }, 0);
  };

  const selectUser = (user) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const before = value.slice(0, mentionStart);
    const after = value.slice(textarea.selectionStart);
    const userMention = `{${user.id}:${user.display_name}}`;
    const newText = before + userMention + ' ' + after;
    onChange(newText);
    setShowDropdown(false);
    setUserResults([]);
    setTimeout(() => {
      textarea.focus();
      const pos = before.length + userMention.length + 1;
      textarea.setSelectionRange(pos, pos);
    }, 0);
  };

  const handleAddBroker = () => {
    if (!newBrokerName || !newBrokerMC) return;
    const nb = addBroker({
      mc_number: newBrokerMC,
      legal_name: newBrokerName.toUpperCase(),
      dba_name: newBrokerName,
      authority_status: 'UNKNOWN',
      entity_type: 'BROKER',
      state: null, city: null, phone: null, years_active: null, usdot_number: null,
    });
    selectBroker(nb);
    setShowAddBroker(false);
    setNewBrokerName('');
    setNewBrokerMC('');
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInput}
        placeholder={placeholder}
        className={`w-full resize-none focus:outline-none text-gray-900 placeholder-gray-400 leading-relaxed ${className}`}
        rows={5}
      />

      {/* Instagram-style mention dropdown */}
      {showDropdown && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-2xl shadow-xl border border-gray-100 z-30 overflow-hidden slide-up">
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
            <Search size={14} className="text-gray-400" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {lang === 'es' ? 'Mencionar' : 'Mention'}
            </span>
            {mentionQuery && (
              <span className="text-xs text-blue-600 font-medium ml-auto">"{mentionQuery}"</span>
            )}
          </div>

          <div className="max-h-64 overflow-y-auto">
            {/* Users section */}
            {userResults.length > 0 && (
              <>
                <div className="px-4 py-1.5 bg-gray-50 border-b border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                    {lang === 'es' ? 'Miembros' : 'Members'}
                  </p>
                </div>
                {userResults.map(user => (
                  <button
                    key={user.id}
                    onMouseDown={(e) => { e.preventDefault(); selectUser(user); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 border-b border-gray-50 transition-colors text-left"
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: user.avatar_color }}
                    >
                      {user.avatar_initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user.display_name}</p>
                    </div>
                    <span className="text-[10px] bg-gray-100 text-gray-500 rounded-full px-2 py-0.5 flex-shrink-0">
                      {EQUIPMENT_LABELS[user.equipment_type] || user.equipment_type}
                    </span>
                  </button>
                ))}
              </>
            )}

            {/* Brokers section */}
            {dropdownResults.length > 0 && (
              <>
                <div className="px-4 py-1.5 bg-gray-50 border-b border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                    Brokers
                  </p>
                </div>
                {dropdownResults.map(broker => {
                  const isActive = broker.authority_status === 'AUTHORIZED';
                  const score = broker.avg_pays_score;
                  const scorePct = score != null ? Math.round(score * 100) : null;
                  return (
                    <button
                      key={broker.id}
                      onMouseDown={(e) => { e.preventDefault(); selectBroker(broker); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 active:bg-blue-100 border-b border-gray-50 last:border-0 transition-colors text-left"
                    >
                      <div className="w-9 h-9 rounded-full bg-[#0F1A2E] flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">
                          {(broker.dba_name || broker.legal_name).slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {broker.dba_name || broker.legal_name}
                        </p>
                        <p className="text-xs text-gray-400">MC-{broker.mc_number}</p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {scorePct !== null && (
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            scorePct >= 70 ? 'bg-emerald-100 text-emerald-700' :
                            scorePct >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {scorePct}%
                          </span>
                        )}
                        <span className={`text-xs font-semibold ${isActive ? 'text-emerald-600' : 'text-red-500'}`}>
                          {isActive ? '✓' : '✗'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </>
            )}

            {userResults.length === 0 && dropdownResults.length === 0 && mentionQuery.length >= 2 && (
              <div className="px-4 py-4 text-center">
                <p className="text-sm text-gray-400">
                  {lang === 'es' ? 'No encontrado' : 'Not found'}
                </p>
              </div>
            )}
          </div>

          {/* Add broker footer */}
          <button
            onMouseDown={(e) => { e.preventDefault(); setShowDropdown(false); setShowAddBroker(true); }}
            className="w-full flex items-center gap-2 px-4 py-3 bg-gray-50 border-t border-gray-100 text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <Plus size={16} />
            <span className="text-sm font-semibold">
              {lang === 'es' ? '¿No encuentras este broker? Agrégalo' : "Can't find this broker? Add it"}
            </span>
          </button>
        </div>
      )}

      {/* Add broker form */}
      {showAddBroker && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-2xl shadow-xl border border-gray-100 z-30 p-4 slide-up">
          <p className="text-base font-bold text-gray-900 mb-3">
            {lang === 'es' ? 'Agregar broker nuevo' : 'Add new broker'}
          </p>
          <input
            type="text"
            placeholder={lang === 'es' ? 'Nombre del broker' : 'Broker name'}
            value={newBrokerName}
            onChange={e => setNewBrokerName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-base mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <input
            type="text"
            placeholder="MC number (ej: 987654)"
            value={newBrokerMC}
            onChange={e => setNewBrokerMC(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-base mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddBroker(false)}
              className="flex-1 py-3 text-sm font-semibold text-gray-600 border border-gray-300 rounded-xl btn-press"
            >
              {lang === 'es' ? 'Cancelar' : 'Cancel'}
            </button>
            <button
              onClick={handleAddBroker}
              disabled={!newBrokerName || !newBrokerMC}
              className="flex-1 py-3 text-sm font-bold text-white bg-[#0F1A2E] rounded-xl disabled:opacity-40 btn-press"
            >
              {lang === 'es' ? 'Agregar' : 'Add'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
