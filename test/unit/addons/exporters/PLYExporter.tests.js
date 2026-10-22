import { BufferGeometry, Float32BufferAttribute, Mesh } from 'three';
import { PLYExporter } from '../../../../examples/jsm/exporters/PLYExporter.js';

function createTriangle( index ) {

	const geometry = new BufferGeometry();
	geometry.setAttribute( 'position', new Float32BufferAttribute( [ 0, 0, 0, 1, 0, 0, 0, 1, 0 ], 3 ) );
	if ( index ) geometry.setIndex( [ 0, 1, 2 ] );

	return geometry;

}

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Exporters', () => {

		QUnit.module( 'PLYExporter', () => {

			QUnit.test( 'mirrored mesh', ( assert ) => {

				for ( const index of [ false, true ] ) {

					const mesh = new Mesh( createTriangle( index ) );

					assert.deepEqual( new PLYExporter().parse( mesh ).match( /^3 .*$/gm ), [ '3 0 1 2' ], 'the winding is kept' );

					mesh.scale.x = - 1;
					mesh.updateMatrixWorld();

					assert.deepEqual( new PLYExporter().parse( mesh ).match( /^3 .*$/gm ), [ '3 0 2 1' ], 'a mirrored triangle is written the other way round' );

					const binary = new DataView( new PLYExporter().parse( mesh, null, { binary: true } ) );
					const faceStart = binary.byteLength - 13;

					assert.deepEqual(
						[ binary.getUint8( faceStart ), binary.getUint32( faceStart + 1 ), binary.getUint32( faceStart + 5 ), binary.getUint32( faceStart + 9 ) ],
						[ 3, 0, 2, 1 ],
						'a mirrored triangle is written the other way round in binary'
					);

				}

			} );

		} );

	} );

} );
