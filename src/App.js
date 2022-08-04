import './App.css';
import EditManifest from './pages/editManifest'
import NewModuleModal from './pages/newModuleModal'
import SaveConfirmModal from './pages/saveConfirm'
import {
  HashRouter,
  Routes,
  Route
} from "react-router-dom";
function App() {
  return (
    <div className="App">
        <HashRouter hashType="noslash">
          <Routes>
              <Route path="/" exact element={<EditManifest></EditManifest>}/>
              <Route path="/newModuleModal"  element={<NewModuleModal></NewModuleModal>} />
              <Route path="/saveConfirm"  element={<SaveConfirmModal></SaveConfirmModal>} />
          </Routes>
        </HashRouter>
    </div>
  );
}

export default App;
