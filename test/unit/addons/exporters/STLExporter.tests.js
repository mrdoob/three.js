import { BufferGeometry, Float32BufferAttribute, Mesh } from 'three';
import { STLExporter } from '../../../../examples/jsm/exporters/STLExporter.js';

function createTriangle( index ) {

	const geometry = new BufferGeometry();
	geometry.setAttribute( 'position', new Float32BufferAttribute( [ 0, 0, 0, 1, 0, 0, 0, 1, 0 ], 3 ) );
	if ( index ) geometry.setIndex( [ 0, 1, 2 ] );

	return geometry;

}

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Exporters', () => {

		QUnit.module( 'STLExporter', () => {

			QUnit.test( 'mirrored mesh', ( assert ) => {

				for ( const index of [ false, true ] ) {

					const mesh = new Mesh( createTriangle( index ) );
					mesh.scale.x = - 1;
					mesh.updateMatrixWorld();

					const ascii = new STLExporter().parse( mesh );

					assert.deepEqual( ascii.match( /(?:facet normal|vertex) .*$/gm ), [
						'facet normal 0 0 1',
						'vertex 0 0 0',
						'vertex 0 1 0',
						'vertex -1 0 0'
					], 'the facet keeps facing +z, the side that is rendered as the front face' );

					const binary = new STLExporter().parse( mesh, { binary: true } );

					assert.deepEqual(
						[ binary.getFloat32( 84 + 8, true ), binary.getFloat32( 84 + 12 + 12 + 4, true ) ],
						[ 1, 1 ],
						'the binary facet normal faces +z and the second vertex is (0, 1, 0)'
					);

				}

			} );

		} );

	} );

} );
