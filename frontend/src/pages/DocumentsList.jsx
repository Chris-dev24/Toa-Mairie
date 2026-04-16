import React, { useEffect, useState, useCallback } from 'react';
import { documentService } from '../services';
import { toast } from 'react-toastify';

const DocumentsList = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await documentService.getAll({ category: category || undefined });
      setDocuments(response.data || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des documents');
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleDownload = (document) => {
    window.open(document.filePath, '_blank');
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('word')) return '📝';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
    return '📁';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Chargement...</div>;
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Documents</h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Télécharger
          </button>
        </div>

        <div className="mb-6">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">Toutes les catégories</option>
            <option value="POLICY">Politique</option>
            <option value="PROCEDURE">Procédure</option>
            <option value="REPORT">Rapport</option>
            <option value="OTHER">Autre</option>
          </select>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Titre</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Taille</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Catégorie</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{getFileIcon(doc.fileType)}</span>
                      <span className="font-medium">{doc.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{doc.fileType}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatFileSize(doc.fileSize)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{doc.category || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => handleDownload(doc)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Télécharger
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {documents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Aucun document trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentsList;
