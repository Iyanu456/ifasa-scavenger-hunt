export function formatTime(watString) {
  if (!watString) return '—';
  return watString.replace(' WAT', '').trim();
}
