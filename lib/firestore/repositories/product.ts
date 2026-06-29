import {
  collection, query, where, orderBy, limit, startAfter, getDocs, getDoc, doc, setDoc, updateDoc,
  DocumentSnapshot, Query
} from 'firebase/firestore';
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

export interface ProductFilter {
  page?: number;
  limit?: number;
  categoryId?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
  sortBy?: 'createdAt' | 'name' | 'basePrice' | 'popularity';
  sortOrder?: 'asc' | 'desc';
  isFeatured?: boolean;
}

export interface PaginatedResult {
  products: Product[];
  total: number;
  page: number;
  pages: number;
  hasMore: boolean;
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

  static async getBySlug(slug: string): Promise<Product | null> {
    const q = query(collection(db, 'products'), where('slug', '==', slug), where('isDeleted', '==', false));
    const snapshot = await getDocs(q);
    return snapshot.docs.length > 0 ? this.fromFirestore(snapshot.docs[0]) : null;
  }

  static async getBySku(sku: string): Promise<Product | null> {
    const q = query(collection(db, 'products'), where('sku', '==', sku), where('isDeleted', '==', false));
    const snapshot = await getDocs(q);
    return snapshot.docs.length > 0 ? this.fromFirestore(snapshot.docs[0]) : null;
  }

  static async update(id: string, data: Partial<Product>): Promise<void> {
    await updateDoc(doc(db, 'products', id), this.toFirestore({ ...data, updatedAt: new Date() }));
  }

  static async incrementViewCount(id: string): Promise<void> {
    const product = await this.getById(id);
    if (product) {
      await this.update(id, { viewCount: (product.viewCount || 0) + 1 } as any);
    }
  }

  static async list(filters: ProductFilter = {}): Promise<PaginatedResult> {
    const limit_ = filters.limit || 20;
    const page = filters.page || 1;

    const constraints: any[] = [
      where('visibility', '==', 'PUBLIC'),
      where('isDeleted', '==', false),
    ];

    if (filters.categoryId) constraints.push(where('categoryId', '==', filters.categoryId));
    if (filters.brandId) constraints.push(where('brandId', '==', filters.brandId));
    if (filters.isFeatured) constraints.push(where('isFeatured', '==', true));

    const sortField = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder || 'desc';
    constraints.push(orderBy(sortField, sortOrder as any));
    constraints.push(limit(limit_ + 1));

    const q = query(collection(db, 'products'), ...constraints);
    const snapshot = await getDocs(q);

    let products = snapshot.docs.map(d => this.fromFirestore(d));

    if (filters.minPrice || filters.maxPrice) {
      products = products.filter(p => {
        const price = p.salePrice || p.basePrice;
        if (filters.minPrice && price.lessThan(new Decimal(filters.minPrice))) return false;
        if (filters.maxPrice && price.greaterThan(new Decimal(filters.maxPrice))) return false;
        return true;
      });
    }

    const hasMore = products.length > limit_;
    if (hasMore) products = products.slice(0, limit_);

    return {
      products,
      total: products.length,
      page,
      pages: Math.ceil(products.length / limit_),
      hasMore,
    };
  }

  static async listFeatured(limit_: number = 6): Promise<Product[]> {
    const q = query(
      collection(db, 'products'),
      where('isFeatured', '==', true),
      where('visibility', '==', 'PUBLIC'),
      where('isDeleted', '==', false),
      orderBy('displayOrder', 'asc'),
      limit(limit_)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => this.fromFirestore(d));
  }

  static async listNewArrivals(limit_: number = 6): Promise<Product[]> {
    const q = query(
      collection(db, 'products'),
      where('isNewArrival', '==', true),
      where('visibility', '==', 'PUBLIC'),
      where('isDeleted', '==', false),
      orderBy('createdAt', 'desc'),
      limit(limit_)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => this.fromFirestore(d));
  }

  static async listBestsellers(limit_: number = 6): Promise<Product[]> {
    const q = query(
      collection(db, 'products'),
      where('isBestseller', '==', true),
      where('visibility', '==', 'PUBLIC'),
      where('isDeleted', '==', false),
      orderBy('viewCount', 'desc'),
      limit(limit_)
    );
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
      deletedAt: data.deletedAt?.toDate?.() || data.deletedAt,
    };
  }
}
