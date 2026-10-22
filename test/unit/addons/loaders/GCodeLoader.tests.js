import { GCodeLoader } from '../../../../examples/jsm/loaders/GCodeLoader.js';

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Loaders', () => {

		QUnit.module( 'GCodeLoader', () => {

			QUnit.test( 'Instancing', ( assert ) => {

				const loader = new GCodeLoader();

				assert.ok( loader instanceof GCodeLoader, 'Can instantiate a GCodeLoader.' );

			} );

			QUnit.test( 'parses CRLF line endings', ( assert ) => {

				const lines = [ 'G90', 'M82', 'G1 Z0.2 F1200', 'G1 X10 Y0 E1', 'G91', 'G1 X10 Y0 E1', 'G1 X0 Y10 E1', '' ];

				function extrusionPositions( text ) {

					const object = new GCodeLoader().parse( text );
					return Array.from( object.children[ 0 ].geometry.getAttribute( 'position' ).array );

				}

				const lf = extrusionPositions( lines.join( '\n' ) );
				const crlf = extrusionPositions( lines.join( '\r\n' ) );

				assert.strictEqual( lf[ 15 ], 20, 'The moves after G91 are relative.' );
				assert.deepEqual( crlf, lf, 'CRLF line endings give the same toolpath as LF.' );

			} );

		} );

	} );

} );
