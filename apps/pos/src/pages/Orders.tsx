import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Order } from '@marrybrown/shared';

const API_URL = 'http://localhost:4000';

export default function Orders() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/orders?limit=20`);
      const data = await response.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-primary text-white shadow-lg">
        <div className="px-4 py-3 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold">MarryBrown POS</h1>
            <p className="text-sm opacity-75">Recent Orders</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/pos"
              className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-sm transition"
            >
              New Order
            </Link>
            <button
              onClick={logout}
              className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-sm transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No orders yet</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {orders.map(order => (
                <div key={order.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-gray-900">Order #{order.id.slice(0, 8)}</p>
                      <p className="text-sm text-gray-600">By: {order.createdBy.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleString()}</p>
                      <p className="text-sm font-medium text-gray-900">{order.totals?.itemCount || 0} items</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {order.items.map((item, i) => (
                      <span key={i} className="bg-gray-100 px-2 py-1 rounded text-sm text-gray-700">
                        {item.name} x{item.qty}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}