import { BufferAttribute, BufferGeometry, Mesh } from 'three';
import { PLYExporter } from '../../../../examples/jsm/exporters/PLYExporter.js';
import { PLYLoader } from '../../../../examples/jsm/loaders/PLYLoader.js';

function createQuantizedMesh() {

	// KHR_mesh_quantization style data: integer positions scaled by the node transform, normalized normals and uvs

	const geometry = new BufferGeometry();
	geometry.setAttribute( 'position', new BufferAttribute( new Uint16Array( [ 0, 0, 0, 2, 0, 0, 0, 6, 0 ] ), 3 ) );
	geometry.setAttribute( 'normal', new BufferAttribute( new Int8Array( [ 0, 0, 127, 0, 127, 127, 127, 0, 127 ] ), 3, true ) );
	geometry.setAttribute( 'uv', new BufferAttribute( new Uint16Array( [ 0, 0, 13107, 0, 0, 65535 ] ), 2, true ) );

	const mesh = new Mesh( geometry );
	mesh.scale.setScalar( 0.25 );
	mesh.updateMatrixWorld();

	return mesh;

}

function round( attribute ) {

	return Array.from( attribute.array, ( v ) => Math.round( v * 1000 ) / 1000 );

}

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Exporters', () => {

		QUnit.module( 'PLYExporter', () => {

			QUnit.test( 'quantized attributes', ( assert ) => {

				const mesh = createQuantizedMesh();
				const exporter = new PLYExporter();
				const loader = new PLYLoader();

				for ( const binary of [ false, true ] ) {

					const geometry = loader.parse( exporter.parse( mesh, null, { binary } ) );
					const format = binary ? 'binary' : 'ascii';

					assert.deepEqual( round( geometry.getAttribute( 'position' ) ), [ 0, 0, 0, 0.5, 0, 0, 0, 1.5, 0 ], `${ format }: positions` );
					assert.deepEqual( round( geometry.getAttribute( 'normal' ) ), [ 0, 0, 1, 0, 0.707, 0.707, 0.707, 0, 0.707 ], `${ format }: normals` );
					assert.deepEqual( round( geometry.getAttribute( 'uv' ) ), [ 0, 0, 0.2, 0, 0, 1 ], `${ format }: uvs` );

				}

			} );

		} );

	} );

} );
