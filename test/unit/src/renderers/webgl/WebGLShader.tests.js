import { WebGLShader } from '../../../../../src/renderers/webgl/WebGLShader.js';

// Records the WebGL calls WebGLShader() makes. A real context is not needed --
// the module is a thin create/source/compile wrapper.
function mockContext() {

	const calls = [];

	return {
		calls,
		VERTEX_SHADER: 35633,
		FRAGMENT_SHADER: 35632,
		createShader( type ) {

			const shader = { type };
			calls.push( [ 'createShader', type ] );
			return shader;

		},
		shaderSource( shader, string ) {

			calls.push( [ 'shaderSource', shader, string ] );

		},
		compileShader( shader ) {

			calls.push( [ 'compileShader', shader ] );

		}
	};

}

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'WebGL', () => {

		QUnit.module( 'WebGLShader', () => {

			QUnit.test( 'creates a shader of the requested type', ( assert ) => {

				const gl = mockContext();

				WebGLShader( gl, gl.VERTEX_SHADER, 'void main() {}' );

				assert.deepEqual( gl.calls[ 0 ], [ 'createShader', gl.VERTEX_SHADER ], 'the type is passed through to createShader' );

			} );

			QUnit.test( 'uploads the source and compiles it', ( assert ) => {

				const gl = mockContext();
				const source = 'void main() { gl_FragColor = vec4( 1.0 ); }';

				const shader = WebGLShader( gl, gl.FRAGMENT_SHADER, source );

				assert.deepEqual(
					gl.calls.map( c => c[ 0 ] ),
					[ 'createShader', 'shaderSource', 'compileShader' ],
					'the calls happen in create, source, compile order'
				);
				assert.strictEqual( gl.calls[ 1 ][ 1 ], shader, 'the source is attached to the shader that was created' );
				assert.strictEqual( gl.calls[ 1 ][ 2 ], source, 'the source string is passed through unmodified' );
				assert.strictEqual( gl.calls[ 2 ][ 1 ], shader, 'the same shader is compiled' );

			} );

			QUnit.test( 'returns the created shader', ( assert ) => {

				const gl = mockContext();

				const shader = WebGLShader( gl, gl.VERTEX_SHADER, '' );

				assert.strictEqual( shader.type, gl.VERTEX_SHADER, 'the returned object is the one createShader produced' );

			} );

			QUnit.test( 'does not check the compile status', ( assert ) => {

				// Compile errors are surfaced later by WebGLProgram, so this
				// function must not query or throw on them itself.
				const gl = mockContext();

				WebGLShader( gl, gl.VERTEX_SHADER, 'this is not valid glsl' );

				assert.ok(
					gl.calls.every( c => c[ 0 ] !== 'getShaderParameter' ),
					'getShaderParameter is never called'
				);

			} );

		} );

	} );

} );
