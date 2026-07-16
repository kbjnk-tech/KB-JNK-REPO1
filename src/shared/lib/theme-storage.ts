export type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'fx-teller-theme'

export function loadTheme(): ThemeMode {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === 'light' || raw === 'dark') return raw
  } catch {
    /* ignore */
  }
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

export function saveTheme(mode: ThemeMode): void {
  localStorage.setItem(STORAGE_KEY, mode)
}

export function applyTheme(mode: ThemeMode): void {
  document.documentElement.classList.toggle('dark', mode === 'dark')
}
