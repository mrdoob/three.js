import { BufferGeometry, Float32BufferAttribute, Mesh, Points, Scene } from 'three';
import { PLYExporter } from '../../../../examples/jsm/exporters/PLYExporter.js';

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Exporters', () => {

		QUnit.module( 'PLYExporter', () => {

			QUnit.test( 'parse skips objects without positions', ( assert ) => {

				const exporter = new PLYExporter();
				const emptyPoints = new Points();

				const emptyResult = exporter.parse( emptyPoints );
				const emptyBinaryResult = exporter.parse( emptyPoints, undefined, { binary: true } );

				assert.ok( emptyResult.includes( 'element vertex 0\n' ), 'Empty Points is exported without throwing' );
				assert.ok( emptyBinaryResult instanceof ArrayBuffer, 'Empty Points is exported in binary format' );

				const geometry = new BufferGeometry();
				geometry.setAttribute( 'position', new Float32BufferAttribute( [
					0, 0, 0,
					1, 0, 0,
					0, 1, 0
				], 3 ) );

				const scene = new Scene();
				scene.add( new Mesh( geometry ), emptyPoints );

				const result = exporter.parse( scene );

				assert.ok( result.includes( 'element vertex 3\n' ), 'Valid mesh vertices are exported' );
				assert.ok( result.includes( 'element face 1\n' ), 'Empty Points does not disable mesh indices' );

			} );

		} );

	} );

} );
