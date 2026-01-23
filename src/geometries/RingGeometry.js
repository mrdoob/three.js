import { BufferGeometry } from '../core/BufferGeometry.js';
import { Float32BufferAttribute } from '../core/BufferAttribute.js';
import { Vector2 } from '../math/Vector2.js';
import { Vector3 } from '../math/Vector3.js';

/**
 * A class for generating a two-dimensional ring geometry.
 *
 * ```js
 * const geometry = new THREE.RingGeometry( 1, 5, 32 );
 * const material = new THREE.MeshBasicMaterial( { color: 0xffff00, side: THREE.DoubleSide } );
 * const mesh = new THREE.Mesh( geometry, material );
 * scene.add( mesh );
 * ```
 *
 * @augments BufferGeometry
 * @demo scenes/geometry-browser.html#RingGeometry
 */
class RingGeometry extends BufferGeometry {

	/**
	 * Constructs a new ring geometry.
	 *
	 * @param {number} [innerRadius=0.5] - The inner radius of the ring.
	 * @param {number} [outerRadius=1] - The outer radius of the ring.
	 * @param {number} [thetaSegments=32] - Number of segments. A higher number means the ring will be more round. Minimum is `3`.
	 * @param {number} [phiSegments=1] - Number of segments per ring segment. Minimum is `1`.
	 * @param {number} [thetaStart=0] - Starting angle in radians.
	 * @param {number} [thetaLength=Math.PI*2] - Central angle in radians.
	 */
	constructor( innerRadius = 0.5, outerRadius = 1, thetaSegments = 32, phiSegments = 1, thetaStart = 0, thetaLength = Math.PI * 2 ) {

		super();

		this.type = 'RingGeometry';

		/**
		 * Holds the constructor parameters that have been
		 * used to generate the geometry. Any modification
		 * after instantiation does not change the geometry.
		 *
		 * @type {Object}
		 */
		this.parameters = {
			innerRadius: innerRadius,
			outerRadius: outerRadius,
			thetaSegments: thetaSegments,
			phiSegments: phiSegments,
			thetaStart: thetaStart,
			thetaLength: thetaLength
		};

		thetaSegments = Math.max( 3, thetaSegments );
		phiSegments = Math.max( 1, phiSegments );

		// buffers

		const indices = [];
		const vertices = [];
		const normals = [];
		const uvs = [];

		// some helper variables

		let radius = innerRadius;
		const radiusStep = ( ( outerRadius - innerRadius ) / phiSegments );
		const vertex = new Vector3();
		const uv = new Vector2();

		// generate vertices, normals and uvs

		for ( let j = 0; j <= phiSegments; j ++ ) {

			for ( let i = 0; i <= thetaSegments; i ++ ) {

				// values are generate from the inside of the ring to the outside

				const segment = thetaStart + i / thetaSegments * thetaLength;

				// vertex

				vertex.x = radius * Math.cos( segment );
				vertex.y = radius * Math.sin( segment );

				vertices.push( vertex.x, vertex.y, vertex.z );

				// normal

				normals.push( 0, 0, 1 );

				// uv

				uv.x = ( vertex.x / outerRadius + 1 ) / 2;
				uv.y = ( vertex.y / outerRadius + 1 ) / 2;

				uvs.push( uv.x, uv.y );

			}

			// increase the radius for next row of vertices

			radius += radiusStep;

		}

		// indices

		for ( let j = 0; j < phiSegments; j ++ ) {

			const thetaSegmentLevel = j * ( thetaSegments + 1 );

			for ( let i = 0; i < thetaSegments; i ++ ) {

				const segment = i + thetaSegmentLevel;

				const a = segment;
				const b = segment + thetaSegments + 1;
				const c = segment + thetaSegments + 2;
				const d = segment + 1;

				// faces

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

	/**
	 * Factory method for creating an instance of this class from the given
	 * JSON object.
	 *
	 * @param {Object} data - A JSON object representing the serialized geometry.
	 * @return {RingGeometry} A new instance.
	 */
	static fromJSON( data ) {

		return new RingGeometry( data.innerRadius, data.outerRadius, data.thetaSegments, data.phiSegments, data.thetaStart, data.thetaLength );

	}

}


export { RingGeometry };
