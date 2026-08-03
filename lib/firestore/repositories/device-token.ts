import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { getDb } from '@/lib/firestore/safe-db';

export interface DeviceToken {
  id: string;
  userId: string;
  token: string;
  platform: 'android' | 'ios' | 'web';
  createdAt: Date;
}

export class DeviceTokenRepository {
  static async register(userId: string, token: string, platform: DeviceToken['platform']): Promise<void> {
    const db = getDb();
    const tokenRef = doc(db, 'users', userId, 'deviceTokens', token);
    await setDoc(tokenRef, { id: token, userId, token, platform, createdAt: new Date() });
  }

  static async unregister(userId: string, token: string): Promise<void> {
    const db = getDb();
    await deleteDoc(doc(db, 'users', userId, 'deviceTokens', token));
  }

  static async getTokensForUser(userId: string): Promise<DeviceToken[]> {
    const db = getDb();
    const snapshot = await getDocs(collection(db, 'users', userId, 'deviceTokens'));
    return snapshot.docs.map(d => {
      const data = d.data();
      return { ...data, createdAt: data.createdAt?.toDate?.() || data.createdAt } as DeviceToken;
    });
  }
}
