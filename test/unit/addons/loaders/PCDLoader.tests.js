import { PCDLoader } from '../../../../examples/jsm/loaders/PCDLoader.js';

function makeHeader( fields, types, counts, points, format = 'ascii' ) {

	return [
		'VERSION .7',
		`FIELDS ${fields}`,
		`SIZE ${fields.split( ' ' ).map( () => 4 ).join( ' ' )}`,
		`TYPE ${types}`,
		...( counts === undefined ? [] : [ `COUNT ${counts}` ] ),
		`WIDTH ${points}`,
		'HEIGHT 1',
		'VIEWPOINT 0 0 0 1 0 0 0',
		`POINTS ${points}`,
		`DATA ${format}`,
		''
	].join( '\n' );

}

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Loaders', () => {

		QUnit.module( 'PCDLoader', () => {

			QUnit.test( 'ASCII fields following a descriptor', ( assert ) => {

				const header = makeHeader(
					'histogram x y z normal_x normal_y normal_z rgb intensity label',
					'F F F F F F F U F I', '3 1 1 1 1 1 1 1 1 1', 2
				);
				const data = header + [
					'100 200 300 1 2 3 0 0 1 16711680 0.5 7',
					'400 500 600 4 5 6 0 1 0 255 0.25 8'
				].join( '\n' );
				const geometry = new PCDLoader().parse( new TextEncoder().encode( data ).buffer ).geometry;

				assert.deepEqual( Array.from( geometry.attributes.position.array ), [ 1, 2, 3, 4, 5, 6 ], 'Expected position values.' );
				assert.deepEqual( Array.from( geometry.attributes.normal.array ), [ 0, 0, 1, 0, 1, 0 ], 'Expected normal values.' );
				assert.deepEqual( Array.from( geometry.attributes.color.array ), [ 1, 0, 0, 0, 0, 1 ], 'Expected color values.' );
				assert.deepEqual( Array.from( geometry.attributes.intensity.array ), [ 0.5, 0.25 ], 'Expected intensity values.' );
				assert.deepEqual( Array.from( geometry.attributes.label.array ), [ 7, 8 ], 'Expected label values.' );

			} );

			QUnit.test( 'ASCII descriptors between scalar fields', ( assert ) => {

				const header = makeHeader(
					'x histogram y z descriptor rgb intensity label',
					'F F F F F U F I', '1 2 1 1 3 1 1 1', 1
				);
				const data = header + '1 11 12 2 3 21 22 23 65280 0.5 7';
				const geometry = new PCDLoader().parse( new TextEncoder().encode( data ).buffer ).geometry;

				assert.deepEqual( Array.from( geometry.attributes.position.array ), [ 1, 2, 3 ], 'Expected position values.' );
				assert.deepEqual( Array.from( geometry.attributes.color.array ), [ 0, 1, 0 ], 'Expected color values.' );
				assert.deepEqual( Array.from( geometry.attributes.intensity.array ), [ 0.5 ], 'Expected intensity values.' );
				assert.deepEqual( Array.from( geometry.attributes.label.array ), [ 7 ], 'Expected label values.' );

			} );

			QUnit.test( 'ASCII scalar fields with explicit and omitted COUNT', ( assert ) => {

				for ( const counts of [ '1 1 1 1', undefined ] ) {

					const data = makeHeader( 'x y z intensity', 'F F F F', counts, 1 ) + '1 2 3 0.5';
					const geometry = new PCDLoader().parse( new TextEncoder().encode( data ).buffer ).geometry;

					assert.deepEqual( Array.from( geometry.attributes.position.array ), [ 1, 2, 3 ], 'Expected position values.' );
					assert.deepEqual( Array.from( geometry.attributes.intensity.array ), [ 0.5 ], 'Expected intensity values.' );

				}

			} );

			QUnit.test( 'binary fields following a descriptor', ( assert ) => {

				const header = new TextEncoder().encode( makeHeader(
					'histogram x y z intensity', 'F F F F F', '3 1 1 1 1', 2, 'binary'
				) );
				const rows = [ 100, 200, 300, 1, 2, 3, 0.5, 400, 500, 600, 4, 5, 6, 0.25 ];
				const bytes = new Uint8Array( header.length + rows.length * 4 );
				bytes.set( header );
				const view = new DataView( bytes.buffer, header.length );

				rows.forEach( ( value, index ) => view.setFloat32( index * 4, value, true ) );

				const geometry = new PCDLoader().parse( bytes.buffer ).geometry;

				assert.deepEqual( Array.from( geometry.attributes.position.array ), [ 1, 2, 3, 4, 5, 6 ], 'Expected position values.' );
				assert.deepEqual( Array.from( geometry.attributes.intensity.array ), [ 0.5, 0.25 ], 'Expected intensity values.' );

			} );

		} );

	} );

} );
