import React, { useEffect, useState } from 'react';
import { shiftAPI, uploadAPI } from '../services/api';
import HomeButton from '../components/HomeButton';

function Profile() {
  const [shiftHistory, setShiftHistory] = useState([]);
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [historyRes, uploadsRes] = await Promise.all([
        shiftAPI.getHistory(),
        uploadAPI.getAllCompletions()
      ]);

      // ✅ ALWAYS force arrays
      setShiftHistory(Array.isArray(historyRes.data) ? historyRes.data : []);
      setUploads(Array.isArray(uploadsRes.data) ? uploadsRes.data : []);

    } catch (error) {
      console.error('Profile load error:', error);
      setShiftHistory([]);
      setUploads([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalHours = () => {
    return shiftHistory.reduce((total, shift) => {
      if (!shift.clock_in_time || !shift.clock_out_time) return total;

      const start = new Date(shift.clock_in_time);
      const end = new Date(shift.clock_out_time);

      const hours = (end - start) / (1000 * 60 * 60);
      return total + (isNaN(hours) ? 0 : hours);
    }, 0);
  };

  if (loading) {
    return <div className="p-6 text-white">Loading...</div>;
  }

  return (
    <div className="p-8 text-white">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Profile</h1>
        <HomeButton />
      </div>

      <div className="mb-6">
        <h2 className="text-xl mb-2">Total Hours</h2>
        <div className="text-3xl">{calculateTotalHours().toFixed(1)}h</div>
      </div>

      <div>
        <h2 className="text-xl mb-2">Recent Shifts</h2>

        {shiftHistory.length === 0 && (
          <div className="text-gray-400">No shifts found</div>
        )}

        {shiftHistory.map((shift) => (
          <div key={shift.id} className="border p-3 mb-2 rounded">
            <div>
              {new Date(shift.clock_in_time).toLocaleDateString()}
            </div>
            <div>
              {shift.clock_in_time} → {shift.clock_out_time || 'Active'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Profile;