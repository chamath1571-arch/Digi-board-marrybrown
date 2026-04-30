import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { POSItem, OrderItem, POS_CATEGORIES, getItemsByCategory } from '@marrybrown/shared';

const API_URL = 'http://localhost:4000';

export default function POS() {
  const { user, logout } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState(POS_CATEGORIES[0]);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [success, setSuccess] = useState(false);

  const items = getItemsByCategory(selectedCategory);

  const addToCart = (item: POSItem) => {
    const existing = cart.find(c => c.itemId === item.id);
    if (existing) {
      setCart(cart.map(c => c.itemId === item.id ? { ...c, qty: c.qty + 1 } : c));
    } else {
      setCart([...cart, { itemId: item.id, name: item.name, qty: 1 }]);
    }
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(c => c.itemId !== itemId));
  };

  const updateQty = (itemId: string, delta: number) => {
    setCart(cart.map(c => {
      if (c.itemId === itemId) {
        const newQty = c.qty + delta;
        return newQty > 0 ? { ...c, qty: newQty } : c;
      }
      return c;
    }).filter(c => c.qty > 0));
  };

  const clearCart = () => {
    setCart([]);
  };

  const handleSubmitOrder = async () => {
    if (cart.length === 0) return;

    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          createdBy: user,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setCart([]);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Failed to submit order:', error);
    }
  };

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-primary text-white shadow-lg">
        <div className="px-4 py-3 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold">MarryBrown POS</h1>
            <p className="text-sm opacity-75">Welcome, {user?.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/pos/orders"
              className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-sm transition"
            >
              Recent Orders
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

      {success && (
        <div className="mx-4 mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
          Order submitted successfully!
        </div>
      )}

      <div className="flex h-[calc(100vh-64px)]">
        {/* Categories Panel */}
        <div className="w-48 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-2">
            {POS_CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`w-full text-left px-3 py-2 rounded-lg mb-1 text-sm transition ${
                  selectedCategory === category
                    ? 'bg-primary text-white'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Items Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{selectedCategory}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {items.map(item => (
              <button
                key={item.id}
                onClick={() => addToCart(item)}
                className="bg-white rounded-lg shadow border border-gray-200 p-4 text-left hover:shadow-md transition"
              >
                <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                {item.price && (
                  <p className="text-primary font-bold mt-1">${item.price.toFixed(2)}</p>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Cart Panel */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Current Order</h2>
            <p className="text-sm text-gray-600">{totalItems} items</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No items in cart
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map(item => (
                  <div key={item.itemId} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQty(item.itemId, -1)}
                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-700"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-medium">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.itemId, 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-700"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeFromCart(item.itemId)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-200 space-y-2">
            <button
              onClick={clearCart}
              disabled={cart.length === 0}
              className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear Cart
            </button>
            <button
              onClick={handleSubmitOrder}
              disabled={cart.length === 0}
              className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}