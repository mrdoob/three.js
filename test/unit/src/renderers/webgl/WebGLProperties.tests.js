/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { WebGLProperties } from '../../../../../src/renderers/webgl/WebGLProperties';

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'WebGL', () => {

		QUnit.module.todo( 'WebGLProperties', () => {

			// INSTANCING
			QUnit.test( "Instancing", ( assert ) => {} );
			
			// PUBLIC STUFF
			QUnit.test( "get", ( assert ) => {} );
			
			QUnit.test( "remove", ( assert ) => {} );
			
			QUnit.test( "clear", ( assert ) => {} );

		} );

	} );

} );
