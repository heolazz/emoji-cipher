import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Host from './pages/Host';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/host" element={<Host />} />
        {/* Akan ditambahkan path /join di task berikutnya */}
      </Routes>
    </BrowserRouter>
  )
}

export default App;
