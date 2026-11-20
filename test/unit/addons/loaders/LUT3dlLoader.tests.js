import { FloatType } from 'three';
import { LUT3dlLoader } from '../../../../examples/jsm/loaders/LUT3dlLoader.js';

function createIdentityLUT( grid, maxValue ) {

	const size = grid.length;
	const lines = [ grid.join( ' ' ) ];

	for ( let r = 0; r < size; r ++ ) {

		for ( let g = 0; g < size; g ++ ) {

			for ( let b = 0; b < size; b ++ ) {

				lines.push( [ r, g, b ].map( v => Math.round( v / ( size - 1 ) * maxValue ) ).join( ' ' ) );

			}

		}

	}

	return lines.join( '\n' );

}

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Loaders', () => {

		QUnit.module( 'LUT3dlLoader', () => {

			QUnit.test( 'accepts grids with a shorter last step', ( assert ) => {

				const grid17 = [ 0, 64, 128, 192, 256, 320, 384, 448, 512, 576, 640, 704, 768, 832, 896, 960, 1023 ];
				const grid33 = [];
				for ( let i = 0; i < 32; i ++ ) grid33.push( i * 32 );
				grid33.push( 1023 );

				const loader = new LUT3dlLoader();

				assert.strictEqual( loader.parse( createIdentityLUT( grid17, 4095 ) ).size, 17, '17 point grid' );
				assert.strictEqual( loader.parse( createIdentityLUT( grid33, 4095 ) ).size, 33, '33 point grid' );

			} );

			QUnit.test( 'rejects non-uniform grids', ( assert ) => {

				const loader = new LUT3dlLoader();

				assert.throws( () => loader.parse( createIdentityLUT( [ 0, 100, 400, 1023 ], 1023 ) ), /Inconsistent grid size/ );

			} );

			QUnit.test( 'maps the maximum value to white', ( assert ) => {

				const grid = [ 0, 341, 682, 1023 ];
				const text = createIdentityLUT( grid, 1023 );
				const last = ( grid.length ** 3 - 1 ) * 4;

				const byteData = new LUT3dlLoader().parse( text ).texture3D.image.data;
				assert.deepEqual( Array.from( byteData.slice( last, last + 4 ) ), [ 255, 255, 255, 255 ], 'UnsignedByteType' );

				const floatData = new LUT3dlLoader().setType( FloatType ).parse( text ).texture3D.image.data;
				assert.deepEqual( Array.from( floatData.slice( last, last + 4 ) ), [ 1, 1, 1, 1 ], 'FloatType' );

			} );

		} );

	} );

} );
