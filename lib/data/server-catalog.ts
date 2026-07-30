import { getAdminDb } from '@/lib/firebase/admin';
import { unstable_cache } from 'next/cache';
import {
  defaultStoreConfig,
  Brand,
  CategoryNode,
  HeroBanner,
  Product,
  ProductQuestion,
  ProductReview,
  StoreConfig,
} from '@/lib/mock/products';

// Every cached read below shares this tag. Admin catalog writes and order
// placement call revalidateTag(CATALOG_TAG), so the daily `revalidate` is
// only a failsafe — Firestore is normally scanned when data changes, not
// on a timer. This keeps reads flat as the catalog grows.
export const CATALOG_TAG = 'storefront';
const CACHE_OPTIONS = { revalidate: 86400, tags: [CATALOG_TAG] };

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

async function readServerBanners(): Promise<HeroBanner[]> {
  try {
    const snapshot = await getAdminDb().collection('banners').get();
    return snapshot.docs.map(banner => ({ id: banner.id, ...banner.data() })) as HeroBanner[];
  } catch (error) {
    console.error('Unable to load storefront banners from Firestore:', error);
    return [];
  }
}

async function readServerConfig(): Promise<StoreConfig> {
  try {
    const snapshot = await getAdminDb().collection('config').doc('store').get();
    if (!snapshot.exists) return defaultStoreConfig;
    return { ...defaultStoreConfig, ...(snapshot.data() as Partial<StoreConfig>) };
  } catch (error) {
    console.error('Unable to load store config from Firestore:', error);
    return defaultStoreConfig;
  }
}

const cachedProducts = unstable_cache(readServerProducts, ['storefront-products'], CACHE_OPTIONS);
const cachedCategories = unstable_cache(readServerCategories, ['storefront-categories'], CACHE_OPTIONS);
const cachedBrands = unstable_cache(readServerBrands, ['storefront-brands'], CACHE_OPTIONS);
const cachedBanners = unstable_cache(readServerBanners, ['storefront-banners'], CACHE_OPTIONS);
const cachedConfig = unstable_cache(readServerConfig, ['storefront-config'], CACHE_OPTIONS);

export function getServerProducts(): Promise<Product[]> {
  return cachedProducts();
}

export function getServerCategories(): Promise<CategoryNode[]> {
  return cachedCategories();
}

export function getServerBrands(): Promise<Brand[]> {
  return cachedBrands();
}

export function getServerBanners(): Promise<HeroBanner[]> {
  return cachedBanners();
}

export function getServerConfig(): Promise<StoreConfig> {
  return cachedConfig();
}

// Catalog queries run against the cached product list, so filtering, search
// and pagination cost zero Firestore reads and browsers only ever download
// one page of products instead of the whole catalog.

export interface CatalogQuery {
  search?: string;
  category?: string;
  brand?: string;
  maxPrice?: number;
  sort?: string;
  page?: number;
  pageSize?: number;
}

export interface CatalogPage {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
}

// Mega-menu links use subcategory slugs; products carry top-level slugs.
function resolveCategorySlug(slug: string, categories: CategoryNode[]): string {
  for (const cat of categories) {
    if (cat.slug === slug) return cat.slug;
    if (cat.children?.some(sub => sub.slug === slug)) return cat.slug;
  }
  return slug;
}

export async function queryServerProducts(queryInput: CatalogQuery): Promise<CatalogPage> {
  const [products, categories] = await Promise.all([cachedProducts(), cachedCategories()]);

  const search = queryInput.search?.trim().toLowerCase() ?? '';
  const category = queryInput.category ? resolveCategorySlug(queryInput.category, categories) : '';
  const brand = queryInput.brand ?? '';
  const maxPrice = queryInput.maxPrice;

  const filtered = products.filter(p => {
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search) ||
      p.description.toLowerCase().includes(search) ||
      p.brand.toLowerCase().includes(search) ||
      p.sku.toLowerCase().includes(search);
    const matchesCategory = !category || p.categorySlug === category;
    const matchesBrand = !brand || p.brandSlug === brand;
    const matchesPrice = maxPrice === undefined || p.price <= maxPrice;
    return matchesSearch && matchesCategory && matchesBrand && matchesPrice;
  });

  switch (queryInput.sort) {
    case 'price-low':
      filtered.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      filtered.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      filtered.sort((a, b) => b.rating - a.rating);
      break;
    case 'newest':
      filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
      break;
    default:
      filtered.sort((a, b) => b.reviews - a.reviews);
  }

  const pageSize = Math.min(Math.max(queryInput.pageSize ?? 12, 1), 48);
  const page = Math.max(queryInput.page ?? 1, 1);
  const start = (page - 1) * pageSize;

  return {
    items: filtered.slice(start, start + pageSize),
    total: filtered.length,
    page,
    pageSize,
  };
}

export async function findServerProduct(idOrSlug: string): Promise<Product | undefined> {
  const products = await cachedProducts();
  return products.find(p => p.id === idOrSlug || p.slug === idOrSlug);
}

export async function getServerRelatedProducts(product: Product): Promise<Product[]> {
  const products = await cachedProducts();
  return products
    .filter(p => p.categorySlug === product.categorySlug && p.id !== product.id)
    .slice(0, 4);
}

// Reviews and questions are fetched per product with an equality filter, so
// each request reads only that product's documents instead of the whole
// collection. Responses are CDN-cached by the route that calls these.

export async function getServerProductReviews(productId: string): Promise<ProductReview[]> {
  try {
    const snapshot = await getAdminDb()
      .collection('reviews')
      .where('productId', '==', productId)
      .get();
    return snapshot.docs
      .map(review => ({ id: review.id, ...review.data() }) as ProductReview)
      .filter(review => review.status === 'APPROVED');
  } catch (error) {
    console.error('Unable to load product reviews from Firestore:', error);
    return [];
  }
}

export async function getServerProductQuestions(productId: string): Promise<ProductQuestion[]> {
  try {
    const snapshot = await getAdminDb()
      .collection('questions')
      .where('productId', '==', productId)
      .get();
    return snapshot.docs.map(question => ({ id: question.id, ...question.data() }) as ProductQuestion);
  } catch (error) {
    console.error('Unable to load product questions from Firestore:', error);
    return [];
  }
}
