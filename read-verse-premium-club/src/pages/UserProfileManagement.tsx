import React, { useState, useEffect } from 'react';
import { useAppSelector } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { 
  UserIcon, 
  CameraIcon,
  ShieldCheckIcon,
  BellIcon,
  KeyIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarIcon,
  GlobeAltIcon,
  HeartIcon,
  BookOpenIcon,
  TrophyIcon,
  StarIcon,
  ClockIcon,
  ChartBarIcon,
  CogIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { authFetch } from '@/lib/api';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  dateOfBirth?: string;
  gender?: string;
  preferences: {
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
      marketing: boolean;
    };
    privacy: {
      profileVisibility: 'public' | 'private' | 'friends';
      readingActivity: boolean;
      showOnlineStatus: boolean;
    };
    reading: {
      preferredLanguage: string;
      fontSize: number;
      theme: 'light' | 'dark' | 'auto';
      autoSave: boolean;
    };
  };
  stats: {
    memberSince: string;
    totalBooks: number;
    readingTime: number;
    reviewsWritten: number;
    level: number;
    points: number;
  };
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  loginNotifications: boolean;
  sessionTimeout: number;
  lastPasswordChange: string;
  trustedDevices: Array<{
    id: string;
    name: string;
    lastUsed: string;
    location: string;
  }>;
}

