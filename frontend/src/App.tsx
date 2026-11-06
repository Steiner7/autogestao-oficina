import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/login/Login";
import Clientes from "./pages/clientes/Clientes";
import RotaProtegida from "./components/RotaProtegida";
import { AuthProvider } from "./contexts/AuthContext";
import { ClientesProvider } from "./contexts/ClientesContext";
import "./App.css";

export default function App() {
  return (
    <AuthProvider>
      <ClientesProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/clientes" element={<RotaProtegida><Clientes /></RotaProtegida>} />
            <Route path="*" element={<Login />} />
          </Routes>
        </BrowserRouter>
      </ClientesProvider>
    </AuthProvider>
  );
}
