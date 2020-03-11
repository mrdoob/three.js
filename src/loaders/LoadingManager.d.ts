import { Loader } from './Loader';

export const DefaultLoadingManager: LoadingManager;

/**
 * Handles and keeps track of loaded and pending data.
 */
export class LoadingManager {

	constructor(
		onLoad?: () => void,
		onProgress?: ( url: string, loaded: number, total: number ) => void,
		onError?: ( url: string ) => void
	);

	/**
	 * Will be called when loading of an item starts.
	 * @param url The url of the item that started loading.
	 * @param loaded The number of items already loaded so far.
	 * @param total The total amount of items to be loaded.
	 */
	onStart?: ( url: string, loaded: number, total: number ) => void;

	/**
	 * Will be called when all items finish loading.
	 * The default is a function with empty body.
	 */
	onLoad: () => void;

	/**
	 * Will be called for each loaded item.
	 * The default is a function with empty body.
	 * @param url The url of the item just loaded.
	 * @param loaded The number of items already loaded so far.
	 * @param total The total amount of items to be loaded.
	 */
	onProgress: ( url: string, loaded: number, total: number ) => void;

	/**
	 * Will be called when item loading fails.
	 * The default is a function with empty body.
	 * @param url The url of the item that errored.
	 */
	onError: ( url: string ) => void;

	/**
	 * If provided, the callback will be passed each resource URL before a request is sent.
	 * The callback may return the original URL, or a new URL to override loading behavior.
	 * This behavior can be used to load assets from .ZIP files, drag-and-drop APIs, and Data URIs.
	 * @param callback URL modifier callback. Called with url argument, and must return resolvedURL.
	 */
	setURLModifier( callback?: ( url: string ) => string ): this;

	/**
	 * Given a URL, uses the URL modifier callback (if any) and returns a resolved URL.
	 * If no URL modifier is set, returns the original URL.
	 * @param url the url to load
	 */
	resolveURL( url: string ): string;

	itemStart( url: string ): void;
	itemEnd( url: string ): void;
	itemError( url: string ): void;

	// handlers

	addHandler( regex: RegExp, loader: Loader ): this;
	removeHandler( regex: RegExp ): this;
	getHandler( file: string ): Loader | null;

}
