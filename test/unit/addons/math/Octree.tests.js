import { Box3, Mesh, Plane, Ray, SphereGeometry, Triangle, Vector3 } from 'three';
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


		QUnit.test( 'triangleBoxIntersect projects the contact onto the plane', ( assert ) => {

			const octree = new Octree();
			const triangles = [
				new Triangle( new Vector3( - 10, - 10, 0 ), new Vector3( 10, - 10, 0 ), new Vector3( 0, 10, 0 ) ),
				new Triangle( new Vector3( 10, - 10, 0 ), new Vector3( - 10, - 10, 0 ), new Vector3( 0, 10, 0 ) ),
				new Triangle( new Vector3( - 10, - 10, - 10 ), new Vector3( 10, - 10, 10 ), new Vector3( 0, 10, 0 ) )
			];

			for ( const offset of [ new Vector3(), new Vector3( 3, - 2, 4 ) ] ) {

				for ( const triangle of triangles ) {

					const translated = new Triangle( triangle.a.clone().add( offset ), triangle.b.clone().add( offset ), triangle.c.clone().add( offset ) );
					const box = new Box3( new Vector3( - 1, - 1, - 0.5 ), new Vector3( 1, 1, 0.5 ) ).translate( offset );
					const originalBox = box.clone();
					const plane = translated.getPlane( new Plane() );
					const result = octree.triangleBoxIntersect( box, translated );

					assert.ok( result, 'Reports the intersection' );
					if ( ! result ) continue;

					assert.ok( Math.abs( plane.distanceToPoint( result.point ) ) < 1e-8, 'Contact lies on the triangle plane' );
					assert.ok( translated.containsPoint( result.point ), 'Contact lies within the large triangle' );
					assert.ok( result.normal.equals( plane.normal ), 'Normal preserves the triangle orientation' );
					assert.ok( Math.abs( result.depth - ( Math.abs( plane.normal.x ) + 0.5 * Math.abs( plane.normal.z ) ) ) < 1e-8, 'Penetration depth is unchanged' );
					assert.ok( box.equals( originalBox ), 'The caller box is unchanged' );

				}

			}

		} );

		QUnit.test( 'triangleBoxIntersect touching and separated boxes', ( assert ) => {

			const octree = new Octree();
			const triangle = new Triangle( new Vector3( - 10, - 10, 0 ), new Vector3( 10, - 10, 0 ), new Vector3( 0, 10, 0 ) );
			const touching = new Box3( new Vector3( - 1, - 1, 0 ), new Vector3( 1, 1, 1 ) );
			const result = octree.triangleBoxIntersect( touching, triangle );

			assert.ok( result, 'Touching box is reported' );
			assert.ok( result.depth === 0, 'Touching box has zero penetration' );
			assert.strictEqual( result.point.z, 0, 'Touching contact remains on the plane' );
			assert.strictEqual( octree.triangleBoxIntersect( touching.translate( new Vector3( 0, 0, 1 ) ), triangle ), false, 'Rejects a box separated from the plane' );
			assert.strictEqual( octree.triangleBoxIntersect( new Box3( new Vector3( 20, 20, - 1 ), new Vector3( 21, 21, 1 ) ), triangle ), false, 'Rejects a box beyond the triangle' );

		} );

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
