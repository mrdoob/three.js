import {
	BufferGeometry,
	Float32BufferAttribute,
	Vector3
} from 'three';

/**
 * This class can be used to generate a geometry based on a parametric surface.
 *
 * Reference: [Mesh Generation with Python](https://prideout.net/blog/old/blog/index.html@p=44.html)
 *
 * ```js
 * const geometry = new THREE.ParametricGeometry( klein, 25, 25 );
 * const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
 * const klein = new THREE.Mesh( geometry, material );
 * scene.add( klein );
 * ```
 *
 * @augments BufferGeometry
 * @three_import import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';
 */
class ParametricGeometry extends BufferGeometry {

	/**
	 * Constructs a new parametric geometry.
	 *
	 * @param {ParametricGeometry~Func} func - The parametric function. Default is a function that generates a curved plane surface.
	 * @param {number} [slices=8] - The number of slices to use for the parametric function.
	 * @param {number} [stacks=8] - The stacks of slices to use for the parametric function.
	 */
	constructor( func = ( u, v, target ) => target.set( u, v, Math.cos( u ) * Math.sin( v ) ), slices = 8, stacks = 8 ) {

		super();

		this.type = 'ParametricGeometry';

		/**
		 * Holds the constructor parameters that have been
		 * used to generate the geometry. Any modification
		 * after instantiation does not change the geometry.
		 *
		 * @type {Object}
		 */
		this.parameters = {
			func: func,
			slices: slices,
			stacks: stacks
		};

		// buffers

		const indices = [];
		const vertices = [];
		const normals = [];
		const uvs = [];

		const EPS = 0.00001;

		const normal = new Vector3();

		const p0 = new Vector3(), p1 = new Vector3();
		const pu = new Vector3(), pv = new Vector3();

		// generate vertices, normals and uvs

		const sliceCount = slices + 1;

		for ( let i = 0; i <= stacks; i ++ ) {

			const v = i / stacks;

			for ( let j = 0; j <= slices; j ++ ) {

				const u = j / slices;

				// vertex

				func( u, v, p0 );
				vertices.push( p0.x, p0.y, p0.z );

				// normal

				// approximate tangent vectors via finite differences

				if ( u - EPS >= 0 ) {

					func( u - EPS, v, p1 );
					pu.subVectors( p0, p1 );

				} else {

					func( u + EPS, v, p1 );
					pu.subVectors( p1, p0 );

				}

				if ( v - EPS >= 0 ) {

					func( u, v - EPS, p1 );
					pv.subVectors( p0, p1 );

				} else {

					func( u, v + EPS, p1 );
					pv.subVectors( p1, p0 );

				}

				// cross product of tangent vectors returns surface normal

				normal.crossVectors( pu, pv ).normalize();
				normals.push( normal.x, normal.y, normal.z );

				// uv

				uvs.push( u, v );

			}

		}

		// generate indices

		for ( let i = 0; i < stacks; i ++ ) {

			for ( let j = 0; j < slices; j ++ ) {

				const a = i * sliceCount + j;
				const b = i * sliceCount + j + 1;
				const c = ( i + 1 ) * sliceCount + j + 1;
				const d = ( i + 1 ) * sliceCount + j;

				// faces one and two

				indices.push( a, b, d );
				indices.push( b, c, d );

			}

		}

		// build geometry

		this.setIndex( indices );
		this.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
		this.setAttribute( 'normal', new Float32BufferAttribute( normals, 3 ) );
		this.setAttribute( 'uv', new Float32BufferAttribute( uvs, 2 ) );

	}

	copy( source ) {

		super.copy( source );

		this.parameters = Object.assign( {}, source.parameters );

		return this;

	}

}

/**
 * Parametric function definition of `ParametricGeometry`.
 *
 * @callback ParametricGeometry~Func
 * @param {number} u - The `u` coordinate on the surface in the range `[0,1]`.
 * @param {number} v - The `v` coordinate on the surface in the range `[0,1]`.
 * @param {Vector3} target - The target vector that is used to store the method's result.
 */

export { ParametricGeometry };
