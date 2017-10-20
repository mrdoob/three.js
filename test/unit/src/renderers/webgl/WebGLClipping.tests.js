/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { WebGLClipping } from '../../../../../src/renderers/webgl/WebGLClipping';

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'WebGL', () => {

		QUnit.module.todo( 'WebGLClipping', () => {

			// INSTANCING
			QUnit.test( "Instancing", ( assert ) => {} );

			// PUBLIC STUFF
			QUnit.test( "init", ( assert ) => {} );

			QUnit.test( "beginShadows", ( assert ) => {} );

			QUnit.test( "endShadows", ( assert ) => {} );

			QUnit.test( "setState", ( assert ) => {} );

		} );

	} );

} );
