/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { WebGLObjects } from '../../../../../src/renderers/webgl/WebGLObjects';

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'WebGL', () => {

		QUnit.module.todo( 'WebGLObjects', () => {

			// INSTANCING
			QUnit.test( "Instancing", ( assert ) => {} );
			
			// PUBLIC STUFF
			QUnit.test( "update", ( assert ) => {} );
			
			QUnit.test( "clear", ( assert ) => {} );

		} );

	} );

} );
