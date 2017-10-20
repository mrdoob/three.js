/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { WebGLBackground } from '../../../../../src/renderers/webgl/WebGLBackground';

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'WebGL', () => {

		QUnit.module.todo( 'WebGLBackground', () => {

			// INSTANCING
			QUnit.test( "Instancing", ( assert ) => {} );

			// PUBLIC STUFF
			QUnit.test( "getClearColor", ( assert ) => {} );

			QUnit.test( "setClearColor", ( assert ) => {} );

			QUnit.test( "getClearAlpha", ( assert ) => {} );

			QUnit.test( "setClearAlpha", ( assert ) => {} );

			QUnit.test( "render", ( assert ) => {} );

		} );

	} );

} );
