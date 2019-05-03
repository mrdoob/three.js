export class IndexedCache {
  enabled: boolean;
  storeName: string;
  dbVersion: number;

  add(
  	key: string,
   	file: any
   	): {onerror: (event: ErrorEvent) => void, onsuccess: () => void}

  get(
  	key: string
   	): {onerror: (event: ErrorEvent) => void, onsuccess: (data: any) => void}
  
  remove(
  	key: string
   	): {onerror: (event: ErrorEvent) => void, onsuccess: () => void}

  clear(): void;
}
