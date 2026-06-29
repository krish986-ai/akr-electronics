import { collection, query, where, orderBy, limit, getDocs, getDoc, doc, setDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Decimal } from 'decimal.js';

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type ShippingStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: Decimal;
  subtotal: Decimal;
}

export interface OrderTimeline {
  timestamp: Date;
  status: OrderStatus;
  message: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  shippingAddressId?: string;
  billingAddressId?: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingStatus: ShippingStatus;
  paymentMethod?: string;
  paymentId?: string;
  transactionId?: string;
  subtotal: Decimal;
  tax: Decimal;
  shippingCost: Decimal;
  total: Decimal;
  notes?: string;
  trackingNumber?: string;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class OrderRepository {
  static async create(data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    const docRef = doc(collection(db, 'orders'));
    const now = new Date();
    const order: Order = {
      ...data,
      id: docRef.id,
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
    };
    await setDoc(docRef, this.toFirestore(order));

    await this.addTimeline(docRef.id, data.orderStatus, `Order created - ${data.orderNumber}`);

    return order;
  }

  static async getById(id: string): Promise<Order | null> {
    const snapshot = await getDoc(doc(db, 'orders', id));
    return snapshot.exists() ? this.fromFirestore(snapshot) : null;
  }

  static async getByOrderNumber(orderNumber: string): Promise<Order | null> {
    const q = query(collection(db, 'orders'), where('orderNumber', '==', orderNumber));
    const snapshot = await getDocs(q);
    return snapshot.docs.length > 0 ? this.fromFirestore(snapshot.docs[0]) : null;
  }

  static async getUserOrders(userId: string, limit_: number = 50): Promise<Order[]> {
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', userId),
      where('isDeleted', '==', false),
      orderBy('createdAt', 'desc'),
      limit(limit_)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => this.fromFirestore(d));
  }

  static async listAll(limit_: number = 50): Promise<Order[]> {
    const q = query(
      collection(db, 'orders'),
      where('isDeleted', '==', false),
      orderBy('createdAt', 'desc'),
      limit(limit_)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => this.fromFirestore(d));
  }

  static async listByStatus(status: OrderStatus, limit_: number = 50): Promise<Order[]> {
    const q = query(
      collection(db, 'orders'),
      where('orderStatus', '==', status),
      where('isDeleted', '==', false),
      orderBy('createdAt', 'desc'),
      limit(limit_)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => this.fromFirestore(d));
  }

  static async updateStatus(id: string, orderStatus: OrderStatus, message?: string): Promise<void> {
    const batch = writeBatch(db);

    batch.update(doc(db, 'orders', id), {
      orderStatus,
      updatedAt: new Date(),
    });

    await this.addTimeline(id, orderStatus, message || `Order status updated to ${orderStatus}`);
    await batch.commit();
  }

  static async updatePaymentStatus(id: string, status: PaymentStatus): Promise<void> {
    await updateDoc(doc(db, 'orders', id), {
      paymentStatus: status,
      updatedAt: new Date(),
    });
  }

  static async updateShippingStatus(id: string, status: ShippingStatus, trackingNumber?: string): Promise<void> {
    const updates: any = {
      shippingStatus: status,
      updatedAt: new Date(),
    };
    if (trackingNumber) updates.trackingNumber = trackingNumber;
    await updateDoc(doc(db, 'orders', id), updates);

    await this.addTimeline(id, 'SHIPPED', `Shipping status: ${status}${trackingNumber ? ` - Tracking: ${trackingNumber}` : ''}`);
  }

  static async getTimeline(orderId: string): Promise<OrderTimeline[]> {
    const snapshot = await getDocs(collection(db, `orders/${orderId}/timeline`));
    return snapshot.docs
      .map(d => ({
        timestamp: d.data().timestamp?.toDate?.() || d.data().timestamp,
        status: d.data().status,
        message: d.data().message,
      }))
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  private static async addTimeline(orderId: string, status: OrderStatus, message: string): Promise<void> {
    const timelineRef = doc(collection(db, `orders/${orderId}/timeline`));
    await setDoc(timelineRef, {
      timestamp: new Date(),
      status,
      message,
    });
  }

  static toFirestore(order: Partial<Order>): any {
    return {
      ...order,
      subtotal: order.subtotal?.toString(),
      tax: order.tax?.toString(),
      shippingCost: order.shippingCost?.toString(),
      total: order.total?.toString(),
      updatedAt: order.updatedAt || new Date(),
    };
  }

  static fromFirestore(doc: any): Order {
    const data = typeof doc.data === 'function' ? doc.data() : doc;
    return {
      ...data,
      id: doc.id,
      subtotal: new Decimal(data.subtotal || '0'),
      tax: new Decimal(data.tax || '0'),
      shippingCost: new Decimal(data.shippingCost || '0'),
      total: new Decimal(data.total || '0'),
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
      deletedAt: data.deletedAt?.toDate?.() || data.deletedAt,
    };
  }
}
