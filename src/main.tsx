import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, createBrowserRouter, RouterProvider } from 'react-router-dom'
import { useThemeStore } from './stores/themeStore'
import App from './App.tsx'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
})

// Initialize theme on app start
const initializeTheme = () => {
  const stored = localStorage.getItem('theme-storage')
  if (stored) {
    try {
      const { state } = JSON.parse(stored)
      if (state?.isDarkMode) {
        document.documentElement.classList.add('dark')
      }
    } catch (e) {
      // Ignore parsing errors
    }
  }
}

initializeTheme()

// Create router with future flags to suppress warnings
const router = createBrowserRouter([
  {
    path: "*",
    element: <App />,
  }
], {
  future: {
    v7_relativeSplatPath: true,
  }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
)