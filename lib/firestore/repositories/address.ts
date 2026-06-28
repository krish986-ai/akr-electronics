import { collection, getDocs, getDoc, doc, setDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
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
  isDefault: boolean;
  createdAt: Date;
}

export class AddressRepository {
  static async create(userId: string, data: Omit<Address, 'id' | 'userId' | 'createdAt'>): Promise<Address> {
    const addrRef = doc(collection(db, 'users', userId, 'addresses'));
    const address = { ...data, id: addrRef.id, userId, createdAt: new Date() };
    await setDoc(addrRef, address);
    return address;
  }

  static async getAddresses(userId: string): Promise<Address[]> {
    const snapshot = await getDocs(collection(db, 'users', userId, 'addresses'));
    return snapshot.docs.map(d => ({ id: d.id, userId, ...d.data() } as Address));
  }

  static async update(userId: string, addressId: string, data: Partial<Address>): Promise<void> {
    await updateDoc(doc(db, 'users', userId, 'addresses', addressId), data);
  }

  static async delete(userId: string, addressId: string): Promise<void> {
    await deleteDoc(doc(db, 'users', userId, 'addresses', addressId));
  }
}
