import { useState } from 'react';
import SpotifyWidget from './components/SpotifyWidget';
import AssignmentForm from './components/AssignmentForm';
import AssignmentList from './components/AssignmentList';



function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  return (
    <div className="App">
      <header>
        <SpotifyWidget/>
      </header>

      <main>
        <h1>Academic Tracker</h1>
        <AssignmentForm onAssignmentAdded={() => setRefreshTrigger(prev => prev+1)}/>
        <AssignmentList key={refreshTrigger}/>
      </main>
    </div>
  );
}

export default App;