// Lightweight LRU Cache for candidate data
// Max 7 candidates to keep RAM usage low on legacy computers

const MAX_CACHE_SIZE = 7;

interface CacheEntry<T> {
  data: T;
  lastAccessed: number;
}

export class LRUCache<T> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private maxSize: number;

  constructor(maxSize: number = MAX_CACHE_SIZE) {
    this.maxSize = maxSize;
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    // Update last accessed time (move to front)
    entry.lastAccessed = Date.now();
    return entry.data;
  }

  set(key: string, data: T): void {
    // If key exists, update it
    if (this.cache.has(key)) {
      this.cache.set(key, { data, lastAccessed: Date.now() });
      return;
    }

    // If at capacity, evict least recently used
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, { data, lastAccessed: Date.now() });
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }

  // Get all cached keys (for debugging)
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      // Optional: Log for debugging during development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[LRU Cache] Evicted candidate: ${oldestKey}`);
      }
    }
  }
}

// Singleton instance for candidate data
export const candidateCache = new LRUCache<unknown>(MAX_CACHE_SIZE);
