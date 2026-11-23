import GLSLDecoder from '../../../../examples/jsm/transpiler/GLSLDecoder.js';
import Transpiler from '../../../../examples/jsm/transpiler/Transpiler.js';
import TSLEncoder from '../../../../examples/jsm/transpiler/TSLEncoder.js';
import WGSLEncoder from '../../../../examples/jsm/transpiler/WGSLEncoder.js';

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Transpiler', () => {

		QUnit.test( 'fixed-size array return type followed by another declaration', ( assert ) => {

			const source = `
				vec2[2] vertices() {
					vec2 edge[2] = vec2[](vec2(1.), vec2(2.));
					return edge;
				}
				float after = 3.;
			`;

			const tsl = new Transpiler( new GLSLDecoder(), new TSLEncoder() ).parse( source );

			assert.true( tsl.includes( 'const vertices = /*@__PURE__*/ Fn( () => {' ) );
			assert.true( tsl.includes( 'const edge = array( [ vec2( 1. ), vec2( 2. ) ] );' ) );
			assert.true( tsl.includes( 'return edge;' ) );
			assert.false( tsl.includes( 'return: \'vec2\'' ) );
			assert.true( tsl.includes( 'const after = float( 3. );' ) );

			const wgsl = new Transpiler( new GLSLDecoder(), new WGSLEncoder() ).parse( source );

			assert.true( wgsl.includes( 'fn vertices() -> array<vec2f, 2> {' ) );
			assert.true( wgsl.includes( 'return edge;' ) );
			assert.true( wgsl.includes( 'const after: f32 = 3.;' ) );

		} );

		QUnit.test( 'ordinary function and array variable declarations', ( assert ) => {

			const source = 'float scalar() { return 1.; } vec2 edge[2] = vec2[](vec2(1.), vec2(2.));';
			const tsl = new Transpiler( new GLSLDecoder(), new TSLEncoder() ).parse( source );

			assert.true( tsl.includes( 'return: \'float\'' ) );
			assert.true( tsl.includes( 'const edge = array( [ vec2( 1. ), vec2( 2. ) ] );' ) );

		} );

	} );

} );
