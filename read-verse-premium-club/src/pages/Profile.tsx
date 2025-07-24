import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { authFetch, setToken } from '@/lib/api';
import { setUser } from '@/store/slices/authSlice';

const Profile: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar: user?.avatar || '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!user) return <div className="p-8">Please log in to view your profile.</div>;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
      setForm((prev) => ({ ...prev, avatar: URL.createObjectURL(e.target.files[0]) }));
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      let avatarUrl = form.avatar;
      if (avatarFile) {
        // Upload avatar to backend (implement /api/users/avatar endpoint)
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        const res = await authFetch('/users/avatar', {
          method: 'POST',
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          avatarUrl = data.avatar;
        } else {
          setError('Failed to upload avatar');
          setLoading(false);
          return;
        }
      }
      const res = await authFetch('/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, avatar: avatarUrl }),
      });
      if (res.ok) {
        const data = await res.json();
        dispatch(setUser(data.user));
        setSuccess('Profile updated successfully!');
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }
    try {
      const res = await authFetch('/users/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: password, newPassword }),
      });
      if (res.ok) {
        setSuccess('Password changed successfully!');
        setPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to change password');
      }
    } catch (err) {
      setError('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <Label htmlFor="avatar">Avatar</Label>
              <div className="flex items-center gap-4 mt-2">
                <img src={form.avatar || '/default-avatar.png'} alt="Avatar" className="w-16 h-16 rounded-full object-cover border" />
                <input type="file" id="avatar" name="avatar" accept="image/*" onChange={handleAvatarChange} />
              </div>
            </div>
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-600 text-sm">{success}</p>}
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
          </form>
          <hr className="my-6" />
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <Label htmlFor="current-password">Current Password</Label>
              <Input id="current-password" name="current-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" name="new-password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input id="confirm-password" name="confirm-password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-600 text-sm">{success}</p>}
            <Button type="submit" disabled={loading}>{loading ? 'Changing...' : 'Change Password'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile; 