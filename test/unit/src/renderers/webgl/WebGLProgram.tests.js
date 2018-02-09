/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { parseIncludes } from '../../../../../src/renderers/webgl/WebGLProgram';
import { ShaderChunk } from '../../../../../src/renderers/shaders/ShaderChunk';

function copyShaderChunks( chunks ) {

	var copy = {};
	for ( var k in chunks ) {

		copy[ k ] = chunks[ k ];

	}

	return copy;

}

function merge( target, source ) {

	for ( var k in source ) {

		target[ k ] = source[ k ];

	}

}

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'WebGL', () => {

		QUnit.module( 'WebGLProgram', () => {

			// INSTANCING
			QUnit.todo( "Instancing", ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

			// PROPERTIES
			QUnit.todo( "uniforms", ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

			QUnit.todo( "attributes", ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

			// PUBLIC STUFF
			QUnit.todo( "getUniforms", ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

			QUnit.todo( "getAttributes", ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

			QUnit.todo( "destroy", ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

			QUnit.test( "parseIncludes", ( assert ) => {

				var testChunks = {
					test_chunk_a: [
						"#chunk_a#"
					].join( "\n" ),
					test_chunk_b: [
						"#include_once <test_chunk_a>",
						"#include_once <test_chunk_f>",
						"#include_once <test_chunk_a>"
					].join( "\n" ),
					test_chunk_c: [
						"#include <test_chunk_a>",
						"#include <test_chunk_d>"
					].join( "\n" ),
					test_chunk_d: [
						"#include <test_chunk_e>",
						"#include <test_chunk_a>"
					].join( "\n" ),
					test_chunk_e: [
						"#include <test_chunk_c>",
						"#include <test_chunk_a>"
					].join( "\n" ),
					test_chunk_f: [
						"#chunk_f#"
					].join( "\n" )
				};
				merge( ShaderChunk, testChunks );
				var testStack = [ "test_chunk_c", "test_chunk_d", "test_chunk_e" ];
				assert.throws(
					() => {

						parseIncludes( "#include_once <test_chunk_c>" );

					},
					new Error(
						'Circular #include <test_chunk_c> detected!\n(\n\t' + testStack.join( '\n\t' ) + '\n)'
					),
					"throws error on circular dependencies"
				);

				assert.equal(
					parseIncludes(
						"#include <test_chunk_b>"
					),
					[
						"#chunk_a#",
						"#chunk_f#",
						""
					].join( "\n" ),
					"multiple include_once of the same library get only included once"
				);

			} );

		} );

	} );

} );
