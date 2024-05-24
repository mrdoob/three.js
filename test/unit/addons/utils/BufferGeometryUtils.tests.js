import { BufferGeometry } from '../../../../src/core/BufferGeometry.js';
import { BufferAttribute } from '../../../../src/core/BufferAttribute.js';
import * as BufferGeometryUtils from '../../../../examples/jsm/utils/BufferGeometryUtils.js';

const getGeometry = () => {

	const geometry = new BufferGeometry();

	// square
	const vertices = new Float32Array( [
		- 1.0, - 1.0, 0.0, // Bottom left
		1.0, - 1.0, 0.0, // Bottom right
		1.0, 1.0, 0.0, // Top right
		- 1.0, 1.0, 0.0 // Top left
	] );

	const morphVertices = new Float32Array( [
		0.0, - 1.0, 0.0, // Bottom
		1.0, 0.0, 0.0, // Right
		0.0, 1.0, 0.0, // Top
		- 1.0, 0.0, 0.0 // Left
	] );

	geometry.setAttribute( 'position', new BufferAttribute( vertices, 3 ) );

	geometry.morphAttributes.position = [
		new BufferAttribute( morphVertices, 3 )
	];

	return geometry;

};

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Utils', () => {

		QUnit.module( 'BufferGeometryUtils', () => {

			QUnit.module( 'mergeVertices', () => {

				QUnit.test( 'can handle morphAttributes without crashing', ( assert ) => {

					const geometry = getGeometry();

					const indexedGeometry = BufferGeometryUtils.mergeVertices( geometry );

					assert.deepEqual( geometry.morphAttributes.position[ 0 ], indexedGeometry.morphAttributes.position[ 0 ], 'morphAttributes were handled' );
					assert.ok( indexedGeometry.index, 'has index' );

				} );

			} );

		} );

	} );


} );
