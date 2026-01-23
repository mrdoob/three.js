import { Euler } from '../../math/Euler.js';
import { Matrix4 } from '../../math/Matrix4.js';
import { uniform } from '../core/UniformNode.js';

const _e1 = /*@__PURE__*/ new Euler();
const _m1 = /*@__PURE__*/ new Matrix4();

/**
 * TSL object that represents the refraction ratio of the material used for rendering the current object.
 *
 * @tsl
 * @type {UniformNode<float>}
 */
export const materialRefractionRatio = /*@__PURE__*/ uniform( 0 ).onReference( ( { material } ) => material ).onObjectUpdate( ( { material } ) => material.refractionRatio );

/**
 * TSL object that represents the intensity of environment maps of PBR materials.
 * When `material.envMap` is set, the value is `material.envMapIntensity` otherwise `scene.environmentIntensity`.
 *
 * @tsl
 * @type {Node<float>}
 */
export const materialEnvIntensity = /*@__PURE__*/ uniform( 1 ).onReference( ( { material } ) => material ).onObjectUpdate( function ( { material, scene } ) {

	return material.envMap ? material.envMapIntensity : scene.environmentIntensity;

} );

/**
 * TSL object that represents the rotation of environment maps.
 * When `material.envMap` is set, the value is `material.envMapRotation`. `scene.environmentRotation` controls the
 * rotation of `scene.environment` instead.
 *
 * @tsl
 * @type {Node<mat4>}
 */
export const materialEnvRotation = /*@__PURE__*/ uniform( new Matrix4() ).onReference( function ( frame ) {

	return frame.material;

} ).onObjectUpdate( function ( { material, scene } ) {

	const rotation = ( scene.environment !== null && material.envMap === null ) ? scene.environmentRotation : material.envMapRotation;

	if ( rotation ) {

		_e1.copy( rotation );

		_m1.makeRotationFromEuler( _e1 );

	} else {

		_m1.identity();

	}

	return _m1;

} );
