import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import LiveTraffic from './pages/LiveTraffic';
import Intersections from './pages/Intersections';
import Vehicles from './pages/Vehicles';
import Incidents from './pages/Incidents';
import VideoFeeds from './pages/VideoFeeds';
import Analytics from './pages/Analytics';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="live" element={<LiveTraffic />} />
          <Route path="intersections" element={<Intersections />} />
          <Route path="vehicles" element={<Vehicles />} />
          <Route path="incidents" element={<Incidents />} />
          <Route path="feeds" element={<VideoFeeds />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
