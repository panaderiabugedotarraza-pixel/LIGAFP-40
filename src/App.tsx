/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LeagueProvider } from './context/LeagueContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Calendar from './pages/Calendar';
import Standings from './pages/Standings';
import Admin from './pages/Admin';
import Teams from './pages/Teams';

export default function App() {
  return (
    <LeagueProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/standings" element={<Standings />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/teams" element={<Teams />} />
          </Routes>
        </Layout>
      </Router>
    </LeagueProvider>
  );
}
