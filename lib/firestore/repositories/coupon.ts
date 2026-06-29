import { collection, query, where, orderBy, limit, getDocs, getDoc, doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Decimal } from 'decimal.js';

export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export interface Coupon {
  id: string;
  code: string;
  discountType: DiscountType;
  value: Decimal;
  minAmount?: Decimal;
  maxDiscount?: Decimal;
  description?: string;
  expiryDate: Date;
  usageLimit?: number;
  usedCount: number;
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class CouponRepository {
  static async create(data: Omit<Coupon, 'id' | 'createdAt' | 'updatedAt' | 'usedCount'>): Promise<Coupon> {
    const docRef = doc(collection(db, 'coupons'));
    const now = new Date();
    const coupon = { ...data, id: docRef.id, createdAt: now, updatedAt: now, usedCount: 0 };
    await setDoc(docRef, this.toFirestore(coupon));
    return coupon;
  }

  static async getById(id: string): Promise<Coupon | null> {
    const snapshot = await getDoc(doc(db, 'coupons', id));
    return snapshot.exists() ? this.fromFirestore(snapshot) : null;
  }

  static async getByCode(code: string): Promise<Coupon | null> {
    const q = query(collection(db, 'coupons'), where('code', '==', code.toUpperCase()), where('isDeleted', '==', false));
    const snapshot = await getDocs(q);
    return snapshot.docs.length > 0 ? this.fromFirestore(snapshot.docs[0]) : null;
  }

  static async validateCoupon(code: string, orderTotal: Decimal): Promise<{ valid: boolean; discount?: Decimal; message?: string }> {
    const coupon = await this.getByCode(code);

    if (!coupon) {
      return { valid: false, message: 'Coupon not found' };
    }

    if (coupon.status !== 'ACTIVE') {
      return { valid: false, message: 'Coupon is not active' };
    }

    if (new Date() > coupon.expiryDate) {
      return { valid: false, message: 'Coupon has expired' };
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, message: 'Coupon usage limit exceeded' };
    }

    if (coupon.minAmount && orderTotal.lessThan(coupon.minAmount)) {
      return { valid: false, message: `Minimum order amount required: ${coupon.minAmount}` };
    }

    let discount = new Decimal(0);
    if (coupon.discountType === 'PERCENTAGE') {
      discount = orderTotal.mul(coupon.value.div(100));
    } else {
      discount = coupon.value;
    }

    if (coupon.maxDiscount && discount.greaterThan(coupon.maxDiscount)) {
      discount = coupon.maxDiscount;
    }

    return { valid: true, discount };
  }

  static async update(id: string, data: Partial<Coupon>): Promise<void> {
    await updateDoc(doc(db, 'coupons', id), this.toFirestore({ ...data, updatedAt: new Date() }));
  }

  static async incrementUsageCount(id: string): Promise<void> {
    const coupon = await this.getById(id);
    if (coupon) {
      await this.update(id, { usedCount: coupon.usedCount + 1 });
    }
  }

  static async listActive(limit_: number = 50): Promise<Coupon[]> {
    const q = query(
      collection(db, 'coupons'),
      where('status', '==', 'ACTIVE'),
      where('isDeleted', '==', false),
      where('expiryDate', '>=', new Date()),
      orderBy('expiryDate', 'asc'),
      limit(limit_)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => this.fromFirestore(d));
  }

  static toFirestore(coupon: Partial<Coupon>): any {
    return {
      ...coupon,
      code: coupon.code?.toUpperCase(),
      value: coupon.value?.toString(),
      minAmount: coupon.minAmount?.toString(),
      maxDiscount: coupon.maxDiscount?.toString(),
      updatedAt: coupon.updatedAt || new Date(),
    };
  }

  static fromFirestore(doc: any): Coupon {
    const data = typeof doc.data === 'function' ? doc.data() : doc;
    return {
      ...data,
      id: doc.id,
      value: new Decimal(data.value || '0'),
      minAmount: data.minAmount ? new Decimal(data.minAmount) : undefined,
      maxDiscount: data.maxDiscount ? new Decimal(data.maxDiscount) : undefined,
      expiryDate: data.expiryDate?.toDate?.() || data.expiryDate,
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
      deletedAt: data.deletedAt?.toDate?.() || data.deletedAt,
    };
  }
}
