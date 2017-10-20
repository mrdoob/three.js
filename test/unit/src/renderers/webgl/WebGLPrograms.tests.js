/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { WebGLPrograms } from '../../../../../src/renderers/webgl/WebGLPrograms';

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'WebGL', () => {

		QUnit.module.todo( 'WebGLPrograms', () => {

			// INSTANCING
			QUnit.test( "Instancing", ( assert ) => {} );

			// PUBLIC STUFF
			QUnit.test( "getParameters", ( assert ) => {} );
			
			QUnit.test( "getProgramCode", ( assert ) => {} );
			
			QUnit.test( "acquireProgram", ( assert ) => {} );
			
			QUnit.test( "releaseProgram", ( assert ) => {} );
			
			QUnit.test( "programs", ( assert ) => {} );

		} );

	} );

} );
