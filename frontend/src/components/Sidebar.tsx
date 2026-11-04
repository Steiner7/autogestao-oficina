import { NavLink, Link } from "react-router-dom";
import { FiUsers, FiTruck, FiClipboard, FiLogOut, FiSettings } from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";
import "./Sidebar.css";

export default function Sidebar() {
  const { usuario, sair } = useAuth();
  return (
    <aside className="sidebar" aria-label="Menu principal">
      <div className="sidebar-inner">
        <Link to="/clientes" className="sidebar-brand">
          <span className="sidebar-brand-icon"><FiSettings aria-hidden="true" /></span>
          <span>Auto<span className="sidebar-brand-accent">Gestão</span></span>
        </Link>
        <p className="sidebar-section-title">GERENCIAMENTO</p>
        <nav className="sidebar-nav" aria-label="Navegação do sistema">
          <NavLink to="/clientes" className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}>
            <FiUsers aria-hidden="true" /><span>Clientes</span>
          </NavLink>
          <NavLink to="/veiculos" className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}>
            <FiTruck aria-hidden="true" /><span>Veículos</span>
          </NavLink>
          <NavLink to="/ordens-servico" className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}>
            <FiClipboard aria-hidden="true" /><span>Ordens de Serviço</span>
          </NavLink>
        </nav>
        <div className="sidebar-bottom">
          <Link to="/" className="sidebar-link" onClick={sair}><FiLogOut aria-hidden="true" /><span>Sair</span></Link>
          {usuario && <p className="sidebar-disclaimer">Conectado como {usuario.nome}</p>}
        </div>
      </div>
    </aside>
  );
}
