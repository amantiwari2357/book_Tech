import React, { useEffect, useState } from 'react';
import { useAppSelector } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { API_BASE_URL, authFetch } from '@/lib/api';

const Notifications: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sendStatus, setSendStatus] = useState('');
  const [sendError, setSendError] = useState('');

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await authFetch('/notifications');
      if (res.ok) {
        setNotifications(await res.json());
      } else {
        setError('Failed to load notifications');
      }
    } catch {
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    await authFetch(`/notifications/${id}/read`, { method: 'PUT' });
    fetchNotifications();
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendStatus('');
    setSendError('');
    try {
      // Find recipient by email
      const resUser = await authFetch(`/admin/users`);
      const users = resUser.ok ? await resUser.json() : [];
      const recipient = users.find((u: any) => u.email === recipientEmail);
      if (!recipient) {
        setSendError('Recipient not found');
        return;
      }
      const res = await authFetch('/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId: recipient._id, message }),
      });
      if (res.ok) {
        setSendStatus('Message sent!');
        setRecipientEmail('');
        setMessage('');
        fetchNotifications();
      } else {
        setSendError('Failed to send message');
      }
    } catch {
      setSendError('Failed to send message');
    }
  };

  if (!user) return <div className="p-8">Please log in to view your notifications.</div>;

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Send a Message</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <Label htmlFor="recipientEmail">Recipient Email</Label>
              <Input id="recipientEmail" name="recipientEmail" type="email" value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Input id="message" name="message" value={message} onChange={e => setMessage(e.target.value)} required />
            </div>
            {sendError && <p className="text-red-500 text-sm">{sendError}</p>}
            {sendStatus && <p className="text-green-600 text-sm">{sendStatus}</p>}
            <Button type="submit">Send</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Inbox</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <p>Loading...</p> : error ? <p className="text-red-500">{error}</p> : notifications.length === 0 ? <p>No notifications.</p> : (
            <div className="space-y-4">
              {notifications.map((n) => (
                <div key={n._id} className={`p-3 border rounded flex items-start gap-2 ${!n.read ? 'bg-blue-50' : ''}`}
                  onClick={() => { if (!n.read) markAsRead(n._id); }}
                  style={{ cursor: !n.read ? 'pointer' : 'default' }}
                >
                  <div className="flex-1">
                    <div className="text-sm">{n.message}</div>
                    <div className="text-xs text-muted-foreground mt-1">{n.sender ? `From: ${n.sender.name} (${n.sender.role})` : ''}</div>
                    <div className="text-xs text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                  </div>
                  {!n.read && <span className="ml-2 text-xs text-blue-600 font-bold">New</span>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Notifications; 