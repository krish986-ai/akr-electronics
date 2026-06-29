import { collection, getDocs, getDoc, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export interface CartItem {
  id: string;
  cartId: string;
  productId?: string;
  kitId?: string;
  quantity: number;
  addedAt: Date;
  updatedAt: Date;
}

export interface Cart {
  userId: string;
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export class CartRepository {
  static async getOrCreate(userId: string): Promise<Cart> {
    const cartDoc = await getDoc(doc(db, 'carts', userId));
    if (cartDoc.exists()) {
      return this.fromFirestore(cartDoc, userId);
    }

    const now = new Date();
    const cart: Cart = { userId, itemCount: 0, createdAt: now, updatedAt: now };
    await setDoc(doc(db, 'carts', userId), this.toFirestore(cart));
    return cart;
  }

  static async addItem(userId: string, item: Omit<CartItem, 'id' | 'cartId' | 'addedAt' | 'updatedAt'>): Promise<CartItem> {
    await this.getOrCreate(userId);
    const itemRef = doc(collection(db, 'carts', userId, 'items'));
    const now = new Date();
    const newItem = { ...item, id: itemRef.id, cartId: userId, addedAt: now, updatedAt: now };
    await setDoc(itemRef, newItem);

    await updateDoc(doc(db, 'carts', userId), { updatedAt: now });

    return newItem;
  }

  static async updateItem(userId: string, itemId: string, quantity: number): Promise<CartItem | null> {
    const itemRef = doc(db, 'carts', userId, 'items', itemId);
    const itemDoc = await getDoc(itemRef);

    if (!itemDoc.exists()) return null;

    const now = new Date();
    await updateDoc(itemRef, { quantity, updatedAt: now });
    await updateDoc(doc(db, 'carts', userId), { updatedAt: now });

    return { id: itemId, cartId: userId, ...itemDoc.data(), quantity, updatedAt: now } as CartItem;
  }

  static async getItems(userId: string): Promise<CartItem[]> {
    const snapshot = await getDocs(collection(db, 'carts', userId, 'items'));
    return snapshot.docs.map(d => this.itemFromFirestore(d, userId));
  }

  static async getItem(userId: string, itemId: string): Promise<CartItem | null> {
    const doc_ = await getDoc(doc(db, 'carts', userId, 'items', itemId));
    return doc_.exists() ? this.itemFromFirestore(doc_, userId) : null;
  }

  static async removeItem(userId: string, itemId: string): Promise<void> {
    await deleteDoc(doc(db, 'carts', userId, 'items', itemId));
    await updateDoc(doc(db, 'carts', userId), { updatedAt: new Date() });
  }

  static async clearCart(userId: string): Promise<void> {
    const items = await this.getItems(userId);
    for (const item of items) {
      await deleteDoc(doc(db, 'carts', userId, 'items', item.id));
    }
    await updateDoc(doc(db, 'carts', userId), { updatedAt: new Date() });
  }

  static async getItemCount(userId: string): Promise<number> {
    const items = await this.getItems(userId);
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }

  private static toFirestore(cart: Partial<Cart>): any {
    return {
      ...cart,
      updatedAt: cart.updatedAt || new Date(),
    };
  }

  private static fromFirestore(doc: any, userId: string): Cart {
    const data = typeof doc.data === 'function' ? doc.data() : doc;
    return {
      userId: userId || data.userId,
      itemCount: data.itemCount || 0,
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
    };
  }

  private static itemFromFirestore(doc: any, userId: string): CartItem {
    const data = typeof doc.data === 'function' ? doc.data() : doc;
    return {
      id: doc.id,
      cartId: userId,
      ...data,
      addedAt: data.addedAt?.toDate?.() || data.addedAt,
      updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
    };
  }
}
