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
	 * @param {RenderContext} renderContext - The render context the bundle is rendered with.
	 */
	constructor( bundleGroup, camera, renderContext ) {

		this.bundleGroup = bundleGroup;
		this.camera = camera;
		this.renderContext = renderContext;

	}

}

export default RenderBundle;
