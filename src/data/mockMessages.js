const now = new Date('2026-04-08T10:00:00Z');
const minsAgo = (m) => new Date(now - m * 60000).toISOString();
const hoursAgo = (h) => new Date(now - h * 3600000).toISOString();
const daysAgo = (d) => new Date(now - d * 86400000).toISOString();

// Realistic speech waveforms: bursts (words) separated by dips (pauses)
// Values 0-1 where high = loud, low = silence between words
const WF_8S = [
  0.3,0.72,0.91,0.85,0.68,0.4,0.1,0.15,
  0.58,0.92,0.88,0.79,0.6,0.28,0.1,
  0.52,0.83,0.95,0.82,0.5,0.12,0.08,0.1,
  0.55,0.88,0.93,0.82,0.6,0.1,
  0.45,0.82,0.9,0.85,0.6,0.22,0.1,0.5,0.8,0.3,
];

const WF_14S = [
  0.2,0.55,0.88,0.92,0.82,0.65,0.4,0.1,0.12,
  0.6,0.93,0.88,0.72,0.42,0.1,0.08,
  0.5,0.82,0.92,0.88,0.62,0.3,0.1,
  0.48,0.82,0.92,0.88,0.65,0.1,0.08,
  0.55,0.88,0.92,0.82,0.5,0.2,0.1,0.65,0.88,0.4,
];

const WF_22S = [
  0.38,0.78,0.92,0.88,0.72,0.5,0.2,0.1,0.08,
  0.62,0.92,0.88,0.72,0.45,0.1,
  0.52,0.88,0.93,0.82,0.6,0.1,0.08,0.12,
  0.68,0.92,0.88,0.65,0.3,0.1,
  0.55,0.9,0.88,0.72,0.42,0.1,0.08,
  0.6,0.88,0.92,
];

