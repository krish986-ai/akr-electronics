'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { Alert } from '@/components/ui/Alert';

const container = 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+91 9876543210',
    country: 'India',
    city: 'Bangalore',
  });

  const [newPassword, setNewPassword] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSave = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccessMessage('Profile updated successfully');
      setIsEditing(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword.new !== newPassword.confirm) {
      alert('Passwords do not match');
      return;
    }

    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccessMessage('Password changed successfully');
      setNewPassword({ current: '', new: '', confirm: '' });
      setTimeout(() => setSuccessMessage(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const profileContent = (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>Update your profile details</CardDescription>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-900">Full Name</label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleProfileChange}
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-900">Email</label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleProfileChange}
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-900">Phone</label>
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleProfileChange}
                placeholder="Enter your phone number"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-900">City</label>
                <Input
                  name="city"
                  value={formData.city}
                  onChange={handleProfileChange}
                  placeholder="Enter your city"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-900">Country</label>
                <Input
                  name="country"
                  value={formData.country}
                  onChange={handleProfileChange}
                  placeholder="Enter your country"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleProfileSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-neutral-600">Full Name</p>
                <p className="text-lg font-medium text-neutral-900 mt-1">{formData.name}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600">Email</p>
                <p className="text-lg font-medium text-neutral-900 mt-1">{formData.email}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600">Phone</p>
                <p className="text-lg font-medium text-neutral-900 mt-1">{formData.phone}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600">Location</p>
                <p className="text-lg font-medium text-neutral-900 mt-1">{formData.city}, {formData.country}</p>
              </div>
            </div>

            <div className="pt-4">
              <Button onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const addressesContent = (
    <Card>
      <CardHeader>
        <CardTitle>Saved Addresses</CardTitle>
        <CardDescription>Manage your delivery addresses</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[
            { label: 'Home', address: '123 Main St, Bangalore, Karnataka 560001' },
            { label: 'Work', address: '456 Business Ave, Bangalore, Karnataka 560002' },
          ].map((addr, idx) => (
            <div key={idx} className="border border-neutral-200 rounded-lg p-4 flex justify-between items-start">
              <div>
                <p className="font-semibold text-neutral-900">{addr.label}</p>
                <p className="text-sm text-neutral-600 mt-1">{addr.address}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Edit</Button>
                <Button variant="outline" size="sm" className="text-red-600 border-red-200">Delete</Button>
              </div>
            </div>
          ))}
        </div>

        <Button className="mt-6">Add New Address</Button>
      </CardContent>
    </Card>
  );

  const securityContent = (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your password regularly for security</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-900">Current Password</label>
              <Input
                type="password"
                value={newPassword.current}
                onChange={(e) => setNewPassword(prev => ({ ...prev, current: e.target.value }))}
                placeholder="Enter current password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-900">New Password</label>
              <Input
                type="password"
                value={newPassword.new}
                onChange={(e) => setNewPassword(prev => ({ ...prev, new: e.target.value }))}
                placeholder="Enter new password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-900">Confirm Password</label>
              <Input
                type="password"
                value={newPassword.confirm}
                onChange={(e) => setNewPassword(prev => ({ ...prev, confirm: e.target.value }))}
                placeholder="Confirm new password"
              />
            </div>

            <Button onClick={handlePasswordChange} disabled={isSaving} className="mt-4">
              {isSaving ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className={cn(container, 'py-12')}>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-neutral-900">Account Settings</h1>
        <p className="text-neutral-600 mt-2">Manage your profile and preferences</p>
      </div>

      {successMessage && (
        <Alert variant="success" className="mb-6">{successMessage}</Alert>
      )}

      <Tabs
        tabs={[
          { label: 'Profile', value: 'profile', content: profileContent },
          { label: 'Addresses', value: 'addresses', content: addressesContent },
          { label: 'Security', value: 'security', content: securityContent },
        ]}
        defaultTab="profile"
      />
    </div>
  );
}
