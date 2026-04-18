import React, { useEffect, useState } from 'react';
import { dashboardService } from '../services';
import useAuthStore from '../store/auth';
import StatCard from '../components/StatCard';
import ActivityList from '../components/ActivityList';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        let response;
        switch (user?.role) {
          case 'ADMIN':
            response = await dashboardService.getAdmin();
            break;
          case 'DIRECTOR':
            response = await dashboardService.getDirector();
            break;
          case 'SERVICE_HEAD':
            response = await dashboardService.getServiceHead();
            break;
          case 'FIELD_AGENT':
            response = await dashboardService.getFieldAgent();
            break;
          case 'COMMUNICATION':
            response = await dashboardService.getCommunication();
            break;
          default:
            response = { data: null };
        }
        setData(response?.data || null);
      } catch (error) {
        console.error('Dashboard error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user]);

  // Mock data for visualisation when API empty
  const mockStats = {
    activeProjects: 24,
    totalTasks: 412,
    completionRate: 78,
    teamMembers: 18,
    recentActivities: [
      { id: 'a1', initials: 'JD', title: 'Tâche #132 marquée comme terminée', subtitle: 'Projet: Assainissement', time: '2h' },
      { id: 'a2', initials: 'SM', title: 'Nouveau document ajouté', subtitle: 'Rapport financier', time: '6h' },
      { id: 'a3', initials: 'AR', title: 'Formulaire soumis', subtitle: 'Requête terrain', time: '1j' }
    ]
  };

  const stats = data || mockStats;

  if (loading) return <div className="flex items-center justify-center h-screen">Chargement...</div>;

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Tableau de bord</h1>
          <p className="text-sm text-gray-500">Vue d'ensemble des activités et indicateurs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Projets actifs" value={stats.activeProjects} delta={3} />
        <StatCard title="Tâches totales" value={stats.totalTasks} delta={-1} />
        <StatCard title="Taux de complétion" value={`${stats.completionRate}%`} delta={2} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Activité récente</h2>
          <ActivityList items={stats.recentActivities} />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Statistiques rapides</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Équipe</span>
              <span className="font-medium">{stats.teamMembers}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Projets en retard</span>
              <span className="font-medium">3</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Formulaires non lus</span>
              <span className="font-medium">7</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
