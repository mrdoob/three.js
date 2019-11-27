/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { WebGLAttributes } from '../../../../../src/renderers/webgl/WebGLAttributes';

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'WebGL', () => {

		QUnit.module( 'WebGLAttributes', () => {

			// INSTANCING
			QUnit.todo( "Instancing", ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

			// PUBLIC STUFF
			QUnit.todo( "get", ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

			QUnit.todo( "remove", ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

			QUnit.todo( "update", ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

			QUnit.test( "update", ( assert ) => {

				const noop = () => {};
				let count = 0;
				const onUploadCallback = () => {

					count ++;

				};
				const attribute = { onUploadCallback, array: { subarray: noop }, usage: {}, version: 0, updateRange: {} };
				const webglAttribute = WebGLAttributes( { createBuffer: noop, bindBuffer: noop, bufferData: noop, bufferSubData: noop } );

				webglAttribute.update( attribute, );
				assert.equal( count, 1, ".onUploadCallback should be called when created" );

				attribute.version ++;
				webglAttribute.update( attribute, );
				assert.equal( count, 2, ".onUploadCallback should be called when updated" );

			} );

		} );

	} );

} );
