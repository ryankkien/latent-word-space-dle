import './App.css'
import { DailyGame } from './components/DailyGame'
import { ThemeProvider } from './hooks/useTheme'

function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <DailyGame />
    </ThemeProvider>
  )
}

export default App
