import { normalView } from '../accessors/Normal.js';
import { positionViewDirection } from '../accessors/Position.js';
import { Fn, vec2, vec3 } from '../tsl/TSLBase.js';

/**
 * TSL function for creating a matcap uv node.
 *
 * Can be used to compute texture coordinates for projecting a
 * matcap onto a mesh. Used by {@link MeshMatcapNodeMaterial}.
 *
 * @tsl
 * @function
 * @returns {Node<vec2>} The matcap UV coordinates.
 */
export const matcapUV = /*@__PURE__*/ Fn( () => {

	const x = vec3( positionViewDirection.z, 0, positionViewDirection.x.negate() ).normalize();
	const y = positionViewDirection.cross( x );

	return vec2( x.dot( normalView ), y.dot( normalView ) ).mul( 0.495 ).add( 0.5 ); // 0.495 to remove artifacts caused by undersized matcap disks

} ).once( [ 'NORMAL', 'VERTEX' ] )().toVar( 'matcapUV' );
