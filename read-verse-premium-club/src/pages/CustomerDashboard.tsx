import React, { useEffect, useState } from 'react';
import { useAppSelector } from '@/store';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { authFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import BookGrid from '@/components/Books/BookGrid';

// Helper: Recently viewed (mock: last 3 books)
function getRecentlyViewed(books: any[]) {
  return books.slice(-3);
}

const CustomerDashboard: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { books } = useAppSelector((state) => state.books);
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [achievements, setAchievements] = useState<string[]>([]);

  useEffect(() => {
    if (!user) navigate('/login');
    else if (user.role === 'admin') navigate('/admin-dashboard');
    else if (user.role !== 'customer') navigate('/author-dashboard');
  }, [user, navigate]);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await authFetch('/orders/my-orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      } else {
        setError('Failed to load order history');
      }
    } catch (err) {
      setError('Failed to load order history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'customer') fetchOrders();
    // eslint-disable-next-line
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
    // eslint-disable-next-line
  }, [user]);

  const fetchStats = async () => {
    try {
      const res = await authFetch('/users/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data.readingStats);
        setAchievements(data.achievements);
      }
    } catch {}
  };

  const handleOrderClick = (order: any) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  const recentlyViewed = getRecentlyViewed(books);

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-4">Customer Dashboard</h1>
      <p className="mb-8">Welcome, {user?.name}! Track your orders and reading progress.</p>
      {/* Recently Viewed Section */}
      {recentlyViewed.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Recently Viewed</h2>
          <BookGrid books={recentlyViewed} />
        </section>
      )}
      {user && stats && (
        <section className="mb-8">
          <div className="flex flex-wrap gap-8 items-center">
            <div className="bg-muted rounded-lg p-4 min-w-[160px] text-center">
              <div className="text-2xl font-bold text-primary">{stats.booksRead}</div>
              <div className="text-muted-foreground">Books Read</div>
            </div>
            <div className="bg-muted rounded-lg p-4 min-w-[160px] text-center">
              <div className="text-2xl font-bold text-primary">{stats.pagesRead}</div>
              <div className="text-muted-foreground">Pages Read</div>
            </div>
            <div className="bg-muted rounded-lg p-4 min-w-[160px] text-center">
              <div className="text-2xl font-bold text-primary">{stats.streak}</div>
              <div className="text-muted-foreground">Day Streak</div>
            </div>
            <div className="bg-muted rounded-lg p-4 min-w-[160px] text-center">
              <div className="text-lg font-semibold text-accent mb-2">Achievements</div>
              <div className="flex flex-wrap gap-2 justify-center">
                {achievements.length === 0 && <span className="text-muted-foreground text-sm">No badges yet</span>}
                {achievements.includes('first-book') && <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">First Book</span>}
                {achievements.includes('10-day-streak') && <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs">10 Day Streak</span>}
                {achievements.includes('1000-pages') && <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs">1000 Pages</span>}
              </div>
            </div>
          </div>
        </section>
      )}
      <h2 className="text-xl font-semibold mb-4">Order History</h2>
      {loading ? <p>Loading orders...</p> : error ? <p className="text-red-500">{error}</p> : (
        orders.length === 0 ? <p>No orders yet.</p> : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {orders.map((order) => (
              <Card key={order._id} className="p-4 flex flex-col cursor-pointer" onClick={() => handleOrderClick(order)}>
                <div className="font-bold text-lg mb-2">{order.book?.title}</div>
                <div className="text-sm text-muted-foreground mb-2">by {order.book?.author}</div>
                <div className="mb-2">Amount: ₹{order.amount}</div>
                <div className="mb-2">Order Date: {new Date(order.createdAt).toLocaleDateString()}</div>
                <div className="flex gap-2 mb-2">
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                    order.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    Payment: {order.paymentStatus}
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    order.orderStatus === 'delivered' ? 'bg-green-100 text-green-800' :
                    order.orderStatus === 'shipped' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    Order: {order.orderStatus}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )
      )}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-lg relative">
            <button className="absolute top-2 right-2 text-xl" onClick={closeModal}>&times;</button>
            <h2 className="text-2xl font-bold mb-4">Order Details</h2>
            <div className="mb-2 font-bold">{selectedOrder.book?.title}</div>
            <div className="mb-2">by {selectedOrder.book?.author}</div>
            <div className="mb-2">Category: {selectedOrder.book?.category}</div>
            <div className="mb-2">Description: {selectedOrder.book?.description}</div>
            <div className="mb-2">Price: ${selectedOrder.book?.price}</div>
            <div className="mb-2">Tags: {selectedOrder.book?.tags?.join(', ')}</div>
            <div className="mb-2">Purchased: {selectedOrder.date ? new Date(selectedOrder.date).toLocaleDateString() : ''}</div>
            <Button className="mt-4 w-full" onClick={closeModal}>Close</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard; 