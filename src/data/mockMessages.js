const now = new Date('2026-04-08T10:00:00Z');
const minsAgo = (m) => new Date(now - m * 60000).toISOString();
const hoursAgo = (h) => new Date(now - h * 3600000).toISOString();
const daysAgo = (d) => new Date(now - d * 86400000).toISOString();

export const mockConversations = [
  {
    id: 'conv-001',
    participant_ids: ['u-001', 'u-007'], // Roberto ↔ Reinaldo Fuentes
    messages: [
      {
        id: 'msg-001',
        sender_id: 'u-007',
        text: 'Hermano, cuidado con el broker que te mandé ayer. No me han pagado todavía.',
        created_at: daysAgo(2),
      },
      {
        id: 'msg-002',
        sender_id: 'u-001',
        text: 'Gracias por el aviso. Yo casi les acepto una carga ayer.',
        created_at: daysAgo(2),
      },
      {
        id: 'msg-003',
        sender_id: 'u-007',
        text: 'Mejor busca en DIN antes de aceptar. Tienen 3 reportes de doble brokerage.',
        created_at: daysAgo(2),
      },
      {
        id: 'msg-004',
        sender_id: 'u-001',
        text: 'Ya los busqué. Tienen autoridad activa pero mucho negativo. Los evito.',
        created_at: daysAgo(2),
      },
      {
        id: 'msg-005',
        sender_id: 'u-007',
        text: '¿Tienes carga para la semana que viene hacia Atlanta?',
        created_at: hoursAgo(4),
      },
    ],
    unread_count: 1, // 1 unread for u-001 (last message from u-007)
  },
  {
    id: 'conv-002',
    participant_ids: ['u-001', 'u-003'], // Roberto ↔ Ana Lucia Torres
    messages: [
      {
        id: 'msg-010',
        sender_id: 'u-003',
        text: 'Roberto, vi tu publicación sobre Medley. Yo también los demandé el año pasado.',
        created_at: daysAgo(5),
      },
      {
        id: 'msg-011',
        sender_id: 'u-001',
        text: '¿En serio? ¿Ganaste el caso? Cuéntame cómo fue el proceso.',
        created_at: daysAgo(5),
      },
      {
        id: 'msg-012',
        sender_id: 'u-003',
        text: 'Sí. Small claims court. $3,200 recuperados. Sin abogado. Te explico cuando pueda.',
        created_at: daysAgo(4),
      },
      {
        id: 'msg-013',
        sender_id: 'u-001',
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
        text: 'Roberto! ¿Vas a ir al meetup de camioneros en Hialeah este viernes?',
        created_at: hoursAgo(6),
      },
      {
        id: 'msg-021',
        sender_id: 'u-001',
        text: '¿A qué hora es? No sabía del meetup.',
        created_at: hoursAgo(5),
      },
      {
        id: 'msg-022',
        sender_id: 'u-010',
        text: 'Viernes 7pm en el Mexican Food de la 49 y Okeechobee. Lo organiza Hector.',
        created_at: hoursAgo(5),
      },
      {
        id: 'msg-023',
        sender_id: 'u-001',
        text: 'Ahí estaré. Manda la dirección exacta cuando puedas.',
        created_at: hoursAgo(3),
      },
      {
        id: 'msg-024',
        sender_id: 'u-010',
        text: '4901 W Okeechobee Rd, Hialeah. Hay parking en el back. Nos vemos!',
        created_at: hoursAgo(2),
      },
      {
        id: 'msg-025',
        sender_id: 'u-010',
        text: 'Y trae la tarjeta del nuevo MC que te hiciste 😄',
        created_at: minsAgo(45),
      },
    ],
    unread_count: 2, // 2 unread (last 2 messages from u-010)
  },
  {
    id: 'conv-004',
    participant_ids: ['u-001', 'u-005'], // Roberto ↔ Jorge Luis Peña
    messages: [
      {
        id: 'msg-030',
        sender_id: 'u-005',
        text: 'Roberto, ¿tienes referencias de algún broker bueno para rutas de tanker en Florida?',
        created_at: daysAgo(1),
      },
      {
        id: 'msg-031',
        sender_id: 'u-001',
        text: 'Sí, mira a Quality Carriers y a Trimac. Los dos pagan bien y son puntuales.',
        created_at: daysAgo(1),
      },
      {
        id: 'msg-032',
        sender_id: 'u-005',
        text: 'Perfecto. ¿Tienes el contacto de alguien en Quality?',
        created_at: minsAgo(30),
      },
    ],
    unread_count: 1,
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
