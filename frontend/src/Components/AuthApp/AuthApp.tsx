import './AuthApp.css';
import { authService } from '../../lib/services';
import LoginRegister from '../LoginRegister/LoginRegister';
import TaskManager from '../TaskManager/TaskManager';

const AuthApp: React.FC = () => {
  const { data: user, isLoading, error } = authService.useCurrentUser();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Verificando autenticación...</p>
      </div>
    );
  }

  // If there's an error or no user, show login/register
  if (error || !user) {
    return <LoginRegister />;
  }

  // User is authenticated, show task manager
  return <TaskManager user={user} />;
};

export default AuthApp;
