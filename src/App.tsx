import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Akan ditambahkan path /host dan /join di task berikutnya */}
      </Routes>
    </BrowserRouter>
  )
}

export default App;
