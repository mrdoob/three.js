import { Fn, float, vec2, vec3, If } from '../tsl/TSLBase.js';
import { abs, clamp, floor, max, min, mix, smoothstep } from '../math/MathNode.js';
import { select } from '../math/ConditionalNode.js';
import { textureSize } from '../accessors/TextureSizeNode.js';

const cubeDirection = /*@__PURE__*/ Fn( ( [ axis, side, uv ] ) => {

	const st = uv.mul( 2 ).sub( 1 ).toVar();
	const over = min( max( abs( st ).sub( 1 ), 0 ), 0.75 );
	const p = clamp( st, - 1, 1 ).div( over.x.oneMinus().mul( over.y.oneMinus() ) );
	const d = vec3( p, side );

	return select( axis.equal( 0 ), d.zxy, select( axis.equal( 1 ), d.yzx, d ) );

} );

/**
 * Reconstructs a cube texture with four bilinear samples.
 *
 * @private
 * @param {CubeTextureNode} textureNode - The cube texture.
 * @param {Node<vec3>} directionNode - The sampling direction.
 * @return {Node<vec3>} The filtered color.
 */
export const cubeTextureBicubic = ( textureNode, directionNode ) => Fn( () => {

	const direction = directionNode.toVar();
	const a = abs( direction ).toVar();
	const axis = select( a.x.greaterThan( a.z ).and( a.x.greaterThan( a.y ) ), 0, select( a.z.greaterThan( a.y ), 2, 1 ) ).toVar();
	const d = direction.div( max( max( a.x, a.y ), a.z ) ).toVar();
	const side = select( axis.equal( 0 ), d.x, select( axis.equal( 1 ), d.y, d.z ) );
	const uv = select( axis.equal( 0 ), d.yz, select( axis.equal( 1 ), d.zx, d.xy ) ).mul( 0.5 ).add( 0.5 ).toVar();
	const size = float( textureSize( textureNode, 0 ).x ).toVar();
	const p = uv.mul( size ).sub( 0.5 );
	const i = floor( p ).toVar();
	const f = p.sub( i ).toVar();

	// Fold the cubic weights into two bilinear samples per axis.
	const s1 = f.mul( f.mul( f.mul( - 2 ).add( 3 ) ).add( 3 ) ).add( 1 ).div( 6 ).toVar();
	const s0 = s1.oneMinus().toVar();
	const q = f.oneMinus().toVar();
	const t0 = i.add( 0.5 ).sub( q.mul( q ).mul( q ).div( s0.mul( 6 ) ) ).div( size ).toVar();
	const t1 = i.add( 1.5 ).add( f.mul( f ).mul( f ).div( s1.mul( 6 ) ) ).div( size ).toVar();
	const tap = ( t ) => textureNode.sample( cubeDirection( axis, side, t ) ).rgb;
	const color = mix(
		mix( tap( vec2( t0.x, t0.y ) ), tap( vec2( t1.x, t0.y ) ), s1.x ),
		mix( tap( vec2( t0.x, t1.y ) ), tap( vec2( t1.x, t1.y ) ), s1.x ),
		s1.y
	).toVar();

	// Blend to bilinear where three face grids meet.
	const st = abs( uv.mul( 2 ).sub( 1 ) );
	const texel = float( 2 ).div( size );
	const corner = smoothstep( texel, texel.mul( 2 ), min( st.x, st.y ).oneMinus() ).toVar();

	If( corner.lessThan( 1 ), () => {

		color.assign( mix( textureNode.sample( direction ).rgb, color, corner ) );

	} );

	return color;

} )().context( { forceUVContext: false } );
