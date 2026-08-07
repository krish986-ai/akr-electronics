'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  updateProfile,
} from 'firebase/auth';
import { cn } from '@/lib/utils/cn';
import { useAuth } from '@/lib/auth/client';
import { fetchUserProfile, saveUserProfile } from '@/lib/auth/profile';
import { profileUpdateSchema } from '@/lib/auth/validation';
import { friendlyAuthError } from '@/lib/auth/errors';
import { auth, isFirebaseConfigured } from '@/lib/firebase/config';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { Alert } from '@/components/ui/Alert';

const container = 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8';

interface ProfileForm {
  name: string;
  phone: string;
  branch: string;
  college: string;
}

const emptyForm: ProfileForm = { name: '', phone: '', branch: '', college: '' };

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const [profileLoading, setProfileLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [savedProfile, setSavedProfile] = useState<ProfileForm>(emptyForm);
  const [formData, setFormData] = useState<ProfileForm>(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [newPassword, setNewPassword] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (!user) {
      setProfileLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const profile = await fetchUserProfile(user.id);
        if (cancelled) return;
        const loaded: ProfileForm = {
          name: profile?.name || user.name,
          phone: profile?.phone ?? '',
          branch: profile?.branch ?? '',
          college: profile?.college ?? '',
        };
        setSavedProfile(loaded);
        setFormData(loaded);
        setEmail(profile?.email || user.email);
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSave = async () => {
    if (!user) return;
    const parsed = profileUpdateSchema.safeParse(formData);
    if (!parsed.success) {
      setErrorMessage(parsed.error.issues[0]?.message ?? 'Please check the form');
      return;
    }
    setIsSaving(true);
    setErrorMessage('');
    try {
      await saveUserProfile(user.id, parsed.data);
      if (isFirebaseConfigured && auth?.currentUser) {
        await updateProfile(auth.currentUser, { displayName: parsed.data.name });
      }
      setSavedProfile(parsed.data);
      setSuccessMessage('Profile updated successfully');
      setIsEditing(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrorMessage(friendlyAuthError(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword.new.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }
    if (newPassword.new !== newPassword.confirm) {
      setPasswordError('Passwords do not match');
      return;
    }

    setIsSaving(true);
    setPasswordError('');
    try {
      if (isFirebaseConfigured && auth?.currentUser?.email) {
        const credential = EmailAuthProvider.credential(auth.currentUser.email, newPassword.current);
        await reauthenticateWithCredential(auth.currentUser, credential);
        await updatePassword(auth.currentUser, newPassword.new);
      }
      setSuccessMessage('Password changed successfully');
      setNewPassword({ current: '', new: '', confirm: '' });
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setPasswordError(friendlyAuthError(err));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || profileLoading) {
    return (
      <div className={cn(container, 'py-20 text-center')}>
        <p className="text-sm text-neutral-500">Loading your profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={cn(container, 'py-20 max-w-md text-center')}>
        <p className="text-5xl mb-4">🔒</p>
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Sign in required</h1>
        <p className="text-sm text-neutral-500 mb-6">Sign in to view and manage your profile.</p>
        <Link
          href="/auth/login"
          className="inline-block bg-primary-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-primary-700"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const profileContent = (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>Update your student profile details</CardDescription>
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
              <Input value={email} disabled />
              <p className="text-xs text-neutral-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-900">Mobile Number</label>
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleProfileChange}
                placeholder="9876543210"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-900">Branch</label>
                <Input
                  name="branch"
                  value={formData.branch}
                  onChange={handleProfileChange}
                  placeholder="e.g. ECE, CSE"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-900">College</label>
                <Input
                  name="college"
                  value={formData.college}
                  onChange={handleProfileChange}
                  placeholder="Your college name"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleProfileSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setFormData(savedProfile);
                  setErrorMessage('');
                  setIsEditing(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-neutral-600">Full Name</p>
                <p className="text-lg font-medium text-neutral-900 mt-1">{savedProfile.name || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600">Email</p>
                <p className="text-lg font-medium text-neutral-900 mt-1">{email || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600">Mobile Number</p>
                <p className="text-lg font-medium text-neutral-900 mt-1">{savedProfile.phone || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600">Branch</p>
                <p className="text-lg font-medium text-neutral-900 mt-1">{savedProfile.branch || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600">College</p>
                <p className="text-lg font-medium text-neutral-900 mt-1">{savedProfile.college || '—'}</p>
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

  const deliveryContent = (
    <Card>
      <CardHeader>
        <CardTitle>Delivery Information</CardTitle>
        <CardDescription>Where your orders are delivered</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
          <p className="text-sm font-semibold text-amber-800">📦 College delivery only</p>
          <p className="text-sm text-amber-700 mt-1">
            We deliver parcels only at your college — not at home or any other place.
          </p>
        </div>
        <div>
          <p className="text-sm text-neutral-600">Your delivery location</p>
          <p className="text-lg font-medium text-neutral-900 mt-1">
            {savedProfile.college || 'Add your college in the Profile tab'}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  const securityContent = (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>Update your password regularly for security</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-neutral-900">Current Password</label>
              <Link href="/auth/forgot-password" className="text-xs text-primary-600 hover:text-primary-700">
                Forgot it?
              </Link>
            </div>
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

          {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}

          <Button onClick={handlePasswordChange} disabled={isSaving} className="mt-4">
            {isSaving ? 'Updating...' : 'Update Password'}
          </Button>
        </div>
      </CardContent>
    </Card>
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
      {errorMessage && (
        <Alert variant="error" className="mb-6">{errorMessage}</Alert>
      )}

      <Tabs
        tabs={[
          { label: 'Profile', value: 'profile', content: profileContent },
          { label: 'Delivery', value: 'delivery', content: deliveryContent },
          { label: 'Security', value: 'security', content: securityContent },
        ]}
        defaultTab="profile"
      />
    </div>
  );
}
