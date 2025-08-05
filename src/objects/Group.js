import { Object3D } from '../core/Object3D.js';

/**
 * This is almost identical to an {@link Object3D}. Its purpose is to
 * make working with groups of objects syntactically clearer.
 *
 * ```js
 * // Create a group and add the two cubes.
 * // These cubes can now be rotated / scaled etc as a group.
 * const group = new THREE.Group();
 *
 * group.add( meshA );
 * group.add( meshB );
 *
 * scene.add( group );
 * ```
 *
 * @augments Object3D
 */
class Group extends Object3D {

	constructor() {

		super();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isGroup = true;

		this.type = 'Group';

	}

}

export { Group };
