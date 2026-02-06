import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formService } from '../services';
import { toast } from 'react-toastify';

const FormsList = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetchForms();
  }, [status]);

  const fetchForms = async () => {
    try {
      setLoading(true);
      const response = await formService.getAll({ status: status || undefined });
      setForms(response.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors du chargement des formulaires');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'DRAFT':
        return 'bg-blue-100 text-blue-800';
      case 'ARCHIVED':
        return 'bg-gray-100 text-gray-800';
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
          <h1 className="text-4xl font-bold">Formulaires</h1>
          <Link
            to="/forms/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Nouveau Formulaire
          </Link>
        </div>

        <div className="mb-6">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">Tous les statuts</option>
            <option value="DRAFT">Brouillon</option>
            <option value="ACTIVE">Actif</option>
            <option value="ARCHIVED">Archivé</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map((form) => (
            <Link
              key={form.id}
              to={`/forms/${form.id}`}
              className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
            >
              <h3 className="text-xl font-bold mb-2">{form.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{form.description}</p>
              
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(form.status)}`}>
                  {form.status}
                </span>
                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                  {form.allowOffline ? 'Offline' : 'Online'}
                </span>
              </div>

              {form.creator && (
                <p className="text-xs text-gray-600">
                  Créé par {form.creator.firstName} {form.creator.lastName}
                </p>
              )}
            </Link>
          ))}
        </div>

        {forms.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Aucun formulaire trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormsList;
