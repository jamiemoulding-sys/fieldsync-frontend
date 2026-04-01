import React, { useEffect, useState } from 'react';
import API from '../services/api';
import HomeButton from '../components/HomeButton';

function Reports() {
  const [data, setData] = useState({
    totalShifts: 0,
    totalUsers: 0,
    totalTasks: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);

      const res = await API.get('/reports');

      console.log('REPORT DATA:', res.data);

      setData({
        totalShifts: res.data?.totalShifts || 0,
        totalUsers: res.data?.totalUsers || 0,
        totalTasks: res.data?.totalTasks || 0
      });

    } catch (err) {
      console.error('Reports error:', err);
      setError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-white">Loading reports...</div>;
  }

  return (
    <div className="p-8 text-white">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Reports</h1>
        <HomeButton />
      </div>

      {error && (
        <div className="text-red-400 mb-4">{error}</div>
      )}

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-gray-800 p-6 rounded">
          <div className="text-3xl font-bold">{data.totalShifts}</div>
          <div className="text-gray-400">Total Shifts</div>
        </div>

        <div className="bg-gray-800 p-6 rounded">
          <div className="text-3xl font-bold">{data.totalUsers}</div>
          <div className="text-gray-400">Users</div>
        </div>

        <div className="bg-gray-800 p-6 rounded">
          <div className="text-3xl font-bold">{data.totalTasks}</div>
          <div className="text-gray-400">Tasks</div>
        </div>
      </div>
    </div>
  );
}

export default Reports;