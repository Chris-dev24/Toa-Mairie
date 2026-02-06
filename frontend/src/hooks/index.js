import { useState, useEffect } from 'react';
import { projectService, taskService, formService } from '../services';
import { toast } from 'react-toastify';

/**
 * Hook pour récupérer et gérer les projets
 */
export const useProjects = (filters = {}) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, [filters]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectService.getAll(filters);
      setProjects(response.data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      toast.error('Erreur lors du chargement des projets');
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (data) => {
    try {
      const response = await projectService.create(data);
      setProjects([...projects, response.data]);
      toast.success('Projet créé avec succès');
      return response.data;
    } catch (err) {
      toast.error('Erreur lors de la création du projet');
      throw err;
    }
  };

  const updateProject = async (id, data) => {
    try {
      const response = await projectService.update(id, data);
      setProjects(projects.map((p) => (p.id === id ? response.data : p)));
      toast.success('Projet mis à jour');
      return response.data;
    } catch (err) {
      toast.error('Erreur lors de la mise à jour');
      throw err;
    }
  };

  const deleteProject = async (id) => {
    try {
      await projectService.delete(id);
      setProjects(projects.filter((p) => p.id !== id));
      toast.success('Projet supprimé');
    } catch (err) {
      toast.error('Erreur lors de la suppression');
      throw err;
    }
  };

  return {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
  };
};

/**
 * Hook pour récupérer et gérer les tâches
 */
export const useTasks = (filters = {}) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await taskService.getAll(filters);
      setTasks(response.data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      toast.error('Erreur lors du chargement des tâches');
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (data) => {
    try {
      const response = await taskService.create(data);
      setTasks([...tasks, response.data]);
      toast.success('Tâche créée');
      return response.data;
    } catch (err) {
      toast.error('Erreur lors de la création de la tâche');
      throw err;
    }
  };

  const updateTask = async (id, data) => {
    try {
      const response = await taskService.update(id, data);
      setTasks(tasks.map((t) => (t.id === id ? response.data : t)));
      toast.success('Tâche mise à jour');
      return response.data;
    } catch (err) {
      toast.error('Erreur lors de la mise à jour');
      throw err;
    }
  };

  const deleteTask = async (id) => {
    try {
      await taskService.delete(id);
      setTasks(tasks.filter((t) => t.id !== id));
      toast.success('Tâche supprimée');
    } catch (err) {
      toast.error('Erreur lors de la suppression');
      throw err;
    }
  };

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  };
};

/**
 * Hook pour récupérer et gérer les formulaires
 */
export const useForms = (filters = {}) => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchForms();
  }, [filters]);

  const fetchForms = async () => {
    try {
      setLoading(true);
      const response = await formService.getAll(filters);
      setForms(response.data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      toast.error('Erreur lors du chargement des formulaires');
    } finally {
      setLoading(false);
    }
  };

  const submitForm = async (formId, data) => {
    try {
      const response = await formService.submit(formId, data);
      toast.success('Formulaire soumis avec succès');
      return response.data;
    } catch (err) {
      toast.error('Erreur lors de la soumission');
      throw err;
    }
  };

  return {
    forms,
    loading,
    error,
    fetchForms,
    submitForm,
  };
};

/**
 * Hook pour gérer un chargement avec retry
 */
export const useFetch = (fetchFn, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retrying, setRetrying] = useState(false);

  const fetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err);
      toast.error(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const retry = async () => {
    setRetrying(true);
    await fetch();
    setRetrying(false);
  };

  useEffect(() => {
    fetch();
  }, dependencies);

  return { data, loading, error, retry, retrying };
};

/**
 * Hook pour debouncer les recherches
 */
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook pour gérer la pagination
 */
export const usePagination = (items, itemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = items.slice(startIndex, endIndex);

  const goToPage = (page) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNumber);
  };

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);

  return {
    currentPage,
    totalPages,
    currentItems,
    goToPage,
    nextPage,
    prevPage,
  };
};
