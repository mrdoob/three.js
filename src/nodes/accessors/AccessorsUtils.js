import { normalView } from './Normal.js';
import { tangentView } from './Tangent.js';
import { bitangentView } from './Bitangent.js';
import { Fn, mat3 } from '../tsl/TSLBase.js';
import { mix } from '../math/MathNode.js';
import { anisotropy, anisotropyB, roughness } from '../core/PropertyNode.js';
import { positionViewDirection } from './Position.js';

/**
 * TSL object that represents the TBN matrix in view space.
 *
 * @tsl
 * @type {Node<mat3>}
 */
export const TBNViewMatrix = /*@__PURE__*/ mat3( tangentView, bitangentView, normalView ).toVar( 'TBNViewMatrix' );

/**
 * TSL object that represents the parallax direction.
 *
 * @tsl
 * @type {Node<mat3>}
 */
export const parallaxDirection = /*@__PURE__*/ positionViewDirection.mul( TBNViewMatrix )/*.normalize()*/;

/**
 * TSL function for computing parallax uv coordinates.
 *
 * @tsl
 * @function
 * @param {Node<vec2>} uv - A uv node.
 * @param {Node<vec2>} scale - A scale node.
 * @returns {Node<vec2>} Parallax uv coordinates.
 */
export const parallaxUV = ( uv, scale ) => uv.sub( parallaxDirection.mul( scale ) );

/**
 * TSL function for computing bent normals.
 *
 * @tsl
 * @function
 * @returns {Node<vec3>} Bent normals.
 */
export const bentNormalView = /*@__PURE__*/ ( Fn( () => {

	// https://google.github.io/filament/Filament.md.html#lighting/imagebasedlights/anisotropy

	let bentNormal = anisotropyB.cross( positionViewDirection );
	bentNormal = bentNormal.cross( anisotropyB ).normalize();
	bentNormal = mix( bentNormal, normalView, anisotropy.mul( roughness.oneMinus() ).oneMinus().pow2().pow2() ).normalize();

	return bentNormal;

} ).once() )();
