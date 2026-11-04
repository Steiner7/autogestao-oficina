import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/login/Login";
import Sidebar from "./components/Sidebar";
import RotaProtegida from "./components/RotaProtegida";
import { AuthProvider } from "./contexts/AuthContext";
import "./App.css";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          {/* Página de clientes provisória, até o CRUD ser conectado. */}
          <Route path="/clientes" element={
            <RotaProtegida>
              <div className="sistema-layout"><Sidebar />
                <main style={{ padding: 40 }}>
                  <header className="page-header"><h1>Clientes</h1><p>Página em construção.</p></header>
                </main>
              </div>
            </RotaProtegida>
          } />
          <Route path="*" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
