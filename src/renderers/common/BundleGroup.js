import { Group } from '../../objects/Group.js';

/**
 * A specialized group which enables applications access to the
 * Render Bundle API of WebGPU. The group with all its descendant nodes
 * are considered as one render bundle and processed as such by
 * the renderer.
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
		 * @type {Boolean}
		 * @readonly
		 * @default true
		 */
		this.isBundleGroup = true;

		/**
		 * This property is only relevant for detecting types
		 * during serialization/deserialization. It should always
		 * match the class name.
		 *
		 * @type {String}
		 * @readonly
		 * @default 'BundleGroup'
		 */
		this.type = 'BundleGroup';

		/**
		 * Whether the bundle is static or not. When set to `true`, the structure
		 * is assumed to be static and does not change. E.g. no new objects are
		 * added to the group
		 *
		 * If a change is required, an update can still be forced by setting the
		 * `needsUpdate` flag to `true`.
		 *
		 * @type {Boolean}
		 * @default true
		 */
		this.static = true;

		/**
		 * The bundle group's version.
		 *
		 * @type {Number}
		 * @readonly
		 * @default 0
		 */
		this.version = 0;

	}

	/**
	 * Set this property to `true` when the bundle group has changed.
	 *
	 * @type {Boolean}
	 * @default false
	 * @param {Boolean} value
	 */
	set needsUpdate( value ) {

		if ( value === true ) this.version ++;

	}

}

export default BundleGroup;
