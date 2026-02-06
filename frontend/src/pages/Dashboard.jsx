import React, { useEffect, useState } from 'react';
import { dashboardService } from '../services';
import useAuthStore from '../store/auth';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        let response;
        
        switch(user?.role) {
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
            response = { data: {} };
        }
        
        setData(response.data);
      } catch (error) {
        console.error('Dashboard error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold mb-8">
        Welcome, {user?.firstName}!
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {user?.role === 'DIRECTOR' && data?.activeProjects !== undefined && (
          <>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-600 text-sm">Active Projects</h3>
              <p className="text-3xl font-bold">{data.activeProjects}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-600 text-sm">Total Tasks</h3>
              <p className="text-3xl font-bold">{data.totalTasks}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-600 text-sm">Completion Rate</h3>
              <p className="text-3xl font-bold">{data.completionRate}%</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-600 text-sm">Team Members</h3>
              <p className="text-3xl font-bold">{data.teamMembers}</p>
            </div>
          </>
        )}

        {user?.role === 'FIELD_AGENT' && data?.taskStats && (
          <>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-600 text-sm">Total Tasks</h3>
              <p className="text-3xl font-bold">{data.taskStats.total}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-600 text-sm">Completed</h3>
              <p className="text-3xl font-bold text-green-600">{data.taskStats.completed}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-600 text-sm">In Progress</h3>
              <p className="text-3xl font-bold text-blue-600">{data.taskStats.inProgress}</p>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          <p className="text-gray-600">No data yet</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Quick Stats</h2>
          <p className="text-gray-600">Dashboard visualization coming soon</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
