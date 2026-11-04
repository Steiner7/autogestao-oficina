import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function RotaProtegida({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/" replace />;
}
