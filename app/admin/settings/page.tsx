'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';
import { Select } from '@/components/ui/Select';

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Settings</h1>

      {saved && <div className="p-4 bg-success rounded text-white">Settings saved successfully!</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card variant="default" className="bg-neutral-800 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-white">General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input label="Website Name" placeholder="A.K.R Electronics" />
            <Input label="Website URL" placeholder="https://akrelectronics.com" />
            <Input label="Currency" placeholder="INR" />
            <Input label="Tax Rate (%)" placeholder="18" />
            <Button onClick={handleSave} variant="primary" fullWidth>Save Changes</Button>
          </CardContent>
        </Card>

        {/* Contact Settings */}
        <Card variant="default" className="bg-neutral-800 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-white">Contact Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input label="Email" placeholder="support@akrelectronics.com" />
            <Input label="Phone" placeholder="+91 XXXXXXXXXX" />
            <Input label="Address" placeholder="123 Tech Street, Bangalore" />
            <Button onClick={handleSave} variant="primary" fullWidth>Save Changes</Button>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card variant="default" className="bg-neutral-800 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-white">Appearance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              label="Theme"
              options={[
                { label: 'Dark', value: 'dark' },
                { label: 'Light', value: 'light' },
              ]}
            />
            <Input label="Primary Color" placeholder="#0066FF" />
            <Input label="Secondary Color" placeholder="#FF6B35" />
            <Button onClick={handleSave} variant="primary" fullWidth>Save Changes</Button>
          </CardContent>
        </Card>

        {/* Email Settings */}
        <Card variant="default" className="bg-neutral-800 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-white">Email</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input label="SMTP Host" placeholder="smtp.gmail.com" />
            <Input label="SMTP Port" placeholder="587" />
            <Input label="From Address" placeholder="noreply@akrelectronics.com" />
            <Button onClick={handleSave} variant="primary" fullWidth>Save Changes</Button>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card variant="default" className="bg-neutral-800 border-neutral-700 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white">Social Media</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Facebook" placeholder="https://facebook.com/akrelectronics" />
              <Input label="Twitter" placeholder="https://twitter.com/akrelectronics" />
              <Input label="Instagram" placeholder="https://instagram.com/akrelectronics" />
              <Input label="LinkedIn" placeholder="https://linkedin.com/company/akr" />
            </div>
            <Button onClick={handleSave} variant="primary" fullWidth>Save Changes</Button>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card variant="default" className="bg-neutral-800 border-neutral-700 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white">System</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Checkbox label="Enable Maintenance Mode" />
            <Checkbox label="Allow User Registration" defaultChecked />
            <Checkbox label="Enable Guest Checkout" defaultChecked />
            <Checkbox label="Enable Product Reviews" defaultChecked />
            <Checkbox label="Send Email Notifications" defaultChecked />
            <Button onClick={handleSave} variant="primary" fullWidth>Save Changes</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
