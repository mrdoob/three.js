/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { WebGLBufferRenderer } from '../../../../../src/renderers/webgl/WebGLBufferRenderer';

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'WebGL', () => {

		QUnit.module.todo( 'WebGLBufferRenderer', () => {

			// INSTANCING
			QUnit.test( "Instancing", ( assert ) => {} );

			// PUBLIC STUFF
			QUnit.test( "setMode", ( assert ) => {} );

			QUnit.test( "render", ( assert ) => {} );

			QUnit.test( "renderInstances", ( assert ) => {} );

		} );

	} );

} );
