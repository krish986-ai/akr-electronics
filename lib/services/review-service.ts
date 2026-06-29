import { ReviewRepository, Review } from '@/lib/firestore/repositories';

export interface CreateReviewInput {
  productId: string;
  userId: string;
  rating: number;
  title?: string;
  content?: string;
  isVerifiedPurchase?: boolean;
}

export interface UpdateReviewInput {
  rating?: number;
  title?: string;
  content?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export class ReviewService {
  static async createReview(data: CreateReviewInput): Promise<Review> {
    if (data.rating < 1 || data.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    return ReviewRepository.create({
      productId: data.productId,
      userId: data.userId,
      rating: data.rating,
      title: data.title,
      content: data.content,
      isVerifiedPurchase: data.isVerifiedPurchase || false,
      status: 'PENDING',
    });
  }

  static async getReviewById(productId: string, reviewId: string): Promise<Review | null> {
    return ReviewRepository.getById(productId, reviewId);
  }

  static async updateReview(productId: string, reviewId: string, data: UpdateReviewInput): Promise<Review | null> {
    if (data.rating !== undefined) {
      if (data.rating < 1 || data.rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }
    }

    const updates: Partial<Review> = {};
    if (data.rating) updates.rating = data.rating;
    if (data.title) updates.title = data.title;
    if (data.content) updates.content = data.content;
    if (data.status) updates.status = data.status;

    updates.updatedAt = new Date();
    await ReviewRepository.update(productId, reviewId, updates);
    return ReviewRepository.getById(productId, reviewId);
  }

  static async deleteReview(productId: string, reviewId: string): Promise<void> {
    await ReviewRepository.delete(productId, reviewId);
  }

  static async approveReview(productId: string, reviewId: string): Promise<void> {
    await ReviewRepository.update(productId, reviewId, { status: 'APPROVED' } as any);
  }

  static async rejectReview(productId: string, reviewId: string): Promise<void> {
    await ReviewRepository.update(productId, reviewId, { status: 'REJECTED' } as any);
  }

  static async getProductReviews(productId: string, limit: number = 10): Promise<Review[]> {
    return ReviewRepository.listByProduct(productId, limit);
  }

  static async getPendingReviews(productId: string, limit: number = 20): Promise<Review[]> {
    return ReviewRepository.listPending(productId, limit);
  }

  static async getUserReviews(userId: string, limit: number = 20): Promise<Review[]> {
    return ReviewRepository.listByUser(userId, limit);
  }

  static async markHelpful(productId: string, reviewId: string): Promise<void> {
    await ReviewRepository.incrementHelpful(productId, reviewId);
  }

  static async markUnhelpful(productId: string, reviewId: string): Promise<void> {
    await ReviewRepository.incrementUnhelpful(productId, reviewId);
  }
}
