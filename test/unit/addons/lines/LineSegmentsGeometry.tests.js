import { BufferGeometryLoader } from 'three';
import { Line2 } from '../../../../examples/jsm/lines/Line2.js';
import { LineGeometry } from '../../../../examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from '../../../../examples/jsm/lines/LineMaterial.js';
import { LineSegmentsGeometry } from '../../../../examples/jsm/lines/LineSegmentsGeometry.js';

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Lines', () => {

		QUnit.module( 'LineSegmentsGeometry', () => {

			QUnit.test( 'toJSON', ( assert ) => {

				const geometry = new LineSegmentsGeometry();
				geometry.setPositions( [ 0, 0, 0, 1, 1, 1, 2, 0, 0 ] );

				const json = geometry.toJSON();

				assert.strictEqual( json.type, 'LineSegmentsGeometry', 'Serializes the geometry type.' );
				assert.strictEqual( json.isInstancedBufferGeometry, true, 'Serializes as an instanced geometry.' );
				assert.strictEqual( json.instanceCount, geometry.instanceCount, 'Serializes the instance count.' );
				assert.ok( json.data.attributes.instanceStart, 'Serializes the instanceStart attribute.' );
				assert.ok( json.data.attributes.instanceEnd, 'Serializes the instanceEnd attribute.' );

				assert.ok( new LineSegmentsGeometry().toJSON(), 'An empty geometry can be serialized.' );

			} );

			QUnit.test( 'toJSON (LineGeometry)', ( assert ) => {

				const geometry = new LineGeometry();
				geometry.setPositions( [ 0, 0, 0, 1, 1, 1, 2, 0, 0 ] );

				const restored = new BufferGeometryLoader().parse( JSON.parse( JSON.stringify( geometry.toJSON() ) ) );

				assert.deepEqual(
					Array.from( restored.attributes.instanceStart.data.array ),
					Array.from( geometry.attributes.instanceStart.data.array ),
					'The segment data survives a round trip.'
				);

			} );

			QUnit.test( 'Line2.toJSON()', ( assert ) => {

				const geometry = new LineGeometry();
				geometry.setPositions( [ 0, 0, 0, 1, 1, 1, 2, 0, 0 ] );

				const line = new Line2( geometry, new LineMaterial( { linewidth: 5 } ) );

				const json = JSON.parse( JSON.stringify( line.toJSON() ) );

				assert.strictEqual( json.object.type, 'Line2', 'Serializes the object.' );
				assert.strictEqual( json.geometries.length, 1, 'Serializes the geometry.' );
				assert.strictEqual( json.materials.length, 1, 'Serializes the material.' );

			} );

		} );

	} );

} );
