import {
	BufferGeometry,
	Float32BufferAttribute
} from 'three';
import { ConvexHull } from '../math/ConvexHull.js';

/**
 * This class can be used to generate a convex hull for a given array of 3D points.
 * The average time complexity for this task is considered to be O(nlog(n)).
 *
 * ```js
 * const geometry = new ConvexGeometry( points );
 * const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
 * const mesh = new THREE.Mesh( geometry, material );
 * scene.add( mesh );
 * ```
 *
 * @augments BufferGeometry
 */
class ConvexGeometry extends BufferGeometry {

	/**
	 * Constructs a new convex geometry.
	 *
	 * @param {Array<Vector3>} points - An array of points in 3D space which should be enclosed by the convex hull.
	 */
	constructor( points = [] ) {

		super();

		// buffers

		const vertices = [];
		const normals = [];

		const convexHull = new ConvexHull().setFromPoints( points );

		// generate vertices and normals

		const faces = convexHull.faces;

		for ( let i = 0; i < faces.length; i ++ ) {

			const face = faces[ i ];
			let edge = face.edge;

			// we move along a doubly-connected edge list to access all face points (see HalfEdge docs)

			do {

				const point = edge.head().point;

				vertices.push( point.x, point.y, point.z );
				normals.push( face.normal.x, face.normal.y, face.normal.z );

				edge = edge.next;

			} while ( edge !== face.edge );

		}

		// build geometry

		this.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
		this.setAttribute( 'normal', new Float32BufferAttribute( normals, 3 ) );

	}

}

export { ConvexGeometry };
