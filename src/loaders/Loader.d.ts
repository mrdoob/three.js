import { LoaderHandler } from './FileLoader';

// Loaders //////////////////////////////////////////////////////////////////////////////////

/**
 * Base class for implementing loaders.
 */
export class Loader {

	constructor();

	/**
	 * default — anonymous.
	 * If set, assigns the crossOrigin attribute of the image to the value of crossOrigin, prior to starting the load.
	 */
	crossOrigin: string;

	static Handlers: LoaderHandler;

}
