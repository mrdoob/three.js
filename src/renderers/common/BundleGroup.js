import { Group } from '../../objects/Group.js';

/**
 * A specialized group which enables applications access to the
 * Render Bundle API of WebGPU. The group with all its descendant nodes
 * are considered as one render bundle and processed as such by
 * the renderer.
 *
 * Only renderable 3D objects are allowed in a bundle group. Other
 * types like lights are not supported and must be added to the scene
 * outside of the group.
 *
 * This module is only fully supported by `WebGPURenderer` with a WebGPU backend.
 * With a WebGL backend, the group can technically be rendered but without
 * any performance improvements.
 *
 * @augments Group
 */
class BundleGroup extends Group {

	/**
	 * Constructs a new bundle group.
	 */
	constructor() {

		super();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isBundleGroup = true;

		/**
		 * This property is only relevant for detecting types
		 * during serialization/deserialization. It should always
		 * match the class name.
		 *
		 * @type {string}
		 * @readonly
		 * @default 'BundleGroup'
		 */
		this.type = 'BundleGroup';

		/**
		 * Whether the bundle is static or not. When set to `true`, the renderer may
		 * skip updating the transformation and material properties of the objects in
		 * the bundle until the `needsUpdate` flag is set to `true`. Set it to `false`
		 * for bundles with animated objects.
		 *
		 * Adding or removing objects always requires setting the `needsUpdate`
		 * flag to `true`.
		 *
		 * Only used by the WebGPU backend. With the WebGL 2 backend, the group is
		 * rendered like a regular group and all changes are applied immediately.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.static = true;

		/**
		 * The bundle group's version.
		 *
		 * @type {number}
		 * @readonly
		 * @default 0
		 */
		this.version = 0;

	}

	/**
	 * Set this property to `true` when the bundle group has changed.
	 *
	 * @type {boolean}
	 * @default false
	 * @param {boolean} value
	 */
	set needsUpdate( value ) {

		if ( value === true ) this.version ++;

	}

}

export default BundleGroup;
