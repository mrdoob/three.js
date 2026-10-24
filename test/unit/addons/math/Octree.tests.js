import { Mesh, Ray, Sphere, SphereGeometry, Triangle, Vector3 } from 'three';
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

		QUnit.test( 'triangleSphereIntersect at an edge', ( assert ) => {

			const octree = new Octree();
			const triangle = new Triangle( new Vector3( - 2, 0, 0 ), new Vector3( 2, 0, 0 ), new Vector3( 0, 3, 0 ) );

			for ( const z of [ 0, 0.1, - 0.1, 0.75 ] ) {

				const sphere = new Sphere( new Vector3( 0, - 0.5, z ), 1 );
				const result = octree.triangleSphereIntersect( sphere, triangle );

				assert.ok( result, `Detects the edge overlap at z = ${z}` );
				if ( ! result ) continue;

				assert.ok( result.point.distanceTo( new Vector3( 0, 0, 0 ) ) < 1e-8, 'Contact lies on the edge' );
				assert.ok( result.normal.distanceTo( sphere.center.clone().normalize() ) < 1e-8, 'Normal points from the edge to the sphere center' );
				assert.ok( Math.abs( result.depth - ( 1 - sphere.center.length() ) ) < 1e-8, 'Depth uses the full distance to the edge' );

			}

		} );

		QUnit.test( 'triangleSphereIntersect at a vertex', ( assert ) => {

			const octree = new Octree();
			const triangle = new Triangle( new Vector3( - 2, 0, 0 ), new Vector3( 2, 0, 0 ), new Vector3( 0, 3, 0 ) );
			const sphere = new Sphere( new Vector3( - 2.3, - 0.4, 0.1 ), 1 );
			const result = octree.triangleSphereIntersect( sphere, triangle );

			assert.ok( result, 'Detects an overlap beyond the edge endpoint' );
			if ( ! result ) return;

			assert.ok( result.point.equals( triangle.a ), 'Contact lies on the vertex' );
			assert.ok( Math.abs( result.depth - ( 1 - sphere.center.distanceTo( triangle.a ) ) ) < 1e-8, 'Depth uses the distance to the vertex' );

		} );

		QUnit.test( 'triangleSphereIntersect face and separated spheres', ( assert ) => {

			const octree = new Octree();
			const triangle = new Triangle( new Vector3( - 2, 0, 0 ), new Vector3( 2, 0, 0 ), new Vector3( 0, 3, 0 ) );
			const face = octree.triangleSphereIntersect( new Sphere( new Vector3( 0, 1, 0.25 ), 1 ), triangle );

			assert.ok( face.point.equals( new Vector3( 0, 1, 0 ) ), 'Face contact remains on the plane' );
			assert.strictEqual( face.depth, 0.75, 'Face penetration remains unchanged' );

			for ( const center of [ new Vector3( 0, - 0.5, 1.1 ), new Vector3( 0, - 1.1, 0.1 ), new Vector3( 0, - 0.8, 0.8 ) ] ) {

				assert.strictEqual( octree.triangleSphereIntersect( new Sphere( center, 1 ), triangle ), false, 'Rejects a separated sphere' );

			}

		} );

		QUnit.test( 'sphereIntersect resolves edge and vertex overlaps', ( assert ) => {

			const triangle = new Triangle( new Vector3( - 2, 0, 0 ), new Vector3( 2, 0, 0 ), new Vector3( 0, 3, 0 ) );
			const octree = new Octree().addTriangle( triangle ).build();

			for ( const center of [ new Vector3( 0, - 0.5, 0.1 ), new Vector3( - 2.3, - 0.4, 0.1 ) ] ) {

				const sphere = new Sphere( center.clone(), 1 );
				const result = octree.sphereIntersect( sphere );

				assert.ok( result, 'The built tree reports the overlap' );
				if ( ! result ) continue;

				const resolved = center.clone().addScaledVector( result.normal, result.depth );
				const closest = triangle.closestPointToPoint( resolved, new Vector3() );

				assert.ok( Math.abs( resolved.distanceTo( closest ) - sphere.radius ) < 1e-8, 'The correction moves the sphere to contact' );
				assert.ok( sphere.center.equals( center ), 'The caller sphere is unchanged' );

			}

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
