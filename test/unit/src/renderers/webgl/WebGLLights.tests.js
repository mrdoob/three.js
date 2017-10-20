/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { WebGLLights } from '../../../../../src/renderers/webgl/WebGLLights';

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'WebGL', () => {

		QUnit.module.todo( 'WebGLLights', () => {

			// INSTANCING
			QUnit.test( "Instancing", ( assert ) => {} );
			
			// PUBLIC STUFF
			QUnit.test( "setup", ( assert ) => {} );
			
			QUnit.test( "state", ( assert ) => {} );

		} );

	} );

} );
