import { WebGLCoordinateSystem } from 'three/webgpu';
import { Break, Fn, If, Loop, bool, float, getScreenPositionFromClip, int, vec2, vec3, vec4 } from 'three/tsl';

/**
 * Projects a view position to the UV and projected depth the rays are traced in, for any camera and depth buffer.
 *
 * @tsl
 * @function
 * @param {Node<vec3>} viewPosition - The position in view space.
 * @param {Node<mat4>} projectionMatrix - The camera's projection matrix.
 * @return {Node<vec3>} The UV and the projected depth.
 */
export const getRayPosition = /*@__PURE__*/ Fn( ( [ viewPosition, projectionMatrix ], builder ) => {

	const clipPosition = projectionMatrix.mul( vec4( viewPosition, 1 ) ).toConst();
	const depth = clipPosition.z.div( clipPosition.w );

	const { coordinateSystem, reversedDepthBuffer } = builder.renderer;

	return vec3( getScreenPositionFromClip( clipPosition ), coordinateSystem === WebGLCoordinateSystem && reversedDepthBuffer !== true ? depth.mul( 0.5 ).add( 0.5 ) : depth );

} );

/**
 * Marches a screen-space ray through the depth one sample at a time, inside the calling TSL function.
 *
 * @param {TextureNode} depthNode - The depth of the scene being traced.
 * @param {Node<vec3>} origin - Start UV and projected depth.
 * @param {Node<vec3>} end - End UV and projected depth.
 * @param {Object} options - Traversal configuration.
 * @param {Node<vec2>} options.resolution - The resolution the steps are counted in.
 * @param {boolean} [options.reversedDepth=false] - Projected depth convention.
 * @param {Node<float>|number} [options.quality=1] - The steps per pixel of the ray.
 * @param {Node<float>|number} [options.offset=0] - The offset of the samples, in steps.
 * @param {Node<int>} [options.steps] - The number of samples, instead of the one given by `quality`.
 * @param {Function} [options.parameter] - Returns the ray parameter of a sample index, instead of even steps.
 * @param {Function} [options.projectDepth] - Converts raw depth to projected depth (log-depth inputs).
 * @param {Function} [options.acceptHit] - TSL predicate accepting (UV, parameter, raw depth). With `refine` it also
 * receives the parameter of the previous sample, to widen its tolerance to the step.
 * @param {boolean} [options.refine=false] - Whether a hit is bisected towards the sample before it, where the ray was in front.
 * @param {Function} [options.refineHit] - TSL predicate (UV, parameter, raw depth): whether the ray can hit the surface it is behind at a bisection sample.
 * @return {Object} Hit flag, UV, raw depth and parameter, and whether hits are refined.
 */
export function traceLinear( depthNode, origin, end, { resolution, reversedDepth = false, quality = 1, offset = 0, steps = null, parameter = null, projectDepth = value => value, acceptHit = () => bool( true ), refine = false, refineHit = () => bool( true ) } ) {

	const delta = end.sub( origin ).toConst();

	if ( steps === null ) {

		const pixels = delta.xy.mul( resolution ).abs();

		steps = int( pixels.x.max( pixels.y ).mul( quality ) ).toConst();

	}

	if ( parameter === null ) parameter = ( index ) => index.add( offset ).div( float( steps ) );

	const hit = bool( false ).toVar();
	const hitUV = vec2( 0 ).toVar();
	const hitDepth = float( 0 ).toVar();
	const hitS = float( 0 ).toVar();
	const hitPreviousS = float( 0 ).toVar();
	const hitPreviousInFront = bool( false ).toVar();

	const previousS = float( 0 ).toVar();
	const previousInFront = bool( true ).toVar();

	const inFrontAt = ( s, raw ) => {

		const z = origin.z.add( delta.z.mul( s ) );
		const depth = projectDepth( raw );

		return reversedDepth ? z.greaterThan( depth ) : z.lessThan( depth );

	};

	Loop( steps, ( { i } ) => {

		const s = parameter( float( i ) ).toConst();
		const sampleUV = origin.xy.add( delta.xy.mul( s ) ).toConst();

		If( s.greaterThan( 1 ).or( sampleUV.lessThan( vec2( 0 ) ).any() ).or( sampleUV.greaterThan( vec2( 1 ) ).any() ), () => {

			Break();

		} );

		const raw = depthNode.sample( sampleUV ).r.toConst();
		const inFront = inFrontAt( s, raw ).toConst();

		const lastS = previousS.toConst();
		const lastInFront = previousInFront.toConst();

		previousS.assign( s );
		previousInFront.assign( inFront );

		If( inFront.not().and( refine ? acceptHit( sampleUV, s, raw, lastS ) : acceptHit( sampleUV, s, raw ) ), () => {

			hit.assign( true );
			hitUV.assign( sampleUV );
			hitDepth.assign( raw );
			hitS.assign( s );
			hitPreviousS.assign( lastS );
			hitPreviousInFront.assign( lastInFront );
			Break();

		} );

	} );

	if ( refine ) {

		// bisect front-to-back crossings, after the march since nested loops trip some shader compilers

		If( hit.and( hitPreviousInFront ), () => {

			Loop( { start: int( 0 ), end: int( 8 ), type: 'int', condition: '<' }, () => {

				const s = hitPreviousS.add( hitS ).mul( 0.5 ).toConst();
				const sampleUV = origin.xy.add( delta.xy.mul( s ) ).toConst();
				const raw = depthNode.sample( sampleUV ).r.toConst();

				If( inFrontAt( s, raw ).not().and( refineHit( sampleUV, s, raw ) ), () => {

					hitS.assign( s );

				} ).Else( () => {

					hitPreviousS.assign( s );

				} );

			} );

			hitUV.assign( origin.xy.add( delta.xy.mul( hitS ) ) );
			hitDepth.assign( depthNode.sample( hitUV ).r );

		} );

	}

	return { hit, uv: hitUV, depth: hitDepth, parameter: hitS, refined: refine };

}

/**
 * Traces screen-space rays by marching the depth linearly, see `traceLinear()`.
 *
 * @three_import import { LinearTracer } from 'three/addons/tsl/utils/traceLinear.js';
 */
export class LinearTracer {

	/**
	 * Traces a ray inside the calling TSL function.
	 *
	 * @param {TextureNode} depthNode - The depth of the scene.
	 * @param {Node<vec3>} origin - Start UV and projected depth.
	 * @param {Node<vec3>} end - End UV and projected depth.
	 * @param {Object} options - See `traceLinear()`.
	 * @return {Object} Hit flag, UV, raw depth and parameter, and whether hits are refined.
	 */
	trace( depthNode, origin, end, options ) {

		return traceLinear( depthNode, origin, end, options );

	}

}
