// Mention format in stored text: [broker_id:display_name] for brokers
// User mention format: {u-XXX:Display Name}
// This returns an array of segments: { type: 'text'|'mention'|'user_mention', content, brokerId, brokerName, userId, userName }

export function parseMentions(text) {
  if (!text) return [{ type: 'text', content: '' }];

  // Combined regex: broker mentions [b-xxx:name] and user mentions {u-xxx:name}
  const combinedRegex = /\[([^:]+):([^\]]+)\]|\{(u-[^:]+):([^}]+)\}/g;
  const segments = [];
  let lastIndex = 0;
  let match;

  while ((match = combinedRegex.exec(text)) !== null) {
    // Text before mention
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        content: text.slice(lastIndex, match.index),
      });
    }

    if (match[1] !== undefined) {
      // Broker mention [id:name]
      segments.push({
        type: 'mention',
        brokerId: match[1],
        brokerName: match[2],
        content: `@${match[2]}`,
      });
    } else {
      // User mention {u-xxx:name}
      segments.push({
        type: 'user_mention',
        userId: match[3],
        userName: match[4],
        content: `@${match[4]}`,
      });
    }

    lastIndex = match.index + match[0].length;
  }

  // Remaining text
  if (lastIndex < text.length) {
    segments.push({
      type: 'text',
      content: text.slice(lastIndex),
    });
  }

  return segments.length > 0 ? segments : [{ type: 'text', content: text }];
}

// Extract broker IDs from a post body
export function extractMentionedBrokerIds(text) {
  if (!text) return [];
  const mentionRegex = /\[([^:]+):([^\]]+)\]/g;
  const ids = [];
  let match;
  while ((match = mentionRegex.exec(text)) !== null) {
    ids.push(match[1]);
  }
  return [...new Set(ids)];
}

// Format a broker mention for insertion into text
export function formatMention(brokerId, brokerName) {
  return `[${brokerId}:${brokerName}]`;
}
