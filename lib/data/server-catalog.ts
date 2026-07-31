import { getAdminDb } from '@/lib/firebase/admin';
import { unstable_cache } from 'next/cache';
import {
  defaultStoreConfig,
  defaultWarrantyPolicy,
  STANDARD_WARRANTY,
  Brand,
  CategoryNode,
  HeroBanner,
  KitItem,
  Product,
  ProductQuestion,
  ProductReview,
  StoreConfig,
  WarrantyPolicy,
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
//
// Warranty text (summary/voidsIf) is forced to the current global policy
// here regardless of what's stored on the product document — it's store-wide
// and admin-editable under Settings. Only `days` stays per-product.
function toStorefrontProduct(
  id: string,
  data: Record<string, unknown>,
  warrantyPolicy: WarrantyPolicy
): Product {
  const storedWarranty = data.warranty as Partial<{ days: number }> | undefined;
  return {
    ...(data as unknown as Product),
    id,
    isNew: Boolean(data.isNew ?? data.isNewArrival),
    isBestseller: Boolean(data.isBestseller),
    isFeatured: Boolean(data.isFeatured),
    isKit: Boolean(data.isKit),
    warranty: {
      days: storedWarranty?.days ?? STANDARD_WARRANTY.days,
      summary: warrantyPolicy.summary,
      voidsIf: warrantyPolicy.voidsIf,
    },
  };
}

// These throw on failure rather than swallowing errors, so a Firestore
// outage propagates out of unstable_cache instead of being cached as an
// empty/default result — a transient failure would otherwise blank the
// storefront for the full `revalidate` window. Callers below catch and
// fall back outside the cache, where the fallback itself is never cached.
async function readServerProducts(): Promise<Product[]> {
  const [snapshot, warrantyPolicy] = await Promise.all([
    getAdminDb().collection('products').get(),
    readServerWarrantyPolicy(),
  ]);
  if (snapshot.empty) return [];

  return snapshot.docs.map(product =>
    toStorefrontProduct(product.id, product.data() as Record<string, unknown>, warrantyPolicy)
  );
}

async function readServerCategories(): Promise<CategoryNode[]> {
  const snapshot = await getAdminDb().collection('categories').get();
  if (snapshot.empty) return [];

  return snapshot.docs.map(category => ({
    id: category.id,
    ...category.data(),
  })) as CategoryNode[];
}

async function readServerBrands(): Promise<Brand[]> {
  const snapshot = await getAdminDb().collection('brands').get();
  return snapshot.docs.map(brand => ({ id: brand.id, ...brand.data() })) as Brand[];
}

async function readServerBanners(): Promise<HeroBanner[]> {
  const snapshot = await getAdminDb().collection('banners').get();
  return snapshot.docs.map(banner => ({ id: banner.id, ...banner.data() })) as HeroBanner[];
}

async function readServerConfig(): Promise<StoreConfig> {
  const snapshot = await getAdminDb().collection('config').doc('store').get();
  if (!snapshot.exists) return defaultStoreConfig;
  return { ...defaultStoreConfig, ...(snapshot.data() as Partial<StoreConfig>) };
}

async function readServerWarrantyPolicy(): Promise<WarrantyPolicy> {
  const snapshot = await getAdminDb().collection('config').doc('warranty').get();
  if (!snapshot.exists) return defaultWarrantyPolicy;
  return { ...defaultWarrantyPolicy, ...(snapshot.data() as Partial<WarrantyPolicy>) };
}

const cachedProducts = unstable_cache(readServerProducts, ['storefront-products'], CACHE_OPTIONS);
const cachedCategories = unstable_cache(readServerCategories, ['storefront-categories'], CACHE_OPTIONS);
const cachedBrands = unstable_cache(readServerBrands, ['storefront-brands'], CACHE_OPTIONS);
const cachedBanners = unstable_cache(readServerBanners, ['storefront-banners'], CACHE_OPTIONS);
const cachedConfig = unstable_cache(readServerConfig, ['storefront-config'], CACHE_OPTIONS);
const cachedWarrantyPolicy = unstable_cache(readServerWarrantyPolicy, ['storefront-warranty'], CACHE_OPTIONS);

// Failures aren't cached by unstable_cache (see above), so without a backoff
// a Firestore outage would make every single request retry Firestore. This
// cooldown caps retries to once per window per warm instance instead, so an
// outage degrades gracefully rather than hammering Firestore on every hit.
const FAILURE_COOLDOWN_MS = 30_000;
const lastFailureAt = new Map<string, number>();

async function withFailureCooldown<T>(key: string, fetcher: () => Promise<T>, fallback: T, label: string): Promise<T> {
  const failedAt = lastFailureAt.get(key);
  if (failedAt !== undefined && Date.now() - failedAt < FAILURE_COOLDOWN_MS) {
    return fallback;
  }
  try {
    const result = await fetcher();
    lastFailureAt.delete(key);
    return result;
  } catch (error) {
    console.error(`Unable to load ${label} from Firestore:`, error);
    lastFailureAt.set(key, Date.now());
    return fallback;
  }
}

export function getServerProducts(): Promise<Product[]> {
  return withFailureCooldown('products', cachedProducts, [], 'storefront products');
}

export function getServerCategories(): Promise<CategoryNode[]> {
  return withFailureCooldown('categories', cachedCategories, [], 'storefront categories');
}

export function getServerBrands(): Promise<Brand[]> {
  return withFailureCooldown('brands', cachedBrands, [], 'storefront brands');
}

export function getServerBanners(): Promise<HeroBanner[]> {
  return withFailureCooldown('banners', cachedBanners, [], 'storefront banners');
}

export function getServerConfig(): Promise<StoreConfig> {
  return withFailureCooldown('config', cachedConfig, defaultStoreConfig, 'store config');
}

export function getServerWarrantyPolicy(): Promise<WarrantyPolicy> {
  return withFailureCooldown('warranty', cachedWarrantyPolicy, defaultWarrantyPolicy, 'warranty policy');
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

export type SearchMode = 'exact' | 'fuzzy' | 'related' | 'popular';

export interface CatalogPage {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
  // Present only when a search term was given. 'exact' = normal substring
  // match. Anything else means the term itself found nothing and these are
  // a fallback, so the UI should say so instead of presenting them as hits.
  searchMode?: SearchMode;
}

function tokenizeSearchable(text: string): string[] {
  return text.toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 0);
}

// Bounded Levenshtein distance — words here are always short (product
// names/SKUs/brands), so a plain DP table is microseconds per pair.
function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    prev = curr;
  }
  return prev[b.length];
}

