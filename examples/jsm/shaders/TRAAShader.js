import { Vector2 } from 'three';

/**
 * Temporal resolve based on TRAANode and TAAUtils. Motion is unjittered,
 * current-minus-previous NDC, with previous window depth and validity in BA.
 *
 * @three_import import { TRAAShader } from 'three/addons/shaders/TRAAShader.js';
 */
const TRAAShader = {

	name: 'TRAAShader',

	uniforms: {
		tDiffuse: { value: null },
		tDepth: { value: null },
		tVelocity: { value: null },
		tHistory: { value: null },
		tHistoryDepth: { value: null },
		resolution: { value: new Vector2() },
		historyValid: { value: false },
		depthThreshold: { value: 0.0005 },
		maxVelocityLength: { value: 128 },
		useSubpixelCorrection: { value: true }
	},

	vertexShader: /* glsl */`
		varying vec2 vUv;
		void main() {
			vUv = uv;
			gl_Position = vec4( position.xy, 0.0, 1.0 );
		}
	`,

	fragmentShader: /* glsl */`
		uniform sampler2D tDiffuse, tDepth, tVelocity, tHistory, tHistoryDepth;
		uniform vec2 resolution;
		uniform bool historyValid, useSubpixelCorrection;
		uniform float depthThreshold, maxVelocityLength;
		varying vec2 vUv;
		layout(location = 1) out highp vec4 historyDepth;

		ivec2 bounded( ivec2 p ) {
			return clamp( p, ivec2( 0 ), ivec2( resolution ) - 1 );
		}

		// Playdead AABB clipping, also used by TAAUtils.clipAABB.
		vec4 clipHistory( vec4 current, vec4 history, vec4 lo, vec4 hi ) {
			vec3 center = ( hi.rgb + lo.rgb ) * 0.5;
			vec3 extent = ( hi.rgb - lo.rgb ) * 0.5 + 1e-7;
			vec4 delta = history - vec4( center, current.a );
			vec3 unit = abs( delta.rgb / extent );
			float longest = max( max( unit.x, unit.y ), unit.z );
			return longest > 1.0 ? vec4( center, current.a ) + delta / longest : history;
		}

		float luminanceWeight( vec3 c ) {
			c /= 1.0 + max( max( c.r, c.g ), c.b );
			return 1.0 / ( 1.0 + dot( c, vec3( 0.2126, 0.7152, 0.0722 ) ) );
		}

		void main() {
			ivec2 p = bounded( ivec2( vUv * resolution ) );
			ivec2 closest = p;
			float closestDepth = 2.0;
			vec4 current = max( texelFetch( tDiffuse, p, 0 ), 0.0 );
			vec4 moment1 = vec4( 0.0 ), moment2 = vec4( 0.0 );
			for ( int x = -1; x <= 1; x ++ ) {
				for ( int y = -1; y <= 1; y ++ ) {
					ivec2 neighbor = bounded( p + ivec2( x, y ) );
					float depth = texelFetch( tDepth, neighbor, 0 ).r;
					if ( depth < closestDepth ) {
						closestDepth = depth;
						closest = neighbor;
					}
					vec4 color = max( texelFetch( tDiffuse, neighbor, 0 ), 0.0 );
					moment1 += color;
					moment2 += color * color;
				}
			}

			vec4 motion = texelFetch( tVelocity, closest, 0 );
			vec2 offsetUV = motion.xy * 0.5;
			vec2 historyUV = vUv - offsetUV;
			bool inBounds = all( greaterThanEqual( historyUV, vec2( 0.0 ) ) ) &&
				all( lessThanEqual( historyUV, vec2( 1.0 ) ) );
			float oldDepth = texture2D( tHistoryDepth, historyUV ).r;
			// Expected previous depth includes rigid object motion as well as camera motion.
			// Reject both signs of mismatch; edges do not bypass disocclusion rejection.
			bool valid = historyValid && inBounds && closestDepth < 1.0 && motion.a > 0.5 &&
				motion.b >= 0.0 && motion.b <= 1.0 && abs( oldDepth - motion.b ) <= depthThreshold;

			float motionFactor = clamp( length( offsetUV * resolution ) / maxVelocityLength, 0.0, 1.0 );
			float weight = 0.05;
			if ( useSubpixelCorrection ) {
				vec2 phase = fract( offsetUV * resolution );
				vec2 subpixel = max( phase, 1.0 - phase );
				weight += ( 1.0 - subpixel.x * subpixel.y ) / 0.75 * 0.25;
			}
			weight = valid ? clamp( weight + motionFactor, 0.0, 1.0 ) : 1.0;
			vec4 mean = moment1 / 9.0;
			float gamma = mix( 0.5, 1.0, pow( 1.0 - motionFactor, 2.0 ) );
			vec4 sigma = sqrt( max( moment2 / 9.0 - mean * mean, 0.0 ) ) * gamma;
			vec4 history = clipHistory( mean, texture2D( tHistory, historyUV ), mean - sigma, mean + sigma );
			float wCurrent = weight * luminanceWeight( current.rgb );
			float wHistory = ( 1.0 - weight ) * luminanceWeight( history.rgb );
			gl_FragColor = valid ? ( current * wCurrent + history * wHistory ) / max( wCurrent + wHistory, 0.00001 ) : current;
			historyDepth = vec4( texelFetch( tDepth, p, 0 ).r, 0.0, 0.0, 1.0 );
		}
	`

};

export { TRAAShader };
