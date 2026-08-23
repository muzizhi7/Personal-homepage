export function resolveProfileAvatar(avatar: string, name: string) {
  const src = avatar.trim()
  return {
    src: src || null,
    initial: (name || '?').trim().charAt(0).toUpperCase() || '?',
  }
}
