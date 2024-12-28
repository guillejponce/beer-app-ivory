import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import BeerCounter from './pages/BeerCounter';
import Stats from './pages/Stats';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-blue-600 text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">Beer Counter</h1>
            <div className="space-x-4">
              <Link to="/" className="hover:text-blue-200">Counter</Link>
              <Link to="/stats" className="hover:text-blue-200">Stats</Link>
            </div>
          </div>
        </nav>

        <main className="container mx-auto p-4">
          <Routes>
            <Route path="/" element={<BeerCounter />} />
            <Route path="/stats" element={<Stats />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
