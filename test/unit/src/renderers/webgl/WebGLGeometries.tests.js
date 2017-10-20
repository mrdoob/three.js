/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { WebGLGeometries } from '../../../../../src/renderers/webgl/WebGLGeometries';

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'WebGL', () => {

		QUnit.module.todo( 'WebGLGeometries', () => {

			// INSTANCING
			QUnit.test( "Instancing", ( assert ) => {} );

			// PUBLIC STUFF
			QUnit.test( "get", ( assert ) => {} );

			QUnit.test( "update", ( assert ) => {} );

			QUnit.test( "getWireframeAttribute", ( assert ) => {} );

		} );

	} );

} );
