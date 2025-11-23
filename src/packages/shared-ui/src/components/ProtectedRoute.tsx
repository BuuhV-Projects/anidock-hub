import { Navigate } from 'react-router-dom';

// Note: useAuth should be provided by the consuming app
// This component will need to receive auth state as props or context
export interface ProtectedRouteProps {
  children: React.ReactNode;
  user: any;
  loading: boolean;
}

export const ProtectedRoute = ({ children, user, loading }: ProtectedRouteProps) => {
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};
