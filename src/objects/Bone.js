import { Object3D } from '../core/Object3D.js';

/**
 * A bone which is part of a {@link Skeleton}. The skeleton in turn is used by
 * the {@link SkinnedMesh}.
 *
 * ```js
 * const root = new THREE.Bone();
 * const child = new THREE.Bone();
 *
 * root.add( child );
 * child.position.y = 5;
 * ```
 *
 * @augments Object3D
 */
class Bone extends Object3D {

	/**
	 * Constructs a new bone.
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
		this.isBone = true;

		this.type = 'Bone';

	}

}

export { Bone };
