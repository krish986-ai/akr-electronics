import { collection, query, where, orderBy, getDocs, getDoc, doc, setDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Decimal } from 'decimal.js';

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  shippingAddressId?: string;
  billingAddressId?: string;
  orderStatus: string;
  paymentStatus: string;
  subtotal: Decimal;
  tax: Decimal;
  shippingCost: Decimal;
  createdAt: Date;
  updatedAt: Date;
}

export class OrderRepository {
  static async create(data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    const docRef = doc(collection(db, 'orders'));
    const now = new Date();
    const order = { ...data, id: docRef.id, createdAt: now, updatedAt: now };
    await setDoc(docRef, this.toFirestore(order));
    return order;
  }

  static async getById(id: string): Promise<Order | null> {
    const snapshot = await getDoc(doc(db, 'orders', id));
    return snapshot.exists() ? this.fromFirestore(snapshot) : null;
  }

  static async getUserOrders(userId: string): Promise<Order[]> {
    const q = query(collection(db, 'orders'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => this.fromFirestore(d));
  }

  static async updateStatus(id: string, status: string): Promise<void> {
    await updateDoc(doc(db, 'orders', id), { orderStatus: status, updatedAt: new Date() });
  }

  static toFirestore(order: Partial<Order>): any {
    return {
      ...order,
      subtotal: order.subtotal?.toString(),
      tax: order.tax?.toString(),
      shippingCost: order.shippingCost?.toString(),
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
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
    };
  }
}
