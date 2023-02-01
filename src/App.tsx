import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";
import { PresenterForm } from "./PresenterForm";
import { ParticipantForm } from "./ParticipantForm";
import { Col, Row, Toast, ToastContainer } from "react-bootstrap";
import { createContext, useMemo, useState } from "react";

export const AppContext = createContext({} as any);

export default function App() {
  const [toast, setToast] = useState("");
  const appContext = useMemo(() => ({ toast, setToast }), [toast, setToast]);
  return (
    <AppContext.Provider value={appContext}>
      <div className="App container">
        <Row>
          <h1>Storypointing Poll</h1>
        </Row>
        <Row>
          <Router>
            <Routes>
              <Route path="/presenter" element={<PresenterForm />} />
              <Route path="/" element={<ParticipantForm />} />
            </Routes>
          </Router>
        </Row>
        <ToastContainer className="p-3" position={"top-end"}>
          <Toast
            onClose={() => setToast("")}
            show={toast !== ""}
            delay={3000}
            autohide
          >
            <Toast.Header>
              <strong className="me-auto">Message</strong>
            </Toast.Header>
            <Toast.Body>{toast}</Toast.Body>
          </Toast>
        </ToastContainer>
      </div>
    </AppContext.Provider>
  );
}
