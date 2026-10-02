import {
	float, int, vec2, vec3, vec4, mat4, length,
	equirectUV, equirectDirection,
	spritesheetUV,
	interleavedGradientNoise, vogelDiskSample,
	getScreenPosition, getScreenPositionFromClip
} from 'three/tsl';
import { gpuTest } from './gpu-test-utils.js';

// Coverage for the utility "grab-bag" functions in src/nodes/utils/EquirectUV.js,
// src/nodes/utils/SpriteSheetUV.js and src/nodes/utils/PostProcessingUtils.js.
// Every expected value below is a plain-JS transliteration of each function's
// own documented formula, computed independently -- never by re-running the
// TSL expression under test (round-trip checks are the one deliberate
// exception: they layer the *actual* TSL functions on top of each other to
// check the documented inverse-of-each-other property, which is itself the
// thing under test, same pattern as TSLDepthConversion.tests.js's round trips).
export default QUnit.module( 'TSL', () => {

	QUnit.module( 'equirectUV() / equirectDirection()', () => {

		gpuTest( 'equirectUV() matches its own documented spherical-coordinate formula', ( { assert } ) => {

			// EquirectUV.js: u = atan2(dir.z, dir.x) / (2*PI) + 0.5
			//                v = asin(clamp(dir.y,-1,1)) / PI + 0.5
			const equirectUVJS = ( x, y, z ) => {

				const u = Math.atan2( z, x ) / ( Math.PI * 2 ) + 0.5;
				const v = Math.asin( Math.min( Math.max( y, - 1 ), 1 ) ) / Math.PI + 0.5;
				return [ u, v ];

			};

			// direction = (1,0,0): atan2(0,1) == 0, asin(0) == 0 -- both terms land exactly on the 0.5 midpoint.
			const [ u1, v1 ] = equirectUVJS( 1, 0, 0 );
			assert.closeAbs( equirectUV( vec3( 1, 0, 0 ) ), vec2( u1, v1 ), 1e-5, 'equirectUV(1,0,0) matches atan2/asin formula' );

			// direction = (0,0,1): atan2(1,0) == PI/2, a quarter turn away from the first case.
			const [ u2, v2 ] = equirectUVJS( 0, 0, 1 );
			assert.closeAbs( equirectUV( vec3( 0, 0, 1 ) ), vec2( u2, v2 ), 1e-5, 'equirectUV(0,0,1) matches atan2/asin formula' );

			// General-case unit direction, off every axis.
			const a = 1 / Math.sqrt( 3 );
			const [ u3, v3 ] = equirectUVJS( a, a, a );
			assert.closeAbs( equirectUV( vec3( a, a, a ) ), vec2( u3, v3 ), 1e-5, 'equirectUV(normalize(1,1,1)) matches atan2/asin formula' );

		} );

		gpuTest( 'equirectDirection() matches its own documented spherical-coordinate formula', ( { assert } ) => {

			// EquirectUV.js: theta = (u-0.5)*2*PI; phi = (v-0.5)*PI
			//                dir = (cos(phi)*cos(theta), sin(phi), cos(phi)*sin(theta))
			const equirectDirectionJS = ( u, v ) => {

				const theta = ( u - 0.5 ) * Math.PI * 2;
				const phi = ( v - 0.5 ) * Math.PI;
				const cosPhi = Math.cos( phi );
				return [ cosPhi * Math.cos( theta ), Math.sin( phi ), cosPhi * Math.sin( theta ) ];

			};

			const [ x1, y1, z1 ] = equirectDirectionJS( 0.3, 0.4 );
			assert.closeAbs( equirectDirection( vec2( 0.3, 0.4 ) ), vec3( x1, y1, z1 ), 1e-5, 'equirectDirection(0.3,0.4) matches the theta/phi formula' );

			const [ x2, y2, z2 ] = equirectDirectionJS( 0.75, 0.5 );
			assert.closeAbs( equirectDirection( vec2( 0.75, 0.5 ) ), vec3( x2, y2, z2 ), 1e-5, 'equirectDirection(0.75,0.5) matches the theta/phi formula' );

		} );

		gpuTest( 'equirectUV() and equirectDirection() round-trip each other', ( { assert } ) => {

			// direction -> uv -> direction' must recover the original unit
			// direction, since the two are documented as inverses of each other.
			const a = 1 / Math.sqrt( 3 );
			const dir = vec3( a, a, a );
			assert.closeAbs( equirectDirection( equirectUV( dir ) ), dir, 1e-4, 'equirectDirection(equirectUV(dir)) recovers dir' );

			// uv -> direction -> uv' must recover the original uv, away from the
			// pole singularity (see the dedicated pole test below for why the
			// pole itself is excluded from this round trip).
			const uv = vec2( 0.3, 0.4 );
			assert.closeAbs( equirectUV( equirectDirection( uv ) ), uv, 1e-4, 'equirectUV(equirectDirection(uv)) recovers uv' );

		} );

		gpuTest( 'equirectUV()/equirectDirection() at the poles: known U-coordinate singularity', ( { assert } ) => {

			// Straight up (0,1,0): v = asin(1)/PI + 0.5 == 1 exactly, regardless
			// of x/z. u = atan2(0,0)/(2*PI) + 0.5 -- atan2(0,0) is only
			// well-defined by convention (JS's Math.atan2(0,0) == 0), and GLSL/
			// WGSL don't guarantee the same convention as JS, so u's exact value
			// at this pole is not hard-asserted here (see the findings file).
			// v, however, is asserted exactly.
			//
			// The pole direction is routed through `.toVar()` so it isn't folded
			// into a compile-time constant -- `atan2(0,0)` on an exact
			// compile-time-constant `(0,0)` risks the same class of WGSL
			// constant-folding rejection as the `sinc()`/`getDistanceAttenuation()`
			// findings already on record (indeterminate compile-time constant
			// expressions), even though atan2's actual runtime behavior at
			// (0,0) is well-defined per backend.
			const pole = vec3( 0, 1, 0 ).toVar();
			const southPole = vec3( 0, - 1, 0 ).toVar();

			assert.closeAbs( equirectUV( pole ).y, float( 1 ), 1e-5, 'equirectUV(0,1,0).y == 1 exactly at the north pole' );
			assert.closeAbs( equirectUV( southPole ).y, float( 0 ), 1e-5, 'equirectUV(0,-1,0).y == 0 exactly at the south pole' );

			// The round trip through the pole is still well-defined *as a
			// direction*, independent of whatever u value equirectUV(0,1,0)
			// produces: at v == 1, phi == PI/2, so cos(phi) == 0, which zeroes
			// out equirectDirection's x/z terms regardless of theta (i.e.
			// regardless of u). This is a robust, backend-independent invariant,
			// unlike u's own value at the pole.
			assert.closeAbs( equirectDirection( equirectUV( pole ) ), vec3( 0, 1, 0 ), 1e-4, 'equirectDirection(equirectUV(0,1,0)) recovers the pole direction regardless of the U singularity' );

		} );

	} );

	QUnit.module( 'spritesheetUV()', () => {

		gpuTest( 'spritesheetUV() maps a frame index to its sub-rectangle, with explicit inputs', ( { assert } ) => {

			// SpriteSheetUV.js, with explicit count/uv/frame (no uv()/time defaults involved):
			//   frameNum = mod(frame, width*height), floored
			//   column = mod(frameNum, width)
			//   row = height - ceil((frameNum+1)/width)
			//   result = (uv + (column,row)) * (1/width, 1/height)
			const spritesheetUVJS = ( width, height, u, v, frame ) => {

				const frameNum = Math.floor( ( ( frame % ( width * height ) ) + ( width * height ) ) % ( width * height ) );
				const column = frameNum % width;
				const row = height - Math.ceil( ( frameNum + 1 ) / width );
				return [ ( u + column ) / width, ( v + row ) / height ];

			};

			// Frame 0 of a 6x6 sheet, base uv at the cell's own origin (0,0).
			const [ x0, y0 ] = spritesheetUVJS( 6, 6, 0, 0, 0 );
			assert.closeAbs(
				spritesheetUV( vec2( 6, 6 ), vec2( 0, 0 ), float( 0 ) ), vec2( x0, y0 ), 1e-5,
				'spritesheetUV frame 0 of 6x6 matches the hand-derived column/row formula'
			);

			// Frame 5: the LAST frame of the first row (width=6, so column wraps
			// back to 0 at frame 6) -- the off-by-one boundary this test is
			// specifically checking.
			const [ x5, y5 ] = spritesheetUVJS( 6, 6, 0, 0, 5 );
			assert.closeAbs(
				spritesheetUV( vec2( 6, 6 ), vec2( 0, 0 ), float( 5 ) ), vec2( x5, y5 ), 1e-5,
				'spritesheetUV frame 5 (last of row 0) matches the hand-derived column/row formula'
			);

			// Frame 6: the FIRST frame of the second row -- column must wrap
			// back to 0 and row must step down by exactly one, immediately
			// after frame 5 above.
			const [ x6, y6 ] = spritesheetUVJS( 6, 6, 0, 0, 6 );
			assert.closeAbs(
				spritesheetUV( vec2( 6, 6 ), vec2( 0, 0 ), float( 6 ) ), vec2( x6, y6 ), 1e-5,
				'spritesheetUV frame 6 (first of row 1) matches the hand-derived column/row formula'
			);

			// A non-zero base uv (sampling somewhere inside the cell, not just
			// its origin) on a 2x2 sheet, to check the (uv + offset) * scale
			// composition itself, not just the offset.
			const [ xOff, yOff ] = spritesheetUVJS( 2, 2, 0.5, 0.5, 0 );
			assert.closeAbs(
				spritesheetUV( vec2( 2, 2 ), vec2( 0.5, 0.5 ), float( 0 ) ), vec2( xOff, yOff ), 1e-5,
				'spritesheetUV composes a non-zero base uv with the frame offset correctly'
			);

			// Frame 36 on the same 6x6 (36-frame) sheet must wrap back to frame
			// 0's result, exercising the mod(frame, width*height) wraparound.
			const [ xWrap, yWrap ] = spritesheetUVJS( 6, 6, 0, 0, 36 );
			assert.closeAbs(
				spritesheetUV( vec2( 6, 6 ), vec2( 0, 0 ), float( 36 ) ), vec2( xWrap, yWrap ), 1e-5,
				'spritesheetUV frame 36 wraps around to frame 0 on a 36-frame sheet'
			);

		} );

	} );

	QUnit.module( 'interleavedGradientNoise()', () => {

		gpuTest( 'interleavedGradientNoise() matches the Jimenez 2014 formula', ( { assert } ) => {

			// PostProcessingUtils.js: fract(52.9829189 * fract(dot(pos, (0.06711056, 0.00583715))))
			const ignJS = ( x, y ) => {

				const dot = x * 0.06711056 + y * 0.00583715;
				const inner = dot - Math.floor( dot );
				const scaled = 52.9829189 * inner;
				return scaled - Math.floor( scaled );

			};

			assert.closeAbs( interleavedGradientNoise( vec2( 0, 0 ) ), float( ignJS( 0, 0 ) ), 1e-4, 'interleavedGradientNoise(0,0) matches the Jimenez formula' );
			assert.closeAbs( interleavedGradientNoise( vec2( 1, 1 ) ), float( ignJS( 1, 1 ) ), 1e-4, 'interleavedGradientNoise(1,1) matches the Jimenez formula' );
			assert.closeAbs( interleavedGradientNoise( vec2( 12.9, 47.3 ) ), float( ignJS( 12.9, 47.3 ) ), 1e-3, 'interleavedGradientNoise(12.9,47.3) matches the Jimenez formula' );

			// Determinism: the same input, evaluated twice, must produce
			// exactly the same output (this is a pure, non-stochastic hash-like
			// formula with no hidden per-invocation state).
			assert.closeAbs( interleavedGradientNoise( vec2( 3.7, 8.2 ) ), interleavedGradientNoise( vec2( 3.7, 8.2 ) ), 1e-6, 'interleavedGradientNoise is deterministic for the same input' );

		} );

	} );

	QUnit.module( 'vogelDiskSample()', () => {

		gpuTest( 'vogelDiskSample() matches the golden-angle disk-sampling formula', ( { assert } ) => {

			// PostProcessingUtils.js:
			//   goldenAngle = 2.399963229728653
			//   r = sqrt((sampleIndex+0.5) / samplesCount)
			//   theta = sampleIndex*goldenAngle + phi
			//   sample = (cos(theta), sin(theta)) * r
			const goldenAngle = 2.399963229728653;
			const vogelJS = ( index, count, phi ) => {

				const r = Math.sqrt( ( index + 0.5 ) / count );
				const theta = index * goldenAngle + phi;
				return [ Math.cos( theta ) * r, Math.sin( theta ) * r ];

			};

			// First sample (index 0) at phi == 0: theta == 0, so the sample
			// lands exactly on the +X axis.
			const [ x0, y0 ] = vogelJS( 0, 8, 0 );
			assert.closeAbs( vogelDiskSample( int( 0 ), int( 8 ), float( 0 ) ), vec2( x0, y0 ), 1e-4, 'vogelDiskSample(0,8,0) matches the hand-derived formula' );

			// A general-case (index, count, phi) combination.
			const [ x3, y3 ] = vogelJS( 3, 8, 0.5 );
			assert.closeAbs( vogelDiskSample( int( 3 ), int( 8 ), float( 0.5 ) ), vec2( x3, y3 ), 1e-4, 'vogelDiskSample(3,8,0.5) matches the hand-derived formula' );

			// The last sample of a differently-sized set, with a larger phi
			// rotation.
			const [ x11, y11 ] = vogelJS( 11, 12, 2.1 );
			assert.closeAbs( vogelDiskSample( int( 11 ), int( 12 ), float( 2.1 ) ), vec2( x11, y11 ), 1e-4, 'vogelDiskSample(11,12,2.1) matches the hand-derived formula' );

			// Sanity property: r = sqrt((index+0.5)/count) < 1 for every valid
			// index in [0, count), so every sample must lie strictly within the
			// unit disk -- checked directly via length(), independent of the
			// exact x/y formula above.
			for ( const index of [ 0, 4, 7 ] ) {

				assert.lessThanOrEqual(
					length( vogelDiskSample( int( index ), int( 8 ), float( 1.3 ) ) ), float( 1 ),
					`vogelDiskSample(${ index },8,1.3) lies within the unit disk`
				);

			}

		} );

	} );

	QUnit.module( 'getScreenPosition() / getScreenPositionFromClip()', () => {

		gpuTest( 'getScreenPosition() matches the clip-space-projection formula, with an explicit identity projection matrix', ( { assert } ) => {

			// PostProcessingUtils.js:
			//   clip = projectionMatrix * (viewPosition, 1)
			//   uv = (clip.xy/clip.w) * 0.5 + 0.5
			//   result = (uv.x, 1 - uv.y)
			// An explicit identity projection matrix is used so the projection
			// step itself contributes nothing beyond a pass-through -- this is a
			// safe stand-in for "some real projection matrix" precisely because
			// identity is its own row-major/column-major transpose, sidestepping
			// the mat4(...) 16-scalar-argument row-major convention documented
			// in tsl-unit-test-findings.md entirely.
			const identity = mat4( 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 );

			const getScreenPositionJS = ( x, y, w = 1 ) => [ ( x / w ) * 0.5 + 0.5, 1 - ( ( y / w ) * 0.5 + 0.5 ) ];

			// A view-space position that projects to dead center of the screen
			// -- the natural edge case for a UV-space projection.
			const [ cx, cy ] = getScreenPositionJS( 0, 0 );
			assert.closeAbs( getScreenPosition( vec3( 0, 0, - 5 ), identity ), vec2( cx, cy ), 1e-5, 'getScreenPosition at the view-space origin lands on screen center (0.5,0.5)' );

			// General off-center case.
			const [ gx, gy ] = getScreenPositionJS( 0.4, - 0.6 );
			assert.closeAbs( getScreenPosition( vec3( 0.4, - 0.6, - 5 ), identity ), vec2( gx, gy ), 1e-5, 'getScreenPosition matches the hand-derived clip/uv formula' );

		} );

		gpuTest( 'getScreenPositionFromClip() matches the clip-space-projection formula', ( { assert } ) => {

			// PostProcessingUtils.js:
			//   uv = (clip.xy/clip.w) * 0.5 + 0.5
			//   result = (uv.x, 1 - uv.y)
			const getScreenPositionFromClipJS = ( x, y, w ) => [ ( x / w ) * 0.5 + 0.5, 1 - ( ( y / w ) * 0.5 + 0.5 ) ];

			// A clip position at the origin (with an arbitrary nonzero w) lands
			// on screen center -- same natural edge case as above, this time
			// exercised directly through clip space rather than a projection
			// matrix.
			const [ cx, cy ] = getScreenPositionFromClipJS( 0, 0, 3 );
			assert.closeAbs( getScreenPositionFromClip( vec4( 0, 0, 1, 3 ) ), vec2( cx, cy ), 1e-5, 'getScreenPositionFromClip at clip-space origin lands on screen center (0.5,0.5)' );

			// General case with a non-1 w (the divide is exercised for real,
			// not just as a no-op).
			const [ gx, gy ] = getScreenPositionFromClipJS( 1, 2, 4 );
			assert.closeAbs( getScreenPositionFromClip( vec4( 1, 2, 3, 4 ) ), vec2( gx, gy ), 1e-5, 'getScreenPositionFromClip matches the hand-derived clip/uv formula' );

			// NOTE: getScreenPositionFromClip() (and getScreenPosition(), via
			// the same division) has no guard against w == 0 -- clip.xy/clip.w
			// divides by zero unconditionally, producing +/-Infinity or NaN
			// depending on the sign of clip.xy. Not hard-asserted here: same
			// reasoning as the posterize(x,0) and getDistanceAttenuation(0)
			// findings already on record -- there's no "more correct" behavior
			// to regression-test against, and the exact NaN/Inf bit pattern
			// isn't something worth locking down. See the findings file.

		} );

	} );

} );
