import { collection, getDocs } from 'firebase/firestore';
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

// Single data-access point for the storefront. All hot paths go through
// CDN-cached API routes backed by the Admin SDK, so browsers never read
// Firestore directly and only download the data the page actually needs.

type StorefrontCatalog = {
  products: Product[];
  categories: CategoryNode[];
  brands: Brand[];
};

type StorefrontMeta = {
  categories: CategoryNode[];
  brands: Brand[];
  banners: HeroBanner[];
  config: StoreConfig;
};

export type CatalogPageParams = {
  search?: string;
  category?: string;
  brand?: string;
  maxPrice?: number;
  sort?: string;
  page?: number;
  pageSize?: number;
};

export type CatalogPage = {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
};

export type ProductDetail = {
  product: Product;
  related: Product[];
  reviews: ProductReview[];
  questions: ProductQuestion[];
};

function memoizedFetch<T>(url: string): { get: () => Promise<T>; reset: () => void } {
  let promise: Promise<T> | null = null;
  const get = async (): Promise<T> => {
    if (!promise) {
      promise = fetch(url).then(async response => {
        if (!response.ok) throw new Error(`Unable to load ${url}`);
        return response.json() as Promise<T>;
      });
    }
    try {
      return await promise;
    } catch (error) {
      promise = null;
      throw error;
    }
  };
  return { get, reset: () => (promise = null) };
}

// Full catalog — only used by low-traffic pages that genuinely need every
// product (admin panels, compare, wishlist). Storefront browsing uses the
// paginated getCatalogPage instead.
const catalogFetch = memoizedFetch<StorefrontCatalog>('/api/public/catalog');

// Small payload for the page chrome (menus, banners, footer, announcement).
const metaFetch = memoizedFetch<StorefrontMeta>('/api/public/storefront');

export async function getProducts(): Promise<Product[]> {
  return (await catalogFetch.get()).products;
}

export async function getProduct(idOrSlug: string): Promise<Product | undefined> {
  return (await getProducts()).find(p => p.id === idOrSlug || p.slug === idOrSlug);
}

export async function getCatalogPage(params: CatalogPageParams): Promise<CatalogPage> {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.category) query.set('category', params.category);
  if (params.brand) query.set('brand', params.brand);
  if (params.maxPrice !== undefined) query.set('maxPrice', String(params.maxPrice));
  if (params.sort) query.set('sort', params.sort);
  if (params.page) query.set('page', String(params.page));
  if (params.pageSize) query.set('pageSize', String(params.pageSize));

  const response = await fetch(`/api/public/products?${query.toString()}`);
  if (!response.ok) throw new Error('Unable to load products');
  return response.json() as Promise<CatalogPage>;
}

export async function getProductDetail(idOrSlug: string): Promise<ProductDetail | null> {
  const response = await fetch(`/api/public/products/${encodeURIComponent(idOrSlug)}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('Unable to load product');
  return response.json() as Promise<ProductDetail>;
}

export async function getBrands(): Promise<Brand[]> {
  return (await metaFetch.get()).brands;
}

export async function getCategories(): Promise<CategoryNode[]> {
  return (await metaFetch.get()).categories;
}

export async function getBanners(): Promise<HeroBanner[]> {
  return (await metaFetch.get()).banners;
}

export async function getActiveBanners(): Promise<HeroBanner[]> {
  const banners = await getBanners();
  const active = banners.filter(b => b.active !== false);
  return active.length > 0 ? active : mockBanners;
}

export async function getStoreConfig(): Promise<StoreConfig> {
  try {
    return { ...defaultStoreConfig, ...(await metaFetch.get()).config };
  } catch {
    return defaultStoreConfig;
  }
}

// The reads below still use the browser SDK: they only run on low-traffic
// authenticated pages (admin moderation, checkout coupons).

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

export function isLiveData(): boolean {
  return isFirebaseConfigured;
}
