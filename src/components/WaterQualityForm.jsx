// =================== WATER QUALITY FORM COMPONENT ===================
// src/components/WaterQualityForm.jsx
import React, { useState, useEffect } from 'react';
import waterQualityService from '../services/waterQualityService';

export const WaterQualityForm = ({ poolId, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    poolId: poolId || '',
    pH: '',
    turbidity: '',
    conductivity: '',
    temperature: '',
    dissolvedOxygen: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pools, setPools] = useState([]);

  useEffect(() => {
    if (!poolId) {
      fetchPools();
    }
  }, [poolId]);

  const fetchPools = async () => {
    try {
      const response = await fetch('/api/pools/locations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const result = await response.json();
      if (result.status === 'success') {
        setPools(result.allPools || []);
      }
    } catch (err) {
      console.error('Error fetching pools:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const dataToSubmit = {
        ...formData,
        pH: parseFloat(formData.pH),
        turbidity: parseFloat(formData.turbidity),
        conductivity: parseFloat(formData.conductivity),
        temperature: formData.temperature ? parseFloat(formData.temperature) : undefined,
        dissolvedOxygen: formData.dissolvedOxygen ? parseFloat(formData.dissolvedOxygen) : undefined,
      };

      await waterQualityService.createRecord(dataToSubmit);
      
      if (onSuccess) {
        onSuccess();
      }
      
      // Reset form
      setFormData({
        poolId: poolId || '',
        pH: '',
        turbidity: '',
        conductivity: '',
        temperature: '',
        dissolvedOxygen: '',
        notes: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
      <h3 className="text-2xl font-bold text-white mb-6">Record Water Quality Data</h3>
      
      {error && (
        <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-3 mb-4">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!poolId && (
          <div>
            <label className="block text-white font-semibold mb-2">Pool</label>
            <select
              name="poolId"
              value={formData.poolId}
              onChange={handleChange}
              required
              className="w-full h-12 border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg px-4 text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50"
            >
              <option value="" className="bg-slate-800">Select Pool</option>
              {pools.map((pool) => (
                <option key={pool.id} value={pool.id} className="bg-slate-800">
                  {pool.name} - {pool.location}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white font-semibold mb-2">pH Level *</label>
            <input
              type="number"
              name="pH"
              value={formData.pH}
              onChange={handleChange}
              min="0"
              max="14"
              step="0.01"
              required
              className="w-full h-12 border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg px-4 text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50"
              placeholder="7.4"
            />
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">Turbidity (NTU) *</label>
            <input
              type="number"
              name="turbidity"
              value={formData.turbidity}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
              className="w-full h-12 border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg px-4 text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50"
              placeholder="25.5"
            />
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">Conductivity (µS/cm) *</label>
            <input
              type="number"
              name="conductivity"
              value={formData.conductivity}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
              className="w-full h-12 border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg px-4 text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50"
              placeholder="1500"
            />
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">Temperature (°C)</label>
            <input
              type="number"
              name="temperature"
              value={formData.temperature}
              onChange={handleChange}
              min="-10"
              max="100"
              step="0.1"
              className="w-full h-12 border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg px-4 text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50"
              placeholder="25.0"
            />
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">Dissolved Oxygen (mg/L)</label>
            <input
              type="number"
              name="dissolvedOxygen"
              value={formData.dissolvedOxygen}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full h-12 border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg px-4 text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50"
              placeholder="8.5"
            />
          </div>
        </div>

        <div>
          <label className="block text-white font-semibold mb-2">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            maxLength="1000"
            className="w-full border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 resize-none"
            placeholder="Any additional observations..."
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            {loading ? 'Saving...' : 'Save Record'}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-lg transition-all duration-300 border border-white/20"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};