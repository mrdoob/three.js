/* global QUnit */

import { LoaderUtils } from '../../../../src/loaders/LoaderUtils.js';

export default QUnit.module( 'Loaders', () => {

	QUnit.module( 'LoaderUtils', () => {

		// STATIC

		QUnit.test( 'extractUrlBase', ( assert ) => {

			assert.equal( '/path/to/', LoaderUtils.extractUrlBase( '/path/to/model.glb' ) );
			assert.equal( './', LoaderUtils.extractUrlBase( 'model.glb' ) );
			assert.equal( '/', LoaderUtils.extractUrlBase( '/model.glb' ) );

		} );

		QUnit.todo( 'resolveURL', ( assert ) => {

			// static resolveURL( url, path )
			assert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
