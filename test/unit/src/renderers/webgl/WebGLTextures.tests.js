/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { WebGLTextures } from '../../../../../src/renderers/webgl/WebGLTextures';

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'WebGL', () => {

		QUnit.module( 'WebGLTextures', () => {

			// INSTANCING
			QUnit.todo( "Instancing", ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

			// PUBLIC STUFF
			QUnit.todo( "setTexture2D", ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );
			QUnit.todo( "setTextureCube", ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );
			QUnit.todo( "setTextureCubeDynamic", ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );
			QUnit.todo( "setupRenderTarget", ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );
			QUnit.todo( "updateRenderTargetMipmap", ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

		} );

	} );

} );
