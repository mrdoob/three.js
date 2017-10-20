/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { WebGLAttributes } from '../../../../../src/renderers/webgl/WebGLAttributes';

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'WebGL', () => {

		QUnit.module.todo( 'WebGLAttributes', () => {

			// INSTANCING
			QUnit.test( "Instancing", ( assert ) => {} );

			// PUBLIC STUFF
			QUnit.test( "get", ( assert ) => {} );

			QUnit.test( "remove", ( assert ) => {} );

			QUnit.test( "update", ( assert ) => {} );

		} );

	} );

} );
