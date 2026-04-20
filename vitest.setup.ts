/**
 * Node 25 ships a native `localStorage` whose methods are partial (e.g. no
 * `.removeItem()`/`.clear()`). When jsdom sets up `window`, Node's global
 * leaks through and wins, breaking tests that interact with storage.
 *
 * Patch a real, isolated in-memory Storage before each test file loads.
 * This runs via `setupFiles` in `vitest.config.ts`.
 */

class MemoryStorage implements Storage {
  private map = new Map<string, string>();
  get length() {
    return this.map.size;
  }
  clear() {
    this.map.clear();
  }
  getItem(key: string) {
    return this.map.has(key) ? this.map.get(key)! : null;
  }
  key(index: number) {
    return Array.from(this.map.keys())[index] ?? null;
  }
  removeItem(key: string) {
    this.map.delete(key);
  }
  setItem(key: string, value: string) {
    this.map.set(key, String(value));
  }
}

const ls = new MemoryStorage();

Object.defineProperty(globalThis, "localStorage", {
  value: ls,
  configurable: true,
  writable: true,
});
Object.defineProperty(globalThis, "sessionStorage", {
  value: new MemoryStorage(),
  configurable: true,
  writable: true,
});
if (typeof window !== "undefined") {
  Object.defineProperty(window, "localStorage", {
    value: ls,
    configurable: true,
    writable: true,
  });
  Object.defineProperty(window, "sessionStorage", {
    value: new MemoryStorage(),
    configurable: true,
    writable: true,
  });
}
