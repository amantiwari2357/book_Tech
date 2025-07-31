import React, { useState, useEffect } from 'react';
import { useAppSelector } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  ArrowLeftIcon,
  UserIcon,
  ShieldCheckIcon,
  KeyIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  GlobeAltIcon,
  BellIcon,
  EyeIcon,
  EyeSlashIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
  CreditCardIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  FingerPrintIcon,
  QrCodeIcon,
  CogIcon,
  InformationCircleIcon,
  DocumentTextIcon,
  ShieldExclamationIcon,
  UserGroupIcon,
  KeyIcon as KeyIconSolid,
  PlusIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { authFetch } from '@/lib/api';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  addresses: Address[];
  preferences: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    marketingEmails: boolean;
    darkMode: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    lastPasswordChange: string;
    passwordStrength: 'weak' | 'medium' | 'strong';
    loginAttempts: number;
  };
}

interface Address {
  _id: string;
  type: 'home' | 'work' | 'other';
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

interface DeviceSession {
  _id: string;
  device: string;
  browser: string;
  location: string;
  ipAddress: string;
  lastActive: string;
  isCurrent: boolean;
  isTrusted: boolean;
}

interface SecurityLog {
  _id: string;
  action: string;
  description: string;
  ipAddress: string;
  location: string;
  device: string;
  timestamp: string;
  status: 'success' | 'failed' | 'warning';
}

const Security: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sessions, setSessions] = useState<DeviceSession[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [addressForm, setAddressForm] = useState({
    type: 'home' as Address['type'],
    name: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    isDefault: false
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchSessions();
      fetchSecurityLogs();
    }
  }, [user]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/users/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setProfileForm({
          name: data.name,
          email: data.email,
          phone: data.phone || ''
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      const res = await authFetch('/users/sessions');
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    }
  };

  const fetchSecurityLogs = async () => {
    try {
      const res = await authFetch('/users/security-logs');
      if (res.ok) {
        const data = await res.json();
        setSecurityLogs(data);
      }
    } catch (error) {
      console.error('Failed to fetch security logs:', error);
    }
  };

  const updateProfile = async () => {
    try {
      const res = await authFetch('/users/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileForm)
      });

      if (res.ok) {
        fetchProfile();
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const changePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return;
    }

    try {
      const res = await authFetch('/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      if (res.ok) {
        setShowPasswordModal(false);
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        fetchProfile();
      }
    } catch (error) {
      console.error('Failed to change password:', error);
    }
  };

  const toggle2FA = async () => {
    try {
      const res = await authFetch('/users/2fa/toggle', {
        method: 'POST'
      });

      if (res.ok) {
        fetchProfile();
        if (!profile?.security.twoFactorEnabled) {
          setShow2FAModal(true);
        }
      }
    } catch (error) {
      console.error('Failed to toggle 2FA:', error);
    }
  };

  const updatePreferences = async (key: string, value: boolean) => {
    try {
      const res = await authFetch('/users/preferences', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          [key]: value
        })
      });

      if (res.ok) {
        fetchProfile();
      }
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  };

  const addAddress = async () => {
    try {
      const res = await authFetch('/users/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(addressForm)
      });

      if (res.ok) {
        setShowAddressModal(false);
        setAddressForm({
          type: 'home',
          name: '',
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
          isDefault: false
        });
        fetchProfile();
      }
    } catch (error) {
      console.error('Failed to add address:', error);
    }
  };

  const updateAddress = async () => {
    if (!editingAddress) return;

    try {
      const res = await authFetch(`/users/addresses/${editingAddress._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(addressForm)
      });

      if (res.ok) {
        setShowAddressModal(false);
        setEditingAddress(null);
        setAddressForm({
          type: 'home',
          name: '',
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
          isDefault: false
        });
        fetchProfile();
      }
    } catch (error) {
      console.error('Failed to update address:', error);
    }
  };

  const deleteAddress = async (addressId: string) => {
    try {
      const res = await authFetch(`/users/addresses/${addressId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        fetchProfile();
      }
    } catch (error) {
      console.error('Failed to delete address:', error);
    }
  };

  const revokeSession = async (sessionId: string) => {
    try {
      const res = await authFetch(`/users/sessions/${sessionId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        fetchSessions();
      }
    } catch (error) {
      console.error('Failed to revoke session:', error);
    }
  };

  const getStatusBadge = (status: SecurityLog['status']) => {
    const config = {
      success: { color: 'bg-green-100 text-green-800', icon: CheckIcon },
      failed: { color: 'bg-red-100 text-red-800', icon: XMarkIcon },
      warning: { color: 'bg-yellow-100 text-yellow-800', icon: ExclamationTriangleIcon }
    };

    const { color, icon: Icon } = config[status];
    return (
      <Badge className={color}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const getPasswordStrengthColor = (strength: string) => {
    const colors = {
      weak: 'text-red-500',
      medium: 'text-yellow-500',
      strong: 'text-green-500'
    };
    return colors[strength as keyof typeof colors] || 'text-gray-500';
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">Please log in to access security settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/customer-dashboard')}
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-xl font-bold text-gray-900">Security & Privacy</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Security Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Active Sessions</p>
                  <p className="text-2xl font-bold">{sessions.length}</p>
                </div>
                <DevicePhoneMobileIcon className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">2FA Status</p>
                  <p className="text-2xl font-bold">
                    {profile?.security.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
                <ShieldCheckIcon className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Password Strength</p>
                  <p className="text-2xl font-bold capitalize">
                    {profile?.security.passwordStrength || 'Unknown'}
                  </p>
                </div>
                <KeyIcon className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Security Events</p>
                  <p className="text-2xl font-bold">{securityLogs.length}</p>
                </div>
                <ShieldExclamationIcon className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="devices">Devices</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Profile Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <UserIcon className="w-5 h-5" />
                    <span>Profile Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <Input
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <Input
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                      type="email"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number</label>
                    <Input
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                      type="tel"
                    />
                  </div>
                  
                  <Button onClick={updateProfile}>
                    <PencilIcon className="w-4 h-4 mr-2" />
                    Update Profile
                  </Button>
                </CardContent>
              </Card>

              {/* Addresses */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPinIcon className="w-5 h-5" />
                    <span>Addresses</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {profile?.addresses.map((address) => (
                      <div key={address._id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary">{address.type}</Badge>
                            {address.isDefault && (
                              <Badge variant="default">Default</Badge>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingAddress(address);
                                setAddressForm({
                                  type: address.type,
                                  name: address.name,
                                  street: address.street,
                                  city: address.city,
                                  state: address.state,
                                  zipCode: address.zipCode,
                                  country: address.country,
                                  isDefault: address.isDefault
                                });
                                setShowAddressModal(true);
                              }}
                            >
                              <PencilIcon className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteAddress(address._id)}
                            >
                              <TrashIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="font-medium">{address.name}</p>
                        <p className="text-sm text-gray-600">
                          {address.street}, {address.city}, {address.state} {address.zipCode}
                        </p>
                        <p className="text-sm text-gray-600">{address.country}</p>
                      </div>
                    ))}
                    
                    <Button onClick={() => setShowAddressModal(true)}>
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Add Address
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Password Security */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <KeyIcon className="w-5 h-5" />
                    <span>Password Security</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Password Strength</p>
                      <p className={`text-sm ${getPasswordStrengthColor(profile?.security.passwordStrength || 'weak')}`}>
                        {profile?.security.passwordStrength?.toUpperCase() || 'WEAK'}
                      </p>
                    </div>
                    <Button onClick={() => setShowPasswordModal(true)}>
                      Change Password
                    </Button>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <p>Last changed: {profile?.security.lastPasswordChange ? 
                      new Date(profile.security.lastPasswordChange).toLocaleDateString() : 'Never'}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Two-Factor Authentication */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FingerPrintIcon className="w-5 h-5" />
                    <span>Two-Factor Authentication</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">2FA Status</p>
                      <p className="text-sm text-gray-600">
                        {profile?.security.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                    <Switch
                      checked={profile?.security.twoFactorEnabled || false}
                      onCheckedChange={toggle2FA}
                    />
                  </div>
                  
                  {!profile?.security.twoFactorEnabled && (
                    <Button onClick={() => setShow2FAModal(true)}>
                      <QrCodeIcon className="w-4 h-4 mr-2" />
                      Setup 2FA
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Security Logs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ShieldExclamationIcon className="w-5 h-5" />
                  <span>Security Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {securityLogs.slice(0, 10).map((log) => (
                    <div key={log._id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{log.action}</p>
                        <p className="text-sm text-gray-600">{log.description}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleString()} • {log.ipAddress} • {log.location}
                        </p>
                      </div>
                      {getStatusBadge(log.status)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="devices" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DevicePhoneMobileIcon className="w-5 h-5" />
                  <span>Active Sessions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div key={session._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                          {session.device.includes('Mobile') ? (
                            <DevicePhoneMobileIcon className="w-6 h-6 text-gray-600" />
                          ) : (
                            <ComputerDesktopIcon className="w-6 h-6 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{session.device}</p>
                          <p className="text-sm text-gray-600">{session.browser}</p>
                          <p className="text-xs text-gray-500">
                            {session.location} • {session.ipAddress}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {session.isCurrent ? 'Current Session' : 'Active'}
                          </p>
                          <p className="text-xs text-gray-500">
                            Last active: {new Date(session.lastActive).toLocaleString()}
                          </p>
                        </div>
                        
                        {!session.isCurrent && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => revokeSession(session._id)}
                          >
                            Revoke
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Notification Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BellIcon className="w-5 h-5" />
                    <span>Notification Preferences</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-gray-600">Order updates and account alerts</p>
                    </div>
                    <Switch
                      checked={profile?.preferences.emailNotifications || false}
                      onCheckedChange={(checked) => updatePreferences('emailNotifications', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">SMS Notifications</p>
                      <p className="text-sm text-gray-600">Delivery updates and security alerts</p>
                    </div>
                    <Switch
                      checked={profile?.preferences.smsNotifications || false}
                      onCheckedChange={(checked) => updatePreferences('smsNotifications', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-gray-600">App notifications and updates</p>
                    </div>
                    <Switch
                      checked={profile?.preferences.pushNotifications || false}
                      onCheckedChange={(checked) => updatePreferences('pushNotifications', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Marketing Emails</p>
                      <p className="text-sm text-gray-600">Promotional content and offers</p>
                    </div>
                    <Switch
                      checked={profile?.preferences.marketingEmails || false}
                      onCheckedChange={(checked) => updatePreferences('marketingEmails', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Privacy Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ShieldCheckIcon className="w-5 h-5" />
                    <span>Privacy Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Profile Visibility</p>
                      <p className="text-sm text-gray-600">Control who can see your profile</p>
                    </div>
                    <select className="border rounded-lg px-3 py-2">
                      <option value="public">Public</option>
                      <option value="friends">Friends Only</option>
                      <option value="private">Private</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Data Sharing</p>
                      <p className="text-sm text-gray-600">Allow data for personalization</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Analytics</p>
                      <p className="text-sm text-gray-600">Help improve our services</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Data Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DocumentTextIcon className="w-5 h-5" />
                  <span>Data Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="justify-start">
                    <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                    Download My Data
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <TrashIcon className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Change Password</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Current Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-4 h-4 text-gray-400" />
                    ) : (
                      <EyeIcon className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">New Password</label>
                <Input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                <Input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                />
              </div>
            </div>
            
            <div className="flex space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordForm({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                  });
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={changePassword}
                disabled={!passwordForm.currentPassword || !passwordForm.newPassword || passwordForm.newPassword !== passwordForm.confirmPassword}
              >
                Change Password
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 2FA Setup Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Setup Two-Factor Authentication</h3>
            
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-48 h-48 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <QrCodeIcon className="w-24 h-24 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Scan this QR code with your authenticator app
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Verification Code</label>
                <Input placeholder="Enter 6-digit code" />
              </div>
            </div>
            
            <div className="flex space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShow2FAModal(false)}
              >
                Cancel
              </Button>
              <Button>
                Verify & Enable
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Address Type</label>
                  <select
                    value={addressForm.type}
                    onChange={(e) => setAddressForm({...addressForm, type: e.target.value as Address['type']})}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="home">Home</option>
                    <option value="work">Work</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Address Name</label>
                  <Input
                    value={addressForm.name}
                    onChange={(e) => setAddressForm({...addressForm, name: e.target.value})}
                    placeholder="e.g., My Home, Office"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Street Address</label>
                <Input
                  value={addressForm.street}
                  onChange={(e) => setAddressForm({...addressForm, street: e.target.value})}
                  placeholder="123 Main St"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">City</label>
                  <Input
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">State</label>
                  <Input
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({...addressForm, state: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">ZIP Code</label>
                  <Input
                    value={addressForm.zipCode}
                    onChange={(e) => setAddressForm({...addressForm, zipCode: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Country</label>
                <Input
                  value={addressForm.country}
                  onChange={(e) => setAddressForm({...addressForm, country: e.target.value})}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({...addressForm, isDefault: e.target.checked})}
                  className="rounded"
                />
                <label htmlFor="isDefault" className="text-sm font-medium">
                  Set as default address
                </label>
              </div>
            </div>
            
            <div className="flex space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddressModal(false);
                  setEditingAddress(null);
                  setAddressForm({
                    type: 'home',
                    name: '',
                    street: '',
                    city: '',
                    state: '',
                    zipCode: '',
                    country: '',
                    isDefault: false
                  });
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={editingAddress ? updateAddress : addAddress}
                disabled={!addressForm.name || !addressForm.street || !addressForm.city}
              >
                {editingAddress ? 'Update Address' : 'Add Address'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Security; 