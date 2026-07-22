import { getAdminDb } from '@/lib/firebase/admin';
import {
  categoryTree as mockCategoryTree,
  products as mockProducts,
  CategoryNode,
  Product,
} from '@/lib/mock/products';

// Server-rendered pages should read through the Admin SDK. This avoids a
// browser-SDK read failure being silently replaced by the static mock catalog.
// Product documents created before the field was standardised use `isNew`;
// newer backend code may use `isNewArrival`, so support both forms.
function toStorefrontProduct(id: string, data: Record<string, unknown>): Product {
  return {
    ...(data as unknown as Product),
    id,
    isNew: Boolean(data.isNew ?? data.isNewArrival),
    isBestseller: Boolean(data.isBestseller),
    isFeatured: Boolean(data.isFeatured),
  };
}

export async function getServerProducts(): Promise<Product[]> {
  try {
    const snapshot = await getAdminDb().collection('products').get();
    if (snapshot.empty) return mockProducts;

    return snapshot.docs.map(product =>
      toStorefrontProduct(product.id, product.data() as Record<string, unknown>)
    );
  } catch (error) {
    console.error('Unable to load storefront products from Firestore:', error);
    return mockProducts;
  }
}

export async function getServerCategories(): Promise<CategoryNode[]> {
  try {
    const snapshot = await getAdminDb().collection('categories').get();
    if (snapshot.empty) return mockCategoryTree;

    return snapshot.docs.map(category => ({
      id: category.id,
      ...category.data(),
    })) as CategoryNode[];
  } catch (error) {
    console.error('Unable to load storefront categories from Firestore:', error);
    return mockCategoryTree;
  }
}
