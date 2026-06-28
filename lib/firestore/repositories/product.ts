import { collection, query, where, orderBy, limit, getDocs, getDoc, doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Decimal } from 'decimal.js';

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  shortDescription?: string;
  thumbnailImage?: string;
  basePrice: Decimal;
  salePrice?: Decimal;
  discountPercent?: number;
  stock: number;
  reservedStock?: number;
  lowStockLimit: number;
  weight?: Decimal;
  dimensions?: any;
  specifications?: any;
  categoryId: string;
  brandId?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED' | 'OUT_OF_STOCK';
  visibility: 'PUBLIC' | 'PRIVATE' | 'HIDDEN' | 'DRAFT';
  isFeatured: boolean;
  isNewArrival?: boolean;
  isBestseller?: boolean;
  displayOrder: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  viewCount: number;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class ProductRepository {
  static async create(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const docRef = doc(collection(db, 'products'));
    const now = new Date();
    const product = { ...data, id: docRef.id, createdAt: now, updatedAt: now };
    await setDoc(docRef, this.toFirestore(product));
    return product;
  }

  static async getById(id: string): Promise<Product | null> {
    const snapshot = await getDoc(doc(db, 'products', id));
    return snapshot.exists() ? this.fromFirestore(snapshot) : null;
  }

  static async update(id: string, data: Partial<Product>): Promise<void> {
    await updateDoc(doc(db, 'products', id), this.toFirestore({ ...data, updatedAt: new Date() }));
  }

  static async list(limit_: number = 20): Promise<Product[]> {
    const q = query(collection(db, 'products'), where('visibility', '==', 'PUBLIC'), orderBy('createdAt', 'desc'), limit(limit_));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => this.fromFirestore(d));
  }

  static toFirestore(product: Partial<Product>): any {
    return {
      ...product,
      basePrice: product.basePrice?.toString(),
      salePrice: product.salePrice?.toString() || null,
      weight: product.weight?.toString(),
      updatedAt: product.updatedAt || new Date(),
    };
  }

  static fromFirestore(doc: any): Product {
    const data = typeof doc.data === 'function' ? doc.data() : doc;
    return {
      ...data,
      id: doc.id,
      basePrice: new Decimal(data.basePrice || '0'),
      salePrice: data.salePrice ? new Decimal(data.salePrice) : undefined,
      weight: data.weight ? new Decimal(data.weight) : undefined,
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
    };
  }
}
