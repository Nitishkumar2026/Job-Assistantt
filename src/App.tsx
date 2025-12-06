import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { ChatInterface } from './components/whatsapp/ChatInterface';
import { DocsPage } from './pages/DocsPage';
import { DatabasePage } from './pages/DatabasePage';

function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-slate-50 font-sans">
        <Sidebar />
        <main className="flex-1 h-full overflow-hidden relative">
          <Routes>
            <Route path="/" element={<div className="h-full max-w-md mx-auto border-x border-gray-200 shadow-2xl"><ChatInterface /></div>} />
            <Route path="/docs" element={<DocsPage />} />
            <Route path="/database" element={<DatabasePage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
