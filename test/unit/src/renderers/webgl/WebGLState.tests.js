/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { WebGLState } from '../../../../../src/renderers/webgl/WebGLState';

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'WebGL', () => {

		QUnit.module.todo( 'WebGLState', () => {

			// INSTANCING
			QUnit.test( "Instancing", ( assert ) => {} );

			// PUBLIC STUFF
			QUnit.test( "buffers", ( assert ) => {} );

			QUnit.test( "initAttributes", ( assert ) => {} );

			QUnit.test( "enableAttribute", ( assert ) => {} );

			QUnit.test( "enableAttributeAndDivisor", ( assert ) => {} );

			QUnit.test( "disableUnusedAttributes", ( assert ) => {} );

			QUnit.test( "enable", ( assert ) => {} );

			QUnit.test( "disable", ( assert ) => {} );

			QUnit.test( "getCompressedTextureFormats", ( assert ) => {} );

			QUnit.test( "useProgram", ( assert ) => {} );

			QUnit.test( "setBlending", ( assert ) => {} );

			QUnit.test( "setMaterial", ( assert ) => {} );

			QUnit.test( "setFlipSided", ( assert ) => {} );

			QUnit.test( "setCullFace", ( assert ) => {} );

			QUnit.test( "setLineWidth", ( assert ) => {} );

			QUnit.test( "setPolygonOffset", ( assert ) => {} );

			QUnit.test( "setScissorTest", ( assert ) => {} );

			QUnit.test( "activeTexture", ( assert ) => {} );

			QUnit.test( "bindTexture", ( assert ) => {} );

			QUnit.test( "compressedTexImage2D", ( assert ) => {} );

			QUnit.test( "texImage2D", ( assert ) => {} );

			QUnit.test( "scissor", ( assert ) => {} );

			QUnit.test( "viewport", ( assert ) => {} );

			QUnit.test( "reset", ( assert ) => {} );

		} );

	} );

} );
