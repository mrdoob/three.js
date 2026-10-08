import { PCDLoader } from '../../../../examples/jsm/loaders/PCDLoader.js';

function createHeader( encoding, lineEnding = '\n' ) {

	return new TextEncoder().encode( [
		'VERSION .7',
		'FIELDS x y z',
		'SIZE 4 4 4',
		'TYPE F F F',
		'COUNT 1 1 1',
		'WIDTH 2',
		'HEIGHT 1',
		'POINTS 2',
		`DATA ${encoding}`,
		''
	].join( lineEnding ) );

}

function concatenate( header, payload ) {

	const buffer = new Uint8Array( header.length + payload.length );
	buffer.set( header );
	buffer.set( payload, header.length );
	return buffer.buffer;

}

function assertPositions( assert, buffer ) {

	const points = new PCDLoader().parse( buffer );
	assert.deepEqual( Array.from( points.geometry.attributes.position.array ), [ 1, 2, 3, 4, 5, 6 ], 'Point coordinates are preserved.' );
	assert.ok( Number.isFinite( points.geometry.boundingSphere.radius ), 'Bounding sphere is finite.' );

}

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Loaders', () => {

		QUnit.module( 'PCDLoader', () => {

			for ( const lineEnding of [ '\n', '\r\n', '\r' ] ) {

				QUnit.test( `binary header ${JSON.stringify( lineEnding )}`, ( assert ) => {

					const payload = new Uint8Array( 24 );
					const view = new DataView( payload.buffer );
					[ 1, 2, 3, 4, 5, 6 ].forEach( ( value, index ) => view.setFloat32( index * 4, value, true ) );
					assertPositions( assert, concatenate( createHeader( 'binary', lineEnding ), payload ) );

				} );

				QUnit.test( `compressed header ${JSON.stringify( lineEnding )}`, ( assert ) => {

					// A literal-only LZF block, in the field-major layout required by PCD.
					const payload = new Uint8Array( 8 + 1 + 24 );
					const view = new DataView( payload.buffer );
					view.setUint32( 0, 25, true );
					view.setUint32( 4, 24, true );
					payload[ 8 ] = 23;
					[ 1, 4, 2, 5, 3, 6 ].forEach( ( value, index ) => view.setFloat32( 9 + index * 4, value, true ) );
					assertPositions( assert, concatenate( createHeader( 'binary_compressed', lineEnding ), payload ) );

				} );

			}

			QUnit.test( 'LF header preserves a payload starting with a newline byte', ( assert ) => {

				const payload = new Uint8Array( 24 );
				const view = new DataView( payload.buffer );
				view.setUint32( 0, 0x3f80000a, true );
				[ 2, 3, 4, 5, 6 ].forEach( ( value, index ) => view.setFloat32( 4 + index * 4, value, true ) );
				const points = new PCDLoader().parse( concatenate( createHeader( 'binary' ), payload ) );
				assert.deepEqual( Array.from( points.geometry.attributes.position.array ), [ view.getFloat32( 0, true ), 2, 3, 4, 5, 6 ], 'Only the header terminator is consumed.' );

			} );

		} );

	} );

} );
