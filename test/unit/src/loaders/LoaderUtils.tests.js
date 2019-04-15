/**
 * @author Don McCurdy / https://www.donmccurdy.com
 * @author bbmv / https://github.com/bbmv
 */
/* global QUnit */

import { LoaderUtils } from '../../../../src/loaders/LoaderUtils';

export default QUnit.module( 'Loaders', () => {

	QUnit.module( 'LoaderUtils', () => {

		// INSTANCING
		QUnit.test( 'decodeText', ( assert ) => {

			var jsonArray = new Uint8Array( [ 123, 34, 106, 115, 111, 110, 34, 58, 32, 116, 114, 117, 101, 125 ] );
			assert.equal( '{"json": true}', LoaderUtils.decodeText( jsonArray ) );

			var multibyteArray = new Uint8Array( [ 230, 151, 165, 230, 156, 172, 229, 155, 189 ] );
			assert.equal( '日本国', LoaderUtils.decodeText( multibyteArray ) );

		} );

		QUnit.test( 'extractUrlBase', ( assert ) => {

			assert.equal( '/path/to/', LoaderUtils.extractUrlBase( '/path/to/model.glb' ) );
			assert.equal( './', LoaderUtils.extractUrlBase( 'model.glb' ) );
			assert.equal( '/', LoaderUtils.extractUrlBase( '/model.glb' ) );

		} );

		QUnit.test( 'parseData', ( assert ) => {

			var AMOUNT = 50000;

			assert.equal( LoaderUtils.parseData( generateText( AMOUNT, true, " ", 3 ) ).length, AMOUNT );
			assert.equal( LoaderUtils.parseData( generateText( AMOUNT, false, " ", 3 ) ).length, AMOUNT );
			assert.equal( LoaderUtils.parseData( generateText( AMOUNT, true, "\t", 3 ) ).length, AMOUNT );
			assert.equal( LoaderUtils.parseData( generateText( AMOUNT, true, "\n", 3 ) ).length, AMOUNT );
			assert.equal( LoaderUtils.parseData( generateText( AMOUNT, true, "\r", 3 ) ).length, AMOUNT );

		} );

	} );

} );

function generateText( amount, isFloat, character, each ) {

	var text = "";

	for( let i=0; i<amount; i++ ) {

		var whiteSpace = ( ( i % each ) === 0 ) ? character : " ";
		var randomNumber = Math.random();
		var number = ( isFloat ) ? randomNumber : Math.round( randomNumber * 100000 );

		text += number + whiteSpace;
	}

	return text;
}