// Tolerates a handful of typos, scaling the allowed edit distance with word
// length so short words (e.g. "led") still require a close match. The
// containment shortcut is guarded to 3+ chars — otherwise single-letter
// tokens like the "R" in "4 R" (an ohm-value fragment) would trivially be
// "contained in" almost any query and match everything.
function fuzzyWordMatches(query: string, target: string): boolean {
  if (query === target) return true;
  if (Math.min(query.length, target.length) >= 3 && (target.includes(query) || query.includes(target))) {
    return true;
  }
  const maxDistance = query.length <= 3 ? 0 : query.length <= 5 ? 1 : query.length <= 9 ? 2 : 3;
  return levenshtein(query, target) <= maxDistance;
}

// Description is excluded here (unbounded length would dominate scoring
// cost) — it's only used by the cheap exact-substring pass below.
function fuzzySearchFields(product: Product): { words: string[]; weight: number }[] {
  return [
    { words: tokenizeSearchable(product.name), weight: 4 },
    { words: tokenizeSearchable(product.sku), weight: 3 },
    { words: tokenizeSearchable(product.brand), weight: 2 },
    { words: tokenizeSearchable(product.category), weight: 2 },
  ];
}

function fuzzyScore(product: Product, queryWords: string[]): number {
  const fields = fuzzySearchFields(product);
  let total = 0;
  for (const queryWord of queryWords) {
    let best = 0;
    for (const { words, weight } of fields) {
      for (const word of words) {
        if (word === queryWord) best = Math.max(best, weight * 3);
        else if (fuzzyWordMatches(queryWord, word)) best = Math.max(best, weight);
      }
    }
    total += best;
  }
  return total;
}

// Mega-menu links use subcategory slugs; products carry top-level slugs.
// A subcategory can share its slug with an unrelated top-level category
// (e.g. a "Resistor" subcategory under "Basic Electronic Components" next
// to a standalone top-level "Resistor" category), so an exact top-level
// match must always win before falling back to a subcategory lookup.
function resolveCategorySlug(slug: string, categories: CategoryNode[]): string {
  if (categories.some(cat => cat.slug === slug)) return slug;
  for (const cat of categories) {
    if (cat.children?.some(sub => sub.slug === slug)) return cat.slug;
  }
  return slug;
}

