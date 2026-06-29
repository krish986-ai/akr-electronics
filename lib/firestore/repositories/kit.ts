import { collection, query, where, orderBy, limit, getDocs, getDoc, doc, setDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Decimal } from 'decimal.js';

export interface KitComponent {
  id: string;
  productId: string;
  quantity: number;
  addedAt: Date;
}

export interface IotKit {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  thumbnailImage?: string;
  basePrice: Decimal;
  salePrice?: Decimal;
  discountPercent?: number;
  status: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED';
  isFeatured: boolean;
  visibility: 'PUBLIC' | 'PRIVATE' | 'HIDDEN' | 'DRAFT';
  displayOrder: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  viewCount: number;
  componentCount: number;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class KitRepository {
  static async create(data: Omit<IotKit, 'id' | 'createdAt' | 'updatedAt' | 'componentCount'>): Promise<IotKit> {
    const docRef = doc(collection(db, 'iotKits'));
    const now = new Date();
    const kit = { ...data, id: docRef.id, createdAt: now, updatedAt: now, componentCount: 0 };
    await setDoc(docRef, this.toFirestore(kit));
    return kit;
  }

  static async getById(id: string): Promise<IotKit | null> {
    const snapshot = await getDoc(doc(db, 'iotKits', id));
    return snapshot.exists() ? this.fromFirestore(snapshot) : null;
  }

  static async getBySlug(slug: string): Promise<IotKit | null> {
    const q = query(collection(db, 'iotKits'), where('slug', '==', slug), where('isDeleted', '==', false));
    const snapshot = await getDocs(q);
    return snapshot.docs.length > 0 ? this.fromFirestore(snapshot.docs[0]) : null;
  }

  static async update(id: string, data: Partial<IotKit>): Promise<void> {
    await updateDoc(doc(db, 'iotKits', id), this.toFirestore({ ...data, updatedAt: new Date() }));
  }

  static async listAll(limit_: number = 20): Promise<IotKit[]> {
    const q = query(
      collection(db, 'iotKits'),
      where('visibility', '==', 'PUBLIC'),
      where('isDeleted', '==', false),
      orderBy('createdAt', 'desc'),
      limit(limit_)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => this.fromFirestore(d));
  }

  static async listFeatured(limit_: number = 6): Promise<IotKit[]> {
    const q = query(
      collection(db, 'iotKits'),
      where('isFeatured', '==', true),
      where('visibility', '==', 'PUBLIC'),
      where('isDeleted', '==', false),
      orderBy('displayOrder', 'asc'),
      limit(limit_)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => this.fromFirestore(d));
  }

  static async addComponent(kitId: string, productId: string, quantity: number): Promise<void> {
    const componentRef = doc(collection(db, `iotKits/${kitId}/components`));
    const now = new Date();
    await setDoc(componentRef, {
      productId,
      quantity,
      addedAt: now,
    });

    const kit = await this.getById(kitId);
    if (kit) {
      await this.update(kitId, { componentCount: (kit.componentCount || 0) + 1 });
    }
  }

  static async removeComponent(kitId: string, componentId: string): Promise<void> {
    const batch = writeBatch(db);
    batch.delete(doc(db, `iotKits/${kitId}/components/${componentId}`));

    const kit = await this.getById(kitId);
    if (kit && kit.componentCount > 0) {
      batch.update(doc(db, 'iotKits', kitId), { componentCount: kit.componentCount - 1 });
    }

    await batch.commit();
  }

  static async getComponents(kitId: string): Promise<KitComponent[]> {
    const snapshot = await getDocs(collection(db, `iotKits/${kitId}/components`));
    return snapshot.docs.map(d => ({
      id: d.id,
      productId: d.data().productId,
      quantity: d.data().quantity,
      addedAt: d.data().addedAt?.toDate?.() || d.data().addedAt,
    }));
  }

  static toFirestore(kit: Partial<IotKit>): any {
    return {
      ...kit,
      basePrice: kit.basePrice?.toString(),
      salePrice: kit.salePrice?.toString() || null,
      updatedAt: kit.updatedAt || new Date(),
    };
  }

  static fromFirestore(doc: any): IotKit {
    const data = typeof doc.data === 'function' ? doc.data() : doc;
    return {
      ...data,
      id: doc.id,
      basePrice: new Decimal(data.basePrice || '0'),
      salePrice: data.salePrice ? new Decimal(data.salePrice) : undefined,
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
      deletedAt: data.deletedAt?.toDate?.() || data.deletedAt,
    };
  }
}
