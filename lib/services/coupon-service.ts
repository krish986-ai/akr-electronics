import { CouponRepository, Coupon, DiscountType } from '@/lib/firestore/repositories';
import { Decimal } from 'decimal.js';

export interface CreateCouponInput {
  code: string;
  discountType: DiscountType;
  value: number | string;
  minAmount?: number | string;
  maxDiscount?: number | string;
  description?: string;
  expiryDate: Date;
  usageLimit?: number;
}

export interface UpdateCouponInput {
  code?: string;
  discountType?: DiscountType;
  value?: number | string;
  minAmount?: number | string;
  maxDiscount?: number | string;
  description?: string;
  expiryDate?: Date;
  usageLimit?: number;
  status?: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
}

export class CouponService {
  static async createCoupon(data: CreateCouponInput): Promise<Coupon> {
    return CouponRepository.create({
      code: data.code,
      discountType: data.discountType,
      value: new Decimal(data.value),
      minAmount: data.minAmount ? new Decimal(data.minAmount) : undefined,
      maxDiscount: data.maxDiscount ? new Decimal(data.maxDiscount) : undefined,
      description: data.description,
      expiryDate: data.expiryDate,
      usageLimit: data.usageLimit,
      status: 'ACTIVE',
      isDeleted: false,
    });
  }

  static async getCouponById(id: string): Promise<Coupon | null> {
    return CouponRepository.getById(id);
  }

  static async getCouponByCode(code: string): Promise<Coupon | null> {
    return CouponRepository.getByCode(code);
  }

  static async updateCoupon(id: string, data: UpdateCouponInput): Promise<Coupon | null> {
    const updates: Partial<Coupon> = {};
    if (data.code) updates.code = data.code;
    if (data.discountType) updates.discountType = data.discountType;
    if (data.value) updates.value = new Decimal(data.value);
    if (data.minAmount !== undefined) updates.minAmount = new Decimal(data.minAmount);
    if (data.maxDiscount !== undefined) updates.maxDiscount = new Decimal(data.maxDiscount);
    if (data.description) updates.description = data.description;
    if (data.expiryDate) updates.expiryDate = data.expiryDate;
    if (data.usageLimit !== undefined) updates.usageLimit = data.usageLimit;
    if (data.status) updates.status = data.status;

    updates.updatedAt = new Date();
    await CouponRepository.update(id, updates);
    return CouponRepository.getById(id);
  }

  static async deleteCoupon(id: string): Promise<void> {
    await CouponRepository.update(id, {
      isDeleted: true,
      deletedAt: new Date(),
      status: 'INACTIVE',
    } as any);
  }

  static async validateAndApplyCoupon(
    code: string,
    orderTotal: Decimal
  ): Promise<{ valid: boolean; discount?: Decimal; message?: string; couponId?: string }> {
    const result = await CouponRepository.validateCoupon(code, orderTotal);

    if (!result.valid) {
      return result;
    }

    const coupon = await this.getCouponByCode(code);
    if (!coupon) {
      return { valid: false, message: 'Coupon not found' };
    }

    await CouponRepository.incrementUsageCount(coupon.id);

    return {
      valid: true,
      discount: result.discount,
      couponId: coupon.id,
    };
  }

  static async listActiveCoupons(limit: number = 50): Promise<Coupon[]> {
    return CouponRepository.listActive(limit);
  }
}
