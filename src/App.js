import './App.css';
import EditManifest from './pages/editManifest'
import NewModuleModal from './pages/newModuleModal'
import {
  Routes,
  Route
} from "react-router-dom";
function App() {
  return (
    <div className="App">
      
        <Routes>
            <Route path="/" exact element={<EditManifest></EditManifest>}/>
            <Route path="/newModuleModal"  element={<NewModuleModal></NewModuleModal>} />
        </Routes>
    </div>
  );
}

export default App;
