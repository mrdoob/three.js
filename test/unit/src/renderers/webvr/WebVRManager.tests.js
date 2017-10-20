/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { WebVRManager } from '../../../../../src/renderers/webvr/WebVRManager';

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'WebGL', () => {

		QUnit.module.todo( 'WebVRManager', () => {

			// INSTANCING
			QUnit.test( "Instancing", ( assert ) => {} );

			// PUBLIC STUFF
			QUnit.test( "getDevice", ( assert ) => {} );

			QUnit.test( "setDevice", ( assert ) => {} );

			QUnit.test( "getCamera", ( assert ) => {} );

			QUnit.test( "getStandingMatrix", ( assert ) => {} );

			QUnit.test( "submitFrame", ( assert ) => {} );

			QUnit.test( "dispose", ( assert ) => {} );

		} );

	} );

} );
