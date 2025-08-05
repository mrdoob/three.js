import { abs, cross, float, Fn, normalize, ivec2, sub, vec2, vec3, vec4 } from '../tsl/TSLBase.js';
import { textureSize } from '../accessors/TextureSizeNode.js';
import { textureLoad } from '../accessors/TextureNode.js';
import { WebGPUCoordinateSystem } from '../../constants.js';

/**
 * Computes a position in view space based on a fragment's screen position expressed as uv coordinates, the fragments
 * depth value and the camera's inverse projection matrix.
 *
 * @tsl
 * @function
 * @param {Node<vec2>} screenPosition - The fragment's screen position expressed as uv coordinates.
 * @param {Node<float>} depth - The fragment's depth value.
 * @param {Node<mat4>} projectionMatrixInverse - The camera's inverse projection matrix.
 * @return {Node<vec3>} The fragments position in view space.
 */
export const getViewPosition = /*@__PURE__*/ Fn( ( [ screenPosition, depth, projectionMatrixInverse ], builder ) => {

	let clipSpacePosition;

	if ( builder.renderer.coordinateSystem === WebGPUCoordinateSystem ) {

		screenPosition = vec2( screenPosition.x, screenPosition.y.oneMinus() ).mul( 2.0 ).sub( 1.0 );
		clipSpacePosition = vec4( vec3( screenPosition, depth ), 1.0 );

	} else {

		clipSpacePosition = vec4( vec3( screenPosition.x, screenPosition.y.oneMinus(), depth ).mul( 2.0 ).sub( 1.0 ), 1.0 );

	}

	const viewSpacePosition = vec4( projectionMatrixInverse.mul( clipSpacePosition ) );

	return viewSpacePosition.xyz.div( viewSpacePosition.w );

} );

/**
 * Computes a screen position expressed as uv coordinates based on a fragment's position in view space
 * and the camera's projection matrix
 *
 * @tsl
 * @function
 * @param {Node<vec3>} viewPosition - The fragments position in view space.
 * @param {Node<mat4>} projectionMatrix - The camera's projection matrix.
 * @return {Node<vec2>} The fragment's screen position expressed as uv coordinates.
 */
export const getScreenPosition = /*@__PURE__*/ Fn( ( [ viewPosition, projectionMatrix ] ) => {

	const sampleClipPos = projectionMatrix.mul( vec4( viewPosition, 1.0 ) );
	const sampleUv = sampleClipPos.xy.div( sampleClipPos.w ).mul( 0.5 ).add( 0.5 ).toVar();
	return vec2( sampleUv.x, sampleUv.y.oneMinus() );

} );

/**
 * Computes a normal vector based on depth data. Can be used as a fallback when no normal render
 * target is available or if flat surface normals are required.
 *
 * @tsl
 * @function
 * @param {Node<vec2>} uv - The texture coordinate.
 * @param {DepthTexture} depthTexture - The depth texture.
 * @param {Node<mat4>} projectionMatrixInverse - The camera's inverse projection matrix.
 * @return {Node<vec3>} The computed normal vector.
 */
export const getNormalFromDepth = /*@__PURE__*/ Fn( ( [ uv, depthTexture, projectionMatrixInverse ] ) => {

	const size = textureSize( textureLoad( depthTexture ) );
	const p = ivec2( uv.mul( size ) ).toVar();

	const c0 = textureLoad( depthTexture, p ).toVar();

	const l2 = textureLoad( depthTexture, p.sub( ivec2( 2, 0 ) ) ).toVar();
	const l1 = textureLoad( depthTexture, p.sub( ivec2( 1, 0 ) ) ).toVar();
	const r1 = textureLoad( depthTexture, p.add( ivec2( 1, 0 ) ) ).toVar();
	const r2 = textureLoad( depthTexture, p.add( ivec2( 2, 0 ) ) ).toVar();
	const b2 = textureLoad( depthTexture, p.add( ivec2( 0, 2 ) ) ).toVar();
	const b1 = textureLoad( depthTexture, p.add( ivec2( 0, 1 ) ) ).toVar();
	const t1 = textureLoad( depthTexture, p.sub( ivec2( 0, 1 ) ) ).toVar();
	const t2 = textureLoad( depthTexture, p.sub( ivec2( 0, 2 ) ) ).toVar();

	const dl = abs( sub( float( 2 ).mul( l1 ).sub( l2 ), c0 ) ).toVar();
	const dr = abs( sub( float( 2 ).mul( r1 ).sub( r2 ), c0 ) ).toVar();
	const db = abs( sub( float( 2 ).mul( b1 ).sub( b2 ), c0 ) ).toVar();
	const dt = abs( sub( float( 2 ).mul( t1 ).sub( t2 ), c0 ) ).toVar();

	const ce = getViewPosition( uv, c0, projectionMatrixInverse ).toVar();

	const dpdx = dl.lessThan( dr ).select( ce.sub( getViewPosition( uv.sub( vec2( float( 1 ).div( size.x ), 0 ) ), l1, projectionMatrixInverse ) ), ce.negate().add( getViewPosition( uv.add( vec2( float( 1 ).div( size.x ), 0 ) ), r1, projectionMatrixInverse ) ) );
	const dpdy = db.lessThan( dt ).select( ce.sub( getViewPosition( uv.add( vec2( 0, float( 1 ).div( size.y ) ) ), b1, projectionMatrixInverse ) ), ce.negate().add( getViewPosition( uv.sub( vec2( 0, float( 1 ).div( size.y ) ) ), t1, projectionMatrixInverse ) ) );

	return normalize( cross( dpdx, dpdy ) );

} );
