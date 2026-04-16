import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { projectService } from '../services';
import { toast } from 'react-toastify';

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const response = await projectService.getById(id);
        setProject(response.data);
        setTasks(response.data.Tasks || []);
      } catch (error) {
        toast.error('Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">{project?.title}</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm">Status</h3>
            <p className="text-lg font-semibold mt-2">{project?.status}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm">Priority</h3>
            <p className="text-lg font-semibold mt-2">{project?.priority}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm">Progress</h3>
            <p className="text-lg font-semibold mt-2">{project?.progress}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${project?.progress}%` }}
              ></div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm">Tasks</h3>
            <p className="text-lg font-semibold mt-2">{tasks.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Tasks</h2>
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">{task.title}</h3>
                  <p className="text-sm text-gray-600">{task.description}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  task.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                  task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
