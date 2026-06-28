'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function AdminDashboard() {
  const stats = [
    { label: 'Total Sales', value: '₹2,45,000', change: '+12.5%', icon: '💰' },
    { label: 'Total Orders', value: '342', change: '+5.2%', icon: '📦' },
    { label: 'Total Products', value: '1,245', change: '+3.1%', icon: '📊' },
    { label: 'Total Customers', value: '5,432', change: '+8.7%', icon: '👥' },
  ];

  const recentOrders = [
    { id: '#2345', customer: 'John Doe', amount: '₹5,000', status: 'Delivered' },
    { id: '#2344', customer: 'Jane Smith', amount: '₹3,200', status: 'Processing' },
    { id: '#2343', customer: 'Bob Wilson', amount: '₹7,500', status: 'Pending' },
    { id: '#2342', customer: 'Alice Brown', amount: '₹2,100', status: 'Delivered' },
  ];

  const lowStockProducts = [
    { name: 'Arduino Uno R3', stock: 15, sku: 'ARDUINO-UNO-R3' },
    { name: 'Servo Motor SG90', stock: 8, sku: 'SG90-SERVO' },
    { name: 'DHT22 Sensor', stock: 5, sku: 'DHT22-SENSOR' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-neutral-400 mt-1">Welcome back, Admin</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Download Report</Button>
          <Button variant="primary">Generate Invoice</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} variant="default" className="bg-neutral-800 border-neutral-700">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-neutral-400 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                  <p className="text-success text-xs mt-2">{stat.change} from last month</p>
                </div>
                <div className="text-3xl">{stat.icon}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <Card variant="default" className="lg:col-span-2 bg-neutral-800 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentOrders.map((order, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-neutral-700 rounded">
                  <div>
                    <p className="font-medium text-white">{order.id}</p>
                    <p className="text-sm text-neutral-400">{order.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-white">{order.amount}</p>
                    <Badge variant={order.status === 'Delivered' ? 'success' : order.status === 'Processing' ? 'primary' : 'warning'} size="sm">
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card variant="default" className="bg-neutral-800 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-white">Low Stock Alert</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockProducts.map((product, i) => (
                <div key={i} className="p-2 bg-neutral-700 rounded">
                  <p className="font-medium text-warning text-sm">{product.name}</p>
                  <p className="text-xs text-neutral-400">{product.stock} units left</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card variant="default" className="bg-neutral-800 border-neutral-700">
        <CardHeader>
          <CardTitle className="text-white">System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-neutral-400">Database</span>
              <Badge variant="success" size="sm">Connected</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Payment Gateway</span>
              <Badge variant="success" size="sm">Active</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Email Service</span>
              <Badge variant="success" size="sm">Running</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
