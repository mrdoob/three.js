/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { WebGLTextures } from '../../../../../src/renderers/webgl/WebGLTextures';

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'WebGL', () => {

		QUnit.module.todo( 'WebGLTextures', () => {

			// INSTANCING
			QUnit.test( "Instancing", ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

			// PUBLIC STUFF
			QUnit.test( "setTexture2D", ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );
			QUnit.test( "setTextureCube", ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );
			QUnit.test( "setTextureCubeDynamic", ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );
			QUnit.test( "setupRenderTarget", ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );
			QUnit.test( "updateRenderTargetMipmap", ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

		} );

	} );

} );
