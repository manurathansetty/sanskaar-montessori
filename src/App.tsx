import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Founders from './pages/Founders';
import Gallery from './pages/Gallery';
import Events from './pages/Events';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';
import AdminImages from './pages/admin/AdminImages';
import AdminImagesCategory from './pages/admin/AdminImagesCategory';
import AdminSlotRouter from './pages/admin/AdminSlotRouter';
import AdminSettings from './pages/admin/AdminSettings';
import AdminEvents from './pages/admin/AdminEvents';
import AdminEventEdit from './pages/admin/AdminEventEdit';
import AdminCategories from './pages/admin/AdminCategories';
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
            <Route path="/admin/images" element={<AdminImages />} />
            <Route path="/admin/images/:category" element={<AdminImagesCategory />} />
            <Route path="/admin/images/:category/:slot" element={<AdminSlotRouter />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/events" element={<AdminEvents />} />
            <Route path="/admin/events/:id" element={<AdminEventEdit />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
};

export default App;
