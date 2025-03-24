import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import SessionModal from "./components/SessionModal";
import TopBar from "./components/TopBar";
import LoginPage from "./pages/LoginPage";
import VerifyCode from "./pages/VerifyCode";
import QuestionsPage from "./pages/QuestionsPage";
import InvitationsPage from "./pages/InvitationsPage";
import TestPage from "./pages/TestPage";
import NotFoundPage from "./pages/NotFoundPage";
import AdminPanel from "./pages/AdminPanel";
const App = () => {
  return (
    <AuthProvider>
      <Router>
        <TopBar />
        <SessionModal />
        <div>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<VerifyCode />} />
            <Route path="/test/:link" element={<TestPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminPanel />
                </ProtectedRoute>
              }
            />
            <Route
              path="/questions"
              element={
                <ProtectedRoute>
                  <QuestionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/invitations"
              element={
                <ProtectedRoute>
                  <InvitationsPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div>Ładowanie...</div>;
  return user ? children : <Navigate to="/login" />;
};

export default App;
