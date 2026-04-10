import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowLeft } from 'lucide-react';

const EQUIPMENT_OPTIONS = [
  { value: 'dry_van', label: 'Dry Van', emoji: '🚛' },
  { value: 'flatbed', label: 'Flatbed', emoji: '🏗️' },
  { value: 'reefer', label: 'Reefer', emoji: '❄️' },
  { value: 'tanker', label: 'Tanker', emoji: '🛢️' },
  { value: 'step_deck', label: 'Step Deck', emoji: '⬇️' },
  { value: 'other', label: 'Otro', emoji: '🚚' },
];

const YEARS_OPTIONS = [
  { value: 0, label: 'Menos de 1 año' },
  { value: 1, label: '1 – 2 años' },
  { value: 3, label: '3 – 5 años' },
  { value: 6, label: '6 – 10 años' },
  { value: 10, label: '10+ años' },
];

const MOCK_FMCSA = {
  '1234567': { company: 'Mendez Trucking LLC', usdot: '3456789', active: true, type: 'carrier' },
  '9876543': { company: 'Garcia Transport Inc', usdot: '8765432', active: true, type: 'carrier' },
  '1111111': { company: 'Fast Lane Brokers LLC', usdot: '9999999', active: true, type: 'broker' },
  '2222222': { company: 'Inactive Carrier LLC', usdot: '8888888', active: false, type: 'carrier' },
};

function StepDots({ current }) {
  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3].map(s => (
        <div key={s} className="flex items-center gap-2">
          <div className={`transition-all duration-300 rounded-full ${
            s < current ? 'w-2 h-2 bg-emerald-500' :
            s === current ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/20'
          }`} />
        </div>
      ))}
    </div>
  );
}

