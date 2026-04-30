import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  SauceInventory, 
  SauceType, 
  SAUCE_TYPES
} from '@marrybrown/shared';

const API_URL = 'http://localhost:4000';

export default function SauceTracker() {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<SauceInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    sauceType: '' as SauceType | '',
    portionsAdded: '',
    expiryAt: '',
  });
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<SauceType>('Cheese');
  const [confirmingBatchId, setConfirmingBatchId] = useState<string | null>(null);

  const fetchInventory = async () => {
    try {
      const response = await fetch(`${API_URL}/sauces`);
      const data = await response.json();
      if (data.success) {
        setInventory(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch sauce inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.sauceType || !formData.portionsAdded) return;

    try {
      const response = await fetch(`${API_URL}/sauces/batches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sauceType: formData.sauceType,
          portionsAdded: parseInt(formData.portionsAdded),
          expiryAt: formData.expiryAt || null,
          preparedBy: user,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setFormData({ sauceType: '', portionsAdded: '', expiryAt: '' });
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        fetchInventory();
      }
    } catch (error) {
      console.error('Failed to add sauce batch:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'bg-green-100 text-green-800';
      case 'expiring_soon': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'safe': return 'Safe';
      case 'expiring_soon': return 'Expiring Soon';
      case 'expired': return 'Expired';
      default: return 'Unknown';
    }
  };

  const handleDiscard = async (batchId: string) => {
    try {
      const response = await fetch(`${API_URL}/sauces/batches/${batchId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discardedBy: user }),
      });

      const data = await response.json();
      if (data.success) {
        setConfirmingBatchId(null);
        fetchInventory();
      }
    } catch (error) {
      console.error('Failed to discard batch:', error);
    }
  };

  const totalLowStock = inventory.filter(i => i.lowStock).length;
  const totalExpiringSoon = inventory.reduce((sum, i) => sum + i.expiringSoonCount, 0);
  const totalExpired = inventory.reduce((sum, i) => sum + i.expiredCount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading sauce inventory...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Sauce Tracker</h1>

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
          Sauce batch added successfully!
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">⚠️</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Low Stock Sauces</p>
              <p className="text-2xl font-bold text-gray-900">{totalLowStock}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">⏰</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Expiring Soon</p>
              <p className="text-2xl font-bold text-gray-900">{totalExpiringSoon}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">❌</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Expired</p>
              <p className="text-2xl font-bold text-gray-900">{totalExpired}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Sauce Batch Form */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Sauce Batch</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sauce Type</label>
            <select
              value={formData.sauceType}
              onChange={(e) => setFormData({ ...formData, sauceType: e.target.value as SauceType })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            >
              <option value="">Select sauce</option>
              {SAUCE_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Portions Added</label>
            <input
              type="number"
              min="1"
              value={formData.portionsAdded}
              onChange={(e) => setFormData({ ...formData, portionsAdded: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Number of portions"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Date (Optional)
              <span className="text-xs text-gray-500 block">
                Auto-calculated for Coleslaw
              </span>
            </label>
            <input
              type="datetime-local"
              value={formData.expiryAt}
              onChange={(e) => setFormData({ ...formData, expiryAt: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={formData.sauceType === 'Coleslaw Regular' || formData.sauceType === 'Coleslaw Large'}
            />
          </div>
          
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition"
            >
              Add Batch
            </button>
          </div>
        </form>
      </div>

      {/* Sauce Tabs */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto">
            {SAUCE_TYPES.map(type => {
              const inv = inventory.find(i => i.sauceType === type);
              return (
                <button
                  key={type}
                  onClick={() => setActiveTab(type)}
                  className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                    activeTab === type
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {type}
                  {inv?.lowStock && <span className="ml-1 text-red-500">⚠️</span>}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {(() => {
            const inv = inventory.find(i => i.sauceType === activeTab);
            if (!inv) {
              return (
                <div className="text-center py-8 text-gray-500">
                  No batches found for {activeTab}
                </div>
              );
            }

            return (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{activeTab}</h3>
                    <p className="text-sm text-gray-600">
                      Total Remaining: <span className={`font-bold ${inv.lowStock ? 'text-red-600' : 'text-gray-900'}`}>{inv.totalRemaining}</span>
                      {inv.lowStock && <span className="ml-2 text-red-600">(Low Stock!)</span>}
                    </p>
                  </div>
                </div>

                {inv.batches.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No batches added yet
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Batch ID</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Added</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Remaining</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Prepared By</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {inv.batches.map(batch => (
                          <tr key={batch.id}>
                            <td className="px-4 py-3 text-sm text-gray-900 font-mono">
                              {batch.id.slice(0, 8)}...
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {new Date(batch.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {batch.portionsRemaining} / {batch.portionsAdded}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(batch.status)}`}>
                                {getStatusLabel(batch.status)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {batch.preparedBy.name}
                            </td>
                            <td className="px-4 py-3">
                              {batch.status === 'expired' && (
                                confirmingBatchId === batch.id ? (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-600">Discard?</span>
                                    <button
                                      onClick={() => handleDiscard(batch.id)}
                                      className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition"
                                    >
                                      Yes
                                    </button>
                                    <button
                                      onClick={() => setConfirmingBatchId(null)}
                                      className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300 transition"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setConfirmingBatchId(batch.id)}
                                    className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition"
                                  >
                                    Discard
                                  </button>
                                )
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}