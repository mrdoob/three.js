/**
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { LoadingManager } from '../../../../src/loaders/LoadingManager';

export default QUnit.module( 'Loaders', () => {

	QUnit.module.todo( 'LoadingManager', () => {

		// INSTANCING
		QUnit.test( "Instancing", ( assert ) => {} );

		// PUBLIC STUFF
		QUnit.test( "onStart", ( assert ) => {} );

		QUnit.test( "onLoad", ( assert ) => {} );

		QUnit.test( "onProgress", ( assert ) => {} );

		QUnit.test( "onError", ( assert ) => {} );

		QUnit.test( "itemStart", ( assert ) => {} );

		QUnit.test( "itemEnd", ( assert ) => {} );

		QUnit.test( "itemError", ( assert ) => {} );

	} );

} );
