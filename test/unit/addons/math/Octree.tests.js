import { Mesh, Ray, SphereGeometry, Vector3 } from 'three';
import { Octree } from '../../../../examples/jsm/math/Octree.js';

function getDepth( octree ) {

	let depth = 0;

	for ( const subTree of octree.subTrees ) {

		depth = Math.max( depth, 1 + getDepth( subTree ) );

	}

	return depth;

}

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'Octree', () => {

		QUnit.test( 'maxLevel applies to recursive splits', ( assert ) => {

			const octree = new Octree();
			octree.maxLevel = 1;
			octree.fromGraphNode( new Mesh( new SphereGeometry( 2, 12, 8 ) ) );

			assert.strictEqual( getDepth( octree ), 2, 'Stops after the configured number of recursive splits' );

			const result = octree.rayIntersect( new Ray( new Vector3( 0, 0, 5 ), new Vector3( 0, 0, - 1 ) ) );
			assert.ok( result, 'The limited tree still finds the sphere surface' );
			assert.ok( Math.abs( result.distance - 3 ) < 1e-8, 'The intersection distance is unchanged' );

		} );

		QUnit.test( 'trianglesPerLeaf applies to recursive splits', ( assert ) => {

			const octree = new Octree();
			octree.trianglesPerLeaf = 32;
			octree.fromGraphNode( new Mesh( new SphereGeometry( 2, 12, 8 ) ) );

			assert.strictEqual( getDepth( octree ), 2, 'Does not keep subdividing leaves below the configured capacity' );

			const result = octree.rayIntersect( new Ray( new Vector3( 0, 0, 5 ), new Vector3( 0, 0, - 1 ) ) );
			assert.ok( result, 'The coarser tree still finds the sphere surface' );
			assert.ok( Math.abs( result.distance - 3 ) < 1e-8, 'The intersection distance is unchanged' );

		} );

	} );

} );
