import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase/config';
import {
  coupons as mockCoupons,
  productReviews as mockReviews,
  productQuestions as mockQuestions,
  heroBanners as mockBanners,
  defaultStoreConfig,
  Product,
  Brand,
  CategoryNode,
  Coupon,
  ProductReview,
  ProductQuestion,
  HeroBanner,
  StoreConfig,
} from '@/lib/mock/products';

type StorefrontCatalog = {
  products: Product[];
  categories: CategoryNode[];
  brands: Brand[];
};

let storefrontCatalogPromise: Promise<StorefrontCatalog> | null = null;

async function getStorefrontCatalog(): Promise<StorefrontCatalog> {
  if (!storefrontCatalogPromise) {
    storefrontCatalogPromise = fetch('/api/public/catalog').then(async response => {
      if (!response.ok) throw new Error('Unable to load the live product catalog');
      return response.json() as Promise<StorefrontCatalog>;
    });
  }

  try {
    return await storefrontCatalogPromise;
  } catch (error) {
    storefrontCatalogPromise = null;
    throw error;
  }
}

// Single data-access point for the storefront. Reads Firestore when Firebase
// is configured and the collection has data; otherwise serves the mock
// catalog so the app works before backend setup (see ROADMAP Phase 17).

async function fromCollection<T>(name: string, fallback: T[]): Promise<T[]> {
  if (!isFirebaseConfigured || !db) return fallback;
  try {
    const snapshot = await getDocs(collection(db, name));
    if (snapshot.empty) return fallback;
    return snapshot.docs.map(d => {
      const data = d.data();
      // Keep the storefront compatible with both product flag names. The admin
      // product editor writes `isNew`, while an earlier repository used
      // `isNewArrival`.
      if (name === 'products') {
        return {
          id: d.id,
          ...data,
          isNew: Boolean(data.isNew ?? data.isNewArrival),
          isBestseller: Boolean(data.isBestseller),
          isFeatured: Boolean(data.isFeatured),
        } as T;
      }
      return { id: d.id, ...data } as T;
    });
  } catch {
    return fallback;
  }
}

export async function getProducts(): Promise<Product[]> {
  return (await getStorefrontCatalog()).products;
}

export async function getProduct(idOrSlug: string): Promise<Product | undefined> {
  return (await getProducts()).find(p => p.id === idOrSlug || p.slug === idOrSlug);
}

export async function getBrands(): Promise<Brand[]> {
  return (await getStorefrontCatalog()).brands;
}

export async function getCategories(): Promise<CategoryNode[]> {
  return (await getStorefrontCatalog()).categories;
}

export async function getCoupons(): Promise<Coupon[]> {
  if (!isFirebaseConfigured || !db) return mockCoupons;
  try {
    const snapshot = await getDocs(collection(db, 'coupons'));
    if (snapshot.empty) return mockCoupons;
    return snapshot.docs.map(d => ({ code: d.id, ...d.data() }) as Coupon);
  } catch {
    return mockCoupons;
  }
}

export async function getReviews(): Promise<ProductReview[]> {
  return fromCollection<ProductReview>('reviews', mockReviews);
}

export async function getQuestions(): Promise<ProductQuestion[]> {
  return fromCollection<ProductQuestion>('questions', mockQuestions);
}

export async function getBanners(): Promise<HeroBanner[]> {
  return fromCollection<HeroBanner>('banners', mockBanners);
}

export async function getActiveBanners(): Promise<HeroBanner[]> {
  const banners = await getBanners();
  const active = banners.filter(b => b.active !== false);
  return active.length > 0 ? active : mockBanners;
}

export async function getStoreConfig(): Promise<StoreConfig> {
  if (!isFirebaseConfigured || !db) return defaultStoreConfig;
  try {
    const snapshot = await getDoc(doc(db, 'config', 'store'));
    if (!snapshot.exists()) return defaultStoreConfig;
    return { ...defaultStoreConfig, ...(snapshot.data() as Partial<StoreConfig>) };
  } catch {
    return defaultStoreConfig;
  }
}

export function isLiveData(): boolean {
  return isFirebaseConfigured;
}
