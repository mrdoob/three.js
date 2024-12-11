import { UVMapping } from '../../constants.js';
import { Euler } from '../../math/Euler.js';
import { Matrix4 } from '../../math/Matrix4.js';
import Node from '../core/Node.js';
import { renderGroup } from '../core/UniformGroupNode.js';
import { nodeImmutable, uniform } from '../tsl/TSLBase.js';
import { reference } from './ReferenceNode.js';

const _e1 = /*@__PURE__*/ new Euler();
const _m1 = /*@__PURE__*/ new Matrix4();

/** @module SceneNode **/

/**
 * This module allows access to a collection of scene properties. The following predefined TSL objects
 * are available for easier use:
 *
 * - `backgroundBlurriness`: A node that represents the scene's background blurriness.
 * - `backgroundIntensity`: A node that represents the scene's background intensity.
 * - `backgroundRotation`: A node that represents the scene's background rotation.
 *
 * @augments Node
 */
class SceneNode extends Node {

	static get type() {

		return 'SceneNode';

	}

	/**
	 * Constructs a new scene node.
	 *
	 * @param {('backgroundBlurriness'|'backgroundIntensity'|'backgroundRotation')} scope - The scope defines the type of scene property that is accessed.
	 * @param {Scene?} [scene=null] - A reference to the scene.
	 */
	constructor( scope = SceneNode.BACKGROUND_BLURRINESS, scene = null ) {

		super();

		/**
		 * The scope defines the type of scene property that is accessed.
		 *
		 * @type {('backgroundBlurriness'|'backgroundIntensity'|'backgroundRotation')}
		 */
		this.scope = scope;

		/**
		 * A reference to the scene that is going to be accessed.
		 *
		 * @type {Scene?}
		 * @default null
		 */
		this.scene = scene;

	}

	/**
	 * Depending on the scope, the method returns a different type of node that represents
	 * the respective scene property.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {Node} The output node.
	 */
	setup( builder ) {

		const scope = this.scope;
		const scene = this.scene !== null ? this.scene : builder.scene;

		let output;

		if ( scope === SceneNode.BACKGROUND_BLURRINESS ) {

			output = reference( 'backgroundBlurriness', 'float', scene );

		} else if ( scope === SceneNode.BACKGROUND_INTENSITY ) {

			output = reference( 'backgroundIntensity', 'float', scene );

		} else if ( scope === SceneNode.BACKGROUND_ROTATION ) {

			output = uniform( 'mat4' ).label( 'backgroundRotation' ).setGroup( renderGroup ).onRenderUpdate( () => {

				const background = scene.background;

				if ( background !== null && background.isTexture && background.mapping !== UVMapping ) {

					_e1.copy( scene.backgroundRotation );

					// accommodate left-handed frame
					_e1.x *= - 1; _e1.y *= - 1; _e1.z *= - 1;

					_m1.makeRotationFromEuler( _e1 );

				} else {

					_m1.identity();

				}

				return _m1;

			} );

		} else {

			console.error( 'THREE.SceneNode: Unknown scope:', scope );

		}

		return output;

	}

}

SceneNode.BACKGROUND_BLURRINESS = 'backgroundBlurriness';
SceneNode.BACKGROUND_INTENSITY = 'backgroundIntensity';
SceneNode.BACKGROUND_ROTATION = 'backgroundRotation';

export default SceneNode;

/**
 * TSL object that represents the scene's background blurriness.
 *
 * @type {SceneNode}
 */
export const backgroundBlurriness = /*@__PURE__*/ nodeImmutable( SceneNode, SceneNode.BACKGROUND_BLURRINESS );

/**
 * TSL object that represents the scene's background intensity.
 *
 * @type {SceneNode}
 */
export const backgroundIntensity = /*@__PURE__*/ nodeImmutable( SceneNode, SceneNode.BACKGROUND_INTENSITY );

/**
 * TSL object that represents the scene's background rotation.
 *
 * @type {SceneNode}
 */
export const backgroundRotation = /*@__PURE__*/ nodeImmutable( SceneNode, SceneNode.BACKGROUND_ROTATION );
