import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Founders from './pages/Founders';
import Gallery from './pages/Gallery';
import Events from './pages/Events';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import ScrollToTop from './components/ScrollToTop';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <div className="App">
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/founders" element={<Founders />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/events" element={<Events />} />
          </Route>
          <Route element={<AdminLayout />}>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<Admin />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
};

export default App;
