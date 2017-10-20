/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { WebGLCapabilities } from '../../../../../src/renderers/webgl/WebGLCapabilities';

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'WebGL', () => {

		QUnit.module.todo( 'WebGLCapabilities', () => {

			// INSTANCING
			QUnit.test( "Instancing", ( assert ) => {} );

			// PUBLIC STUFF
			QUnit.test( "getMaxAnisotropy", ( assert ) => {} );

			QUnit.test( "getMaxPrecision", ( assert ) => {} );

			QUnit.test( "precision", ( assert ) => {} );

			QUnit.test( "logarithmicDepthBuffer", ( assert ) => {} );

			QUnit.test( "maxTextures", ( assert ) => {} );

			QUnit.test( "maxVertexTextures", ( assert ) => {} );

			QUnit.test( "maxTextureSize", ( assert ) => {} );

			QUnit.test( "maxCubemapSize", ( assert ) => {} );

			QUnit.test( "maxAttributes", ( assert ) => {} );

			QUnit.test( "maxVertexUniforms", ( assert ) => {} );

			QUnit.test( "maxVaryings", ( assert ) => {} );

			QUnit.test( "maxFragmentUniforms", ( assert ) => {} );

			QUnit.test( "vertexTextures", ( assert ) => {} );

			QUnit.test( "floatFragmentTextures", ( assert ) => {} );

			QUnit.test( "floatVertexTextures", ( assert ) => {} );

		} );

	} );

} );
