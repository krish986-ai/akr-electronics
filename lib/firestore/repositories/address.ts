import { collection, getDocs, getDoc, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export interface Address {
  id: string;
  userId: string;
  name: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  type?: 'HOME' | 'OFFICE' | 'OTHER';
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class AddressRepository {
  static async create(userId: string, data: Omit<Address, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Address> {
    const addrRef = doc(collection(db, 'users', userId, 'addresses'));
    const now = new Date();
    const address = { ...data, id: addrRef.id, userId, createdAt: now, updatedAt: now };
    await setDoc(addrRef, address);
    return address;
  }

  static async getById(userId: string, addressId: string): Promise<Address | null> {
    const snapshot = await getDoc(doc(db, 'users', userId, 'addresses', addressId));
    return snapshot.exists() ? this.fromFirestore(snapshot, userId) : null;
  }

  static async getAddresses(userId: string): Promise<Address[]> {
    const snapshot = await getDocs(collection(db, 'users', userId, 'addresses'));
    return snapshot.docs.map(d => this.fromFirestore(d, userId));
  }

  static async getUserAddresses(userId: string): Promise<Address[]> {
    return this.getAddresses(userId);
  }

  static async update(userId: string, addressId: string, data: Partial<Address>): Promise<void> {
    const updates = { ...data, updatedAt: new Date() };
    await updateDoc(doc(db, 'users', userId, 'addresses', addressId), updates);
  }

  static async delete(userId: string, addressId: string): Promise<void> {
    await deleteDoc(doc(db, 'users', userId, 'addresses', addressId));
  }

  private static fromFirestore(doc: any, userId: string): Address {
    const data = typeof doc.data === 'function' ? doc.data() : doc;
    return {
      ...data,
      id: doc.id,
      userId: userId || data.userId,
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
    };
  }
}
