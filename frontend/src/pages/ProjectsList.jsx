import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectService } from '../services';
import { toast } from 'react-toastify';

const ProjectsList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', priority: '', page: 1, limit: 20 });

  useEffect(() => {
    fetchProjects();
  }, [filters]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectService.getAll(filters);
      setProjects(response.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors du chargement des projets');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'ON_HOLD':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Chargement...</div>;
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Projets</h1>
          <Link
            to="/projects/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Nouveau Projet
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">Tous les statuts</option>
            <option value="PLANNING">Planification</option>
            <option value="IN_PROGRESS">En cours</option>
            <option value="ON_HOLD">En attente</option>
            <option value="COMPLETED">Complété</option>
            <option value="CANCELLED">Annulé</option>
          </select>
          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value, page: 1 })}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">Toutes les priorités</option>
            <option value="LOW">Basse</option>
            <option value="MEDIUM">Moyen</option>
            <option value="HIGH">Haute</option>
            <option value="CRITICAL">Critique</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
            >
              <h3 className="text-xl font-bold mb-2">{project.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{project.description}</p>
              
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
                <span className="text-sm text-gray-500">{project.priority}</span>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progrès</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              {project.creator && (
                <p className="text-xs text-gray-600">
                  Créé par {project.creator.firstName} {project.creator.lastName}
                </p>
              )}
            </Link>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Aucun projet trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsList;
