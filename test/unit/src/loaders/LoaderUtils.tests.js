/* global QUnit */

import { LoaderUtils } from '../../../../src/loaders/LoaderUtils.js';

export default QUnit.module( 'Loaders', () => {

	QUnit.module( 'LoaderUtils', () => {

		// STATIC
		QUnit.test( 'decodeText', ( assert ) => {

			const jsonArray = new Uint8Array( [ 123, 34, 106, 115, 111, 110, 34, 58, 32, 116, 114, 117, 101, 125 ] );
			assert.equal( '{"json": true}', LoaderUtils.decodeText( jsonArray ) );

			const multibyteArray = new Uint8Array( [ 230, 151, 165, 230, 156, 172, 229, 155, 189 ] );
			assert.equal( '日本国', LoaderUtils.decodeText( multibyteArray ) );

		} );

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
