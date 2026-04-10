import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockUsers } from '../data/mockUsers';

const VALID_CODES = ['ASAP2X4K', 'DIN3M7PQ', 'RMV8N2YH', 'CAMION01', 'TRUCKER2'];

// 5 members for the avatar stack
const stackUsers = mockUsers.slice(0, 5);

export default function InviteScreen() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!code.trim() || loading) return;
    setLoading(true);
    setError('');
    setTimeout(() => {
      setLoading(false);
      if (VALID_CODES.includes(code.toUpperCase().trim())) {
        setSuccess(true);
        setTimeout(() => navigate('/signup'), 600);
      } else {
        setError('Código inválido o ya usado');
      }
    }, 700);
  };

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-between px-6 py-10"
      style={{ background: 'linear-gradient(160deg, #0a1628 0%, #0F1A2E 50%, #0d1f3c 100%)' }}
    >
      {/* Top spacer */}
      <div className="flex-1" />

      {/* Logo block */}
      <div className="flex flex-col items-center mb-8">
        {/* Logo mark */}
        <div className="relative mb-5">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-2xl shadow-blue-900/50">
            <span className="text-white text-4xl font-black tracking-tighter">D</span>
          </div>
          <div className="absolute inset-0 rounded-3xl bg-blue-500/20 blur-xl scale-125 -z-10" />
        </div>

        <h1 className="text-4xl font-black text-white tracking-tight mb-1">ASAP-DIN</h1>
        <p className="text-blue-300/80 text-sm text-center leading-snug max-w-[220px]">
          La red verificada de camioneros independientes
        </p>
      </div>

      {/* Social proof block */}
      <div className="flex flex-col items-center mb-8">
        {/* Overlapping avatar stack */}
        <div className="flex avatar-stack mb-3">
          {stackUsers.map(user => (
            <div
              key={user.id}
              className="w-10 h-10 rounded-full border-2 border-[#0F1A2E] flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: user.avatar_color }}
            >
              {user.avatar_initials}
            </div>
          ))}
          <div className="w-10 h-10 rounded-full border-2 border-[#0F1A2E] bg-white/10 flex items-center justify-center text-white text-xs font-bold">
            +13
          </div>
        </div>

        <p className="text-white font-bold text-sm text-center mb-4">
          {mockUsers.length} camioneros verificados ya están adentro
        </p>

        {/* Value props */}
        <div className="space-y-2">
          {[
            'Red privada verificada solo para carriers',
            'Alertas de brokers que no pagan',
            'Tarifas reales del mercado en tiempo real',
          ].map(item => (
            <div key={item} className="flex items-center gap-2.5">
              <span className="text-emerald-400 font-bold text-sm">✓</span>
              <span className="text-white/70 text-sm">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Gate card */}
      <div className="w-full max-w-sm">
        {/* Exclusivity label */}
        <div className="flex items-center gap-2 justify-center mb-5">
          <div className="h-px bg-white/10 flex-1" />
          <p className="text-white/40 text-xs font-medium uppercase tracking-widest px-2">Solo por invitación</p>
          <div className="h-px bg-white/10 flex-1" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={code}
              onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }}
              placeholder="Código de 8 caracteres"
              maxLength={8}
              className={`w-full px-5 py-4 rounded-2xl text-white text-xl font-mono tracking-[0.3em] text-center placeholder-white/25 focus:outline-none transition-all ${
                success
                  ? 'bg-emerald-600/20 border-2 border-emerald-500'
                  : error
                  ? 'bg-red-500/10 border-2 border-red-500'
                  : 'bg-white/8 border-2 border-white/15 focus:border-blue-400 focus:bg-white/12'
              }`}
              autoCapitalize="characters"
              autoCorrect="off"
              autoFocus
              style={{ background: success ? undefined : error ? undefined : 'rgba(255,255,255,0.07)' }}
            />

            {error && (
              <div className="flex items-center gap-2 mt-2.5 px-1">
                <span className="text-red-400 text-sm">✗ {error}</span>
              </div>
            )}
            {success && (
              <div className="flex items-center justify-center gap-2 mt-2.5">
                <span className="text-emerald-400 text-sm font-medium">✓ Código válido — entrando...</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={code.length < 8 || loading || success}
            className={`w-full font-black py-4 rounded-2xl text-base transition-all btn-press ${
              code.length === 8 && !loading && !success
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                : 'bg-white/10 text-white/30'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" style={{ animation: 'spin 0.7s linear infinite' }} />
                Verificando...
              </span>
            ) : success ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>

      {/* Bottom */}
      <div className="flex-1 flex flex-col items-center justify-end pt-8">
        <p className="text-white/30 text-sm text-center leading-relaxed max-w-[250px]">
          ¿No tienes código? Solicita uno a un miembro verificado.
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-5 text-white/20 text-xs underline underline-offset-2"
        >
          Entrar como demo
        </button>
      </div>
    </div>
  );
}
