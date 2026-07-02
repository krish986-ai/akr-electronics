import { collection, query, where, orderBy, limit, getDocs, getDoc, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { getDb } from '@/lib/firestore/safe-db';

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title?: string;
  content?: string;
  helpful: number;
  unhelpful: number;
  isVerifiedPurchase: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: Date;
  updatedAt: Date;
}

export class ReviewRepository {
  static async create(data: Omit<Review, 'id' | 'createdAt' | 'updatedAt' | 'helpful' | 'unhelpful'>): Promise<Review> {
    const docRef = doc(collection(getDb(), `products/${data.productId}/reviews`));
    const now = new Date();
    const review = { ...data, id: docRef.id, createdAt: now, updatedAt: now, helpful: 0, unhelpful: 0 };
    await setDoc(docRef, this.toFirestore(review));
    return review;
  }

  static async getById(productId: string, reviewId: string): Promise<Review | null> {
    const snapshot = await getDoc(doc(getDb(), `products/${productId}/reviews/${reviewId}`));
    return snapshot.exists() ? this.fromFirestore(snapshot, productId) : null;
  }

  static async update(productId: string, reviewId: string, data: Partial<Review>): Promise<void> {
    await updateDoc(doc(getDb(), `products/${productId}/reviews/${reviewId}`), this.toFirestore({ ...data, updatedAt: new Date() }));
  }

  static async delete(productId: string, reviewId: string): Promise<void> {
    await deleteDoc(doc(getDb(), `products/${productId}/reviews/${reviewId}`));
  }

  static async listByProduct(productId: string, limit_: number = 10): Promise<Review[]> {
    const q = query(
      collection(getDb(), `products/${productId}/reviews`),
      where('status', '==', 'APPROVED'),
      orderBy('createdAt', 'desc'),
      limit(limit_)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => this.fromFirestore(d, productId));
  }

  static async listPending(productId: string, limit_: number = 20): Promise<Review[]> {
    const q = query(
      collection(getDb(), `products/${productId}/reviews`),
      where('status', '==', 'PENDING'),
      orderBy('createdAt', 'asc'),
      limit(limit_)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => this.fromFirestore(d, productId));
  }

  static async listByUser(userId: string, limit_: number = 20): Promise<Review[]> {
    const q = query(collection(getDb(), 'products'), limit(1));
    const productsSnapshot = await getDocs(q);

    const allReviews: Review[] = [];
    for (const productDoc of productsSnapshot.docs) {
      const reviewsQ = query(
        collection(getDb(), `products/${productDoc.id}/reviews`),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const reviewsSnapshot = await getDocs(reviewsQ);
      allReviews.push(...reviewsSnapshot.docs.map(d => this.fromFirestore(d, productDoc.id)));
    }

    return allReviews.slice(0, limit_);
  }

  static async incrementHelpful(productId: string, reviewId: string): Promise<void> {
    const review = await this.getById(productId, reviewId);
    if (review) {
      await this.update(productId, reviewId, { helpful: review.helpful + 1 });
    }
  }

  static async incrementUnhelpful(productId: string, reviewId: string): Promise<void> {
    const review = await this.getById(productId, reviewId);
    if (review) {
      await this.update(productId, reviewId, { unhelpful: review.unhelpful + 1 });
    }
  }

  static toFirestore(review: Partial<Review>): any {
    return {
      ...review,
      updatedAt: review.updatedAt || new Date(),
    };
  }

  static fromFirestore(doc: any, productId: string): Review {
    const data = typeof doc.data === 'function' ? doc.data() : doc;
    return {
      ...data,
      id: doc.id,
      productId: productId || data.productId,
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
    };
  }
}
