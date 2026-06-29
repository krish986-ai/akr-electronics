import { collection, query, where, orderBy, limit, getDocs, getDoc, doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export type UserRole = 'ADMIN' | 'CUSTOMER';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DELETED';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  image?: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  verifiedAt?: Date;
  lastLoginAt?: Date;
  loginCount: number;
  failedLoginAttempts: number;
  lastFailedLoginAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class UserRepository {
  static async create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'loginCount' | 'failedLoginAttempts'>): Promise<User> {
    const now = new Date();
    const user = {
      ...data,
      id: data.id || '',
      loginCount: 0,
      failedLoginAttempts: 0,
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(doc(db, 'users', data.id), this.toFirestore(user));
    return user as User;
  }

  static async getById(id: string): Promise<User | null> {
    const snapshot = await getDoc(doc(db, 'users', id));
    return snapshot.exists() ? this.fromFirestore(snapshot) : null;
  }

  static async getByEmail(email: string): Promise<User | null> {
    const q = query(collection(db, 'users'), where('email', '==', email.toLowerCase()));
    const snapshot = await getDocs(q);
    return snapshot.docs.length > 0 ? this.fromFirestore(snapshot.docs[0]) : null;
  }

  static async update(id: string, data: Partial<User>): Promise<void> {
    await updateDoc(doc(db, 'users', id), this.toFirestore({ ...data, updatedAt: new Date() }));
  }

  static async listAdmins(limit_: number = 50): Promise<User[]> {
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'ADMIN'),
      where('isDeleted', '==', false),
      orderBy('createdAt', 'desc'),
      limit(limit_)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => this.fromFirestore(d));
  }

  static async listCustomers(limit_: number = 50): Promise<User[]> {
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'CUSTOMER'),
      where('isDeleted', '==', false),
      orderBy('createdAt', 'desc'),
      limit(limit_)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => this.fromFirestore(d));
  }

  static async updateLoginInfo(id: string, success: boolean = true): Promise<void> {
    const user = await this.getById(id);
    if (!user) return;

    const updates: Partial<User> = {
      updatedAt: new Date(),
    };

    if (success) {
      updates.lastLoginAt = new Date();
      updates.loginCount = (user.loginCount || 0) + 1;
      updates.failedLoginAttempts = 0;
    } else {
      updates.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      updates.lastFailedLoginAt = new Date();
    }

    await updateDoc(doc(db, 'users', id), this.toFirestore(updates));
  }

  static toFirestore(user: Partial<User>): any {
    return {
      ...user,
      email: user.email?.toLowerCase(),
      updatedAt: user.updatedAt || new Date(),
    };
  }

  static fromFirestore(doc: any): User {
    const data = typeof doc.data === 'function' ? doc.data() : doc;
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
      verifiedAt: data.verifiedAt?.toDate?.() || data.verifiedAt,
      lastLoginAt: data.lastLoginAt?.toDate?.() || data.lastLoginAt,
      lastFailedLoginAt: data.lastFailedLoginAt?.toDate?.() || data.lastFailedLoginAt,
      deletedAt: data.deletedAt?.toDate?.() || data.deletedAt,
    };
  }
}