export async function queryServerProducts(queryInput: CatalogQuery): Promise<CatalogPage> {
  const [products, categories] = await Promise.all([getServerProducts(), getServerCategories()]);

  const search = queryInput.search?.trim().toLowerCase() ?? '';
  const category = queryInput.category ? resolveCategorySlug(queryInput.category, categories) : '';
  const brand = queryInput.brand ?? '';
  const maxPrice = queryInput.maxPrice;

  const matchesCategory = (p: Product) => !category || p.categorySlug === category;
  const matchesBrand = (p: Product) => !brand || p.brandSlug === brand;
  const matchesPrice = (p: Product) => maxPrice === undefined || p.price <= maxPrice;
  const matchesFilters = (p: Product) => matchesCategory(p) && matchesBrand(p) && matchesPrice(p);

  const matchesSearchExact = (p: Product) =>
    !search ||
    p.name.toLowerCase().includes(search) ||
    p.description.toLowerCase().includes(search) ||
    p.brand.toLowerCase().includes(search) ||
    p.sku.toLowerCase().includes(search);

  let filtered = products.filter(p => matchesSearchExact(p) && matchesFilters(p));
  let searchMode: SearchMode | undefined = search ? 'exact' : undefined;

  // The typed term matched nothing (typo, wrong word, too specific) — widen
  // the net in stages: fuzzy-match within the user's chosen filters, then
  // fuzzy-match ignoring filters, then fall back to generally popular items.
  // All of this runs over the already-cached product array, so it costs CPU
  // only and never touches Firestore.
  if (search && filtered.length === 0) {
    const queryWords = tokenizeSearchable(search);
    const scored = products
      .map(product => ({ product, score: fuzzyScore(product, queryWords) }))
      .filter(entry => entry.score > 0)
      .sort((a, b) => b.score - a.score);

    const withinFilters = scored.filter(entry => matchesFilters(entry.product));
    if (withinFilters.length > 0) {
      searchMode = 'fuzzy';
      filtered = withinFilters.map(entry => entry.product);
    } else if (scored.length > 0) {
      searchMode = 'related';
      filtered = scored.map(entry => entry.product);
    } else {
      searchMode = 'popular';
      const pool = products.filter(matchesFilters);
      filtered = (pool.length > 0 ? pool : products)
        .slice()
        .sort(
          (a, b) =>
            (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0) || b.rating - a.rating || b.reviews - a.reviews
        )
        .slice(0, 24);
    }
  }

  // Fallback tiers are already ordered by relevance/popularity; an explicit
  // sort only applies once there's a real (exact) match to sort within.
  if (searchMode === 'exact' || !search) {
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
  }

  const pageSize = Math.min(Math.max(queryInput.pageSize ?? 12, 1), 48);
  const page = Math.max(queryInput.page ?? 1, 1);
  const start = (page - 1) * pageSize;

  return {
    items: filtered.slice(start, start + pageSize),
    total: filtered.length,
    page,
    pageSize,
    searchMode,
  };
}

export async function findServerProduct(idOrSlug: string): Promise<Product | undefined> {
  const products = await getServerProducts();
  return products.find(p => p.id === idOrSlug || p.slug === idOrSlug);
}

export async function getServerRelatedProducts(product: Product): Promise<Product[]> {
  const products = await getServerProducts();
  return products
    .filter(p => p.categorySlug === product.categorySlug && p.id !== product.id)
    .slice(0, 4);
}

export interface KitContentEntry {
  product: Product;
  quantity: number;
}

// A kit only stores { productId, quantity } references so it always reflects
// the current price/image/stock of each component. Items whose product was
// since deleted are silently dropped rather than breaking the kit page.
export async function getServerKitContents(kitItems: KitItem[]): Promise<KitContentEntry[]> {
  const products = await getServerProducts();
  const byId = new Map(products.map(p => [p.id, p]));
  return kitItems
    .map(item => {
      const product = byId.get(item.productId);
      return product ? { product, quantity: item.quantity } : null;
    })
    .filter((entry): entry is KitContentEntry => entry !== null);
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
