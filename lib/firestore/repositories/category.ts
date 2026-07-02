import { collection, query, where, orderBy, limit, getDocs, getDoc, doc, setDoc, updateDoc } from 'firebase/firestore';
import { getDb } from '@/lib/firestore/safe-db';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  parentId?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  isFeatured: boolean;
  displayOrder: number;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class CategoryRepository {
  static async create(data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
    const docRef = doc(collection(getDb(), 'categories'));
    const now = new Date();
    const category = { ...data, id: docRef.id, createdAt: now, updatedAt: now };
    await setDoc(docRef, this.toFirestore(category));
    return category;
  }

  static async getById(id: string): Promise<Category | null> {
    const snapshot = await getDoc(doc(getDb(), 'categories', id));
    return snapshot.exists() ? this.fromFirestore(snapshot) : null;
  }

  static async getBySlug(slug: string): Promise<Category | null> {
    const q = query(collection(getDb(), 'categories'), where('slug', '==', slug), where('isDeleted', '==', false));
    const snapshot = await getDocs(q);
    return snapshot.docs.length > 0 ? this.fromFirestore(snapshot.docs[0]) : null;
  }

  static async update(id: string, data: Partial<Category>): Promise<void> {
    await updateDoc(doc(getDb(), 'categories', id), this.toFirestore({ ...data, updatedAt: new Date() }));
  }

  static async listAll(limit_: number = 50): Promise<Category[]> {
    const q = query(
      collection(getDb(), 'categories'),
      where('isDeleted', '==', false),
      where('status', '==', 'ACTIVE'),
      orderBy('displayOrder', 'asc'),
      limit(limit_)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => this.fromFirestore(d));
  }

  static async listFeatured(limit_: number = 10): Promise<Category[]> {
    const q = query(
      collection(getDb(), 'categories'),
      where('isFeatured', '==', true),
      where('isDeleted', '==', false),
      where('status', '==', 'ACTIVE'),
      orderBy('displayOrder', 'asc'),
      limit(limit_)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => this.fromFirestore(d));
  }

  static async getChildren(parentId: string): Promise<Category[]> {
    const q = query(
      collection(getDb(), 'categories'),
      where('parentId', '==', parentId),
      where('isDeleted', '==', false),
      orderBy('displayOrder', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => this.fromFirestore(d));
  }

  static toFirestore(category: Partial<Category>): any {
    return {
      ...category,
      updatedAt: category.updatedAt || new Date(),
    };
  }

  static fromFirestore(doc: any): Category {
    const data = typeof doc.data === 'function' ? doc.data() : doc;
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
    };
  }
}
