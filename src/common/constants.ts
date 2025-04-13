export const CACHE_TTL = {
  PRODUCTS: 3600, // 1 hour
  CATEGORIES: 3600, // 1 hour
  FEATURED_PRODUCTS: 1800, // 30 minutes
  PRODUCT_DETAILS: 1800, // 30 minutes
};

export const CACHE_KEYS = {
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  FEATURED_PRODUCTS: 'featured_products',
  PRODUCT_DETAILS: (id: number) => `product_${id}`,
  CATEGORY_PRODUCTS: (id: number) => `category_${id}_products`,
};

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;
