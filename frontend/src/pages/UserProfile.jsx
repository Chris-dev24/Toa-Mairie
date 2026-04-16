import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { userService, taskService } from '../services';
import { toast } from 'react-toastify';
import useAuthStore from '../store/auth';

const UserProfile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuthStore();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = id || currentUser?.id;

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      const userResponse = await userService.getById(userId);
      setUser(userResponse.data);
      
      // Fetch user's tasks
      const tasksResponse = await taskService.getAll({ assignedTo: userId });
      setTasks(tasksResponse.data || []);
    } catch (error) {
      toast.error('Erreur lors du chargement du profil utilisateur');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId, fetchUserData]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Chargement...</div>;
  }

  if (!user) {
    return <div className="flex items-center justify-center h-screen">Utilisateur non trouvé</div>;
  }

  const getRoleLabel = (role) => {
    const roleLabels = {
      ADMIN: 'Administrateur',
      DIRECTOR: 'Directeur',
      SERVICE_HEAD: 'Chef de Service',
      SECRETARY: 'Secrétaire',
      COMMUNICATION: 'Communication',
      FIELD_AGENT: 'Agent Terrain'
    };
    return roleLabels[role] || role;
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mr-6">
                <span className="text-4xl font-bold text-blue-600">
                  {user.firstName[0]}{user.lastName[0]}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>
            {currentUser?.id === user.id && (
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Modifier le profil
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-600 text-sm">Rôle</p>
              <p className="text-lg font-semibold">{getRoleLabel(user.role)}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Département</p>
              <p className="text-lg font-semibold">{user.department || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Téléphone</p>
              <p className="text-lg font-semibold">{user.phone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Dernier accès</p>
              <p className="text-lg font-semibold">
                {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('fr-FR') : 'Jamais'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Tâches assignées</h2>
          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div>
                  <h3 className="font-semibold">{task.title}</h3>
                  <p className="text-sm text-gray-600">{task.description}</p>
                </div>
                <span className={`px-2 py-1 rounded text-sm font-medium ${
                  task.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                  task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {task.status}
                </span>
              </div>
            ))}
            {tasks.length === 0 && (
              <p className="text-gray-600 text-center py-4">Aucune tâche assignée</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
