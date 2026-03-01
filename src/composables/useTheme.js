import { ref } from 'vue'

// Singleton - shared across all components
const isDark = ref(true)

const applyTheme = (dark) => {
  const html = document.documentElement
  if (dark) {
    html.classList.add('dark')
    html.classList.remove('light')
  } else {
    html.classList.remove('dark')
    html.classList.add('light')
  }
  localStorage.setItem('algs-theme', dark ? 'dark' : 'light')
}

// Initialize from localStorage on first import
const saved = localStorage.getItem('algs-theme')
isDark.value = saved ? saved === 'dark' : true
applyTheme(isDark.value)

export function useTheme() {
  const toggleTheme = () => {
    isDark.value = !isDark.value
    applyTheme(isDark.value)
  }

  return { isDark, toggleTheme }
}
