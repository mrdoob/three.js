import { UVMapping } from '../../constants.js';
import { Euler } from '../../math/Euler.js';
import { Matrix4 } from '../../math/Matrix4.js';
import { renderGroup } from '../core/UniformGroupNode.js';
import { uniform } from '../tsl/TSLBase.js';

const _e1 = /*@__PURE__*/ new Euler();
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

		_e1.copy( scene.backgroundRotation );

		// accommodate left-handed frame
		_e1.x *= - 1; _e1.y *= - 1; _e1.z *= - 1;

		_m1.makeRotationFromEuler( _e1 );

	} else {

		_m1.identity();

	}

	return _m1;

} );
