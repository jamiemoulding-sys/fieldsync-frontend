import React, { useState, useEffect } from 'react';
import api from '../services/api';
import HomeButton from '../components/HomeButton';

function Billing() {
  const [billingInfo, setBillingInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      const res = await api.get('/billing').catch(() => null);

      setBillingInfo(
        res?.data || {
          employeeCount: 1,
          pricePerEmployee: 6,
          monthlyPrice: 6
        }
      );
    } catch (err) {
      console.error(err);
      setError('Failed to load billing');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-white">Loading billing...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-white text-2xl">💳 Billing</h1>
        <HomeButton />
      </div>

      <div className="text-white">
        Monthly: £{billingInfo?.monthlyPrice}
      </div>

      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
}

export default Billing;
