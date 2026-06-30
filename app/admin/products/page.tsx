'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';

export default function ProductsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const products = [
    { id: 1, name: 'Arduino Uno R3', sku: 'ARDUINO-UNO', category: 'Microcontroller', price: 450, stock: 150, status: 'Published' },
    { id: 2, name: 'Raspberry Pi 4', sku: 'RPI-4-8GB', category: 'SBC', price: 4500, stock: 75, status: 'Published' },
    { id: 3, name: 'DHT22 Sensor', sku: 'DHT22', category: 'Sensor', price: 280, stock: 25, status: 'Published' },
    { id: 4, name: 'HC-SR04 Sensor', sku: 'HC-SR04', category: 'Sensor', price: 150, stock: 300, status: 'Published' },
    { id: 5, name: 'Servo Motor SG90', sku: 'SG90', category: 'Motor', price: 220, stock: 8, status: 'Draft' },
  ];

  const filtered = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Products</h1>
        <Button variant="primary">+ New Product</Button>
      </div>

      <Card variant="default" className="bg-neutral-800 border-neutral-700">
        <CardContent className="p-6">
          <div className="flex gap-4 mb-6">
            <SearchInput placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1" />
            <Button variant="outline">Filter</Button>
            <Button variant="outline">Export</Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Product</TableHeader>
                  <TableHeader>SKU</TableHeader>
                  <TableHeader>Category</TableHeader>
                  <TableHeader>Price</TableHeader>
                  <TableHeader>Stock</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Actions</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map(product => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium text-white">{product.name}</TableCell>
                    <TableCell className="text-neutral-400">{product.sku}</TableCell>
                    <TableCell className="text-neutral-400">{product.category}</TableCell>
                    <TableCell className="text-white">₹{product.price}</TableCell>
                    <TableCell className={product.stock < 20 ? 'text-warning' : 'text-success'}>{product.stock}</TableCell>
                    <TableCell><Badge variant={product.status === 'Published' ? 'success' : 'primary'} size="sm">{product.status}</Badge></TableCell>
                    <TableCell className="text-sm space-x-2">
                      <button className="hover:text-primary">Edit</button>
                      <button className="hover:text-error">Delete</button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-center mt-6">
            <Pagination currentPage={currentPage} totalPages={5} onPageChange={setCurrentPage} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
