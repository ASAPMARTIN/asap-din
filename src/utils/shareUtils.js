const APP_BASE_URL = 'https://app.asap-din.com';

export function getShareUrl(type, id) {
  switch (type) {
    case 'post': return `${APP_BASE_URL}/post/${id}`;
    case 'broker': return `${APP_BASE_URL}/broker/${id}`;
    case 'resource': return `${APP_BASE_URL}/guias/${id}`;
    default: return APP_BASE_URL;
  }
}

export function getShareTargets() {
  return [
    { id: 'whatsapp', label: 'WhatsApp', icon: 'message-circle', color: '#25D366' },
    { id: 'facebook', label: 'Facebook', icon: 'facebook', color: '#1877F2' },
    { id: 'telegram', label: 'Telegram', icon: 'send', color: '#26A5E4' },
    { id: 'sms', label: 'SMS', icon: 'message-square', color: '#34C759' },
    { id: 'messenger', label: 'Messenger', icon: 'message-circle', color: '#0084FF' },
    { id: 'tiktok', label: 'TikTok', icon: 'music', color: '#010101' },
    { id: 'instagram', label: 'Instagram', icon: 'instagram', color: '#E4405F' },
    { id: 'twitter', label: 'X (Twitter)', icon: 'twitter', color: '#000000' },
    { id: 'email', label: 'Email', icon: 'mail', color: '#6B7280' },
    { id: 'copy', label: 'Copiar enlace', icon: 'link', color: '#4B5563' },
  ];
}

export function buildShareLink(target, url, title) {
  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  switch (target) {
    case 'whatsapp': return `https://wa.me/?text=${encodedTitle}%20${encoded}`;
    case 'facebook': return `https://www.facebook.com/sharer/sharer.php?u=${encoded}`;
    case 'telegram': return `https://t.me/share/url?url=${encoded}&text=${encodedTitle}`;
    case 'twitter': return `https://twitter.com/intent/tweet?url=${encoded}&text=${encodedTitle}`;
    case 'email': return `mailto:?subject=${encodedTitle}&body=${encoded}`;
    default: return url;
  }
}
