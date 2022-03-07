import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";
import { PresenterForm } from "./PresenterForm";
import { ParticipantForm } from "./ParticipantForm";

export default function App() {
  return (
    <div className="App container">
      <div className="row">
        <h1>Storypointing Poll</h1>
      </div>
      <div className="row">
        <Router>
          <Routes>
            <Route path='/presenter' element={<PresenterForm />} />
            <Route path='/' element={<ParticipantForm />} />
          </Routes>
        </Router>
      </div>
    </div>
  );
}
