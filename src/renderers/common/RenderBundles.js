import ChainMap from './ChainMap.js';
import RenderBundle from './RenderBundle.js';

const _chainKeys = [];

/**
 * This renderer module manages render bundles.
 *
 * @private
 */
class RenderBundles {

	/**
	 * Constructs a new render bundle management component.
	 */
	constructor() {

		/**
		 * A chain map for maintaining the render bundles.
		 *
		 * @type {ChainMap}
		 */
		this.bundles = new ChainMap();

	}

	/**
	 * Returns a render bundle for the given bundle group and camera.
	 *
	 * @param {BundleGroup} bundleGroup - The bundle group.
	 * @param {Camera} camera - The camera the bundle group is rendered with.
	 * @return {RenderBundle} The render bundle.
	 */
	get( bundleGroup, camera ) {

		const bundles = this.bundles;

		_chainKeys[ 0 ] = bundleGroup;
		_chainKeys[ 1 ] = camera;

		let bundle = bundles.get( _chainKeys );

		if ( bundle === undefined ) {

			bundle = new RenderBundle( bundleGroup, camera );
			bundles.set( _chainKeys, bundle );

		}

		_chainKeys.length = 0;

		return bundle;

	}

	/**
	 * Frees all internal resources.
	 */
	dispose() {

		this.bundles = new ChainMap();

	}

}

export default RenderBundles;
