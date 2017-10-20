/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { WebGLTextures } from '../../../../../src/renderers/webgl/WebGLTextures';

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'WebGL', () => {

		QUnit.module.todo( 'WebGLTextures', () => {

			// INSTANCING
			QUnit.test( "Instancing", ( assert ) => {} );

			// PUBLIC STUFF
			QUnit.test( "setTexture2D", ( assert ) => {} );
			QUnit.test( "setTextureCube", ( assert ) => {} );
			QUnit.test( "setTextureCubeDynamic", ( assert ) => {} );
			QUnit.test( "setupRenderTarget", ( assert ) => {} );
			QUnit.test( "updateRenderTargetMipmap", ( assert ) => {} );

		} );

	} );

} );
