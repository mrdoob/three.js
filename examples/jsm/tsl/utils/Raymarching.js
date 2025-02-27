import { varying, vec4, modelWorldMatrixInverse, cameraPosition, positionGeometry, float, Fn, Loop, max, min, vec2, vec3 } from 'three/tsl';

const hitBox = /*@__PURE__*/ Fn( ( { orig, dir } ) => {

	const box_min = vec3( - 0.5 );
	const box_max = vec3( 0.5 );

	const inv_dir = dir.reciprocal();

	const tmin_tmp = box_min.sub( orig ).mul( inv_dir );
	const tmax_tmp = box_max.sub( orig ).mul( inv_dir );

	const tmin = min( tmin_tmp, tmax_tmp );
	const tmax = max( tmin_tmp, tmax_tmp );

	const t0 = max( tmin.x, max( tmin.y, tmin.z ) );
	const t1 = min( tmax.x, min( tmax.y, tmax.z ) );

	return vec2( t0, t1 );

} );

/**
 * Performs raymarching box-area using the specified number of steps and a callback function.
 *
 * ```js
 * RaymarchingBox( count, ( { positionRay } ) => {
 *
 * } );
 * ```
 *
 * @tsl
 * @function
 * @param {number|Node} steps - The number of steps for raymarching.
 * @param {Function|FunctionNode} callback - The callback function to execute at each step.
 * @returns {void}
 */
export const RaymarchingBox = ( steps, callback ) => {

	const vOrigin = varying( vec3( modelWorldMatrixInverse.mul( vec4( cameraPosition, 1.0 ) ) ) );
	const vDirection = varying( positionGeometry.sub( vOrigin ) );

	const rayDir = vDirection.normalize();
	const bounds = vec2( hitBox( { orig: vOrigin, dir: rayDir } ) ).toVar();

	bounds.x.greaterThan( bounds.y ).discard();

	bounds.assign( vec2( max( bounds.x, 0.0 ), bounds.y ) );

	const inc = vec3( rayDir.abs().reciprocal() ).toVar();
	const delta = float( min( inc.x, min( inc.y, inc.z ) ) ).toVar( 'rayDelta' ); // used 'rayDelta' name in loop

	delta.divAssign( float( steps ) );

	const positionRay = vec3( vOrigin.add( bounds.x.mul( rayDir ) ) ).toVar();

	Loop( { type: 'float', start: bounds.x, end: bounds.y, update: '+= rayDelta' }, () => {

		callback( { positionRay } );

		positionRay.addAssign( rayDir.mul( delta ) );

	} );

};
