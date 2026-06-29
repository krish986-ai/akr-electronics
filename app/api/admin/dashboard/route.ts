import { NextRequest, NextResponse } from 'next/server';
import {
  ProductRepository,
  OrderRepository,
  UserRepository,
  CategoryRepository,
  BrandRepository,
} from '@/lib/firestore/repositories';

export async function GET(req: NextRequest) {
  try {
    const userRole = req.headers.get('x-user-role');
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { Decimal } = require('decimal.js');

    const [productsResult, orders, customers, categories, brands] = await Promise.all([
      ProductRepository.list({ limit: 1000 }),
      OrderRepository.listAll(1000),
      UserRepository.listCustomers(1000),
      CategoryRepository.listAll(1000),
      BrandRepository.listAll(1000),
    ]);

    const recentOrders = orders.slice(0, 5);
    const totalRevenue = orders.reduce((sum: any, order: any) => sum.plus(order.total), new Decimal('0'));
    const totalOrders = orders.length;
    const totalProducts = productsResult.products.length;
    const totalCustomers = customers.length;
    const totalCategories = categories.length;
    const totalBrands = brands.length;

    const ordersThisMonth = orders.filter((o: any) => {
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return o.createdAt >= firstDayOfMonth;
    }).length;

    const lowStockProducts = productsResult.products.filter((p: any) => p.stock <= p.lowStockLimit).slice(0, 5);

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalProducts,
          totalCategories,
          totalBrands,
          totalOrders,
          totalCustomers,
          totalRevenue: totalRevenue.toString(),
          ordersThisMonth,
          lowStockCount: lowStockProducts.length,
        },
        recentOrders: recentOrders.map(o => ({
          id: o.id,
          orderNumber: o.orderNumber,
          userId: o.userId,
          total: o.total.toString(),
          status: o.orderStatus,
          createdAt: o.createdAt,
        })),
        lowStockProducts: lowStockProducts.map(p => ({
          id: p.id,
          name: p.name,
          sku: p.sku,
          stock: p.stock,
          lowStockLimit: p.lowStockLimit,
        })),
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats', details: error instanceof Error ? error.message : '' },
      { status: 500 }
    );
  }
}
