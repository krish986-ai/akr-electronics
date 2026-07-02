import { collection, query, where, orderBy, limit, getDocs, getDoc, doc, setDoc, updateDoc } from 'firebase/firestore';
import { getDb } from '@/lib/firestore/safe-db';

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED';
  isFeatured: boolean;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class BrandRepository {
  static async create(data: Omit<Brand, 'id' | 'createdAt' | 'updatedAt'>): Promise<Brand> {
    const docRef = doc(collection(getDb(), 'brands'));
    const now = new Date();
    const brand = { ...data, id: docRef.id, createdAt: now, updatedAt: now };
    await setDoc(docRef, this.toFirestore(brand));
    return brand;
  }

  static async getById(id: string): Promise<Brand | null> {
    const snapshot = await getDoc(doc(getDb(), 'brands', id));
    return snapshot.exists() ? this.fromFirestore(snapshot) : null;
  }

  static async getBySlug(slug: string): Promise<Brand | null> {
    const q = query(collection(getDb(), 'brands'), where('slug', '==', slug), where('isDeleted', '==', false));
    const snapshot = await getDocs(q);
    return snapshot.docs.length > 0 ? this.fromFirestore(snapshot.docs[0]) : null;
  }

  static async update(id: string, data: Partial<Brand>): Promise<void> {
    await updateDoc(doc(getDb(), 'brands', id), this.toFirestore({ ...data, updatedAt: new Date() }));
  }

  static async listAll(limit_: number = 50): Promise<Brand[]> {
    const q = query(
      collection(getDb(), 'brands'),
      where('isDeleted', '==', false),
      where('status', '==', 'ACTIVE'),
      orderBy('createdAt', 'desc'),
      limit(limit_)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => this.fromFirestore(d));
  }

  static async listFeatured(limit_: number = 10): Promise<Brand[]> {
    const q = query(
      collection(getDb(), 'brands'),
      where('isFeatured', '==', true),
      where('isDeleted', '==', false),
      where('status', '==', 'ACTIVE'),
      orderBy('createdAt', 'desc'),
      limit(limit_)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => this.fromFirestore(d));
  }

  static toFirestore(brand: Partial<Brand>): any {
    return {
      ...brand,
      updatedAt: brand.updatedAt || new Date(),
    };
  }

  static fromFirestore(doc: any): Brand {
    const data = typeof doc.data === 'function' ? doc.data() : doc;
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
    };
  }
}
