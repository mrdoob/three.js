import { LoadingManager } from './LoadingManager';

/**
 * Base class for implementing loaders.
 */
export class Loader {

	constructor( manager?: LoadingManager );

	crossOrigin: string;
	path: string;
	resourcePath: string;
	manager: LoadingManager;

	/*
	load(): void;
	parse(): void;
	*/

	setCrossOrigin( crossOrigin: string ): this;
	setPath( path: string ): this;
	setResourcePath( resourcePath: string ): this;

	static Handlers: LoaderHandler;

}

// LoaderHandler

export interface LoaderHandler {
	handlers: ( RegExp | Loader )[];

	add( regex: RegExp, loader: Loader ): void;
	get( file: string ): Loader | null;
}
