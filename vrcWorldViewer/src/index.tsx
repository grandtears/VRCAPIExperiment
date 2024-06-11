import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import WorldInfoComponent from './component/worldViewer';

const App = () => {
  return(
    <div>
      <h1>VRChat World Viewer</h1>
      <WorldInfoComponent />
    </div>
  )
}
ReactDOM.render(<App />, document.getElementById('root'));