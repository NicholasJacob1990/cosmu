"use client";

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CacheConfig {
  ttl?: number; // Time to live in seconds
  maxItems?: number;
  strategy?: 'lru' | 'fifo';
}

class CacheManager {
  private cache = new Map<string, CacheItem<any>>();
  private accessOrder: string[] = [];
  private config: Required<CacheConfig>;
  
  constructor(config: CacheConfig = {}) {
    this.config = {
      ttl: config.ttl || 300, // 5 minutes default
      maxItems: config.maxItems || 100,
      strategy: config.strategy || 'lru'
    };
  }
  
  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (this.isExpired(item)) {
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
      return null;
    }
    
    // Update access order for LRU
    if (this.config.strategy === 'lru') {
      this.updateAccessOrder(key);
    }
    
    return item.data as T;
  }
  
  async set<T>(key: string, data: T, ttl?: number): Promise<void> {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.ttl,
    };
    
    // Check if we need to evict items
    if (this.cache.size >= this.config.maxItems && !this.cache.has(key)) {
      this.evictItem();
    }
    
    this.cache.set(key, item);
    this.updateAccessOrder(key);
  }
  
  async invalidate(key: string): Promise<void> {
    this.cache.delete(key);
    this.removeFromAccessOrder(key);
  }
  
  async invalidatePattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern);
    const keysToDelete: string[] = [];
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.invalidate(key));
  }
  
  async clear(): Promise<void> {
    this.cache.clear();
    this.accessOrder = [];
  }
  
  private isExpired(item: CacheItem<any>): boolean {
    return Date.now() - item.timestamp > item.ttl * 1000;
  }
  
  private updateAccessOrder(key: string): void {
    this.removeFromAccessOrder(key);
    this.accessOrder.push(key);
  }
  
  private removeFromAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }
  
  private evictItem(): void {
    if (this.config.strategy === 'lru') {
      // Remove least recently used
      const keyToRemove = this.accessOrder[0];
      if (keyToRemove) {
        this.invalidate(keyToRemove);
      }
    } else {
      // FIFO - remove oldest item
      const oldestKey = Array.from(this.cache.keys())[0];
      if (oldestKey) {
        this.invalidate(oldestKey);
      }
    }
  }
  
  // Utility methods
  getSize(): number {
    return this.cache.size;
  }
  
  getStats() {
    let expiredCount = 0;
    let totalSize = 0;
    
    for (const [key, item] of this.cache.entries()) {
      if (this.isExpired(item)) {
        expiredCount++;
      }
      totalSize += JSON.stringify(item.data).length;
    }
    
    return {
      items: this.cache.size,
      expired: expiredCount,
      sizeInBytes: totalSize,
      maxItems: this.config.maxItems,
      strategy: this.config.strategy
    };
  }
}

// Create singleton instances for different cache types
export const apiCache = new CacheManager({
  ttl: 300, // 5 minutes
  maxItems: 100,
  strategy: 'lru'
});

export const userCache = new CacheManager({
  ttl: 3600, // 1 hour
  maxItems: 50,
  strategy: 'lru'
});

export const metricsCache = new CacheManager({
  ttl: 600, // 10 minutes
  maxItems: 200,
  strategy: 'lru'
});

// React Query integration
export function createQueryKeyWithCache(
  baseKey: string | string[],
  params?: Record<string, any>
): string {
  const key = Array.isArray(baseKey) ? baseKey.join(':') : baseKey;
  return params ? `${key}:${JSON.stringify(params)}` : key;
}

// Hook for cache-aware data fetching
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

export function useCachedQuery<T>(
  queryKey: string | string[],
  queryFn: () => Promise<T>,
  options?: UseQueryOptions<T> & { cache?: CacheManager }
) {
  const cache = options?.cache || apiCache;
  const cacheKey = createQueryKeyWithCache(queryKey);
  
  return useQuery({
    queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
    queryFn: async () => {
      // Check cache first
      const cached = await cache.get<T>(cacheKey);
      if (cached) {
        return cached;
      }
      
      // Fetch fresh data
      const data = await queryFn();
      
      // Cache the result
      await cache.set(cacheKey, data);
      
      return data;
    },
    ...options
  });
}