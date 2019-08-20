import { Material } from './../materials/Material';
import { LoaderHandler } from './FileLoader';

// Loaders //////////////////////////////////////////////////////////////////////////////////

/**
 * Base class for implementing loaders.
 *
 * Events:
 *		 load
 *				 Dispatched when the image has completed loading
 *				 content — loaded image
 *
 *		 error
 *
 *					Dispatched when the image can't be loaded
 *					message — error message
 */
export class Loader {

	constructor();

	/**
	 * Will be called when load starts.
	 * The default is a function with empty body.
	 */
	onLoadStart: () => void;

	/**
	 * Will be called while load progresses.
	 * The default is a function with empty body.
	 */
	onLoadProgress: () => void;

	/**
	 * Will be called when load completes.
	 * The default is a function with empty body.
	 */
	onLoadComplete: () => void;

	/**
	 * default — null.
	 * If set, assigns the crossOrigin attribute of the image to the value of crossOrigin, prior to starting the load.
	 */
	crossOrigin: string;

	static Handlers: LoaderHandler;

}
