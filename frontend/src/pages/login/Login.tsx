import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiLock, FiUser, FiSettings } from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";
import { mensagemDeErro } from "../../services/api";
import "./Login.css";

export default function Login() {
  const { token, entrar: autenticar } = useAuth();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function entrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!usuario.trim() || !senha.trim()) {
      setMensagem("Preencha o usuário e a senha.");
      return;
    }
    setEnviando(true);
    setMensagem("");
    try {
      await autenticar(usuario.trim(), senha);
      navigate("/dashboard", { replace: true });
    } catch (erro) {
      setMensagem(mensagemDeErro(erro));
    } finally {
      setEnviando(false);
    }
  }

  if (token) return <Navigate to="/dashboard" replace />;

  return (
    <div className="login-layout">
      <section className="login-hero" aria-label="Apresentação do AutoGestão">
        <div className="login-hero-body">
          <div className="login-hero-icon"><FiSettings aria-hidden="true" /></div>
          <h1>AutoGestão</h1>
          <p>Gestão inteligente para sua oficina mecânica.</p>
          <span>Mais organização para o seu dia a dia.</span>
        </div>
        <small>AutoGestão • Sistema de oficina mecânica</small>
      </section>
      <main className="login-main">
        <div className="login-panel">
          <span className="login-mini-brand"><FiSettings aria-hidden="true" /> AutoGestão</span>
          <h2>Bem-vindo de volta!</h2>
          <p className="login-subtitle">Entre com seus dados para acessar o sistema.</p>
          <form onSubmit={entrar} className="login-form">
            <label htmlFor="login-usuario">Usuário</label>
            <div className="login-input-wrap">
              <FiUser aria-hidden="true" />
              <input id="login-usuario" value={usuario} onChange={(e) => setUsuario(e.target.value)} placeholder="Digite seu usuário" autoComplete="username" required />
            </div>
            <label htmlFor="login-senha">Senha</label>
            <div className="login-input-wrap">
              <FiLock aria-hidden="true" />
              <input id="login-senha" type={mostrarSenha ? "text" : "password"} value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Digite sua senha" autoComplete="current-password" required />
              <button type="button" className="login-toggle-password" onClick={() => setMostrarSenha(!mostrarSenha)} aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}>
                {mostrarSenha ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            <button type="submit" className="login-submit" disabled={enviando}>{enviando ? "Entrando..." : "Entrar"}</button>
          </form>
          {mensagem && <p className="login-message" role="status">{mensagem}</p>}
        </div>
      </main>
    </div>
  );
}
