import { Fn, clearcoat, clearcoatNormalView, clearcoatRoughness, metalness, normalView, roughness } from 'three/tsl';

/**
 * The normal, roughness and metalness of the outermost specular lobe of a material: of its
 * clearcoat where it is coated and of its base lobe elsewhere. This is the lobe that a per-pixel
 * source of indirect specular light answers, so a pre-pass writes these for the pass that
 * computes such a source, like SSR, in place of `normalView`, `roughness` and `metalness`.
 *
 * ```js
 * prePass.setMRT( mrt( { output: outermostNormalView, metalrough: vec2( outermostMetalness, outermostRoughness ) } ) );
 * ```
 *
 * @module OutermostLobe
 * @three_import import { outermostNormalView, outermostRoughness, outermostMetalness } from 'three/addons/tsl/utils/OutermostLobe.js';
 */

const outermost = ( coat, base ) => Fn( ( { material } ) => material.useClearcoat === true ? clearcoat.greaterThan( 0 ).select( coat, base ) : base )();

/**
 * The view space normal of the outermost specular lobe.
 *
 * @tsl
 * @type {Node<vec3>}
 */
export const outermostNormalView = /*@__PURE__*/ outermost( clearcoatNormalView, normalView );

/**
 * The roughness of the outermost specular lobe.
 *
 * @tsl
 * @type {Node<float>}
 */
export const outermostRoughness = /*@__PURE__*/ outermost( clearcoatRoughness, roughness );

/**
 * The metalness of the outermost specular lobe. A clearcoat is a dielectric.
 *
 * @tsl
 * @type {Node<float>}
 */
export const outermostMetalness = /*@__PURE__*/ outermost( 0, metalness );
