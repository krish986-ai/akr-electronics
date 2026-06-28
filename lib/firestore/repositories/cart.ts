import { collection, query, where, getDocs, getDoc, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export interface CartItem {
  id: string;
  cartId: string;
  productId?: string;
  kitId?: string;
  quantity: number;
}

export class CartRepository {
  static async getOrCreate(userId: string): Promise<string> {
    const cartDoc = await getDoc(doc(db, 'carts', userId));
    if (!cartDoc.exists()) {
      await setDoc(doc(db, 'carts', userId), { userId, createdAt: new Date(), updatedAt: new Date() });
    }
    return userId;
  }

  static async addItem(userId: string, item: Omit<CartItem, 'id' | 'cartId'>): Promise<CartItem> {
    const cartId = await this.getOrCreate(userId);
    const itemRef = doc(collection(db, 'carts', cartId, 'items'));
    const newItem = { ...item, id: itemRef.id, cartId };
    await setDoc(itemRef, newItem);
    return newItem;
  }

  static async getItems(userId: string): Promise<CartItem[]> {
    const snapshot = await getDocs(collection(db, 'carts', userId, 'items'));
    return snapshot.docs.map(d => ({ id: d.id, cartId: userId, ...d.data() } as CartItem));
  }

  static async removeItem(userId: string, itemId: string): Promise<void> {
    await deleteDoc(doc(db, 'carts', userId, 'items', itemId));
  }

  static async clearCart(userId: string): Promise<void> {
    const items = await this.getItems(userId);
    for (const item of items) {
      await this.removeItem(userId, item.id);
    }
  }
}
