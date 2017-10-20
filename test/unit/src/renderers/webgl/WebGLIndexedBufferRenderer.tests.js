/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { WebGLIndexedBufferRenderer } from '../../../../../src/renderers/webgl/WebGLIndexedBufferRenderer';

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'WebGL', () => {

		QUnit.module.todo( 'WebGLIndexedBufferRenderer', () => {

			// INSTANCING
			QUnit.test( "Instancing", ( assert ) => {} );

			// PUBLIC STUFF
			QUnit.test( "setMode", ( assert ) => {} );

			QUnit.test( "setIndex", ( assert ) => {} );

			QUnit.test( "render", ( assert ) => {} );

			QUnit.test( "renderInstances", ( assert ) => {} );

		} );

	} );

} );
