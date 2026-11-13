import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/login/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import Clientes from "./pages/clientes/Clientes";
import Veiculos from "./pages/veiculos/Veiculos";
import OrdensServico from "./pages/ordensServico/OrdensServico";
import RotaProtegida from "./components/RotaProtegida";
import { AuthProvider } from "./contexts/AuthContext";
import { ClientesProvider } from "./contexts/ClientesContext";
import { VeiculosProvider } from "./contexts/VeiculosContext";
import { OrdensServicoProvider } from "./contexts/OrdensServicoContext";
import "./App.css";

export default function App() {
  return (
    <AuthProvider>
      <ClientesProvider>
        <VeiculosProvider>
          <OrdensServicoProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/dashboard" element={<RotaProtegida><Dashboard /></RotaProtegida>} />
                <Route path="/clientes" element={<RotaProtegida><Clientes /></RotaProtegida>} />
                <Route path="/veiculos" element={<RotaProtegida><Veiculos /></RotaProtegida>} />
                <Route path="/ordens-servico" element={<RotaProtegida><OrdensServico /></RotaProtegida>} />
                <Route path="*" element={<Login />} />
              </Routes>
            </BrowserRouter>
          </OrdensServicoProvider>
        </VeiculosProvider>
      </ClientesProvider>
    </AuthProvider>
  );
}