const UserProfileManagement: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [security, setSecurity] = useState<SecuritySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    website: '',
    dateOfBirth: '',
    gender: '',
  });

  useEffect(() => {
    if (user && user.role === 'user') {
      fetchProfileData();
    }
  }, [user]);

  const fetchProfileData = async () => {
    try {
      const [profileRes, securityRes] = await Promise.all([
        authFetch('/user/profile'),
        authFetch('/user/security')
      ]);

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData);
        setFormData({
          name: profileData.name || '',
          email: profileData.email || '',
          phone: profileData.phone || '',
          bio: profileData.bio || '',
          location: profileData.location || '',
          website: profileData.website || '',
          dateOfBirth: profileData.dateOfBirth || '',
          gender: profileData.gender || '',
        });
      }

      if (securityRes.ok) {
        const securityData = await securityRes.json();
        setSecurity(securityData);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await authFetch('/user/profile', {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        const updatedProfile = await res.json();
        setProfile(updatedProfile);
        // Show success message
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await authFetch('/user/avatar', {
        method: 'POST',
        body: formData,
      });
      
      if (res.ok) {
        const updatedProfile = await res.json();
        setProfile(updatedProfile);
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
    }
  };

  const handlePreferenceUpdate = async (category: string, key: string, value: any) => {
    try {
      const res = await authFetch('/user/preferences', {
        method: 'PUT',
        body: JSON.stringify({
          category,
          key,
          value,
        }),
      });
      
      if (res.ok) {
        const updatedProfile = await res.json();
        setProfile(updatedProfile);
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  const handlePasswordChange = async (currentPassword: string, newPassword: string) => {
    try {
      const res = await authFetch('/user/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      
      if (res.ok) {
        // Show success message
      }
    } catch (error) {
      console.error('Error changing password:', error);
    }
  };

  const handleTwoFactorToggle = async () => {
    try {
      const res = await authFetch('/user/two-factor', {
        method: 'POST',
        body: JSON.stringify({
          enabled: !security?.twoFactorEnabled,
        }),
      });
      
      if (res.ok) {
        const updatedSecurity = await res.json();
        setSecurity(updatedSecurity);
      }
    } catch (error) {
      console.error('Error toggling two-factor:', error);
    }
  };

  if (!user || user.role !== 'user') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Profile Settings
          </h1>
          <p className="text-gray-600 mt-2">Manage your account and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="relative inline-block">
                    <Avatar className="w-24 h-24 mx-auto mb-4">
                      <AvatarImage src={profile?.avatar} alt={profile?.name} />
                      <AvatarFallback>
                        <UserIcon className="h-12 w-12" />
                      </AvatarFallback>
                    </Avatar>
                    <label className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-2 cursor-pointer hover:bg-blue-600">
                      <CameraIcon className="h-4 w-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <h2 className="text-xl font-semibold">{profile?.name}</h2>
                  <p className="text-gray-600">{profile?.email}</p>
                  <Badge className="mt-2 bg-gradient-to-r from-purple-400 to-pink-400 text-white">
                    <TrophyIcon className="h-3 w-3 mr-1" />
                    Level {profile?.stats.level}
                  </Badge>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Member since</span>
                    <span className="text-sm font-medium">
                      {profile?.stats.memberSince ? new Date(profile.stats.memberSince).getFullYear() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Books read</span>
                    <span className="text-sm font-medium">{profile?.stats.totalBooks}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Reading time</span>
                    <span className="text-sm font-medium">
                      {profile?.stats.readingTime ? Math.floor(profile.stats.readingTime / 60) : 0}h
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Reviews written</span>
                    <span className="text-sm font-medium">{profile?.stats.reviewsWritten}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="privacy">Privacy</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="gender">Gender</Label>
                      <Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="City, Country"
                      />
                    </div>

                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={formData.website}
                        onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                        placeholder="https://yourwebsite.com"
                      />
                    </div>

                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Tell us about yourself..."
                        rows={4}
                      />
                    </div>

                    <Button onClick={handleSaveProfile} disabled={saving}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preferences" className="mt-6">
                <div className="space-y-6">
                  {/* Notification Preferences */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BellIcon className="h-5 w-5 mr-2" />
                        Notification Preferences
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Email Notifications</Label>
                          <p className="text-sm text-gray-600">Receive notifications via email</p>
                        </div>
                        <Switch
                          checked={profile?.preferences.notifications.email}
                          onCheckedChange={(checked) => handlePreferenceUpdate('notifications', 'email', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Push Notifications</Label>
                          <p className="text-sm text-gray-600">Receive push notifications</p>
                        </div>
                        <Switch
                          checked={profile?.preferences.notifications.push}
                          onCheckedChange={(checked) => handlePreferenceUpdate('notifications', 'push', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>SMS Notifications</Label>
                          <p className="text-sm text-gray-600">Receive SMS notifications</p>
                        </div>
                        <Switch
                          checked={profile?.preferences.notifications.sms}
                          onCheckedChange={(checked) => handlePreferenceUpdate('notifications', 'sms', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Marketing Emails</Label>
                          <p className="text-sm text-gray-600">Receive promotional emails</p>
                        </div>
                        <Switch
                          checked={profile?.preferences.notifications.marketing}
                          onCheckedChange={(checked) => handlePreferenceUpdate('notifications', 'marketing', checked)}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Reading Preferences */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BookOpenIcon className="h-5 w-5 mr-2" />
                        Reading Preferences
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Preferred Language</Label>
                        <Select 
                          value={profile?.preferences.reading.preferredLanguage} 
                          onValueChange={(value) => handlePreferenceUpdate('reading', 'preferredLanguage', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="english">English</SelectItem>
                            <SelectItem value="hindi">Hindi</SelectItem>
                            <SelectItem value="spanish">Spanish</SelectItem>
                            <SelectItem value="french">French</SelectItem>
                            <SelectItem value="german">German</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Default Font Size</Label>
                        <Select 
                          value={profile?.preferences.reading.fontSize.toString()} 
                          onValueChange={(value) => handlePreferenceUpdate('reading', 'fontSize', parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="12">Small (12px)</SelectItem>
                            <SelectItem value="14">Medium (14px)</SelectItem>
                            <SelectItem value="16">Large (16px)</SelectItem>
                            <SelectItem value="18">Extra Large (18px)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Theme</Label>
                        <Select 
                          value={profile?.preferences.reading.theme} 
                          onValueChange={(value) => handlePreferenceUpdate('reading', 'theme', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="auto">Auto</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Auto-save Progress</Label>
                          <p className="text-sm text-gray-600">Automatically save reading progress</p>
                        </div>
                        <Switch
                          checked={profile?.preferences.reading.autoSave}
                          onCheckedChange={(checked) => handlePreferenceUpdate('reading', 'autoSave', checked)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="security" className="mt-6">
                <div className="space-y-6">
                  {/* Password Change */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <KeyIcon className="h-5 w-5 mr-2" />
                        Change Password
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            type={showPassword ? "text" : "password"}
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeSlashIcon className="h-4 w-4" />
                            ) : (
                              <EyeIcon className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                        />
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                        />
                      </div>
                      <Button>Change Password</Button>
                    </CardContent>
                  </Card>

                  {/* Two-Factor Authentication */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <ShieldCheckIcon className="h-5 w-5 mr-2" />
                        Two-Factor Authentication
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Enable 2FA</Label>
                          <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                        </div>
                        <Switch
                          checked={security?.twoFactorEnabled}
                          onCheckedChange={handleTwoFactorToggle}
                        />
                      </div>
                      {security?.twoFactorEnabled && (
                        <div className="p-4 bg-green-50 rounded-lg">
                          <div className="flex items-center">
                            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                            <span className="text-sm text-green-700">Two-factor authentication is enabled</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Trusted Devices */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Trusted Devices</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {security?.trustedDevices.map(device => (
                          <div key={device.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium">{device.name}</p>
                              <p className="text-sm text-gray-600">{device.location}</p>
                              <p className="text-xs text-gray-500">Last used: {new Date(device.lastUsed).toLocaleDateString()}</p>
                            </div>
                            <Button variant="outline" size="sm">
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="privacy" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <EyeIcon className="h-5 w-5 mr-2" />
                      Privacy Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Profile Visibility</Label>
                        <p className="text-sm text-gray-600">Who can see your profile</p>
                      </div>
                      <Select 
                        value={profile?.preferences.privacy.profileVisibility} 
                        onValueChange={(value) => handlePreferenceUpdate('privacy', 'profileVisibility', value)}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="friends">Friends Only</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Reading Activity</Label>
                        <p className="text-sm text-gray-600">Show your reading activity to others</p>
                      </div>
                      <Switch
                        checked={profile?.preferences.privacy.readingActivity}
                        onCheckedChange={(checked) => handlePreferenceUpdate('privacy', 'readingActivity', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Online Status</Label>
                        <p className="text-sm text-gray-600">Show when you're online</p>
                      </div>
                      <Switch
                        checked={profile?.preferences.privacy.showOnlineStatus}
                        onCheckedChange={(checked) => handlePreferenceUpdate('privacy', 'showOnlineStatus', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileManagement;
