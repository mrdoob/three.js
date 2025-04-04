/**
 * This module is used to represent render bundles inside the renderer
 * for further processing.
 *
 * @private
 */
class RenderBundle {

	/**
	 * Constructs a new bundle group.
	 *
	 * @param {BundleGroup} bundleGroup - The bundle group.
	 * @param {Camera} camera - The camera the bundle group is rendered with.
	 */
	constructor( bundleGroup, camera ) {

		this.bundleGroup = bundleGroup;
		this.camera = camera;

	}

}

export default RenderBundle;