export const mockConversations = [
  {
    id: 'conv-001',
    participant_ids: ['u-001', 'u-007'], // Roberto ↔ Reinaldo Fuentes
    messages: [
      {
        id: 'msg-001',
        sender_id: 'u-007',
        type: 'text',
        text: 'Hermano, cuidado con el broker que te mandé ayer. No me han pagado todavía.',
        created_at: daysAgo(2),
      },
      {
        id: 'msg-002',
        sender_id: 'u-001',
        type: 'text',
        text: 'Gracias por el aviso. Yo casi les acepto una carga ayer.',
        created_at: daysAgo(2),
        status: 'read',
      },
      {
        id: 'msg-003',
        sender_id: 'u-007',
        type: 'text',
        text: 'Mejor busca en DIN antes de aceptar. Tienen 3 reportes de doble brokerage.',
        created_at: daysAgo(2),
      },
      {
        id: 'msg-shared-1',
        sender_id: 'u-007',
        type: 'shared_post',
        shared_post_id: 'p-003',
        created_at: daysAgo(1),
      },
      {
        id: 'msg-004',
        sender_id: 'u-001',
        type: 'text',
        text: 'Ya los busqué. Tienen autoridad activa pero mucho negativo. Los evito.',
        created_at: daysAgo(1),
        status: 'read',
      },
      {
        id: 'msg-005',
        sender_id: 'u-007',
        type: 'text',
        text: '¿Tienes carga para la semana que viene hacia Atlanta?',
        created_at: hoursAgo(4),
      },
    ],
    unread_count: 1,
  },
  {
    id: 'conv-002',
    participant_ids: ['u-001', 'u-003'], // Roberto ↔ Ana Lucia Torres
    messages: [
      {
        id: 'msg-010',
        sender_id: 'u-003',
        type: 'text',
        text: 'Roberto, vi tu publicación sobre Medley. Yo también los demandé el año pasado.',
        created_at: daysAgo(5),
      },
      {
        id: 'msg-011',
        sender_id: 'u-001',
        type: 'text',
        text: '¿En serio? ¿Ganaste el caso? Cuéntame cómo fue el proceso.',
        created_at: daysAgo(5),
      },
      {
        id: 'msg-012',
        sender_id: 'u-003',
        type: 'text',
        text: 'Sí. Small claims court. $3,200 recuperados. Sin abogado. Te explico cuando pueda.',
        created_at: daysAgo(4),
      },
      {
        id: 'msg-013',
        sender_id: 'u-001',
        type: 'text',
        text: 'Cuando puedas me avisas. Muchas gracias Ana.',
        created_at: daysAgo(4),
      },
    ],
    unread_count: 0,
  },
  {
    id: 'conv-003',
    participant_ids: ['u-001', 'u-010'], // Roberto ↔ Lisset Hernandez
    messages: [
      {
        id: 'msg-020',
        sender_id: 'u-010',
        type: 'text',
        text: 'Roberto! ¿Vas a ir al meetup de camioneros en Hialeah este viernes?',
        created_at: hoursAgo(6),
      },
      {
        id: 'msg-021',
        sender_id: 'u-001',
        type: 'text',
        text: '¿A qué hora es? No sabía del meetup.',
        created_at: hoursAgo(5),
      },
      {
        id: 'msg-022',
        sender_id: 'u-010',
        type: 'text',
        text: 'Viernes 7pm en el Mexican Food de la 49 y Okeechobee. Lo organiza Hector.',
        created_at: hoursAgo(5),
      },
      {
        id: 'msg-023',
        sender_id: 'u-001',
        type: 'text',
        text: 'Ahí estaré. Manda la dirección exacta cuando puedas.',
        created_at: hoursAgo(3),
      },
      {
        id: 'msg-024',
        sender_id: 'u-010',
        type: 'text',
        text: '4901 W Okeechobee Rd, Hialeah. Hay parking en el back. Nos vemos!',
        created_at: hoursAgo(2),
      },
      {
        id: 'msg-025',
        sender_id: 'u-010',
        type: 'text',
        text: 'Y trae la tarjeta del nuevo MC que te hiciste 😄',
        created_at: minsAgo(45),
      },
    ],
    unread_count: 2,
  },
  {
    id: 'conv-004',
    participant_ids: ['u-001', 'u-005'], // Roberto ↔ Jorge Luis Peña
    messages: [
      {
        id: 'msg-030',
        sender_id: 'u-005',
        type: 'text',
        text: 'Roberto, ¿tienes referencias de algún broker bueno para rutas de tanker en Florida?',
        created_at: daysAgo(1),
      },
      {
        id: 'msg-031',
        sender_id: 'u-001',
        type: 'text',
        text: 'Sí, mira a Quality Carriers y a Trimac. Los dos pagan bien y son puntuales.',
        created_at: daysAgo(1),
      },
      {
        id: 'msg-v3',
        sender_id: 'u-005',
        type: 'voice',
        duration: 22,
        waveform: WF_22S,
        audio_url: null,
        created_at: hoursAgo(3),
      },
      {
        id: 'msg-032',
        sender_id: 'u-005',
        type: 'text',
        text: 'Perfecto. ¿Tienes el contacto de alguien en Quality?',
        created_at: minsAgo(30),
      },
    ],
    unread_count: 1,
  },
  {
    id: 'conv-005',
    participant_ids: ['u-001', 'u-002'], // Roberto ↔ Carlos Gutierrez
    messages: [
      {
        id: 'msg-040',
        sender_id: 'u-002',
        type: 'text',
        text: 'Roberto, oye ¿cómo te fue con esa carga a Charlotte que mencionaste?',
        created_at: daysAgo(3),
      },
      {
        id: 'msg-041',
        sender_id: 'u-001',
        type: 'text',
        text: 'Bien, pero el broker tardó 38 días en pagar. Por eso no repito con ellos.',
        created_at: daysAgo(3),
        status: 'read',
      },
      {
        id: 'msg-v1',
        sender_id: 'u-002',
        type: 'voice',
        duration: 8,
        waveform: WF_8S,
        audio_url: null,
        created_at: daysAgo(3),
      },
      {
        id: 'msg-042',
        sender_id: 'u-001',
        type: 'text',
        text: 'Exacto. Yo siempre digo lo mismo, hay que conocerlos bien primero.',
        created_at: hoursAgo(10),
        status: 'read',
      },
      {
        id: 'msg-v2',
        sender_id: 'u-001',
        type: 'voice',
        duration: 14,
        waveform: WF_14S,
        audio_url: null,
        created_at: hoursAgo(9),
        status: 'delivered',
      },
      {
        id: 'msg-043',
        sender_id: 'u-002',
        type: 'text',
        text: '100%. Bueno, cuando salgas para el norte avísame.',
        created_at: hoursAgo(8),
      },
    ],
    unread_count: 0,
  },
];

