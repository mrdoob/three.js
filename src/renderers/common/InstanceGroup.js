import { EventDispatcher } from '../../core/EventDispatcher.js';

/**
 * A group of compatible objects which are drawn with a single instanced draw call.
 * Instance groups are created by drawers like {@link OptimizedDrawer} and act as the
 * source of the render object which draws them.
 *
 * @private
 * @augments EventDispatcher
 */
class InstanceGroup extends EventDispatcher {

	/**
	 * Constructs a new instance group.
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
		this.isInstanceGroup = true;

		/**
		 * The objects drawn as instances. The first object is the one
		 * that represents the group in the render list.
		 *
		 * @type {Array<Object3D>}
		 */
		this.objects = [];

	}

	/**
	 * Frees the resources of the render objects drawing this group.
	 *
	 * @fires InstanceGroup#dispose
	 */
	dispose() {

		this.objects.length = 0;

		/**
		 * Fires when the instance group has been disposed.
		 *
		 * @event InstanceGroup#dispose
		 * @type {Object}
		 */
		this.dispatchEvent( { type: 'dispose' } );

	}

}

export default InstanceGroup;
