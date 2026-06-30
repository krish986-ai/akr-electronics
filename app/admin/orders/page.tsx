'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';

export default function OrdersPage() {
  const [currentPage, setCurrentPage] = useState(1);

  const orders = [
    { id: '#2345', customer: 'John Doe', amount: 5000, date: '28-06-2026', status: 'Delivered' },
    { id: '#2344', customer: 'Jane Smith', amount: 3200, date: '27-06-2026', status: 'Processing' },
    { id: '#2343', customer: 'Bob Wilson', amount: 7500, date: '26-06-2026', status: 'Pending' },
    { id: '#2342', customer: 'Alice Brown', amount: 2100, date: '25-06-2026', status: 'Delivered' },
    { id: '#2341', customer: 'Charlie Davis', amount: 4300, date: '24-06-2026', status: 'Shipped' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Orders</h1>
        <Button variant="primary">Export Orders</Button>
      </div>

      <Card variant="default" className="bg-neutral-800 border-neutral-700">
        <CardContent className="p-6">
          <div className="flex gap-4 mb-6">
            <SearchInput placeholder="Search orders..." className="flex-1" />
            <Button variant="outline">Filter by Status</Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Order ID</TableHeader>
                  <TableHeader>Customer</TableHeader>
                  <TableHeader>Amount</TableHeader>
                  <TableHeader>Date</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Actions</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium text-white">{order.id}</TableCell>
                    <TableCell className="text-neutral-400">{order.customer}</TableCell>
                    <TableCell className="text-white">₹{order.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-neutral-400">{order.date}</TableCell>
                    <TableCell>
                      <Badge variant={order.status === 'Delivered' ? 'success' : order.status === 'Processing' ? 'primary' : 'warning'} size="sm">
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm space-x-2">
                      <button className="hover:text-primary">View</button>
                      <button className="hover:text-primary">Update</button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-center mt-6">
            <Pagination currentPage={currentPage} totalPages={10} onPageChange={setCurrentPage} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