// Group conversations
export const mockGroups = [
  {
    id: 'grp-001',
    name: 'Dry Van Miami-Atlanta',
    emoji: '🚛',
    members: ['u-001', 'u-002', 'u-005', 'u-009', 'u-012'],
    created_by: 'u-002',
    last_message_at: '2026-04-09T18:00:00Z',
    messages: [
      { id: 'gm-001', sender_id: 'u-002', type: 'text', body: 'Buenas! Alguien corriendo Miami-Atlanta esta semana?', created_at: '2026-04-09T10:00:00Z' },
      { id: 'gm-002', sender_id: 'u-005', type: 'text', body: 'Yo! Las tarifas bajaron a $2.10/mi. Están bien bajas', created_at: '2026-04-09T10:05:00Z' },
      { id: 'gm-003', sender_id: 'u-001', type: 'text', body: 'Echo vi ayer $2.35 en DAT, busquen bien', created_at: '2026-04-09T10:12:00Z', status: 'read' },
      { id: 'gm-004', sender_id: 'u-009', type: 'text', body: 'Cuidado con Horizon Freight en Atlanta, me dejaron esperando 6 horas', created_at: '2026-04-09T11:00:00Z' },
      { id: 'gm-005', sender_id: 'u-012', type: 'text', body: 'Gracias por el aviso! Los tengo anotados', created_at: '2026-04-09T11:15:00Z' },
      { id: 'gm-006', sender_id: 'u-002', type: 'text', body: 'Alguien sabe si I-75 está libre hoy? Vi algo de construcción', created_at: '2026-04-09T14:00:00Z' },
      { id: 'gm-007', sender_id: 'u-005', type: 'text', body: 'Sí hay obra en el kilómetro 120, evítenlo o lleguen temprano', created_at: '2026-04-09T14:22:00Z' },
      { id: 'gm-008', sender_id: 'u-001', type: 'text', body: 'Gracias a todos, buen viaje esta semana! 🙏', created_at: '2026-04-09T18:00:00Z', status: 'delivered' },
    ],
  },
  {
    id: 'grp-002',
    name: 'Reefer Costa Este',
    emoji: '❄️',
    members: ['u-001', 'u-003', 'u-007', 'u-014'],
    created_by: 'u-003',
    last_message_at: '2026-04-10T08:00:00Z',
    messages: [
      { id: 'gr2-001', sender_id: 'u-003', type: 'text', body: 'Grupo para reefer en la costa este 🥶', created_at: '2026-04-08T09:00:00Z' },
      { id: 'gr2-002', sender_id: 'u-007', type: 'text', body: 'Buena idea. Alguien en Boston esta semana?', created_at: '2026-04-08T09:30:00Z' },
      { id: 'gr2-003', sender_id: 'u-001', type: 'text', body: 'Yo voy para NY mañana con carga de produce', created_at: '2026-04-08T10:00:00Z', status: 'read' },
      { id: 'gr2-004', sender_id: 'u-014', type: 'text', body: 'Revisen la temperatura a tiempo, tuve un problema con un cargador en Philly', created_at: '2026-04-09T07:00:00Z' },
      { id: 'gr2-005', sender_id: 'u-003', type: 'text', body: 'Importante! Siempre documenten temp al recoger y entregar 📷', created_at: '2026-04-10T08:00:00Z' },
    ],
  },
];

// Helper: get all conversations for a given user, sorted by most recent message
export const getConversationsForUser = (userId) =>
  mockConversations
    .filter(c => c.participant_ids.includes(userId))
    .sort((a, b) => {
      const aLast = a.messages[a.messages.length - 1]?.created_at || '';
      const bLast = b.messages[b.messages.length - 1]?.created_at || '';
      return bLast.localeCompare(aLast);
    });

// Helper: get conversation between two users
export const getConversation = (uid1, uid2) =>
  mockConversations.find(c =>
    c.participant_ids.includes(uid1) && c.participant_ids.includes(uid2)
  ) || null;

// Helper: total unread count for a user
export const getTotalUnreadCount = (userId) =>
  mockConversations
    .filter(c => c.participant_ids.includes(userId))
    .reduce((sum, c) => sum + c.unread_count, 0);

// Helper: get other participant in a conversation
export const getOtherUserId = (conversation, myUserId) =>
  conversation.participant_ids.find(id => id !== myUserId);

// Helper: get groups for a user
export const getGroupsForUser = (userId) =>
  mockGroups.filter(g => g.members.includes(userId))
    .sort((a, b) => new Date(b.last_message_at) - new Date(a.last_message_at));
