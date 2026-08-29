export function useAvatar() {
  function seedOf(seed: string | null | undefined): string {
    const s = String(seed || 'user')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]/g, '')
    return s || 'user'
  }

  function avatarUrl(seed: string | null | undefined, style = 'avataaars'): string {
    return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seedOf(seed))}`
  }

  return { avatarUrl, seedOf }
}
