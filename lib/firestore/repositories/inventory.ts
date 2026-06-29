import { collection, doc, setDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export interface InventoryHistory {
  id: string;
  productId: string;
  quantityChange: number;
  reason: string;
  notes?: string;
  createdAt: Date;
}

export class InventoryRepository {
  static async recordHistory(productId: string, data: Omit<InventoryHistory, 'id' | 'productId' | 'createdAt'>): Promise<InventoryHistory> {
    const histRef = doc(collection(db, 'products', productId, 'inventoryHistory'));
    const history = { ...data, id: histRef.id, productId, createdAt: new Date() };
    await setDoc(histRef, history);
    return history;
  }

  static async getHistory(productId: string): Promise<InventoryHistory[]> {
    const q = query(collection(db, 'products', productId, 'inventoryHistory'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, productId, ...d.data() } as InventoryHistory));
  }
}
