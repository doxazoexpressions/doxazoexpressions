import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";

export const GATE_MESSAGE =
  "Create a free account to use your personal spiritual tools.";

/**
 * Signed-out visitors are sent to /auth (same behaviour on web and native).
 * Data protection stays in database rules; this only controls page access.
 */
const RequireAuth = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return <div className="min-h-screen bg-background" aria-busy="true" />;
  }
  if (!user) {
    const next = location.pathname + location.search;
    return <Navigate to={`/auth?gate=1&next=${encodeURIComponent(next)}`} replace />;
  }
  return <>{children}</>;
};

export default RequireAuth;
