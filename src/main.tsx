import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import CropRotationOptimizer from './crops.tsx'
import { ThemeProvider } from "@/components/theme-provider.tsx"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <CropRotationOptimizer />
      </ThemeProvider>
    </StrictMode>,
)
