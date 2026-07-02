import { collection, getDocs, doc, getDoc, query, where, limit as fbLimit } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase/config';
import {
  products as mockProducts,
  brands as mockBrands,
  categoryTree as mockCategoryTree,
  Product,
  Brand,
  CategoryNode,
} from '@/lib/mock/products';

// Single data-access point for the storefront. Reads Firestore when Firebase
// is configured and the collection has data; otherwise serves the mock
// catalog so the app works before backend setup (see ROADMAP Phase 17).

async function fromCollection<T>(name: string, fallback: T[]): Promise<T[]> {
  if (!isFirebaseConfigured || !db) return fallback;
  try {
    const snapshot = await getDocs(collection(db, name));
    if (snapshot.empty) return fallback;
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }) as T);
  } catch {
    return fallback;
  }
}

export async function getProducts(): Promise<Product[]> {
  return fromCollection<Product>('products', mockProducts);
}

export async function getProduct(idOrSlug: string): Promise<Product | undefined> {
  if (isFirebaseConfigured && db) {
    try {
      const byId = await getDoc(doc(db, 'products', idOrSlug));
      if (byId.exists()) return { id: byId.id, ...byId.data() } as Product;

      const bySlug = await getDocs(
        query(collection(db, 'products'), where('slug', '==', idOrSlug), fbLimit(1))
      );
      if (!bySlug.empty) {
        const d = bySlug.docs[0];
        return { id: d.id, ...d.data() } as Product;
      }
    } catch {
      // fall through to mock
    }
  }
  return mockProducts.find(p => p.id === idOrSlug || p.slug === idOrSlug);
}

export async function getBrands(): Promise<Brand[]> {
  return fromCollection<Brand>('brands', mockBrands);
}

export async function getCategories(): Promise<CategoryNode[]> {
  return fromCollection<CategoryNode>('categories', mockCategoryTree);
}

export function isLiveData(): boolean {
  return isFirebaseConfigured;
}
