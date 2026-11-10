import { float, frameId, interleavedGradientNoise, screenCoordinate, uint } from 'three/tsl';

/**
 * Interleaved gradient noise animated by scrolling it 5.588238 pixels diagonally per index, so
 * accumulated frames or samples converge. The index wraps every 256 steps to keep float precision.
 * Offset positions are not independent dimensions, so use it for scalar noise only.
 *
 * Reference: {@link https://blog.demofox.org/2022/01/01/interleaved-gradient-noise-a-different-kind-of-low-discrepancy-sequence/}
 *
 * @tsl
 * @function
 * @param {Node<vec2>} [position=screenCoordinate] - The input position, usually screen coordinates.
 * @param {Node<uint>|number} [index=frameId] - The frame or sample index.
 * @return {Node<float>} The noise value in [0,1).
 */
export const animatedInterleavedGradientNoise = ( position = screenCoordinate, index = frameId ) => interleavedGradientNoise( position.add( float( uint( index ).mod( 256 ) ).mul( 5.588238 ) ) );
