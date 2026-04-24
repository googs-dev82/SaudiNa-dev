import { Injectable } from '@nestjs/common';

@Injectable()
export class RateLimitService {
  private readonly buckets = new Map<string, number[]>();

  consume(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;
    const hits = (this.buckets.get(key) ?? []).filter(
      (timestamp) => timestamp > windowStart,
    );

    if (hits.length >= limit) {
      this.buckets.set(key, hits);
      return false;
    }

    hits.push(now);
    this.buckets.set(key, hits);
    return true;
  }

  reset(): void {
    this.buckets.clear();
  }
}