export default function SignupScreen() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [smsSent, setSmsSent] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [mcNumber, setMcNumber] = useState('');
  const [mcLookup, setMcLookup] = useState(null);
  const [mcError, setMcError] = useState('');
  const [mcLoading, setMcLoading] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [equipment, setEquipment] = useState('');
  const [years, setYears] = useState('');
  const [bio, setBio] = useState('');
  const [creating, setCreating] = useState(false);

  const stepLabels = [
    { es: 'Verificar teléfono', en: 'Verify phone' },
    { es: 'Tu autoridad MC', en: 'MC Authority' },
    { es: 'Tu perfil', en: 'Your profile' },
  ];

  const handleSendSMS = () => {
    if (phone.replace(/\D/g, '').length < 10) { setPhoneError('Ingresa un número válido'); return; }
    setPhoneError('');
    setSmsSent(true);
  };

  const handleMCLookup = () => {
    setMcLoading(true); setMcError('');
    setTimeout(() => {
      setMcLoading(false);
      const r = MOCK_FMCSA[mcNumber];
      if (!r) { setMcError('MC no encontrado. Verifica el número.'); return; }
      if (!r.active) { setMcError('Esta autoridad está INACTIVA. No puede registrarse.'); return; }
      if (r.type === 'broker') { setMcError('Este MC pertenece a un broker. Solo carriers pueden registrarse.'); return; }
      setMcLookup(r);
    }, 1000);
  };

  const handleCreate = () => {
    if (!displayName || !equipment || !years) return;
    setCreating(true);
    setTimeout(() => navigate('/'), 1200);
  };

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: 'linear-gradient(160deg, #0a1628 0%, #0F1A2E 100%)' }}>
      {/* Dark header */}
      <div className="px-5 pt-safe pt-4 pb-5">
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => step > 1 ? setStep(s => s - 1) : navigate('/invite')}
            className="p-2 text-white/60 hover:text-white btn-press"
          >
            <ArrowLeft size={22} />
          </button>
          <StepDots current={step} />
          <div className="w-10" />
        </div>

        <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-1">
          Paso {step} de 3
        </p>
        <h1 className="text-2xl font-black text-white">
          {stepLabels[step - 1].es}
        </h1>
      </div>

      {/* White content card */}
      <div className="flex-1 bg-white rounded-t-3xl px-5 pt-6 pb-10">

        {/* Step 1: Phone */}
        {step === 1 && (
          <div className="space-y-5 fade-in">
            <p className="text-gray-500 text-base">
              Usamos tu número como acceso. No compartimos tu información.
            </p>

            <div>
              <label className="text-sm font-bold text-gray-700 block mb-2">Número de teléfono</label>
              <input
                type="tel"
                value={phone}
                onChange={e => { setPhone(e.target.value); setPhoneError(''); }}
                placeholder="+1 (305) 555-0000"
                className={`w-full px-4 py-4 border-2 rounded-2xl text-base focus:outline-none transition-colors ${
                  phoneError ? 'border-red-400' : 'border-gray-200 focus:border-[#0F1A2E]'
                }`}
              />
              {phoneError && <p className="text-red-500 text-sm mt-1.5 font-medium">{phoneError}</p>}
            </div>

            {!smsSent ? (
              <button
                onClick={handleSendSMS}
                className="w-full bg-[#0F1A2E] text-white font-black py-4 rounded-2xl text-base btn-press"
              >
                Enviar código SMS
              </button>
            ) : (
              <div className="space-y-4 fade-in">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                  <p className="text-emerald-700 text-sm font-medium">
                    ✓ Código enviado. Ingresa cualquier 6 dígitos (demo).
                  </p>
                </div>
                <input
                  type="tel"
                  value={smsCode}
                  onChange={e => setSmsCode(e.target.value.slice(0, 6))}
                  placeholder="000000"
                  className="w-full px-4 py-4 border-2 border-gray-200 focus:border-[#0F1A2E] rounded-2xl text-center text-3xl font-mono tracking-[0.4em] focus:outline-none transition-colors"
                  autoFocus
                />
                <button
                  onClick={() => smsCode.length === 6 && setStep(2)}
                  disabled={smsCode.length !== 6}
                  className="w-full bg-[#0F1A2E] disabled:bg-gray-200 disabled:text-gray-400 text-white font-black py-4 rounded-2xl text-base btn-press transition-colors"
                >
                  Continuar
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: MC verification */}
        {step === 2 && (
          <div className="space-y-5 fade-in">
            <p className="text-gray-500 text-base">
              Verificamos tu MC en el registro público del FMCSA. Solo carriers activos pueden unirse.
            </p>

            {!mcLookup ? (
              <>
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-2">Número MC</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={mcNumber}
                      onChange={e => { setMcNumber(e.target.value); setMcError(''); }}
                      placeholder="ej: 1234567"
                      className={`flex-1 px-4 py-4 border-2 rounded-2xl text-base font-mono focus:outline-none transition-colors ${
                        mcError ? 'border-red-400' : 'border-gray-200 focus:border-[#0F1A2E]'
                      }`}
                    />
                    <button
                      onClick={handleMCLookup}
                      disabled={mcNumber.length < 6 || mcLoading}
                      className="bg-[#0F1A2E] disabled:bg-gray-200 text-white disabled:text-gray-400 px-5 rounded-2xl font-bold text-sm btn-press transition-colors min-w-[72px]"
                    >
                      {mcLoading
                        ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full block" style={{ animation: 'spin 0.7s linear infinite' }} />
                        : 'Buscar'}
                    </button>
                  </div>
                  {mcError && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-red-700 text-sm font-medium">✗ {mcError}</p>
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    Demo: prueba 1234567 o 9876543
                  </p>
                </div>
              </>
            ) : (
              <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-5 fade-in">
                <p className="text-emerald-600 text-sm font-bold mb-1 uppercase tracking-wide">¿Es esta tu empresa?</p>
                <p className="text-xl font-black text-gray-900 mb-1">{mcLookup.company}</p>
                <p className="text-sm text-gray-500 mb-5">MC-{mcNumber} · USDOT-{mcLookup.usdot} · ✓ Activo</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => { setMcLookup(null); setMcNumber(''); }}
                    className="flex-1 py-3 border-2 border-gray-300 rounded-xl text-sm font-bold text-gray-600 btn-press"
                  >
                    No, cambiar
                  </button>
                  <button
                    onClick={() => {
                      setDisplayName(mcLookup.company);
                      setStep(3);
                    }}
                    className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-sm font-black btn-press"
                  >
                    Sí, confirmar ✓
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Profile */}
        {step === 3 && (
          <div className="space-y-5 fade-in">
            <p className="text-gray-500 text-base">
              Así te verá la comunidad. Sé claro y honesto.
            </p>

            <div>
              <label className="text-sm font-bold text-gray-700 block mb-2">Nombre / Empresa</label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="w-full px-4 py-4 border-2 border-gray-200 focus:border-[#0F1A2E] rounded-2xl text-base focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 block mb-2">Tipo de equipo</label>
              <div className="grid grid-cols-2 gap-2.5">
                {EQUIPMENT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setEquipment(opt.value)}
                    className={`flex items-center gap-2 py-3 px-4 rounded-xl border-2 text-sm font-semibold transition-all btn-press ${
                      equipment === opt.value
                        ? 'border-[#0F1A2E] bg-[#0F1A2E] text-white'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span>{opt.emoji}</span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 block mb-2">Años en el negocio</label>
              <div className="flex flex-col gap-2">
                {YEARS_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setYears(String(opt.value))}
                    className={`w-full py-3 px-4 rounded-xl border-2 text-sm font-semibold transition-all btn-press text-left ${
                      years === String(opt.value)
                        ? 'border-[#0F1A2E] bg-[#0F1A2E] text-white'
                        : 'border-gray-200 text-gray-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 block mb-2">
                Bio <span className="font-normal text-gray-400">(opcional)</span>
              </label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value.slice(0, 280))}
                placeholder="Una línea sobre ti o tu operación..."
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 focus:border-[#0F1A2E] rounded-2xl text-base resize-none focus:outline-none transition-colors"
              />
              <p className="text-xs text-gray-400 text-right">{bio.length}/280</p>
            </div>

            <button
              onClick={handleCreate}
              disabled={!displayName || !equipment || !years || creating}
              className="w-full bg-[#0F1A2E] disabled:bg-gray-200 disabled:text-gray-400 text-white font-black py-4 rounded-2xl text-base btn-press transition-colors"
            >
              {creating
                ? <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" style={{ animation: 'spin 0.7s linear infinite' }} />
                    Creando tu perfil...
                  </span>
                : 'Crear mi perfil verificado ✓'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
