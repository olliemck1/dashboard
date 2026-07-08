import { useEffect, useState } from 'react';
import SpotifyWidget from './components/SpotifyWidget';


function App() {
  return (
    <div className ="App">
      <h1> Dashboard </h1>
      <SpotifyWidget/>
    </div>
  );
}

export default App;