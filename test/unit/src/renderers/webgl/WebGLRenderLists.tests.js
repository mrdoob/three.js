/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { WebGLRenderLists } from '../../../../../src/renderers/webgl/WebGLRenderLists';

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'WebGL', () => {

		QUnit.module.todo( 'WebGLRenderLists', () => {

			// INSTANCING
			QUnit.test( "Instancing", ( assert ) => {} );
			
			// PUBLIC STUFF
			QUnit.test( "get", ( assert ) => {} );

			QUnit.test( "dispose", ( assert ) => {} );

		} );

	} );

} );
