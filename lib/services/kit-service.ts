import { collection, doc, setDoc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Decimal } from 'decimal.js';

export interface IotKit {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: Decimal;
  salePrice?: Decimal;
  status: string;
  isFeatured: boolean;
  visibility: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class KitService {
  static async createKit(data: any): Promise<IotKit> {
    const docRef = doc(collection(db, 'iotKits'));
    const kit = {
      ...data,
      id: docRef.id,
      basePrice: new Decimal(data.basePrice),
      salePrice: data.salePrice ? new Decimal(data.salePrice) : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await setDoc(docRef, this.toFirestore(kit));
    return kit;
  }

  static async getKitById(id: string): Promise<IotKit | null> {
    const snapshot = await getDoc(doc(db, 'iotKits', id));
    return snapshot.exists() ? this.fromFirestore(snapshot) : null;
  }

  static async listKits(): Promise<IotKit[]> {
    const q = query(collection(db, 'iotKits'), where('visibility', '==', 'PUBLIC'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => this.fromFirestore(d));
  }

  private static toFirestore(kit: any) {
    return {
      ...kit,
      basePrice: kit.basePrice?.toString(),
      salePrice: kit.salePrice?.toString() || null,
      updatedAt: kit.updatedAt || new Date(),
    };
  }

  private static fromFirestore(doc: any): IotKit {
    const data = typeof doc.data === 'function' ? doc.data() : doc;
    return {
      ...data,
      id: doc.id,
      basePrice: new Decimal(data.basePrice || '0'),
      salePrice: data.salePrice ? new Decimal(data.salePrice) : undefined,
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
    };
  }
}
