import { Geometry } from './../core/Geometry';
import { Material } from './../materials/Material';
import { Loader } from './Loader';
/**
 * A loader for loading objects in JSON format.
 */
export class JSONLoader extends Loader {
  constructor(manager?: LoadingManager);

  manager: LoadingManager;
  withCredentials: boolean;

  load(
    url: string,
    onLoad?: (geometry: Geometry, materials: Material[]) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (event: ErrorEvent) => void
  ): void;
  setTexturePath(value: string): void;
  parse(
    json: any,
    texturePath?: string
  ): { geometry: Geometry; materials?: Material[] };
}

/**
 * Handles and keeps track of loaded and pending data.
 */
export class LoadingManager {
  constructor(
    onLoad?: () => void,
    onProgress?: (url: string, loaded: number, total: number) => void,
    onError?: () => void
  );

  onStart?: (url: string, loaded: number, total: number) => void;

  /**
   * Will be called when load starts.
   * The default is a function with empty body.
   */
  onLoad: () => void;

  /**
   * Will be called while load progresses.
   * The default is a function with empty body.
   */
  onProgress: (item: any, loaded: number, total: number) => void;

  /**
   * Will be called when each element in the scene completes loading.
   * The default is a function with empty body.
   */
  onError: (url: string) => void;

  /**
   * If provided, the callback will be passed each resource URL before a request is sent.
   * The callback may return the original URL, or a new URL to override loading behavior.
   * This behavior can be used to load assets from .ZIP files, drag-and-drop APIs, and Data URIs.
   * @param callback URL modifier callback. Called with url argument, and must return resolvedURL.
   */
  setURLModifier(callback?: (url: string) => string): void;

  /**
   * Given a URL, uses the URL modifier callback (if any) and returns a resolved URL.
   * If no URL modifier is set, returns the original URL.
   * @param url the url to load
   */
  resolveURL(url: string): string;

  itemStart(url: string): void;
  itemEnd(url: string): void;
  itemError(url: string): void;
}
