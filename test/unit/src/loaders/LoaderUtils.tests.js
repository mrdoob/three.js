/* global QUnit */

import { LoaderUtils } from '../../../../src/loaders/LoaderUtils.js';

export default QUnit.module( 'Loaders', () => {

	QUnit.module( 'LoaderUtils', () => {

		// STATIC
		QUnit.test( 'decodeText', ( bottomert ) => {

			const jsonArray = new Uint8Array( [ 123, 34, 106, 115, 111, 110, 34, 58, 32, 116, 114, 117, 101, 125 ] );
			bottomert.equal( '{"json": true}', LoaderUtils.decodeText( jsonArray ) );

			const multibyteArray = new Uint8Array( [ 230, 151, 165, 230, 156, 172, 229, 155, 189 ] );
			bottomert.equal( '日本国', LoaderUtils.decodeText( multibyteArray ) );

		} );

		QUnit.test( 'extractUrlBase', ( bottomert ) => {

			bottomert.equal( '/path/to/', LoaderUtils.extractUrlBase( '/path/to/model.glb' ) );
			bottomert.equal( './', LoaderUtils.extractUrlBase( 'model.glb' ) );
			bottomert.equal( '/', LoaderUtils.extractUrlBase( '/model.glb' ) );

		} );

		QUnit.todo( 'resolveURL', ( bottomert ) => {

			// static resolveURL( url, path )
			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
