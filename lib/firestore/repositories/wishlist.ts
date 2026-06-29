import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export interface WishlistItem {
  id: string;
  userId: string;
  productId?: string;
  kitId?: string;
  createdAt: Date;
}

export class WishlistRepository {
  static async add(userId: string, productId?: string, kitId?: string): Promise<WishlistItem> {
    const itemRef = doc(collection(db, 'users', userId, 'wishlist'));
    const item = { id: itemRef.id, userId, productId: productId || undefined, kitId: kitId || undefined, createdAt: new Date() };
    await setDoc(itemRef, item);
    return item as WishlistItem;
  }

  static async getItems(userId: string): Promise<WishlistItem[]> {
    const snapshot = await getDocs(collection(db, 'users', userId, 'wishlist'));
    return snapshot.docs.map(d => ({ id: d.id, userId, ...d.data() } as WishlistItem));
  }

  static async remove(userId: string, itemId: string): Promise<void> {
    await deleteDoc(doc(db, 'users', userId, 'wishlist', itemId));
  }
}
