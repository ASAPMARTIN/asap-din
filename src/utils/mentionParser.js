// Mention format in stored text: [broker_id:display_name]
// Example: "Cuidado con [b-006:Fast Lane Brokers] MC-765432"
// This returns an array of segments: { type: 'text'|'mention', content, brokerId, brokerName }

export function parseMentions(text) {
  if (!text) return [{ type: 'text', content: '' }];

  const mentionRegex = /\[([^:]+):([^\]]+)\]/g;
  const segments = [];
  let lastIndex = 0;
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    // Text before mention
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        content: text.slice(lastIndex, match.index),
      });
    }

    segments.push({
      type: 'mention',
      brokerId: match[1],
      brokerName: match[2],
      content: `@${match[2]}`,
    });

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
