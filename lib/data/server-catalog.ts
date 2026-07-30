import { getAdminDb } from '@/lib/firebase/admin';
import { unstable_cache } from 'next/cache';
import { Brand, CategoryNode, Product } from '@/lib/mock/products';

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

async function readServerProducts(): Promise<Product[]> {
  try {
    const snapshot = await getAdminDb().collection('products').get();
    if (snapshot.empty) return [];

    return snapshot.docs.map(product =>
      toStorefrontProduct(product.id, product.data() as Record<string, unknown>)
    );
  } catch (error) {
    console.error('Unable to load storefront products from Firestore:', error);
    return [];
  }
}

async function readServerCategories(): Promise<CategoryNode[]> {
  try {
    const snapshot = await getAdminDb().collection('categories').get();
    if (snapshot.empty) return [];

    return snapshot.docs.map(category => ({
      id: category.id,
      ...category.data(),
    })) as CategoryNode[];
  } catch (error) {
    console.error('Unable to load storefront categories from Firestore:', error);
    return [];
  }
}

async function readServerBrands(): Promise<Brand[]> {
  try {
    const snapshot = await getAdminDb().collection('brands').get();
    return snapshot.docs.map(brand => ({ id: brand.id, ...brand.data() })) as Brand[];
  } catch (error) {
    console.error('Unable to load storefront brands from Firestore:', error);
    return [];
  }
}

const cachedProducts = unstable_cache(readServerProducts, ['storefront-products'], { revalidate: 300 });
const cachedCategories = unstable_cache(readServerCategories, ['storefront-categories'], { revalidate: 300 });
const cachedBrands = unstable_cache(readServerBrands, ['storefront-brands'], { revalidate: 300 });

export function getServerProducts(): Promise<Product[]> {
  return cachedProducts();
}

export function getServerCategories(): Promise<CategoryNode[]> {
  return cachedCategories();
}

export function getServerBrands(): Promise<Brand[]> {
  return cachedBrands();
}
