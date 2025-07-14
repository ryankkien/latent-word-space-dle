import './App.css'
import { Game } from './components/Game'
import { ThemeProvider } from './hooks/useTheme'

function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <Game />
    </ThemeProvider>
  )
}

export default App
