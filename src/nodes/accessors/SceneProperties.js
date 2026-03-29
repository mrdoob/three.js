import { UVMapping } from '../../constants.js';
import { Matrix4 } from '../../math/Matrix4.js';
import { renderGroup } from '../core/UniformGroupNode.js';
import { uniform } from '../tsl/TSLBase.js';

const _m1 = /*@__PURE__*/ new Matrix4();

/**
 * TSL object that represents the scene's background blurriness.
 *
 * @tsl
 * @type {Node<float>}
 */
export const backgroundBlurriness = /*@__PURE__*/ uniform( 0 ).setGroup( renderGroup ).onRenderUpdate( ( { scene } ) => scene.backgroundBlurriness );

/**
 * TSL object that represents the scene's background intensity.
 *
 * @tsl
 * @type {Node<float>}
 */
export const backgroundIntensity = /*@__PURE__*/ uniform( 1 ).setGroup( renderGroup ).onRenderUpdate( ( { scene } ) => scene.backgroundIntensity );

/**
 * TSL object that represents the scene's background rotation.
 *
 * @tsl
 * @type {Node<mat4>}
 */
export const backgroundRotation = /*@__PURE__*/ uniform( new Matrix4() ).setGroup( renderGroup ).onRenderUpdate( ( { scene } ) => {

	const background = scene.background;

	if ( background !== null && background.isTexture && background.mapping !== UVMapping ) {

		// note: since the matrix is orthonormal, we can use the more-efficient transpose() in lieu of invert()
		_m1.makeRotationFromEuler( scene.backgroundRotation ).transpose();

	} else {

		_m1.identity();

	}

	return _m1;

} );
