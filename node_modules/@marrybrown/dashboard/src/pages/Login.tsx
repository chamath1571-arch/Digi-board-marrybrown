import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [payrollId, setPayrollId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const success = await login(payrollId);
    
    if (success) {
      navigate('/');
    } else {
      setError('Invalid Payroll ID. Please try again.');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-3xl">🍗</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">MarryBrown Plenty Valley</h1>
            <p className="text-gray-600 mt-2">DigiBoard Dashboard Login</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="payrollId" className="block text-sm font-medium text-gray-700 mb-2">
                Payroll ID
              </label>
              <input
                type="text"
                id="payrollId"
                value={payrollId}
                onChange={(e) => setPayrollId(e.target.value)}
                placeholder="Enter your Payroll ID"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                required
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Demo Users Info */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">Demo Payroll IDs:</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">1001</span>
                <span className="text-gray-900">Sankar (Head Staff)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">1002</span>
                <span className="text-gray-900">Manager One (Shift Manager)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">1003</span>
                <span className="text-gray-900">Staff One (Staff)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">1004</span>
                <span className="text-gray-900">Staff Two (Staff)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}