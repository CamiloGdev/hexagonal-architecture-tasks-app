import type React from 'react';
import { FaEnvelope, FaSignOutAlt, FaUser } from 'react-icons/fa';
import type { AuthUser } from '../../lib/Auth';
import { authService } from '../../lib/services';
import './TaskManager.css';

interface TaskManagerProps {
  user: AuthUser;
}

const TaskManager: React.FC<TaskManagerProps> = ({ user }) => {
  const logoutMutation = authService.useLogout();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails on server, the mutation will clear local data
    }
  };

  return (
    <div className="task-manager">
      <div className="task-manager-header">
        <div className="header-content">
          <h1 className="app-title">Gestor de Tareas</h1>
          <div className="user-section">
            <div className="user-info">
              <div className="user-detail">
                <FaUser className="user-icon" />
                <span className="user-name">{user.name}</span>
              </div>
              <div className="user-detail">
                <FaEnvelope className="user-icon" />
                <span className="user-email">{user.email}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="logout-button"
              title="Cerrar sesión"
            >
              <FaSignOutAlt />
              {logoutMutation.isPending ? 'Cerrando...' : 'Cerrar Sesión'}
            </button>
          </div>
        </div>
      </div>

      <div className="task-manager-content">
        <div className="welcome-message">
          <h2>¡Bienvenido, {user.name}!</h2>
          <p>Tu sistema de gestión de tareas está listo para usar.</p>
          <div className="feature-placeholder">
            <p>🚀 Próximamente: Funcionalidades de gestión de tareas</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskManager;
