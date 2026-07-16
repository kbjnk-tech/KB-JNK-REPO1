import { useEffect, useState } from 'react'
import {
  applyTheme,
  loadTheme,
  saveTheme,
  type ThemeMode,
} from '@/shared/lib'
import { Button } from './components'

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>('light')

  useEffect(() => {
    const initial = loadTheme()
    setTheme(initial)
    applyTheme(initial)
  }, [])

  function toggle() {
    const next: ThemeMode = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    saveTheme(next)
    applyTheme(next)
  }

  return (
    <Button
      type="button"
      className="bg-slate-700 hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-500"
      onClick={toggle}
      aria-label={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
    >
      {theme === 'dark' ? '라이트 모드' : '다크 모드'}
    </Button>
  )
}
