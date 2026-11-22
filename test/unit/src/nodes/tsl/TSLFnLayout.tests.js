import { Fn, float, texture, uniform, vec2 } from 'three/tsl';
import { DataTexture } from '../../../../../src/textures/DataTexture.js';
import { gpuTest } from './gpu-test-utils.js';

// The code of a Fn() with a layout is shared by the shaders of a backend. Uniforms and
// textures that the function reads are declared and named per shader, so each of the
// shaders below has to get its own working copy of the function.

const scale = uniform( 3 );
const offset = uniform( 0.5 );

const scaleByUniforms = Fn( ( [ x ] ) => x.mul( scale ).add( offset ) ).setLayout( {
	name: 'scaleByUniforms',
	type: 'float',
	inputs: [ { name: 'x', type: 'float' } ]
} );

const lookup = new DataTexture( new Uint8Array( [ 51, 102, 153, 255 ] ), 1, 1 );
lookup.needsUpdate = true;

const sampleLookup = Fn( ( [ p ] ) => texture( lookup, p ).level( 0 ).x ).setLayout( {
	name: 'sampleLookup',
	type: 'float',
	inputs: [ { name: 'p', type: 'vec2' } ]
} );

export default QUnit.module( 'Nodes', () => {

	QUnit.module( 'TSL', () => {

		QUnit.module( 'Fn() layouts', () => {

			gpuTest( 'A layout function reads uniforms', ( { assert } ) => {

				assert.closeAbs( scaleByUniforms( float( 2 ) ), float( 6.5 ), 1e-6, '2 * 3 + 0.5' );

			} );

			gpuTest( 'A layout function reads uniforms in another shader', ( { assert } ) => {

				// a uniform of this shader only, so the shared uniforms are numbered differently than in the first shader

				const other = uniform( 7 );

				assert.closeAbs( float( 1 ).mul( other ), float( 7 ), 1e-6, 'the uniform of this shader' );
				assert.closeAbs( scaleByUniforms( float( 4 ) ), float( 12.5 ), 1e-6, '4 * 3 + 0.5' );

			} );

			gpuTest( 'A layout function samples a texture', ( { assert } ) => {

				assert.closeAbs( sampleLookup( vec2( 0.5 ) ), float( 0.2 ), 1e-3, 'red channel of the texel' );

			} );

			gpuTest( 'A layout function samples a texture in another shader', ( { assert } ) => {

				assert.closeAbs( scaleByUniforms( float( 0 ) ), float( 0.5 ), 1e-6, 'the uniforms come first in this shader' );
				assert.closeAbs( sampleLookup( vec2( 0.5 ) ), float( 0.2 ), 1e-3, 'red channel of the texel' );

			} );

		} );

	} );

} );
