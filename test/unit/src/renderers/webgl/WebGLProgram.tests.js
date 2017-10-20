/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { WebGLProgram } from '../../../../../src/renderers/webgl/WebGLProgram';

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'WebGL', () => {

		QUnit.module.todo( 'WebGLProgram', () => {

			// INSTANCING
			QUnit.test( "Instancing", ( assert ) => {} );

			// PROPERTIES
			QUnit.test( "uniforms", ( assert ) => {} );
			
			QUnit.test( "attributes", ( assert ) => {} );

			// PUBLIC STUFF
			QUnit.test( "getUniforms", ( assert ) => {} );
			
			QUnit.test( "getAttributes", ( assert ) => {} );
			
			QUnit.test( "destroy", ( assert ) => {} );

		} );

	} );

} );
