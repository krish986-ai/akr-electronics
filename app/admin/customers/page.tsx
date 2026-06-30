'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/Table';
import { } from '@/components/ui/Avatar';
import { Pagination } from '@/components/ui/Pagination';

export default function CustomersPage() {
  const [currentPage, setCurrentPage] = useState(1);

  const customers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', phone: '+91 9876543210', orders: 5, totalSpent: 25000, joinDate: '15-05-2026' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '+91 9876543211', orders: 3, totalSpent: 12500, joinDate: '20-05-2026' },
    { id: 3, name: 'Bob Wilson', email: 'bob@example.com', phone: '+91 9876543212', orders: 8, totalSpent: 45000, joinDate: '01-06-2026' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', phone: '+91 9876543213', orders: 2, totalSpent: 8500, joinDate: '10-06-2026' },
    { id: 5, name: 'Charlie Davis', email: 'charlie@example.com', phone: '+91 9876543214', orders: 4, totalSpent: 18000, joinDate: '12-06-2026' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Customers</h1>
        <Button variant="outline">Export List</Button>
      </div>

      <Card variant="default" className="bg-neutral-800 border-neutral-700">
        <CardContent className="p-6">
          <SearchInput placeholder="Search customers by name or email..." className="mb-6 w-full" />

          <div className="overflow-x-auto">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Name</TableHeader>
                  <TableHeader>Email</TableHeader>
                  <TableHeader>Phone</TableHeader>
                  <TableHeader>Orders</TableHeader>
                  <TableHeader>Total Spent</TableHeader>
                  <TableHeader>Joined</TableHeader>
                  <TableHeader>Action</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {customers.map(customer => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium text-white">{customer.name}</TableCell>
                    <TableCell className="text-neutral-400">{customer.email}</TableCell>
                    <TableCell className="text-neutral-400">{customer.phone}</TableCell>
                    <TableCell className="text-white">{customer.orders}</TableCell>
                    <TableCell className="text-white">₹{customer.totalSpent.toLocaleString()}</TableCell>
                    <TableCell className="text-neutral-400">{customer.joinDate}</TableCell>
                    <TableCell className="text-sm">
                      <button className="hover:text-primary">View</button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-center mt-6">
            <Pagination currentPage={currentPage} totalPages={8} onPageChange={setCurrentPage} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
