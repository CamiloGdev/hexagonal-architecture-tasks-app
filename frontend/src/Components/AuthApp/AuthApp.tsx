import './AuthApp.css';
import { authService } from '../../lib/services';
import LoginRegister from '../LoginRegister/LoginRegister';
import TaskManager from '../TaskManager/TaskManager';

const AuthApp: React.FC = () => {
  const { data: user, isLoading, error } = authService.useCurrentUser();

  // Debug logs
  console.log(
    'AuthApp render - isLoading:',
    isLoading,
    'user:',
    user,
    'error:',
    error,
  );

  // Show loading state while checking authentication
  if (isLoading) {
    console.log('AuthApp: Showing loading state');
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Verificando autenticación...</p>
      </div>
    );
  }

  // If there's an error or no user, show login/register
  if (error || !user) {
    console.log('AuthApp: Showing login/register - no user or error');
    return <LoginRegister />;
  }

  // User is authenticated, show task manager
  console.log('AuthApp: Showing task manager for user:', user.name);
  return <TaskManager user={user} />;
};

export default AuthApp;
