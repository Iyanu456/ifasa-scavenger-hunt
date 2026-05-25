export function watNow() {
  const now = new Date();
  const wat = new Date(now.getTime() + 60 * 60 * 1000);
  return wat.toISOString().replace('T', ' ').substring(0, 19) + ' WAT';
}
