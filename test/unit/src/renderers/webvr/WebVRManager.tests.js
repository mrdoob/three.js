/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { WebVRManager } from '../../../../../src/renderers/webvr/WebVRManager';

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'WebGL', () => {

		QUnit.module.todo( 'WebVRManager', () => {

			QUnit.test( 'write me !', ( assert ) => {

				assert.ok( false, "everything's gonna be alright" );

			} );

		} );

	} );

} );
