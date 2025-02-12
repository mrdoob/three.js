import { varying, vec4, modelWorldMatrixInverse, cameraPosition, positionGeometry, float, Fn, Loop, max, min, vec2, vec3, smoothstep, If, Break } from 'three/tsl';

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

/**
 * Performs raymarching on the specified 3D texture.
 *
 * @tsl
 * @function
 * @param {Object} params - The parameters for the function.
 * @param {Texture|Node} params.texture - The 3D texture to sample.
 * @param {number|Node} [params.range=0.1] - The range for the smoothstep function.
 * @param {number|Node} [params.threshold=0.25] - The threshold for the smoothstep function.
 * @param {number|Node} [params.opacity=0.25] - The opacity value for the final color.
 * @param {number|Node} [params.steps=100] - The number of steps for raymarching.
 * @returns {Function} The generated function that performs raymarching on the 3D texture.
 */
export const raymarchingTexture3D = Fn( ( {
	texture,
	range = float( 0.1 ),
	threshold = float( 0.25 ),
	opacity = float( 0.25 ),
	steps = float( 100 )
} ) => {

	const finalColor = vec4( 0 ).toVar();

	RaymarchingBox( steps, ( { positionRay } ) => {

		const mapValue = float( texture.sample( positionRay.add( 0.5 ) ).r ).toVar();

		mapValue.assign( smoothstep( threshold.sub( range ), threshold.add( range ), mapValue ).mul( opacity ) );

		const shading = texture.sample( positionRay.add( vec3( - 0.01 ) ) ).r.sub( texture.sample( positionRay.add( vec3( 0.01 ) ) ).r );

		const col = shading.mul( 3.0 ).add( positionRay.x.add( positionRay.y ).mul( 0.25 ) ).add( 0.2 );

		finalColor.rgb.addAssign( finalColor.a.oneMinus().mul( mapValue ).mul( col ) );

		finalColor.a.addAssign( finalColor.a.oneMinus().mul( mapValue ) );

		If( finalColor.a.greaterThanEqual( 0.95 ), () => {

			Break();

		} );

	} );

	return finalColor;

} );
