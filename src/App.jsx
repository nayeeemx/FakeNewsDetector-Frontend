import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardLayoutAccountSidebar from './components/Dashboard.jsx'; // Import main layout
import SentimentAnalyzer from './components/SentimentAnalizer.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Wrap all routes inside DashboardLayoutAccountSidebar */}
        <Route path="/" element={<DashboardLayoutAccountSidebar />}>
          <Route index element={<div>Mainboard Content</div>} />
          <Route path="sentiment" element={<SentimentAnalyzer />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
