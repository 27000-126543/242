import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Environment from './pages/Environment';
import Tasks from './pages/Tasks';
import Pests from './pages/Pests';
import Inventory from './pages/Inventory';
import Yield from './pages/Yield';
import Reports from './pages/Reports';
import UserManagement from './pages/Users';
import SystemSettings from './pages/Settings';

const App: React.FC = () => {
  return (
    <Router>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/environment" element={<Environment />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/pests" element={<Pests />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/yield" element={<Yield />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/settings" element={<SystemSettings />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;
