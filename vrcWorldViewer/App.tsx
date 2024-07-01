import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import WorldInfoComponent from './src/component/worldViewer';
import WorldLogViewer from './src/component/worldLogViewer'; // この新しいコンポーネントを作成する必要があります

const App: React.FC = () => {
  return (
      <Routes>
        <Route path="/" element={<WorldInfoComponent />} />
        <Route path="/worldLogs" element={<WorldLogViewer />} />
      </Routes>
  );
};

export default App;